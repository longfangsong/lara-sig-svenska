import { DBTypes } from "../types";

export async function getArticleMetas(
  db: D1Database,
  limit: number,
  offset: number,
): Promise<Array<DBTypes.ArticleMeta>> {
  const result = await db
    .prepare(
      `SELECT Article.id, Article.title
      FROM Article
      ORDER BY Article.create_time DESC
      LIMIT ?1
      OFFSET ?2`,
    )
    .bind(limit, offset)
    .all<DBTypes.ArticleMeta>();
  if (!result.success) throw new Error(result.error);
  return result.results;
}

export async function getArticle(
  db: D1Database,
  id: string,
): Promise<DBTypes.Article | null> {
  return await db
    .prepare(
      `SELECT Article.id, Article.title, Article.content, Article.create_time, Article.url, Article.voice_url
      FROM Article
      WHERE Article.id = ?1;`,
    )
    .bind(id)
    .first<DBTypes.Article>();
}
