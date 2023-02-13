CREATE TABLE Article( id SERIAL PRIMARY KEY,
                                        title text, url text unique,
                                                             content text);


CREATE TABLE Word( id BIGSERIAL PRIMARY KEY,
                                        spell text unique,
                                                   meaning text, pronunciation bytea);