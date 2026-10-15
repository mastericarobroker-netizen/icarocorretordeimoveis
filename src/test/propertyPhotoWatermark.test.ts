import { describe, expect, it } from 'vitest';
import {
  hasPropertyPhotoWatermark,
  markNewPropertyPhotoUrl,
} from '@/lib/propertyPhotoWatermark';

const existingPhotoUrl = 'https://yvzhiejargcejzjgrqwx.supabase.co/storage/v1/object/public/property-images/old-photo.jpg';

describe('property photo watermark marker', () => {
  it('marks a newly uploaded photo URL without changing its path or query', () => {
    const url = markNewPropertyPhotoUrl(`${existingPhotoUrl}?width=800`);
    const parsed = new URL(url);

    expect(parsed.pathname).toBe(new URL(existingPhotoUrl).pathname);
    expect(parsed.searchParams.get('width')).toBe('800');
    expect(parsed.hash).toBe('#icaro-watermark');
    expect(hasPropertyPhotoWatermark(url)).toBe(true);
  });

  it('keeps existing photo URLs unmarked', () => {
    expect(hasPropertyPhotoWatermark(existingPhotoUrl)).toBe(false);
  });

  it('does not treat an unrelated fragment as a watermark marker', () => {
    expect(hasPropertyPhotoWatermark(`${existingPhotoUrl}#gallery`)).toBe(false);
  });
});
