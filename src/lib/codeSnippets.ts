import { RequestData } from "../types";

export function getCodeSnippets(req: RequestData): Record<string, string> {
  let finalUrl = req.url || "http://localhost";
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }
  
  const method = req.method;
  
  // Prepare headers
  const headersObj: Record<string, string> = {};
  req.headers.forEach(h => {
    if (h.enabled && h.key) headersObj[h.key] = h.value;
  });
  
  // Auth headers
  if (req.auth.type === 'bearer' && req.auth.token) {
    headersObj['Authorization'] = `Bearer ${req.auth.token}`;
  } else if (req.auth.type === 'basic' && (req.auth.username || req.auth.password)) {
    headersObj['Authorization'] = `Basic ${btoa((req.auth.username || '') + ':' + (req.auth.password || ''))}`;
  }

  // Params
  try {
    const urlObj = new URL(finalUrl);
    req.params.forEach(p => {
      if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value);
    });
    finalUrl = urlObj.toString();
  } catch (e) {}

  const hasBody = req.bodyType !== "none" && req.body && ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const bodyText = hasBody ? req.body : "";

  // Generators

  // cURL
  let curl = `curl --request ${method} \\\n  --url '${finalUrl}'`;
  Object.entries(headersObj).forEach(([k, v]) => {
    curl += ` \\\n  --header '${k}: ${v}'`;
  });
  if (hasBody) {
    curl += ` \\\n  --data '${bodyText.replace(/'/g, "'\\''")}'`;
  }

  // JavaScript (Fetch)
  let js = `const options = {\n  method: '${method}'`;
  if (Object.keys(headersObj).length > 0) {
    js += `,\n  headers: ${JSON.stringify(headersObj, null, 4).replace(/\\n/g, '\\n  ')}`;
  }
  if (hasBody) {
    js += `,\n  body: ${typeof bodyText === 'string' ? JSON.stringify(bodyText) : bodyText}`;
  }
  js += `\n};\n\nfetch('${finalUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`;

  // HTTP
  let http = "";
  try {
    const host = new URL(finalUrl).host;
    const pathPart = new URL(finalUrl).pathname + new URL(finalUrl).search;
    http = `${method} ${pathPart} HTTP/1.1\nHost: ${host}\n`;
    Object.entries(headersObj).forEach(([k, v]) => {
      http += `${k}: ${v}\n`;
    });
    if (hasBody) {
      http += `\n${bodyText}`;
    }
  } catch(e) {
    http = "// Invalid URL for HTTP snippet";
  }

  // Go
  let go = `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n`;
  if (hasBody) go += `\t"strings"\n`;
  go += `)\n\nfunc main() {\n`;
  go += `\turl := "${finalUrl}"\n`;
  if (hasBody) {
    go += `\tpayload := strings.NewReader(\`${bodyText.replace(/`/g, '`+"`"+`')}\`)\n`;
    go += `\treq, _ := http.NewRequest("${method}", url, payload)\n`;
  } else {
    go += `\treq, _ := http.NewRequest("${method}", url, nil)\n`;
  }
  Object.entries(headersObj).forEach(([k, v]) => {
    go += `\treq.Header.Add("${k}", "${v}")\n`;
  });
  go += `\tres, _ := http.DefaultClient.Do(req)\n`;
  go += `\tdefer res.Body.Close()\n`;
  go += `\tbody, _ := ioutil.ReadAll(res.Body)\n`;
  go += `\tfmt.Println(res)\n`;
  go += `\tfmt.Println(string(body))\n}`;

  // Java (OkHttp)
  let java = `OkHttpClient client = new OkHttpClient();\n\n`;
  if (hasBody) {
    java += `MediaType mediaType = MediaType.parse("application/json");\n`;
    java += `RequestBody body = RequestBody.create(mediaType, ${JSON.stringify(bodyText)});\n`;
  }
  java += `Request request = new Request.Builder()\n  .url("${finalUrl}")\n`;
  if (hasBody) {
    java += `  .method("${method}", body)\n`;
  } else if (method !== 'GET') {
    java += `  .method("${method}", null)\n`;
  }
  Object.entries(headersObj).forEach(([k, v]) => {
    java += `  .addHeader("${k}", "${v}")\n`;
  });
  java += `  .build();\n\nResponse response = client.newCall(request).execute();`;

  // PHP (cURL)
  let php = `<?php\n\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "${finalUrl}",\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_ENCODING => "",\n  CURLOPT_MAXREDIRS => 10,\n  CURLOPT_TIMEOUT => 30,\n  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n  CURLOPT_CUSTOMREQUEST => "${method}",\n`;
  if (hasBody) {
    php += `  CURLOPT_POSTFIELDS => ${JSON.stringify(bodyText)},\n`;
  }
  if (Object.keys(headersObj).length > 0) {
    php += `  CURLOPT_HTTPHEADER => [\n`;
    Object.entries(headersObj).forEach(([k, v]) => {
      php += `    "${k}: ${v}",\n`;
    });
    php += `  ],\n`;
  }
  php += `]);\n\n$response = curl_exec($curl);\n$err = curl_error($curl);\n\ncurl_close($curl);\n\nif ($err) {\n  echo "cURL Error #:" . $err;\n} else {\n  echo $response;\n}`;

  // Delphi (TIdHTTP)
  let delphi = `var\n  HTTP: TIdHTTP;\n  Response: string;\n`;
  if (hasBody) delphi += `  RequestBody: TStringStream;\n`;
  delphi += `begin\n  HTTP := TIdHTTP.Create(nil);\n  try\n`;
  Object.entries(headersObj).forEach(([k, v]) => {
    delphi += `    HTTP.Request.CustomHeaders.AddValue('${k}', '${v}');\n`;
  });
  if (hasBody) {
    delphi += `    RequestBody := TStringStream.Create(${JSON.stringify(bodyText)});\n    try\n`;
    if (method === 'POST') {
      delphi += `      Response := HTTP.Post('${finalUrl}', RequestBody);\n`;
    } else if (method === 'PUT') {
      delphi += `      Response := HTTP.Put('${finalUrl}', RequestBody);\n`;
    } else {
      delphi += `      // Method ${method} might need custom handling in Indy\n`;
    }
    delphi += `    finally\n      RequestBody.Free;\n    end;\n`;
  } else {
    delphi += `    Response := HTTP.Get('${finalUrl}');\n`;
  }
  delphi += `  finally\n    HTTP.Free;\n  end;\nend;`;


  return {
    cURL: curl,
    "JavaScript (Fetch)": js,
    PHP: php,
    Go: go,
    Java: java,
    Delphi: delphi,
    HTTP: http,
  };
}
