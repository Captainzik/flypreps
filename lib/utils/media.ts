export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false
  const value = url.trim().toLowerCase()
  if (!value) return false

  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
  if (videoExts.some((ext) => value.includes(ext))) return true
  if (value.includes('/video/upload/')) return true

  return false
}

export function isImageUrl(url?: string | null): boolean {
  if (!url) return false
  return !isVideoUrl(url)
}
