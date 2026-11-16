/**
 * Helper utility to optimize image delivery and compress payloads on-the-fly.
 * Automatically injects Cloudinary (f_auto, q_auto, w_X) & Unsplash parameters.
 */
export function optimizeImage(url: string | undefined | null, width = 800): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=' + width
  }

  // Cloudinary optimization
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // Avoid double transformation if already present
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/c_')) {
      return url
    }
    const transform = `f_auto,q_auto,w_${width},c_limit`
    return url.replace('/image/upload/', `/image/upload/${transform}/`)
  }

  // Unsplash optimization
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0]
    return `${cleanUrl}?auto=format&fit=crop&q=80&w=${width}`
  }

  return url
}
