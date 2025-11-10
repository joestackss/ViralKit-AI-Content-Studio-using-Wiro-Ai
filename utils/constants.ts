import Constants from "expo-constants";

let apiKey = "";
let apiSecret = "";

if (__DEV__) {
  apiKey = process.env.EXPO_PUBLIC_WIRO_API_KEY || "";
  apiSecret = process.env.EXPO_PUBLIC_WIRO_API_SECRET || "";
} else {
  apiKey = Constants.expoConfig?.extra?.wiroApiKey || "";
  apiSecret = Constants.expoConfig?.extra?.wiroApiSecret || "";
}

if (!apiKey || !apiSecret) {
  throw new Error("API key and secret are required");
}

// Wiro API Configuration
export const WIRO_CONFIG = {
  API_KEY: apiKey || "",
  API_SECRET: apiSecret || "",
  BASE_URL: "https://api.wiro.ai/v1",
};

// API Endpoints
export const WIRO_ENDPOINTS = {
  VIRTUAL_TRY_ON: "/Run/wiro/virtual-try-on",
  VIDEO_GENERATION: "/Run/bytedance/image-to-video-seedance-lite-v1",
  CAPTION_GENERATION: "/Run/wiro/rag-chat",
  TASK_DETAIL: "/Task/Detail",
  TASK_KILL: "/Task/Kill",
  TASK_CANCEL: "/Task/Cancel",
};

// Default Configurations for ByteDance Image-to-Video
export const DEFAULT_VIDEO_CONFIG = {
  duration: "5", // "5" or "10" seconds
  resolution: "720p", // "480p" or "720p"
  ratio: "adaptive", // ByteDance uses "adaptive"
  watermark: "false", // "false" or "true"
  camerafixed: "false", // "false" or "true"
  seed: "", // Will be generated if not provided
};

export const DEFAULT_CAPTION_CONFIG = {
  selectedModel: "617", // RAG Chat model ID
  temperature: "0.7",
  top_p: "0.90",
  top_k: "50",
  repetition_penalty: "1.0",
  max_new_tokens: "0",
  seed: "6747892",
  quantization: "--quantization",
  do_sample: "",
  chunk_size: "256",
  chunk_overlap: "25",
  similarity_top_k: "5",
  context_window: "0",
};

export const DEFAULT_TRYON_CONFIG = {
  style: "outdoor",
  pose: "auto",
  plan: "auto",
};

// Polling Configuration
export const POLLING_CONFIG = {
  INTERVAL: 3000, // 3 seconds
  MAX_ATTEMPTS: 60, // 3 minutes max (60 * 3 seconds)
};

// Task Status Values
export const TASK_STATUS = {
  QUEUE: "task_queue",
  START: "task_start",
  OUTPUT: "task_output", // Task is producing output but not complete yet
  COMPLETED: "task_postprocess_end",
  CANCELLED: "task_cancel",
} as const;

// Task statuses that indicate the task is still processing (not failed)
export const PROCESSING_STATUSES = [
  TASK_STATUS.QUEUE,
  TASK_STATUS.START,
  TASK_STATUS.OUTPUT,
];
