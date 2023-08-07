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
    const psWords = words.filter(word => word.startsWith('ps_'));
    return psWords;
  }
  
