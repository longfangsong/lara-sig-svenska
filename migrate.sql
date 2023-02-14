CREATE TABLE Article( 
    id SERIAL PRIMARY KEY,
    title text,
    url text unique,
    content text,
    create_time timestamp
);

CREATE TABLE Word( id BIGSERIAL PRIMARY KEY,
                                        spell text unique,
                                                   meaning text, pronunciation bytea);