drop table Article CASCADE;
drop table Spell_Word CASCADE;
drop table Word CASCADE;
drop table User_Word CASCADE;

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
    pronunciation text,
    meaning text,
    pronunciation_voice bytea
);

CREATE TABLE Spell_Word(
    spell text,
    word_id BIGINT,
    FOREIGN KEY (word_id) REFERENCES Word (id) ON DELETE CASCADE,
    PRIMARY KEY (spell, word_id)
);

CREATE TABLE User_Word(
    user_id INTEGER,
    word_id BIGINT,
    review_count INTEGER DEFAULT 0,
    last_review_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (word_id) REFERENCES Word (id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, word_id)
);
