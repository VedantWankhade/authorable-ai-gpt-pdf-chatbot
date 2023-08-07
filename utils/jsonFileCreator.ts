import fs from 'fs';

export default function createJSONFile(jsonObject: object, outputFilePath: string): void {
  const jsonString = JSON.stringify(jsonObject, null, 2);

  fs.writeFileSync(outputFilePath, jsonString);

  console.log(`JSON file created: ${outputFilePath}`);
}