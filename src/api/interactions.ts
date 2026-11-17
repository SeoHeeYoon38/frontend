import { apiRequest } from "./client";

export interface ItemInteraction {
  itemId: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
}

export interface ItemComment {
  id: number;
  itemId: string;
  parentId: number | null;
  content: string;
  author: { id: number; nickname: string; characterId: number | null };
  likeCount: number;
  liked: boolean;
  createdAt: string;
}

export interface TripInteractions {
  items: ItemInteraction[];
  comments: ItemComment[];
}

export function getTripInteractions(tripId: number, signal?: AbortSignal) {
  return apiRequest<TripInteractions>(`/api/trips/${tripId}/comments`, { signal });
}

export function setItemLike(tripId: number, itemId: string, liked: boolean) {
  return apiRequest<{ count: number; liked: boolean }>(
    `/api/trips/${tripId}/items/${encodeURIComponent(itemId)}/likes`,
    { method: liked ? "POST" : "DELETE" },
  );
}

export function addItemComment(tripId: number, itemId: string, content: string, parentId: number | null) {
  return apiRequest<ItemComment>(`/api/trips/${tripId}/items/${encodeURIComponent(itemId)}/comments`, {
    method: "POST",
    json: { content, parentId },
  });
}

export function setCommentLike(commentId: number, liked: boolean) {
  return apiRequest<{ count: number; liked: boolean }>(`/api/comments/${commentId}/likes`, {
    method: liked ? "POST" : "DELETE",
  });
}
