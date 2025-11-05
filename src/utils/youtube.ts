/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (youtube.com/watch?v=... or youtu.be/...)
 * @returns Video ID or null if invalid
 */
export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Validate and format YouTube URL to standard format
 * @param url - YouTube URL in any format
 * @returns Formatted YouTube URL or null if invalid
 */
export function formatYouTubeUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return url;
    }
    
    // Handle youtu.be/VIDEO_ID
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if URL is a YouTube video
 * @param url - URL to check
 * @returns True if URL is a valid YouTube video URL
 */
export function isYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}
