export interface BlogPost {
  slug: string; // unikátne URL (napr. "trendove-strihy-2025")
  title: string; // nadpis
  perex: string; // krátky úvod
  authorRole?: string; // rola autora
  subtitle?: string; // podnadpis
  content: string | ContentBlock[]; // HTML string alebo štruktúrovaný obsah
  imageUrl: string; // cesta k obrázku v /images/
  author: string; // meno kaderníka / autora
  date: string; // ISO dátum
  readingTime: number; // čas čítania
  tags: string[]; // tagy
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
