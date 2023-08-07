import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { extractJSONObjectFromText, extractWordsStartingWithPS } from '@/utils/jsonExtractor';
import createJSONFile from '@/utils/jsonFileCreator';


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
  const optimizedQuery = "List all the required properties in json format with missing properties as empty string to run the following command(s) : " + sanitizedQuestion;
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
      chat_history: history || [],
    });

    const jsonResponse = extractJSONObjectFromText(response.text);
    console.log(jsonResponse);
    if (jsonResponse) {
      createJSONFile(jsonResponse, '/Users/karthik/Teaching/psForAEM/input.json');
      const scriptResponse = await chain.call({
        question: `What scripts need to be invoked - ${sanitizedQuestion}`,
        chat_history: history || [],
      });
      const scriptsToRun = extractWordsStartingWithPS(scriptResponse.text);
      console.log(scriptsToRun);
    }
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}

function isValidJSONObject(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch (error) {
    return false;
  }
}
