"use client";

import { Word } from "@/lib/types";
import { HR, Modal } from "flowbite-react";
import { PlayButton } from "./PlayButton";
import React from "react";

export function WordDetail({ word }: { word: Word | null }) {
  return (
    <>
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
          adjectivePronTable(word)
        ) : word?.part_of_speech === "pron." &&
          word?.indexes.find((it) => it.form === "nform") !== undefined ? (
          adjectivePronTable(word)
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
    </>
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
  const imperativ = word?.indexes.find((it) => it.form === "imperativ")?.spell;
  const infinitiv = word?.indexes.find((it) => it.form === "infinitiv")?.spell;
  const supinum = word?.indexes.find((it) => it.form === "supinum")?.spell;
  const imperfekt = word?.indexes.find((it) => it.form === "imperfekt")?.spell;
  const perf_part = word?.indexes.find((it) => it.form === "perf.part.")?.spell;
  const presens = word?.indexes.find((it) => it.form === "presens")?.spell;
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
            {imperativ ? (
              <>
                <span className="text-xs">att </span>
                {imperativ}!
              </>
            ) : (
              <></>
            )}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {infinitiv ? (
              <>
                <span className="text-xs">att </span>
                {infinitiv}
              </>
            ) : (
              <></>
            )}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {supinum ? (
              <>
                <span className="text-xs">har </span>
                {supinum}
              </>
            ) : (
              <></>
            )}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {imperfekt ? imperfekt : ""}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {perf_part ? (
              <>
                <span className="text-xs">är </span>
                {perf_part}
              </>
            ) : (
              <></>
            )}
          </td>
          <td className="py-1 px-2 border border-sky-500">
            {presens ? presens : ""}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function adjectivePronTable(word: Word) {
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
