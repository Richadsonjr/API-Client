import { Send, Code2 } from 'lucide-react';
import { RequestData } from '../types';
import { cn } from '../lib/utils';

interface RequestBarProps {
  request: RequestData;
  onChange: (updates: Partial<RequestData>) => void;
  onSend: () => void;
  onShowCode: () => void;
  loading: boolean;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

export function RequestBar({ request, onChange, onSend, onShowCode, loading }: RequestBarProps) {
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
    <div className="flex bg-[#1a1a1a] rounded-md border border-gray-700/50 p-1 shadow-sm">
      <select
        value={request.method}
        onChange={(e) => onChange({ method: e.target.value })}
        className={cn(
          "bg-transparent focus:outline-none px-4 py-2 font-semibold cursor-pointer border-r border-gray-700/50",
          methodColor(request.method)
        )}
      >
        {METHODS.map(m => (
          <option key={m} value={m} className="bg-[#2a2a2a] text-gray-200">
            {m}
          </option>
        ))}
      </select>
      
      <input
        type="text"
        value={request.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="Enter request URL"
        className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-gray-200 placeholder-gray-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend();
        }}
      />
      
      <button
        onClick={onSend}
        disabled={loading || !request.url.trim()}
        className={cn(
          "flex items-center gap-2 px-6 py-2 rounded font-medium transition-colors ml-2",
          loading || !request.url.trim()
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-500 text-white"
        )}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
        ) : (
          <Send size={16} />
        )}
        Send
      </button>

      <div className="w-px bg-gray-700/50 mx-2 my-1"></div>

      <button
        onClick={onShowCode}
        title="Generate Code Snippets"
        className="flex items-center justify-center p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <Code2 size={20} />
      </button>
    </div>
  );
}
