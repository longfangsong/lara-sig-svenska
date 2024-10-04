import { expect, test, describe } from "vitest";
import { env } from "cloudflare:test";
import { getWord, searchWord } from "./word";
import { Word } from "../types";

describe("Test word fetching", () => {
  test("should be able to search the word (full match)", async () => {
    const result = await searchWord(env.DB, "a");
    expect(result.length).toBe(10);
    const firstResult = result[0];
    expect(firstResult.lemma).toBe("a");
    expect(firstResult.definitions).contains("första bokstaven i alfabetet");
    expect(firstResult.definitions).contains(
      "the first letter of the alphabet",
    );
  });

  test("should be able to search the word (prefix)", async () => {
    const result = await searchWord(env.DB, "abstr");
    expect(result.length).toBe(3);
    expect(result.map((it) => it.lemma)).contains("abstrakt");
  });

  test("should be able to get the word", async () => {
    const searchResult = await searchWord(env.DB, "barn");
    const wordId = searchResult[0].id;
    const result: Word = await getWord(env.DB, wordId);
    expect(result).not.toBeNull();
    expect(result?.lemma).toBe("barn");
    expect(result?.part_of_speech).toBe("subst.");
    const obestPlural = result?.indexes.find((it) => it.form === "obest.f.pl.");
    expect(obestPlural?.spell).toBe("barn");
    const bestSing = result?.indexes.find((it) => it.form === "best.f.sing.");
    expect(bestSing?.spell).toBe("barnet");
    const otherRelated = result?.indexes.find((it) => it.spell === "barnbok");
    expect(otherRelated?.form).toBe(null);
    const meanings = result?.lexemes;
    expect(meanings?.length).not.toBe(0);
  });
});
