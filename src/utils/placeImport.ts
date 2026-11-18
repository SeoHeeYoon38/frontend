const maxFileSize = 20 * 1024 * 1024;

export function googleMapsImportTarget(device: Pick<Navigator, "userAgent" | "platform" | "maxTouchPoints">) {
  const mobile = /Android|iPhone|iPad|iPod/i.test(device.userAgent) ||
    (device.platform === "MacIntel" && device.maxTouchPoints > 1);
  // The desktop site handles the saved-list panel URL. Use the documented map action on mobile.
  return mobile
    ? { href: "https://www.google.com/maps/@?api=1&map_action=map", opensSavedList: false }
    : { href: "https://www.google.com/maps/@/data=!4m2!10m1!1e1?hl=ko", opensSavedList: true };
}

export function validateTakeoutFile(file: Pick<File, "name" | "size">): string {
  if (!/\.(zip|csv)$/i.test(file.name)) return "ZIP 또는 CSV 파일을 선택해 주세요.";
  if (file.size > maxFileSize) return "20MB 이하의 파일을 선택해 주세요.";
  if (file.size === 0) return "빈 파일이에요. 저장 목록이 담긴 파일을 선택해 주세요.";
  return "";
}

export function validateMapsListLink(value: string): string {
  const error = "공개 Google Maps 목록의 공유 링크를 입력해 주세요.";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return error;

    const shortLink = url.hostname === "maps.app.goo.gl" && /^\/[^/]+\/?$/.test(url.pathname);
    const mapsLink = ["google.com", "www.google.com"].includes(url.hostname) &&
      url.pathname.startsWith("/maps/") &&
      (url.pathname.length > "/maps/".length || Boolean(url.search));
    return shortLink || mapsLink ? "" : error;
  } catch {
    return error;
  }
}

export function extractMapsListLink(value: string): string | undefined {
  const trimmed = value.trim();
  if (!/\s/.test(trimmed) && !validateMapsListLink(trimmed)) return trimmed;

  for (const [url] of trimmed.matchAll(/https:\/\/[^\s<>"“”‘’]+/gi)) {
    const candidate = url.replace(/[)\]},.!?;:…]+$/, "");
    if (!validateMapsListLink(candidate)) return candidate;
  }
}
