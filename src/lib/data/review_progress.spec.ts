import { expect, test, describe, beforeEach, vi, afterEach } from "vitest";
import { env } from "cloudflare:test";
import {
  createReviewProgess,
  getReviewProgressesOfUser,
  updateReviewProgress,
} from "./review_progress";

const wordIds = [
  "2b1e1adc-2b9a-4c64-b7ba-a57510805eee",
  "f3b7ebad-4e6a-41dd-b947-c6e413ff33fb",
];
describe("Test dealing with ReviewProgress", () => {
  test("should be able to deal with a single review progess", async () => {
    // create a review progess at t=10
    vi.setSystemTime(new Date(2000, 1, 1, 0, 0, 10));
    await createReviewProgess(env.DB, "a@b.com", wordIds[0]);

    // start a snapshot at 20
    const snapshotTime = new Date(2000, 1, 1, 0, 0, 20).getTime();
    vi.setSystemTime(snapshotTime);
    const firstSearch = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      snapshotTime,
      0,
      10,
    );
    expect(firstSearch.length).toBe(1);
    let result = firstSearch[0];
    // should be reviewable now
    expect(result.next_reviewable_time).lessThanOrEqual(snapshotTime);
    // review it
    const reviewTime = new Date(2000, 1, 1, 0, 0, 30).getTime();
    vi.setSystemTime(reviewTime);
    await updateReviewProgress(env.DB, result.id, {
      review_count: 1,
      last_last_review_time: result.last_review_time!,
      last_review_time: reviewTime,
    });
    const secondSearchOnSamesnapshot = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      snapshotTime,
      0,
      10,
    );
    result = secondSearchOnSamesnapshot[0];
    // should not be reviewable now
    expect(result.next_reviewable_time).greaterThanOrEqual(reviewTime);
    // but in the snapshot, it "seems" to be still reviewable
    expect(result.snapshot_next_reviewable_time).lessThanOrEqual(reviewTime);
    // 1 day passed after the review
    const secondReviewTime = new Date(2000, 1, 2, 0, 0, 40).getTime();
    vi.setSystemTime(reviewTime);
    const thirdSearch = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      secondReviewTime,
      0,
      10,
    );
    result = thirdSearch[0];
    // should be reviewable now
    expect(result.next_reviewable_time).lessThanOrEqual(secondReviewTime);
  });

  test("should order review progesses correctly", async () => {
    // create a review progess at t=10
    vi.setSystemTime(new Date(2000, 1, 1, 0, 0, 10));
    await createReviewProgess(env.DB, "a@b.com", wordIds[0]);
    // create a review progess at t=20
    vi.setSystemTime(new Date(2000, 1, 1, 0, 0, 20));
    await createReviewProgess(env.DB, "a@b.com", wordIds[1]);
    // create a snapshot at t=20
    let snapshotTime = new Date(2000, 1, 1, 0, 0, 30).getTime();
    vi.setSystemTime(snapshotTime);
    let searchResult = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      snapshotTime,
      0,
      10,
    );
    expect(searchResult.length).toBe(2);
    expect(searchResult[0].word_id).toBe(wordIds[0]);
    expect(searchResult[1].word_id).toBe(wordIds[1]);
    // review should not have affect order on the same snapshot
    let reviewTime = new Date(2000, 1, 1, 0, 0, 40).getTime();
    await updateReviewProgress(env.DB, searchResult[0].id, {
      review_count: 1,
      last_last_review_time: searchResult[0].last_review_time!,
      last_review_time: reviewTime,
    });
    vi.setSystemTime(reviewTime);
    searchResult = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      snapshotTime,
      0,
      10,
    );
    expect(searchResult.length).toBe(2);
    expect(searchResult[0].word_id).toBe(wordIds[0]);
    expect(searchResult[1].word_id).toBe(wordIds[1]);
    // but affects a new snapshot
    snapshotTime = new Date(2000, 1, 1, 0, 0, 50).getTime();
    searchResult = await getReviewProgressesOfUser(
      env.DB,
      "a@b.com",
      snapshotTime,
      0,
      10,
    );
    expect(searchResult.length).toBe(2);
    expect(searchResult[0].word_id).toBe(wordIds[1]);
    expect(searchResult[1].word_id).toBe(wordIds[0]);
  });
});
