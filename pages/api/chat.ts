import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { extractJSONObjectFromText, extractWordsStartingWithPS } from '@/utils/jsonExtractor';
import createJSONFile from '@/utils/jsonFileCreator';
import runBashScript from './scriptExecuter';
import generateImage from '@/utils/pythonExecutor';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  const optimizedQuery = "List all the required properties in json format with missing properties as empty string to run the following command(s) : \n" + sanitizedQuestion;
  //const optimizedQuery = sanitizedQuestion;
  console.log('optimizedQuery', optimizedQuery);
  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: optimizedQuery,
      chat_history: [],
    });

    const jsonResponse = extractJSONObjectFromText(response.text);
    console.log(jsonResponse);
    if (jsonResponse && jsonResponse['Page name']) {
      const description: String = jsonResponse["Description"];
      const pageName = jsonResponse['Page name'] ? jsonResponse['Page name'].toLowerCase().replaceAll(/ /g, "-"): '';
      const scriptResponse = await chain.call({
        question: `Provide the script(s) to be invoked for following command- ${sanitizedQuestion}`,
        chat_history: [],
      });
      console.log('scripts to be invoked', scriptResponse.text)
      const scriptsToRun = extractWordsStartingWithPS(scriptResponse.text);
      console.log('scriptsToRunFinal', scriptsToRun);
      if (scriptsToRun && scriptsToRun.indexOf('ps_UpdateImage') > -1 && description) {
        await generateImage(process.env.STABILITY_AI_API_KEY, description, '/Users/karthik/Teaching/psForAEM/')
      }
      if (scriptsToRun && scriptsToRun.indexOf('ps_SuggestSEODetails') > -1) {
        const titleResponse = await chain.call({
          question: `suggest a seo based title for  https://wknd.site/us/en/${pageName}.html. Please give just the title as response.`,
          chat_history: [],
        });
        console.log('SEO title', titleResponse.text);
        jsonResponse["SEO title"] = titleResponse && titleResponse.text;
      }
      if (!scriptsToRun || scriptsToRun.length === 0) {
        return res.status(200).json({ text: "Looks like openai has given up on us.. or you missed page name or any required properties. Can you please retry?"})
      }
      createJSONFile(jsonResponse, '/Users/karthik/Teaching/psForAEM/input.json');
      const result = runBashScript('./test.sh', scriptsToRun);
      console.log("bashresponse", result);
      if (result === 1) {
        const url = `http://localhost:4502/content/wknd/language-masters/en/${pageName}.html`
        res.status(200).json({text: `Horray! we authored what you need! checkout @ ${url}`});
      } else {
        return res.status(200).json({ text: "Looks like openai has given up on us.. or you missed page name or any required properties. Can you please retry?"})
      }
      
    } else {
      return res.status(200).json({ text: "Looks like openai has given up on us.. or you missed page name or any required properties. Can you please retry?"})
    }
    
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
