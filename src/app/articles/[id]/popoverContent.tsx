"use client";

import { WordDetail } from "@/app/_components/WordDetail";
import { fetchWithSemaphore } from "@/lib/fetch";
import { Word } from "@/lib/types";
import { Button, HR, Spinner } from "flowbite-react";
import React from "react";
import { useEffect, useState } from "react";
import { RiStickyNoteAddLine } from "react-icons/ri";

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
    return <div className="p-2">
     <Spinner aria-label="Spinner button example" size="xl" />
    </div>
  } else {
    return (
      <div className="max-h-72 max-w-fit overflow-scroll">
        {words?.map((word, index) => (
          <React.Fragment key={word.id}>
            <div className="hover:bg-sky-100 dark:hover:bg-slate-700 p-2">
              <h2 className="text-xl font-semibold">{word.lemma}</h2>
              <WordDetail word={word} buttons={[
                <Button className="ml-3 p-0" onClick={() => alert("todo")}>
                  <RiStickyNoteAddLine className="h-4 w-4" />
                </Button>
              ]}/>
            </div>
            {index < words.length - 1 ? <HR className="m-0 border" /> : <></>}
          </React.Fragment>
        ))}
      </div>
    );
  }
}
