import { execSync } from 'child_process'

export default function scriptRunner(req, res) {
  const output = execSync('sh ./test.sh', { encoding: 'utf-8' });  // the default is 'buffer'
  const splitted = output.split(/\r?\n/);
  const filtered = splitted.filter( e => {
    return e !== '';
  });

  res.status(200).json(JSON.stringify(filtered));
}