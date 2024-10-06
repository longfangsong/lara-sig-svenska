"use client";

import { Word, WordSearchResult } from "@/lib/types";
import debounce from "debounce";
import { FloatingLabel, HR, Table, TableCell } from "flowbite-react";
import React, { useState } from "react";
import { WordDetail } from "../_components/WordDetail";

export default function Words() {
  const [words, setWords] = useState<Array<WordSearchResult>>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  return (
    <div>
      <FloatingLabel
        variant="filled"
        label="Search"
        onKeyDown={debounce((e) => {
          (async () => {
            const response = await fetch(`/api/words?search=${e.target.value}`);
            const result: Array<WordSearchResult> = await response.json();
            setWords(result);
          })();
        }, 500)}
      />
      <Table>
        <Table.Head>
          <Table.HeadCell>Spell</Table.HeadCell>
          <Table.HeadCell>Definitions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {words.map((word) => (
            <Table.Row
              key={word.id}
              onClick={async () => {
                const selectedWord = await fetch(`/api/words/${word.id}`);
                setSelectedWord(await selectedWord.json());
              }}
            >
              <TableCell className="py-1">{word.lemma}</TableCell>
              <TableCell className="py-1">
                {word.definitions.map((definition, index) => (
                  <React.Fragment key={definition}>
                    <p>{definition}</p>
                    {index !== word.definitions.length - 1 ? (
                      <HR className="m-1" />
                    ) : (
                      <></>
                    )}
                  </React.Fragment>
                ))}
              </TableCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <WordDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
