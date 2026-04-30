/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Send, Plus, Trash2, Clock, Check, ChevronDown, Save, Code2, Download, Upload, Terminal } from 'lucide-react';
import { cn } from './lib/utils';
import { RequestBar } from './components/RequestBar';
import { KeyValueEditor } from './components/KeyValueEditor';
import { BodyEditor } from './components/BodyEditor';
import { AuthEditor } from './components/AuthEditor';
import { ResponseViewer } from './components/ResponseViewer';
import { Sidebar } from './components/Sidebar';
import { CodeSnippetDialog } from './components/CodeSnippetDialog';
import { CurlImportDialog } from './components/CurlImportDialog';
import { HistoryItem, KeyValue, RequestData, ResponseData } from './types';

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"params" | "auth" | "headers" | "body">("params");
  const [showCode, setShowCode] = useState(false);
  const [showCurlModal, setShowCurlModal] = useState(false);
  
  const [request, setRequest] = useState<RequestData>({
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    params: [{ id: "1", key: "", value: "", enabled: true }],
    headers: [{ id: "1", key: "", value: "", enabled: true }],
    auth: { type: "none" },
    bodyType: "none",
    body: "",
  });

  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!request.url.trim()) return;
    
    setLoading(true);
    setResponse(null);

    // Prepare auth headers for actual proxy request
    const finalHeaders = [...request.headers];
    if (request.auth.type === 'bearer' && request.auth.token) {
      finalHeaders.push({ id: 'auth', key: 'Authorization', value: `Bearer ${request.auth.token}`, enabled: true });
    } else if (request.auth.type === 'basic' && (request.auth.username || request.auth.password)) {
      finalHeaders.push({ id: 'auth', key: 'Authorization', value: `Basic ${btoa((request.auth.username || '') + ':' + (request.auth.password || ''))}`, enabled: true });
    }

    // Add Content-Type if body is JSON and not already defined
    if (request.bodyType === "json" && !finalHeaders.some(h => h.enabled && h.key.toLowerCase() === 'content-type')) {
      finalHeaders.push({ id: 'content-type', key: 'Content-Type', value: 'application/json', enabled: true });
    }

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: request.url,
          method: request.method,
          headers: finalHeaders,
          query: request.params,
          body: request.bodyType === "json" ? JSON.parse(request.body || "{}") : request.body,
        }),
      });

      const data = await res.json();
      setResponse(data);
      
      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        request: { ...request },
        timestamp: Date.now(),
        status: data.status,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50
    } catch (error: any) {
      setResponse({
        error: "Client Error: " + error.message,
        status: 0,
        statusText: "Error",
        time: 0,
        size: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = (updates: Partial<RequestData>) => {
    setRequest(prev => ({ ...prev, ...updates }));
  };

  const handleExportRequest = () => {
    const content = JSON.stringify(request, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request_${request.method}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportRequest = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
           const imported = JSON.parse(event.target?.result as string);
           if (imported && imported.method && imported.url !== undefined) {
              setRequest(imported);
           } else {
              alert("Invalid request file format");
           }
        } catch(err) {
           alert("Failed to parse JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#111111] text-gray-200 font-sans">
      <Sidebar 
        history={history} 
        onSelect={(req) => setRequest(req)} 
        onClearAll={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 bg-[#161616]">
           <div className="text-sm font-semibold text-gray-400">Current Request</div>
           <div className="flex items-center gap-2">
             <button onClick={() => setShowCurlModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#222] hover:bg-[#333] text-orange-500 rounded transition-colors border border-gray-700">
               <Terminal size={14} /> Import cURL
             </button>
             <button onClick={handleImportRequest} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#222] hover:bg-[#333] text-gray-300 rounded transition-colors border border-gray-700">
               <Upload size={14} /> Import
             </button>
             <button onClick={handleExportRequest} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#222] hover:bg-[#333] text-gray-300 rounded transition-colors border border-gray-700">
               <Download size={14} /> Export
             </button>
           </div>
        </div>
        <div className="border-b border-gray-800 p-4">
          <RequestBar 
            request={request} 
            onChange={updateRequest} 
            onSend={handleSend}
            onShowCode={() => setShowCode(true)}
            loading={loading} 
          />
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
          {/* Request Configuration */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col border border-gray-800 rounded-md overflow-hidden bg-[#1a1a1a]">
              <div className="flex items-center gap-1 border-b border-gray-800 px-2 bg-[#1f1f1f]">
                {["params", "auth", "headers", "body"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors",
                      activeTab === tab 
                        ? "border-orange-500 text-orange-500" 
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="p-4 min-h-[200px]">
                {activeTab === "params" && (
                  <KeyValueEditor 
                    items={request.params} 
                    onChange={(params) => updateRequest({ params })}
                    placeholderKey="Query Param"
                  />
                )}
                {activeTab === "auth" && (
                  <AuthEditor
                    request={request}
                    onChange={updateRequest}
                  />
                )}
                {activeTab === "headers" && (
                  <KeyValueEditor 
                    items={request.headers} 
                    onChange={(headers) => updateRequest({ headers })}
                    placeholderKey="Header"
                  />
                )}
                {activeTab === "body" && (
                  <BodyEditor 
                    request={request}
                    onChange={updateRequest}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Response Viewer */}
          <div className="flex-1 flex flex-col border border-gray-800 rounded-md overflow-hidden bg-[#1a1a1a]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span>Sending request...</span>
                </div>
              </div>
            ) : (
              <ResponseViewer response={response} />
            )}
          </div>
        </div>
      </main>

      {showCode && (
        <CodeSnippetDialog 
          request={request} 
          onClose={() => setShowCode(false)} 
        />
      )}

      {showCurlModal && (
        <CurlImportDialog
          onClose={() => setShowCurlModal(false)}
          onImport={(importedReq) => {
            setRequest(prev => ({ ...prev, ...importedReq }));
          }}
        />
      )}
    </div>
  );
}
