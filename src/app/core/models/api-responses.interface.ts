/**
 * Type definitions for external API responses
 */

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  id: string;
  model: string;
  created: number;
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role?: string;
    };
    finishReason?: string;
    index?: number;
  }[];
  promptFeedback?: {
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  };
}

export interface RouteData {
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
  };
  [key: string]: unknown;
}

export interface ContentCacheItem<T> {
  data: T;
  timestamp: number;
}
