export interface ArticleMeta {
  id: string;
  title: string;
}

export interface Article extends ArticleMeta {
  url: string;
  content: string;
  voice_url: string;
}
