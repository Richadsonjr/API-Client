import { Plus, Trash2 } from 'lucide-react';
import { KeyValue } from '../types';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  placeholderKey?: string;
}

export function KeyValueEditor({ items, onChange, placeholderKey = "Key" }: KeyValueEditorProps) {
  const handleAdd = () => {
    onChange([...items, { id: Date.now().toString(), key: "", value: "", enabled: true }]);
  };

  const handleChange = (id: string, field: "key" | "value" | "enabled", val: any) => {
    onChange(items.map(item => item.id === id ? { ...item, [field]: val } : item));
    
    // Auto-add new row if last item is edited
    if (field === "key" && val !== "" && id === items[items.length - 1].id) {
       onChange([
        ...items.map(item => item.id === id ? { ...item, [field]: val } : item),
        { id: Date.now().toString(), key: "", value: "", enabled: true }
      ]);
    }
  };

  const handleRemove = (id: string) => {
    if (items.length === 1) return; // Keep at least one empty row
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => handleChange(item.id, "enabled", e.target.checked)}
            className="w-4 h-4 accent-orange-500 bg-[#2a2a2a] border-gray-600 rounded"
          />
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleChange(item.id, "key", e.target.value)}
            placeholder={placeholderKey}
            className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-gray-500 text-sm"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleChange(item.id, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-gray-500 text-sm"
          />
          <button
            onClick={() => handleRemove(item.id)}
            disabled={items.length === 1 && !item.key && !item.value}
            className="p-1.5 text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
