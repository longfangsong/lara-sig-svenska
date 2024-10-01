import { expect, test, describe } from "vitest";
import { searchWord } from "../src/lib/data";
import { env } from "cloudflare:test";

describe("Test data fetching", () => {
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
    console.log(result);
    expect(result.length).toBe(3);
    expect(result.map((it) => it.lemma)).contains("abstrakt");
  });
});
