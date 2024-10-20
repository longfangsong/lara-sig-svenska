import {
  DBTypes,
  ReviewProgress,
  ReviewProgressAtSnapshot,
  ReviewProgressPatchPayload,
} from "../types";

export async function createReviewProgess(
  db: D1Database,
  user_email: string,
  word_id: string,
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO ReviewProgress(id, user_email, word_id, last_review_time) VALUES (?1, ?2, ?3, ?4);`,
    )
    .bind(id, user_email, word_id, new Date().getTime())
    .run();
  return id;
}

export async function deleteReviewProgress(db: D1Database, id: string) {
  await db.prepare(`DELETE FROM ReviewProgress WHERE id=?1;`).bind(id).run();
}

function generateSQL(payload: ReviewProgressPatchPayload): string {
  let result = "UPDATE ReviewProgress SET";
  let current_index = 2;
  [
    "query_count",
    "review_count",
    "last_last_review_time",
    "last_review_time",
  ].forEach((field) => {
    if (payload[field as keyof ReviewProgressPatchPayload]) {
      result += ` ${field}=?${current_index},\n`;
      current_index++;
    }
  });
  result = result.trim();
  if (result.endsWith(",")) {
    result = result.slice(0, -1);
  }
  result += "WHERE id=?1;";
  return result;
}

export async function updateReviewProgress(
  db: D1Database,
  id: string,
  payload: ReviewProgressPatchPayload,
) {
  const update_sql = generateSQL(payload);
  const params = [
    id,
    payload.query_count,
    payload.review_count,
    payload.last_last_review_time,
    payload.last_review_time,
  ].filter((it) => it !== undefined);
  await db
    .prepare(update_sql)
    .bind(...params)
    .run();
}

export async function getReviewProgressesOfUser(
  db: D1Database,
  userEmail: string,
  snapshotTime: number,
  offset: number,
  limit: number,
): Promise<Array<ReviewProgressAtSnapshot>> {
  // ---last_last_review_time---(last_review_enable_time)---last_review_time---(next_review_time)
  //                                                      ^ snapshot ==> reviewed after snapshot
  //                                                                         ^ snapshot ==> not reviewd
  const result = await db
    .prepare(
      `SELECT
      id,
      user_email,
      word_id,
      query_count,
      review_count,
      last_last_review_time,
      last_review_time,
      CASE WHEN ?2 < last_review_time
        THEN review_count - 1
        ELSE review_count
      END as snapshot_review_count,
      CASE WHEN ?2 < last_review_time
        THEN (last_last_review_time + 3600000 * CASE review_count - 1
            WHEN 0 THEN 0
            WHEN 1 THEN 1
            WHEN 2 THEN 3
            WHEN 3 THEN 7
            WHEN 4 THEN 15
            WHEN 5 THEN 30
            ELSE NULL
        END)
        ELSE (SELECT last_review_time+3600000 * CASE review_count
            WHEN 0 THEN 0
            WHEN 1 THEN 1
            WHEN 2 THEN 3
            WHEN 3 THEN 7
            WHEN 4 THEN 15
            WHEN 5 THEN 30
            ELSE NULL
          END)
      END as snapshot_next_reviewable_time,
      (
        SELECT last_review_time+3600000 * CASE review_count
            WHEN 0 THEN 0
            WHEN 1 THEN 1
            WHEN 2 THEN 3
            WHEN 3 THEN 7
            WHEN 4 THEN 15
            WHEN 5 THEN 30
            ELSE NULL
          END
      ) as next_reviewable_time
    FROM ReviewProgress
    WHERE ReviewProgress.user_email = ?1
    ORDER BY snapshot_next_reviewable_time ASC, snapshot_review_count DESC
    LIMIT ?4 OFFSET ?3;`,
    )
    .bind(userEmail, snapshotTime, offset, limit)
    .all<ReviewProgressAtSnapshot>();
  return result.results;
}

export async function getReviewProgressByWord(
  db: D1Database,
  userEmail: string,
  wordId: string,
): Promise<ReviewProgress | null> {
  return await db
    .prepare(
      `SELECT
      id,
      user_email,
      word_id,
      query_count,
      review_count,
      last_last_review_time,
      last_review_time,
      (
        SELECT last_review_time+3600000 * CASE review_count
            WHEN 0 THEN 0
            WHEN 1 THEN 1
            WHEN 2 THEN 3
            WHEN 3 THEN 7
            WHEN 4 THEN 15
            WHEN 5 THEN 30
            ELSE NULL
          END
      ) as next_reviewable_time
    FROM ReviewProgress
    WHERE ReviewProgress.user_email = ?1 AND ReviewProgress.word_id = ?2;`,
    )
    .bind(userEmail, wordId)
    .first<ReviewProgress>();
}
