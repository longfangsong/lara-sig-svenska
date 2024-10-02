"use client";

import { WordSearchResult } from "@/lib/types";
import debounce from "debounce";
import {
  FloatingLabel,
  HR,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useState } from "react";

export default function Words({
  searchParams,
}: {
  searchParams?: { spell?: string };
}) {
  const [words, setWords] = useState<Array<WordSearchResult>>([]);
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
        <TableHead>
          <TableHeadCell>Spell</TableHeadCell>
          <TableHeadCell>Definitions</TableHeadCell>
        </TableHead>
        <TableBody className="divide-y">
          {words.map((word) => (
            <TableRow key={word.id}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
