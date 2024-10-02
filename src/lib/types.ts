export namespace DBTypes {
  export interface Article {
    id: string;
    title: string;
    content: string;
    create_time: number;
    url: string;
    voice_url: string;
  }

  export interface Word {
    id: string;
    lemma: string;
    part_of_speech: string;
    phonetic: string;
    phonetic_voice: string | null;
    phonetic_url: string | null;
  }

  export interface WordIndex {
    id: string;
    word_id: string;
    spell: string;
    form: string | null;
  }

  export interface Lexeme {
    id: string;
    word_id: string;
    definition: string;
    example: string | null;
    example_meaning: string | null;
    source: string;
  }

  export interface ReviewProgress {
    id: string;
    user_email: string;
    word_id: string;
    query_count: number;
    review_count: number;
    last_last_review_time: number | null;
    last_review_time: number | null;
  }
}

export interface WordSearchResult {
  id: string;
  lemma: string;
  definitions: Array<string>;
}

export interface Word extends DBTypes.Word {
  indexes: Array<DBTypes.WordIndex>;
  lexemes: Array<DBTypes.Lexeme>;
}
