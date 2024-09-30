interface SearchResult {
  id: string;
  lemma: string;
  definitions: Array<string>;
}
export async function searchWord(
  db: D1Database,
  spell: string,
): Promise<Array<SearchResult>> {
  const result = await db
    .prepare(
      `SELECT FoundWords.id, FoundWords.lemma, Lexeme.definition, Lexeme.source FROM (
          SELECT 0 as source, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma=?1
          UNION
          SELECT 1 as source, Word.id, Word.lemma, length (lemma) FROM Word WHERE Word.lemma LIKE ?2
          UNION
          SELECT 2 as source, Word.id, Word.lemma, length (lemma) FROM Word, WordIndex WHERE Word.id=WordIndex.word_id AND WordIndex.spell LIKE ?2
          ORDER BY length (lemma)
          LIMIT 20
      ) AS FoundWords, Lexeme
      WHERE FoundWords.id=Lexeme.word_id
      GROUP BY FoundWords.lemma, Lexeme.definition
      ORDER BY FoundWords.source ASC;`,
    )
    .bind(spell, `${spell}%`)
    .all<{ id: string; lemma: string; definition: string }>();
  if (!result.success) throw new Error(result.error);
  const groupedResults: Record<string, SearchResult> = {};
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
