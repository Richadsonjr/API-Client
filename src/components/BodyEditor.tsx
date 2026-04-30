import { RequestData } from '../types';

interface BodyEditorProps {
  request: RequestData;
  onChange: (updates: Partial<RequestData>) => void;
}

export function BodyEditor({ request, onChange }: BodyEditorProps) {
  const handleFormat = () => {
    if (request.bodyType !== "json" || !request.body) return;
    try {
      const parsed = JSON.parse(request.body);
      onChange({ body: JSON.stringify(parsed, null, 2) });
    } catch (e) {
      // Ignore if invalid JSON
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={request.bodyType === "none"}
            onChange={() => onChange({ bodyType: "none", body: "" })}
            className="accent-orange-500"
          />
          <span className="text-gray-300">none</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={request.bodyType === "json"}
            onChange={() => onChange({ bodyType: "json" })}
            className="accent-orange-500"
          />
          <span className="text-gray-300">raw (JSON)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={request.bodyType === "text"}
            onChange={() => onChange({ bodyType: "text" })}
            className="accent-orange-500"
          />
          <span className="text-gray-300">raw (Text)</span>
        </label>
        
        {request.bodyType === "json" && (
          <button 
            onClick={handleFormat}
            className="ml-auto text-xs text-orange-500 hover:text-orange-400 font-medium"
          >
            Format JSON
          </button>
        )}
      </div>

      {request.bodyType !== "none" && (
        <textarea
          value={request.body}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder={request.bodyType === "json" ? '{\n  "key": "value"\n}' : "Enter request body..."}
          className="flex-1 bg-[#2a2a2a] border border-gray-700/50 rounded-md p-3 focus:outline-none focus:border-gray-500 font-mono text-sm min-h-[200px] resize-y"
        />
      )}
    </div>
  );
}
