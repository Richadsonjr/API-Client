import { useState } from 'react';
import { X, Terminal } from 'lucide-react';
import { parseCurl } from '../lib/curlParser';
import { RequestData } from '../types';

interface CurlImportDialogProps {
  onClose: () => void;
  onImport: (req: Partial<RequestData>) => void;
}

export function CurlImportDialog({ onClose, onImport }: CurlImportDialogProps) {
  const [curlText, setCurlText] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    const parsed = parseCurl(curlText);
    if (!parsed) {
      setError("Failed to parse cURL command. Make sure it starts with 'curl'.");
      return;
    }
    onImport(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg w-full max-w-2xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#222]">
          <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
            <Terminal size={18} className="text-orange-500" /> Import cURL
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-gray-400">Paste your cURL command here:</p>
          <textarea
            value={curlText}
            onChange={(e) => { setCurlText(e.target.value); setError(""); }}
            className="w-full h-48 bg-[#2a2a2a] border border-gray-700/50 rounded-md p-3 focus:outline-none focus:border-orange-500 font-mono text-sm text-gray-200 resize-y"
            placeholder="curl -X GET https://api.example.com -H 'Authorization: Bearer token'"
          />
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-[#161616] rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleImport} 
            disabled={!curlText.trim()}
            className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
