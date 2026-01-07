export interface Comment {
  id: string; // unikátne ID komentára
  postSlug: string; // slug príspevku, ku ktorému komentár patrí
  author: string; // meno autora komentára
  content: string; // obsah komentára
  date?: string; // ISO dátum vytvorenia komentára (optional pre nové komentáre)
}