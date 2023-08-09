import { exec } from 'child_process';

export default function runBashScript(scriptPath: string, parameters: string[]): number {
  const command = `${scriptPath} ${parameters.join(' ')}`;
  let result  = 1;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      result =  0;
    } 
    console.log('Standard Output:', stdout);
    result = 1
  });
  return result;
}
