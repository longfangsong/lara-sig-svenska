export interface ArticleMeta {
    id: string;
    title: string;
    url: string;
}

export interface WordInArticle {
    id: string | null,
    spell: string,
    review_count: number | null,
}

export interface Article extends ArticleMeta {
    words: Array<WordInArticle>;
}

export interface Word {
    id: string;
    spell: string;
    pronunciation: string;
    meaning: string;
    pronunciation_voice: string;
}

export interface UserWord extends Word {
    review_count: number;
}