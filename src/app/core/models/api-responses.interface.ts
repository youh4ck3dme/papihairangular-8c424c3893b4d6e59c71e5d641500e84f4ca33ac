/**
 * Type definitions for external API responses
 */

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
