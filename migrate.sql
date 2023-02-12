CREATE TABLE Article(
    id SERIAL PRIMARY KEY,
    title text,
    url text unique,
    content text
);
