import { exec } from 'child_process';

function runBashScript(scriptPath: string, parameters: string[]): void {
  const command = `${scriptPath} ${parameters.join(' ')}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    
    console.log('Standard Output:', stdout);
    console.error('Standard Error:', stderr);
  });
}

const scriptPath = './my_script.sh';
const scriptParameters = ['param1', 'param2', 'param3'];

runBashScript(scriptPath, scriptParameters);