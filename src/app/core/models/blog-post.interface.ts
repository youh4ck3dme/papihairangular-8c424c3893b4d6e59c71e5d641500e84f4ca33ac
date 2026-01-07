export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  perex: string;
  content: string | ContentBlock[];
  author: string;
  authorRole?: string;
  date: string;
  readingTime: number;
  imageUrl: string;
  tags: string[];
  faqs?: { question: string; answer: string }[];
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'heading-level-2' | 'heading-level-3' | 'heading-level-4' | 'image' | 'list' | 'list-item' | 'tip-box';
  data?: string;
  text?: string;
  items?: string[];
  url?: string;
  alt?: string;
  caption?: string;
}
