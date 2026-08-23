/** 将 B 站资源 URL 规范为 HTTPS，避免 Mixed Content 警告 */
export function normalizeHttpsUrl(url: string): string {
  if (!url) {
    return url
  }
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  if (url.startsWith('http://')) {
    return `https://${url.slice(7)}`
  }
  return url
}
