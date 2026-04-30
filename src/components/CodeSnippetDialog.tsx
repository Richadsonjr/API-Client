import { useState } from 'react';
import { RequestData } from '../types';
import { getCodeSnippets } from '../lib/codeSnippets';
import { X, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function CodeSnippetDialog({ request, onClose }: { request: RequestData, onClose: () => void }) {
  const snippets = getCodeSnippets(request);
  const languages = Object.keys(snippets);
  const [activeLang, setActiveLang] = useState(languages[0]);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg w-full max-w-4xl flex flex-col h-[80vh] shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#222]">
          <h2 className="text-lg font-semibold text-gray-200">Generate Code Snippets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-gray-800 flex flex-col overflow-y-auto bg-[#1b1b1b]">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "p-3 text-sm text-left transition-colors border-l-2",
                  activeLang === lang 
                    ? "bg-[#252525] text-orange-500 font-medium border-orange-500" 
                    : "border-transparent text-gray-400 hover:bg-[#252525] hover:text-gray-200"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
          
          <div className="flex-1 flex flex-col min-w-0 bg-[#161616]">
            <div className="flex items-center justify-end p-2 bg-[#1f1f1f] border-b border-gray-800">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 text-sm font-mono text-gray-300 leading-relaxed whitespace-pre">
              {snippets[activeLang]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
