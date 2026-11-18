export function inviteSmsUrl(link: string, device: Pick<Navigator, "userAgent" | "platform" | "maxTouchPoints">) {
  const isAppleMobile = /iPhone|iPad|iPod/.test(device.userAgent) ||
    (device.platform === "MacIntel" && device.maxTouchPoints > 1);
  return `sms:${isAppleMobile ? "&" : "?"}body=${encodeURIComponent(link)}`;
}
