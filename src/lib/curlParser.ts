import { KeyValue, RequestData } from '../types';

export function parseCurl(curlText: string): Partial<RequestData> | null {
  if (!curlText.trim().toLowerCase().startsWith('curl')) return null;

  let method = 'GET';
  let url = '';
  let headers: KeyValue[] = [];
  let body = '';
  let bodyType: 'none' | 'json' | 'text' = 'none';
  let auth: RequestData['auth'] = { type: 'none' };

  const tokens = splitIntoTokens(curlText);

  for (let i = 0; i < tokens.length; i++) {
     const token = tokens[i];
     
     if (token === '-X' || token === '--request') {
         if (i + 1 < tokens.length) method = tokens[++i].toUpperCase();
     } else if (token === '-H' || token === '--header') {
         if (i + 1 < tokens.length) {
             const headerStr = tokens[++i];
             const sepIdx = headerStr.indexOf(':');
             if (sepIdx > -1) {
                 const key = headerStr.slice(0, sepIdx).trim();
                 const value = headerStr.slice(sepIdx + 1).trim();
                 
                 if (key.toLowerCase() === 'authorization') {
                     if (value.toLowerCase().startsWith('bearer ')) {
                         auth = { type: 'bearer', token: value.substring(7) };
                         continue;
                     }
                     if (value.toLowerCase().startsWith('basic ')) {
                         try {
                             const decoded = atob(value.substring(6));
                             const [username, ...passParts] = decoded.split(':');
                             auth = { type: 'basic', username, password: passParts.join(':') };
                         } catch (e) {}
                         continue;
                     }
                 }
                 headers.push({ id: Date.now().toString() + Math.random(), key, value, enabled: true });
             }
         }
     } else if (['--data', '--data-raw', '--data-binary', '-d'].includes(token)) {
         if (i + 1 < tokens.length) {
             body = tokens[++i];
             bodyType = 'text';
             if (method === 'GET') method = 'POST';
         }
     } else if (token === '--url') {
         if (i + 1 < tokens.length) url = tokens[++i];
     } else if (!url && !token.startsWith('-') && token.toLowerCase() !== 'curl') {
         url = token;
     }
  }

  // Determine body type
  if (bodyType !== 'none') {
    try {
        JSON.parse(body);
        bodyType = 'json';
        body = JSON.stringify(JSON.parse(body), null, 2);
    } catch(e) {}
  }

  // Extract params from URL
  let params: KeyValue[] = [{ id: "1", key: "", value: "", enabled: true }];
  try {
     let queryUrl = url;
     if (queryUrl && !queryUrl.startsWith('http')) queryUrl = 'https://' + queryUrl;
     if (queryUrl) {
         const urlObj = new URL(queryUrl);
         url = urlObj.origin + urlObj.pathname;
         const searchParams = Array.from(urlObj.searchParams.entries());
         if (searchParams.length > 0) {
             params = searchParams.map(([key, value]) => ({
                 id: Date.now().toString() + Math.random(),
                 key,
                 value,
                 enabled: true
             }));
             params.push({ id: Date.now().toString() + Math.random(), key: "", value: "", enabled: true });
         }
     }
  } catch(e) {}

  if (headers.length === 0) {
      headers.push({ id: "1", key: "", value: "", enabled: true });
  } else {
      headers.push({ id: Date.now().toString() + Math.random(), key: "", value: "", enabled: true });
  }

  return {
      method,
      url,
      headers,
      params,
      body,
      bodyType,
      auth
  };
}

function splitIntoTokens(text: string): string[] {
    const tokens: string[] = [];
    let currentToken = '';
    let insideQuote: string | null = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '\\' && i + 1 < text.length) {
             // Handle newline escapes
             if (text[i+1] === '\n' || text[i+1] === '\r') {
                 i++;
                 if (text[i] === '\r' && text[i+1] === '\n') i++;
                 continue;
             }
             currentToken += text[i+1];
             i++;
             continue;
        }

        if (char === "'" || char === '"') {
             if (insideQuote === char) {
                 insideQuote = null; // close quote
             } else if (!insideQuote) {
                 insideQuote = char; // open quote
             } else {
                 currentToken += char; // quote inside another quote
             }
             continue;
        }

        if (/[ \t\n\r]/.test(char) && !insideQuote) {
            if (currentToken.length > 0) {
                tokens.push(currentToken);
                currentToken = '';
            }
        } else {
            currentToken += char;
        }
    }
    
    if (currentToken.length > 0) {
        tokens.push(currentToken);
    }
    
    return tokens;
}
