import { expect, test, describe } from "vitest";
import { env } from "cloudflare:test";
import { searchWord } from "./data";

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
    expect(result.length).toBe(3);
    expect(result.map((it) => it.lemma)).contains("abstrakt");
  });
});
