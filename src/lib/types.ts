export interface ArticleMeta {
    id: string;
    title: string;
    url: string;
}

export interface Article extends ArticleMeta {
    words: Array<string>;
}
