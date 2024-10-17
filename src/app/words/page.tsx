"use client";

import { Word, WordSearchResult } from "@/lib/types";
import debounce from "debounce";
import {
  FloatingLabel,
  HR,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableCell,
} from "flowbite-react";
import React, { useState } from "react";
import { fetchWithSemaphore } from "@/lib/fetch";
import { WordDetail } from "../_components/WordDetail";

export function WordDetailModal({
  word,
  onClose,
}: {
  word: Word | null;
  onClose?: () => void;
}) {
  return (
    <Modal show={word !== null} onClose={onClose}>
      <ModalHeader>{word?.lemma}</ModalHeader>
      <ModalBody className="p-4">
        <WordDetail word={word} />
      </ModalBody>
    </Modal>
  );
}

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
            if (e.target.value === "") {
              setWords([]);
              return;
            }
            const response = await fetchWithSemaphore(
              `/api/words?search=${e.target.value}`,
            );
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
                const selectedWord = await fetchWithSemaphore(
                  `/api/words/${word.id}`,
                );
                const result: Word = await selectedWord.json();
                console.log(result);
                setSelectedWord(result);
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
      <WordDetailModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}
