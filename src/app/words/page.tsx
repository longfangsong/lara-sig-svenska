"use client";

import { Word, WordSearchResult } from "@/lib/types";
import debounce from "debounce";
import {
  FloatingLabel,
  HR,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useState } from "react";
import { PlayButton } from "../_components/PlayButton";

export default function Words({
  searchParams,
}: {
  searchParams?: { spell?: string };
}) {
  const [words, setWords] = useState<Array<WordSearchResult>>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  return (
    <div>
      <FloatingLabel
        variant="filled"
        label="Label"
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
                  <>
                    <p>{definition}</p>
                    {index !== word.definitions.length - 1 ? (
                      <HR className="m-1" />
                    ) : (
                      <></>
                    )}
                  </>
                ))}
              </TableCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Modal show={selectedWord !== null} onClose={() => setSelectedWord(null)}>
        <Modal.Header>{selectedWord?.lemma}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p>[{selectedWord?.phonetic}]</p>
            <p>{selectedWord?.part_of_speech}</p>
            {selectedWord ? <PlayButton voice={selectedWord} /> : <></>}
            {selectedWord?.part_of_speech === "subst." ? (
              <>
                {selectedWord?.indexes
                  .find((it) => it.form === "best.f.sing.")
                  ?.spell.endsWith("t") ? (
                  <p>
                    "{selectedWord.lemma}" är ett{" "}
                    <b className="text-red-500">ett</b>-ord
                  </p>
                ) : (
                  <p>
                    '{selectedWord.lemma}' är ett{" "}
                    <b className="text-green-500">en</b>-ord
                  </p>
                )}
                <table className="py-1 px-2 border border-sky-500">
                  <thead>
                    <tr>
                      <th />
                      <th className="py-1 px-2 border border-sky-500">
                        Obestämd
                      </th>
                      <th className="py-1 px-2 border border-sky-500">
                        Bestämd
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1 px-2 border border-sky-500">
                        Singular
                      </td>
                      <td className="py-1 px-2 border border-sky-500">
                        {
                          selectedWord?.indexes.find(
                            (it) => it.form === "obest.f.sing.",
                          )?.spell
                        }
                      </td>
                      <td className="py-1 px-2 border border-sky-500">
                        {
                          selectedWord?.indexes.find(
                            (it) => it.form === "best.f.sing.",
                          )?.spell
                        }
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 border border-sky-500">
                        Plural
                      </td>
                      <td className="py-1 px-2 border border-sky-500">
                        {
                          selectedWord?.indexes.find(
                            (it) => it.form === "obest.f.pl.",
                          )?.spell
                        }
                      </td>
                      <td className="py-1 px-2 border border-sky-500">
                        {
                          selectedWord?.indexes.find(
                            (it) => it.form === "best.f.pl.",
                          )?.spell
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : selectedWord?.part_of_speech === "verb" ? (
              <table className="py-1 px-2 border border-sky-500">
                <thead>
                  <tr>
                    <th className="py-1 px-2 border border-sky-500">
                      Imperativ
                    </th>
                    <th className="py-1 px-2 border border-sky-500">
                      Infinitiv
                    </th>
                    <th className="py-1 px-2 border border-sky-500">Supinum</th>
                    <th className="py-1 px-2 border border-sky-500">
                      Imperfekt
                    </th>
                    <th className="py-1 px-2 border border-sky-500">
                      Perfekt particip
                    </th>
                    <th className="py-1 px-2 border border-sky-500">Presens</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "imperativ",
                        )?.spell
                      }
                      !
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      <span className="text-xs">att </span>
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "infinitiv",
                        )?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      <span className="text-xs">har </span>
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "supinum",
                        )?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "imperfekt",
                        )?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      <span className="text-xs">är </span>
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "perf.part.",
                        )?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find(
                          (it) => it.form === "presens",
                        )?.spell
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : selectedWord?.part_of_speech === "adj." ? (
              <table className="py-1 px-2 border border-sky-500">
                <thead>
                  <tr>
                    <th className="py-1 px-2 border border-sky-500">n-form</th>
                    <th className="py-1 px-2 border border-sky-500">t-form</th>
                    <th className="py-1 px-2 border border-sky-500">a-form</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find((it) => it.form === "nform")
                          ?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find((it) => it.form === "tform")
                          ?.spell
                      }
                    </td>
                    <td className="py-1 px-2 border border-sky-500">
                      {
                        selectedWord?.indexes.find((it) => it.form === "aform")
                          ?.spell
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <></>
            )}
          </div>
          <HR className="m-1 border" />
          {selectedWord?.lexemes.map((lexeme, index) => (
            <>
              <p>{lexeme.definition}</p>
              <div className="grid grid-cols-2">
                <span className="text-sm text-green-500">
                  {lexeme.example ? lexeme.example : ""}
                </span>{" "}
                <span className="text-sm text-blue-500">
                  {lexeme.example_meaning ? lexeme.example_meaning : ""}
                </span>
              </div>
              {index !== selectedWord?.lexemes.length - 1 ? (
                <HR className="m-1 border-t" />
              ) : (
                <></>
              )}
            </>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
}
