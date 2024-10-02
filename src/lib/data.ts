import { DBTypes, Word, WordSearchResult } from "./types";

export async function searchWord(
  db: D1Database,
  spell: string,
): Promise<Array<WordSearchResult>> {
  const result = await db
    .prepare(
      `SELECT FoundWords.id, FoundWords.lemma, Lexeme.definition, Lexeme.source FROM (
          SELECT 0 as source_id, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma=?1
          UNION
          SELECT 1 as source_id, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma LIKE ?2
          UNION
          SELECT 2 as source_id, Word.id, Word.lemma, length (lemma) FROM Word, WordIndex WHERE Word.id=WordIndex.word_id AND WordIndex.spell LIKE ?2
          ORDER BY length (lemma)
          LIMIT 20
      ) AS FoundWords, Lexeme
      WHERE FoundWords.id=Lexeme.word_id
      GROUP BY FoundWords.lemma, Lexeme.definition
      ORDER BY FoundWords.source_id ASC;`,
    )
    .bind(spell, `${spell}%`)
    .all<{ id: string; lemma: string; definition: string }>();
  if (!result.success) throw new Error(result.error);
  const groupedResults: Record<string, WordSearchResult> = {};
  for (const row of result.results) {
    if (!groupedResults[row.lemma]) {
      groupedResults[row.lemma] = {
        id: row.id,
        lemma: row.lemma,
        definitions: [],
      };
    }
    groupedResults[row.lemma].definitions.push(row.definition);
  }
  return Object.values(groupedResults);
}

async function getDBWord(
  db: D1Database,
  id: string,
): Promise<DBTypes.Word | null> {
  return await db
    .prepare(
      `SELECT Word.id, Word.lemma, Word.part_of_speech, Word.phonetic, Word.phonetic_voice, Word.phonetic_url
      FROM Word
      WHERE Word.id=?1`,
    )
    .bind(id)
    .first<DBTypes.Word>();
}

async function getDBWordIndexesByWordId(
  db: D1Database,
  wordId: string,
): Promise<Array<DBTypes.WordIndex>> {
  const result = await db
    .prepare(
      `SELECT WordIndex.id, WordIndex.word_id, WordIndex.spell, WordIndex.form
      FROM WordIndex
      WHERE WordIndex.word_id=?1`,
    )
    .bind(wordId)
    .all<DBTypes.WordIndex>();
  if (!result.success) throw new Error(result.error);
  return result.results;
}

async function getDBLexemesByWordId(
  db: D1Database,
  wordId: string,
): Promise<Array<DBTypes.Lexeme>> {
  const result = await db
    .prepare(
      `SELECT Lexeme.id, Lexeme.word_id, Lexeme.definition, Lexeme.example, Lexeme.example_meaning, Lexeme.source
      FROM Lexeme
      WHERE Lexeme.word_id=?1`,
    )
    .bind(wordId)
    .all<DBTypes.Lexeme>();
  if (!result.success) throw new Error(result.error);
  return result.results;
}

export async function getWord(
  db: D1Database,
  id: string,
): Promise<Word | null> {
  const word = await getDBWord(db, id);
  if (!word) return null;
  const indexes = await getDBWordIndexesByWordId(db, id);
  const lexemes = await getDBLexemesByWordId(db, id);
  return {
    ...word,
    indexes,
    lexemes,
  };
}
