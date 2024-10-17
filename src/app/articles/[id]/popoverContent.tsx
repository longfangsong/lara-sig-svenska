"use client";

import { WordDetail } from "@/app/_components/WordDetail";
import { fetchWithSemaphore } from "@/lib/fetch";
import { Word } from "@/lib/types";
import { HR } from "flowbite-react";
import React from "react";
import { useEffect, useState } from "react";

export function PopoverContent({ spell }: { spell: string }) {
  const [words, setWords] = useState<Array<Word> | null>(null);
  useEffect(() => {
    (async () => {
      /// todo: error handling
      const result = await fetchWithSemaphore(
        `/api/words?index_spell=${spell}`,
      );
      const queryResult: Array<Word> = await result.json();
      setWords(queryResult);
    })();
  }, [spell]);
  if (words === null) {
  } else {
    return (
      <div className="max-h-72 overflow-scroll">
        {words?.map((word, index) => (
          <React.Fragment key={word.id}>
            <div className="hover:bg-sky-200 dark:hover:bg-slate-700 p-2">
              <h2 className="text-xl font-semibold">{word.lemma}</h2>
              <WordDetail word={word} />
            </div>
            {index < words.length - 1 ? <HR className="m-0 border" /> : <></>}
          </React.Fragment>
        ))}
      </div>
    );
  }
}
