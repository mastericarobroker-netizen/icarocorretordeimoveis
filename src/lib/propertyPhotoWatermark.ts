const WATERMARK_HASH = '#icaro-watermark';
const DEFAULT_BASE_URL = 'https://imoveis.icaroimoveis.com.br';

export function markNewPropertyPhotoUrl(publicUrl: string): string {
  const imageUrl = new URL(publicUrl);
  imageUrl.hash = WATERMARK_HASH.slice(1);
  return imageUrl.toString();
}

export function hasPropertyPhotoWatermark(imageUrl: string): boolean {
  try {
    return new URL(imageUrl, DEFAULT_BASE_URL).hash === WATERMARK_HASH;
  } catch {
    return false;
  }
}
