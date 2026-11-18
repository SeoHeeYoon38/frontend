import type { ItemComment, TripInteractions } from "../api/interactions.ts";

export function canDeleteComment(comment: ItemComment, currentUserId?: number) {
  return currentUserId !== undefined && currentUserId > 0 && comment.author.id === currentUserId;
}

export function removeComment(interactions: TripInteractions, commentId: number): TripInteractions {
  const target = interactions.comments.find((comment) => comment.id === commentId);
  if (!target) return interactions;
  const removed = interactions.comments.filter((comment) => comment.id === commentId || comment.parentId === commentId);
  const ids = new Set(removed.map((comment) => comment.id));
  return {
    items: interactions.items.map((item) => item.itemId === target.itemId
      ? { ...item, commentCount: Math.max(0, item.commentCount - removed.length) } : item),
    comments: interactions.comments.filter((comment) => !ids.has(comment.id)),
  };
}

export function appendComment(interactions: TripInteractions, comment: ItemComment): TripInteractions {
  if (interactions.comments.some((item) => item.id === comment.id)) return interactions;
  return {
    items: interactions.items.map((item) => item.itemId === comment.itemId
      ? { ...item, commentCount: item.commentCount + 1 } : item),
    comments: [...interactions.comments, comment],
  };
}

export function commentInputValid(text: string) {
  return text.trim().length > 0 && text.trim().length <= 500;
}
