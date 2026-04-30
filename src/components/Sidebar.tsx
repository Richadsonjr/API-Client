import { HistoryItem, RequestData } from '../types';
import { Clock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  history: HistoryItem[];
  onSelect: (request: RequestData) => void;
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
}

export function Sidebar({ history, onSelect, onClearAll, onRemoveItem }: SidebarProps) {
  const methodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-orange-500';
      case 'PUT': return 'text-blue-500';
      case 'DELETE': return 'text-red-500';
      case 'PATCH': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-64 border-r border-gray-800 bg-[#161616] flex flex-col hidden md:flex">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg">
          A
        </div>
        <h1 className="font-bold text-lg text-gray-200">API Tester</h1>
      </div>
      
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Clock size={14} /> History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClearAll} 
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Clear all history"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {history.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center mt-4">
            No history yet. Send a request to get started.
          </div>
        ) : (
          <div className="flex flex-col">
            {history.map((item) => {
              let path = item.request.url;
              try {
                if (item.request.url) {
                  const urlObj = new URL(item.request.url.startsWith('http') ? item.request.url : `http://${item.request.url}`);
                  path = urlObj.pathname + urlObj.search;
                  if (path === '/') path = item.request.url;
                }
              } catch(e) {}
              
              return (
                <div key={item.id} className="relative flex flex-col border-b border-gray-800/50 group">
                  <button
                    onClick={() => onSelect(item.request)}
                    className="flex flex-col gap-1 p-3 hover:bg-[#222] transition-colors text-left flex-1"
                  >
                    <div className="flex items-center justify-between pr-6">
                      <span className={cn("text-xs font-bold", methodColor(item.request.method))}>
                        {item.request.method}
                      </span>
                      {item.status !== undefined && (
                        <span className={cn(
                          "text-[10px] px-1.5 rounded-full font-medium flex items-center gap-1",
                          item.status >= 200 && item.status < 300 ? "bg-green-500/10 text-green-500" :
                          item.status === 0 ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                        )}>
                          {item.status === 0 ? "ERROR" : item.status}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 truncate w-full group-hover:text-white pr-6" title={item.request.url}>
                      {path !== '/' ? path : item.request.url}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
