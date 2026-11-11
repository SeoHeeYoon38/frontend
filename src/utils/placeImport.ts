const maxFileSize = 20 * 1024 * 1024;

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
