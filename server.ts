import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Accept larger payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.text({ limit: "50mb" }));

  // API proxy route
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, method, headers, query, body } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      let parsedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        parsedUrl = 'https://' + url;
      }
      const targetUrl = new URL(parsedUrl);
      if (query && query.length > 0) {
        query.forEach((q: { key: string; value: string; enabled: boolean }) => {
          if (q.enabled && q.key) {
            targetUrl.searchParams.append(q.key, q.value);
          }
        });
      }

      // Prepare headers
      const fetchHeaders: Record<string, string> = {};
      if (headers && headers.length > 0) {
        headers.forEach((h: { key: string; value: string; enabled: boolean }) => {
          if (h.enabled && h.key) {
            fetchHeaders[h.key] = h.value;
          }
        });
      }

      const fetchOptions: RequestInit = {
        method: method || "GET",
        headers: fetchHeaders,
      };

      if (body && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const startTime = Date.now();
      let proxyResponse;
      try {
        proxyResponse = await fetch(targetUrl.toString(), fetchOptions);
      } catch (fetchErr: any) {
         return res.status(500).json({
          error: "Failed to fetch from target URL",
          details: fetchErr.message,
          time: Date.now() - startTime
        });
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = proxyResponse.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await proxyResponse.json();
        } catch (e) {
          responseData = await proxyResponse.text();
        }
      } else {
        responseData = await proxyResponse.text();
      }

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      proxyResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      res.status(200).json({
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        time: responseTime,
        headers: responseHeaders,
        data: responseData,
        size: Buffer.byteLength(JSON.stringify(responseData || "")), // Approximate size
      });

    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
