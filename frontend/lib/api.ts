// frontend/lib/api.ts

// By using a relative path, we can leverage Netlify redirects in production
// and Next.js rewrites in local development.
const API_BASE_URL = "";

/**
 * Defines the structure for the main statistics object from the backend.
 */
export interface SystemStats {
  total_flows: number;
  normal: number;
  attacks: number;
  recent_attack_ratio: number;
  status: "SAFE" | "THREAT";
}

/**
 * Defines the structure for a single alert entry from the backend.
 */
export interface ApiAlert {
  model_used: string;
  prediction: 0 | 1;
  label: "Normal" | "DDoS Attack";
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
}

/**
 * Defines the structure for prediction result
 */
export interface PredictionResult {
  model_used: string;
  prediction: number;
  label: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
}

/**
 * CSV Prediction result
 */
export interface CSVPredictionResult {
  model_used: string;
  total_rows: number;
  ddos_detected: number;
  normal: number;
}

/**
 * Flow data for single prediction
 */
export interface FlowDataInput {
  "Source IP": string;
  "Destination IP": string;
  "Source Port": number;
  "Destination Port": number;
  Protocol: number;
  "Flow Duration": number;
  "Total Fwd Packets": number;
  "Total Backward Packets": number;
  "Total Length of Fwd Packets": number;
  "Total Length of Bwd Packets": number;
  "Fwd Packet Length Max": number;
  "Fwd Packet Length Min": number;
  "Fwd Packet Length Mean": number;
  "Bwd Packet Length Max": number;
  "Bwd Packet Length Min": number;
  "Bwd Packet Length Mean": number;
  "Flow Bytes/s": number;
  "Flow Packets/s": number;
  "Flow IAT Mean": number;
  "Flow IAT Std": number;
  "Flow IAT Max": number;
  "Flow IAT Min": number;
  "Fwd IAT Total": number;
  "Fwd IAT Mean": number;
  "Fwd IAT Std": number;
  "Fwd IAT Max": number;
  "Fwd IAT Min": number;
  "Bwd IAT Total": number;
  "Bwd IAT Mean": number;
  "Bwd IAT Std": number;
  "Bwd IAT Max": number;
  "Bwd IAT Min": number;
  "Min Packet Length": number;
  "Max Packet Length": number;
  "Packet Length Mean": number;
  "Packet Length Std": number;
  "FIN Flag Count": number;
  "SYN Flag Count": number;
  "RST Flag Count": number;
  "PSH Flag Count": number;
  "ACK Flag Count": number;
  "URG Flag Count": number;
  "CWE Flag Count": number;
  "ECE Flag Count": number;
  "Down/Up Ratio": number;
  "Average Packet Size": number;
  "Avg Fwd Segment Size": number;
  "Avg Bwd Segment Size": number;
  "Fwd Header Length": number;
  "Bwd Header Length": number;
  "Fwd Bytes/Bulk Avg": number;
  "Fwd Packet/Bulk Avg": number;
  "Fwd Bulk Rate": number;
  "Bwd Bytes/Bulk Avg": number;
  "Bwd Packet/Bulk Avg": number;
  "Bwd Bulk Rate": number;
  "Subflow Fwd Packets": number;
  "Subflow Fwd Bytes": number;
  "Subflow Bwd Packets": number;
  "Subflow Bwd Bytes": number;
  "Init_Win_bytes_forward": number;
  "Init_Win_bytes_backward": number;
  "act_data_pkt_fwd": number;
  "min_seg_size_forward": number;
  "Active Mean": number;
  "Active Std": number;
  "Active Max": number;
  "Active Min": number;
  "Idle Mean": number;
  "Idle Std": number;
  "Idle Max": number;
  "Idle Min": number;
}

/**
 * Fetches the main system statistics from the backend.
 */
export async function fetchStats(): Promise<SystemStats> {
  const response = await fetch(`${API_BASE_URL}/api/stats`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch system stats: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches the list of recent alerts from the backend.
 */
export async function fetchAlerts(): Promise<ApiAlert[]> {
  const response = await fetch(`${API_BASE_URL}/api/alerts`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  const alerts: ApiAlert[] = await response.json();
  // Reverse to show the most recent alerts first
  return alerts.reverse();
}

/**
 * Get the latest prediction from the backend.
 */
export async function fetchLatestPrediction(): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/api/latest`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch latest prediction: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Make a single flow prediction.
 * @param flowData - The flow data to predict
 * @param modelName - Optional model name (default: xgboost)
 */
export async function predictFlow(flowData: FlowDataInput, modelName: string = "xgboost"): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/predict?model=${modelName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(flowData),
  });
  
  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Upload a CSV file for batch prediction.
 * @param file - The CSV file to predict
 * @param modelName - Optional model name (default: xgboost)
 */
export async function predictCSV(file: File, modelName: string = "xgboost"): Promise<CSVPredictionResult> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_BASE_URL}/predict-csv?model=${modelName}`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`CSV prediction failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get available models from the backend.
 */
export async function getAvailableModels(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  const data = await response.json();
  return data.available_models || [];
}

/**
 * Check backend health/connection.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
