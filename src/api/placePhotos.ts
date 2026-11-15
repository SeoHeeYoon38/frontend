import { ApiError, apiRequest } from "./client";

export interface PlacePhoto {
  photoUrl: string;
  totalCount: number;
  attributions: { name: string; uri?: string }[];
}

const photos = new Map<string, Promise<PlacePhoto | null>>();

export function getPlacePhoto(placeId: string, index: number, courseId?: number) {
  const id = encodeURIComponent(placeId);
  const path = courseId === undefined
    ? `/api/places/${id}/photos/${index}`
    : `/api/courses/${courseId}/photos/${id}/${index}`;
  const existing = photos.get(path);
  if (existing) return existing;

  const request = apiRequest<PlacePhoto>(path, { auth: courseId === undefined }).catch((error: unknown) => {
    if (error instanceof ApiError && error.code === "PHOTO_NOT_FOUND") return null;
    photos.delete(path);
    throw error;
  });
  photos.set(path, request);
  return request;
}
