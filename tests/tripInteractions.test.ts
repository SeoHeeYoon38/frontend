import assert from "node:assert/strict";
import test from "node:test";
import type { ItemComment, TripInteractions } from "../src/api/interactions.ts";
import { appendComment, canDeleteComment, commentInputValid, removeComment } from "../src/utils/tripInteractions.ts";

function comment(id: number, parentId: number | null = null, itemId = "visit-a"): ItemComment {
  return { id, parentId, itemId, content: "@민규 여기 어때요?", author: { id: 7, nickname: "지우", characterId: 2 },
    likeCount: 2, liked: true, createdAt: "2026-11-18T10:00:00" };
}

function interactions(): TripInteractions {
  return { items: [
    { itemId: "visit-a", commentCount: 3, likeCount: 4, liked: true },
    { itemId: "visit-b", commentCount: 1, likeCount: 1, liked: false },
  ], comments: [comment(1), comment(2, 1), comment(3, 1), comment(4, null, "visit-b")] };
}

test("로그인 사용자와 작성자 ID가 일치할 때만 삭제할 수 있다", () => {
  assert.equal(canDeleteComment(comment(1), 7), true);
  assert.equal(canDeleteComment(comment(1), 8), false);
  assert.equal(canDeleteComment(comment(1)), false);
  assert.equal(canDeleteComment(comment(1), 0), false);
});

test("원 댓글 삭제 시 답글·댓글 반응을 함께 제거하고 다른 방문과 장소 좋아요는 보존한다", () => {
  const original = interactions();
  const result = removeComment(original, 1);
  assert.deepEqual(result.comments.map((item) => item.id), [4]);
  assert.deepEqual(result.items[0], { itemId: "visit-a", commentCount: 0, likeCount: 4, liked: true });
  assert.deepEqual(result.items[1], original.items[1]);
  assert.equal(original.comments.length, 4);
  assert.equal(removeComment(result, 1), result);
});

test("답글만 삭제하면 원 댓글과 다른 답글을 유지한다", () => {
  const result = removeComment(interactions(), 2);
  assert.deepEqual(result.comments.map((item) => item.id), [1, 3, 4]);
  assert.equal(result.items[0].commentCount, 2);
});

test("작성 응답의 멘션·답글·반응을 그대로 보존하고 중복 반영을 막는다", () => {
  const original = interactions();
  const added = comment(5, 1);
  const result = appendComment(original, added);
  assert.deepEqual(result.comments.at(-1), added);
  assert.equal(result.items[0].commentCount, 4);
  assert.equal(result.items[1].commentCount, 1);
  assert.equal(appendComment(result, added), result);
  assert.equal(original.items[0].commentCount, 3);
});

test("댓글 입력은 공백만인 값과 500자 초과를 막는다", () => {
  assert.equal(commentInputValid("  "), false);
  assert.equal(commentInputValid("가".repeat(500)), true);
  assert.equal(commentInputValid("가".repeat(501)), false);
  assert.equal(commentInputValid(" @민규 여기 어때요? "), true);
});
