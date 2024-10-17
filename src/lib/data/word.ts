import { DBTypes, Word, WordSearchResult } from "../types";

function unescapeString(str: string): string {
  return str.replace(/&#39;/g, "'");
}

function unescapeObject(obj: any): any {
  if (typeof obj === "string") {
    return unescapeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(unescapeObject);
  }
  if (typeof obj === "object" && obj !== null) {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = unescapeObject(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

export async function searchWord(
  db: D1Database,
  spell: string,
): Promise<Array<WordSearchResult>> {
  const result = await db
    .prepare(
      `SELECT FoundWords.id, FoundWords.lemma, Lexeme.definition, Lexeme.source FROM (
          SELECT 0 as source_id, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma=?1
          UNION
          SELECT 1 as source_id, Word.id, Word.lemma, length (lemma) FROM Word, WordIndex
            WHERE Word.id=WordIndex.word_id AND WordIndex.spell=?1 AND WordIndex.form is not null
          UNION
          SELECT 2 as source_id, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma LIKE ?2
          UNION
          SELECT 3 as source_id, Word.id, Word.lemma, length (lemma) FROM Word, WordIndex WHERE Word.id=WordIndex.word_id AND WordIndex.spell LIKE ?2
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
    if (!groupedResults[row.id]) {
      groupedResults[row.id] = {
        id: row.id,
        lemma: row.lemma,
        definitions: [],
      };
    }
    groupedResults[row.id].definitions.push(row.definition);
  }
  return unescapeObject(Object.values(groupedResults));
}

async function getDBWord(
  db: D1Database,
  id: string,
): Promise<DBTypes.Word | null> {
  return unescapeObject(
    await db
      .prepare(
        `SELECT Word.id, Word.lemma, Word.part_of_speech, Word.phonetic, Word.phonetic_voice, Word.phonetic_url
      FROM Word
      WHERE Word.id=?1`,
      )
      .bind(id)
      .first<DBTypes.Word>(),
  );
}

export async function getDBWordsByIndex(
  db: D1Database,
  index_spell: string,
): Promise<Array<DBTypes.Word> | null> {
  const queryResult = await db
    .prepare(
      `
      SELECT DISTINCT FoundWord.id,
          FoundWord.lemma,
          FoundWord.part_of_speech,
          FoundWord.phonetic,
          FoundWord.phonetic_voice,
          FoundWord.phonetic_url
      FROM (
        SELECT 0 as source_id,
          Word.id,
          Word.lemma,
          Word.part_of_speech,
          Word.phonetic,
          Word.phonetic_voice,
          Word.phonetic_url
        FROM Word
        WHERE Word.lemma=?1
        UNION
        SELECT 1 as source_id,
          Word.id,
          Word.lemma,
          Word.part_of_speech,
          Word.phonetic,
          Word.phonetic_voice,
          Word.phonetic_url
        FROM Word, WordIndex
        WHERE Word.id=WordIndex.word_id
          AND WordIndex.spell=?1
          AND WordIndex.form is NOT NULL
      ) as FoundWord ORDER BY source_id, length(FoundWord.lemma);`,
    )
    .bind(index_spell)
    .all<DBTypes.Word>();
  if (queryResult.success && queryResult.results.length !== 0) {
    return unescapeObject(queryResult.results);
  }
  const backupQueryResult = await db
    .prepare(
      `SELECT Word.id,
          Word.lemma,
          Word.part_of_speech,
          Word.phonetic,
          Word.phonetic_voice,
          Word.phonetic_url,
          ABS(length(WordIndex.spell)-length(?1)) as length_diff
      FROM Word, WordIndex
      WHERE Word.id=WordIndex.word_id
          AND WordIndex.spell=?1
          AND WordIndex.form is NULL
          ORDER BY length_diff ASC;`,
    )
    .bind(index_spell)
    .all<DBTypes.Word>();
  return backupQueryResult.success
    ? unescapeObject(backupQueryResult.results)
    : null;
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
  return unescapeObject(result.results);
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
  return unescapeObject(result.results);
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

export async function getWordsByIndex(
  db: D1Database,
  index_spell: string,
): Promise<Array<Word> | null> {
  const words = await getDBWordsByIndex(db, index_spell);
  if (!words) return null;
  return await Promise.all(
    words.map(async (word) => {
      const [indexes, lexemes] = await Promise.all([
        getDBWordIndexesByWordId(db, word.id),
        getDBLexemesByWordId(db, word.id),
      ]);
      return {
        ...word,
        indexes,
        lexemes,
      };
    }),
  );
}
