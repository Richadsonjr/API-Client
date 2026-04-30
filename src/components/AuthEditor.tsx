import { RequestData } from "../types";

export function AuthEditor({ request, onChange }: { request: RequestData, onChange: (updates: Partial<RequestData>) => void }) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      auth: {
        ...request.auth,
        type: e.target.value as any
      }
    });
  };

  const updateAuth = (field: string, value: string) => {
    onChange({
      auth: {
        ...request.auth,
        [field]: value
      }
    });
  };

  return (
    <div className="flex h-full gap-4">
      <div className="w-48 border-r border-gray-800 pr-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</label>
        <select
          value={request.auth.type}
          onChange={handleTypeChange}
          className="w-full bg-[#2a2a2a] border border-gray-700/50 rounded-md p-2 focus:outline-none focus:border-gray-500 text-sm"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
        </select>
        <div className="mt-4 text-xs text-gray-500 leading-relaxed">
          The authorization header will be automatically generated when you send the request.
        </div>
      </div>

      <div className="flex-1">
        {request.auth.type === "none" && (
          <div className="text-gray-500 text-sm mt-8 text-center">
            This request does not use any authorization.
          </div>
        )}
        
        {request.auth.type === "bearer" && (
          <div className="max-w-md flex flex-col gap-4">
             <div className="flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Token</label>
               <input
                 type="text"
                 value={request.auth.token || ""}
                 onChange={(e) => updateAuth("token", e.target.value)}
                 placeholder="Enter bearer token..."
                 className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
               />
             </div>
          </div>
        )}

        {request.auth.type === "basic" && (
          <div className="max-w-md flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
               <input
                 type="text"
                 value={request.auth.username || ""}
                 onChange={(e) => updateAuth("username", e.target.value)}
                 placeholder="Username"
                 className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
               />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
               <input
                 type="password"
                 value={request.auth.password || ""}
                 onChange={(e) => updateAuth("password", e.target.value)}
                 placeholder="Password"
                 className="w-full bg-[#2a2a2a] border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-gray-500 text-sm"
               />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
