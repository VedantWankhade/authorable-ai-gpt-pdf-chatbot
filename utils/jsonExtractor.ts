export function extractJSONObjectFromText(text: string): object | null {
    let startIndex = text.indexOf('{');
    
    if (startIndex === -1) {
      return null;
    }
    
    let openBraceCount = 1;
    let endIndex = startIndex + 1;
  
    while (openBraceCount > 0 && endIndex < text.length) {
      if (text[endIndex] === '{') {
        openBraceCount++;
      } else if (text[endIndex] === '}') {
        openBraceCount--;
      }
      endIndex++;
    }
    
    if (openBraceCount === 0) {
      const jsonObjectText = text.substring(startIndex, endIndex);
      try {
        const extractedJSONObject = JSON.parse(jsonObjectText);
        return extractedJSONObject;
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    }
    
    return null;
  }

  export function extractWordsStartingWithPS(text: string): string[] {
    const words = text.split(/\s+/);
    const psWords = words.filter(word => word.indexOf('ps_') > -1);
    psWords && psWords.forEach(word => word.replace(/[^a-zA-Z0-9_]/g, ''));
    return psWords;
  }
  
