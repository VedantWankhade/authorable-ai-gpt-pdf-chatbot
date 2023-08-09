import { spawn } from 'child_process';

function executePythonScript(
  scriptPath: string,
  args: string[] = [],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(
          new Error(
            `Python script exited with code ${code}. Error: ${errorOutput}`,
          ),
        );
      }
    });
  });
}

export default async function generateImage(apiKey: any, prompt: any, imagePath: any) {
  try {
    const scriptPath = 'utils/generate_image.py';
    const scriptArgs = [apiKey, prompt, imagePath];

    const scriptOutput = await executePythonScript(scriptPath, scriptArgs);
    console.log('Python script output:', scriptOutput);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}
