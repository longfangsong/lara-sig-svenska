"use client";

import { Word } from "@/lib/types";
import { HR, Modal } from "flowbite-react";
import { PlayButton } from "./PlayButton";
import React from "react";

export function WordDetail({
  word,
  onClose,
}: {
  word: Word | null;
  onClose?: () => void;
}) {
  return (
    <Modal show={word !== null} onClose={onClose}>
      <Modal.Header>{word?.lemma}</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          <p>[{word?.phonetic}]</p>
          <p>{word?.part_of_speech}</p>
          {word ? <PlayButton voice={word} /> : <></>}
          {word?.part_of_speech === "subst." ? (
            <>
              {word?.indexes
                .find((it) => it.form === "best.f.sing.")
                ?.spell.endsWith("t") ? (
                <p>
                  "{word.lemma}" är ett <b className="text-red-500">ett</b>-ord
                </p>
              ) : (
                <p>
                  '{word.lemma}' är ett <b className="text-green-500">en</b>-ord
                </p>
              )}
              {substantiveTable(word)}
            </>
          ) : word?.part_of_speech === "verb" ? (
            verbTable(word)
          ) : word?.part_of_speech === "adj." ? (
            adjectiveTable(word)
          ) : (
            <></>
          )}
        </div>
        <HR className="m-1 border" />
        {word?.lexemes.map((lexeme, index) => (
          <React.Fragment key={lexeme.id}>
            <p>{lexeme.definition}</p>
            <div className="grid grid-cols-2">
              <span className="text-sm text-green-500">
                {lexeme.example ? lexeme.example : ""}
              </span>
              <span className="text-sm text-blue-500">
                {lexeme.example_meaning ? lexeme.example_meaning : ""}
              </span>
            </div>
            {index !== word?.lexemes.length - 1 ? (
              <HR className="m-1 border-t" />
            ) : (
              <></>
            )}
          </React.Fragment>
        ))}
      </Modal.Body>
    </Modal>
  );
}

function substantiveTable(word: Word) {
  return (
    <table className="py-1 px-2 border border-sky-500">
      <thead>
        <tr>
          <th />
          <th className="py-1 px-2 border border-sky-500">Obestämd</th>
          <th className="py-1 px-2 border border-sky-500">Bestämd</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1 px-2 border border-sky-500">Singular</td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "obest.f.sing.")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "best.f.sing.")?.spell}
          </td>
        </tr>
        <tr>
          <td className="py-1 px-2 border border-sky-500">Plural</td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "obest.f.pl.")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "best.f.pl.")?.spell}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function verbTable(word: Word) {
  return (
    <table className="py-1 px-2 border border-sky-500">
      <thead>
        <tr>
          <th className="py-1 px-2 border border-sky-500">Imperativ</th>
          <th className="py-1 px-2 border border-sky-500">Infinitiv</th>
          <th className="py-1 px-2 border border-sky-500">Supinum</th>
          <th className="py-1 px-2 border border-sky-500">Imperfekt</th>
          <th className="py-1 px-2 border border-sky-500">Perfekt particip</th>
          <th className="py-1 px-2 border border-sky-500">Presens</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "imperativ")?.spell}!
          </td>
          <td className="py-1 px-2 border border-sky-500">
            <span className="text-xs">att </span>
            {word?.indexes.find((it) => it.form === "infinitiv")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            <span className="text-xs">har </span>
            {word?.indexes.find((it) => it.form === "supinum")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "imperfekt")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            <span className="text-xs">är </span>
            {word?.indexes.find((it) => it.form === "perf.part.")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "presens")?.spell}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function adjectiveTable(word: Word) {
  return (
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
            {word?.indexes.find((it) => it.form === "nform")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "tform")?.spell}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {word?.indexes.find((it) => it.form === "aform")?.spell}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
