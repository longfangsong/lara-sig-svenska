"use client";

import { Button } from "flowbite-react";
import { RiUserVoiceLine } from "react-icons/ri";

export function PlayButton({
  voice,
}: {
  voice: { phonetic_url: string | null };
}) {
  return (
    <Button
      className="ml-3 p-0"
      onClick={() => {
        if (voice.phonetic_url) {
          new Audio(voice.phonetic_url).play();
        }
      }}
    >
      <RiUserVoiceLine className="h-4 w-4" />
    </Button>
  );
}
