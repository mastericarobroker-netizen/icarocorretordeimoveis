import { describe, expect, it } from 'vitest';
import { getYouTubeVideoId } from '@/lib/youtube';

describe('getYouTubeVideoId', () => {
  it('extracts a video id from a standard watch URL', () => {
    expect(getYouTubeVideoId('https://www.youtube.com/watch?v=abcdefghijk&t=12')).toBe('abcdefghijk');
  });

  it('accepts short links, Shorts and embed URLs', () => {
    expect(getYouTubeVideoId('https://youtu.be/abcdefghijk?si=share')).toBe('abcdefghijk');
    expect(getYouTubeVideoId('https://youtube.com/shorts/abcdefghijk')).toBe('abcdefghijk');
    expect(getYouTubeVideoId('https://www.youtube.com/embed/abcdefghijk')).toBe('abcdefghijk');
  });

  it('rejects non-YouTube hosts and malformed video ids', () => {
    expect(getYouTubeVideoId('https://example.com/watch?v=abcdefghijk')).toBeNull();
    expect(getYouTubeVideoId('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(getYouTubeVideoId('')).toBeNull();
  });
});
