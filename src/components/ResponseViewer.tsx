import { useState } from 'react';
import { ResponseData } from '../types';
import { cn } from '../lib/utils';
import { Clock, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface ResponseViewerProps {
  response: ResponseData | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#1e1e1e]">
        Enter a URL and click Send to see the response
      </div>
    );
  }

  const handleExportResponse = () => {
    if (!response || !response.data) return;
    let content = "";
    if (typeof response.data === 'object') {
       content = JSON.stringify(response.data, null, 2);
    } else {
       content = response.data.toString();
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 300 && status < 400) return 'text-yellow-500';
    if (status >= 400 && status < 500) return 'text-orange-500';
    if (status >= 500) return 'text-red-500';
    return 'text-gray-500';
  };

  const renderBody = () => {
    if (response.error) {
       return <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">{response.error}</div>;
    }
    
    if (typeof response.data === 'object') {
      return (
        <pre className="text-blue-300 font-mono text-sm overflow-auto">
          {JSON.stringify(response.data, null, 2)}
        </pre>
      );
    }

    return (
      <pre className="text-gray-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
        {response.data?.toString() || ""}
      </pre>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Response Header Status */}
      <div className="flex items-center gap-6 border-b border-gray-800 px-4 py-3 bg-[#252525]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</span>
          <span className={cn("font-medium flex items-center gap-1.5", getStatusColor(response.status))}>
            {response.status >= 200 && response.status < 300 ? <CheckCircle2 size={16} /> : (response.status === 0 ? <AlertCircle size={16}/> : null)}
            {response.status === 0 ? "Error" : `${response.status} ${response.statusText}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Time</span>
          <span className="text-green-500 font-medium flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            {response.time} ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Size</span>
          <span className="text-gray-300 font-medium">
            {formatSize(response.size)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 px-2 bg-[#1f1f1f]">
        <div className="flex items-center gap-1">
          {(["body", "headers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        
        {activeTab === "body" && response.data && (
           <button
             onClick={handleExportResponse}
             className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
           >
             <Download size={14} />
             Export JSON
           </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-[#1a1a1a]">
        {activeTab === "body" && renderBody()}
        
        {activeTab === "headers" && (
          <div className="flex flex-col">
            {Object.entries(response.headers || {}).map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-800/50 py-2 text-sm font-mono hover:bg-[#252525]">
                <span className="w-1/3 text-gray-400 shrink-0 break-all">{key}</span>
                <span className="w-2/3 text-gray-200 break-all">{value}</span>
              </div>
            ))}
            {(!response.headers || Object.keys(response.headers).length === 0) && (
              <div className="text-gray-500 text-sm">No headers received</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
