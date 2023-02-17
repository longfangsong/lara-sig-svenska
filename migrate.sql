CREATE TABLE Article( 
    id SERIAL PRIMARY KEY,
    title text,
    url text unique,
    content text,
    create_time timestamp
);

CREATE TABLE Word(
    id BIGSERIAL PRIMARY KEY,
    spell text unique,
    meaning text, 
    pronunciation bytea
);

CREATE TABLE User_Word(
    user_id INTEGER,
    word_id BIGINT,
    review_count INTEGER DEFAULT 0,
    last_review_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (word_id) REFERENCES Word (id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, word_id)
);
