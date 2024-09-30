-- Migration number: 0001 	 2024-09-27T11:57:22.545Z

CREATE TABLE Article (
    id CHAR(36) PRIMARY KEY,
    title text,
    content text,
    create_time INTEGER,
    url VARCHAR(2048),
    voice_url VARCHAR(2048)
);

CREATE TABLE Word (
    id CHAR(36) PRIMARY KEY,
    lemma VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(32),
    phonetic VARCHAR(255) NOT NULL,
    phonetic_voice BLOB,
    phonetic_url VARCHAR(2048)
);

CREATE TABLE WordIndex (
    id CHAR(36) PRIMARY KEY,
    word_id CHAR(36) NOT NULL REFERENCES Word(id),
    spell VARCHAR(255) NOT NULL,
    form VARCHAR(16)
);

CREATE INDEX idx_WordIndex_spell ON WordIndex(spell);
CREATE INDEX idx_WordIndex_word_id ON WordIndex(word_id);

CREATE TABLE Lexeme (
    id CHAR(36) PRIMARY KEY,
    word_id CHAR(36) NOT NULL REFERENCES Word(id),
    definition TEXT NOT NULL,
    example TEXT,
    example_meaning TEXT,
    -- lexin-swe | folkets-lexikon | AI
    source VARCHAR(16) NOT NULL
);
CREATE INDEX idx_Lexeme_word_id ON Lexeme(word_id);

CREATE TABLE ReviewProgress (
    id CHAR(36) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    word_id CHAR(36) NOT NULL REFERENCES Word(id),
    query_count INTEGER NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    last_last_review_time INTEGER,
    last_review_time INTEGER
);
CREATE INDEX idx_ReviewProgress_user_email ON ReviewProgress(user_email);
