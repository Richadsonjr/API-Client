export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  method: string;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  auth: {
    type: "none" | "basic" | "bearer";
    username?: string;
    password?: string;
    token?: string;
  };
  bodyType: "json" | "text" | "none";
  body: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  time: number;
  size: number;
  headers?: Record<string, string>;
  data?: any;
  error?: string;
}

export interface HistoryItem {
  id: string;
  request: RequestData;
  timestamp: number;
  status?: number;
}
