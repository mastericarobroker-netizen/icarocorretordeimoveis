import sharp from 'sharp';

const ALLOWED_IMAGE_HOST = 'yvzhiejargcejzjgrqwx.supabase.co';
const PROPERTY_IMAGES_PATH = '/storage/v1/object/public/property-images/';
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 580_000;
const SUPPORTED_SOURCE_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function sendError(response, statusCode, message) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(message);
}

function getSourceUrl(request) {
  const requestUrl = new URL(request.url || '/', `https://${request.headers?.host || 'localhost'}`);
  const sourceValue = requestUrl.searchParams.get('source');
  if (!sourceValue) return null;

  let sourceUrl;
  try {
    sourceUrl = new URL(sourceValue);
  } catch {
    return null;
  }

  if (sourceUrl.protocol !== 'https:'
    || sourceUrl.hostname !== ALLOWED_IMAGE_HOST
    || sourceUrl.port
    || !sourceUrl.pathname.startsWith(PROPERTY_IMAGES_PATH)) {
    return null;
  }

  return sourceUrl;
}

async function createPreview(sourceBuffer) {
  const widths = [1200, 1000, 800, 640, 480];
  const qualities = [78, 70, 62, 54, 46];

  for (const width of widths) {
    for (const quality of qualities) {
      const image = await sharp(sourceBuffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (image.length < MAX_PREVIEW_BYTES) return image;
    }
  }

  throw new Error('Image could not be compressed below the preview size limit');
}

export default async function sharePropertyImage(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return sendError(response, 405, 'Method not allowed');
  }

  const sourceUrl = getSourceUrl(request);
  if (!sourceUrl) return sendError(response, 400, 'Invalid property image source');

  try {
    const sourceResponse = await fetch(sourceUrl, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' },
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
    });

    if (!sourceResponse.ok) return sendError(response, 404, 'Property image not found');

    const contentType = (sourceResponse.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
    if (!SUPPORTED_SOURCE_TYPES.has(contentType)) {
      return sendError(response, 415, 'Unsupported property image type');
    }

    const contentLength = Number(sourceResponse.headers.get('Content-Length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
      return sendError(response, 413, 'Property image is too large to process');
    }

    const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
    if (sourceBuffer.length > MAX_SOURCE_BYTES) {
      return sendError(response, 413, 'Property image is too large to process');
    }

    const preview = await createPreview(sourceBuffer);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image/jpeg');
    response.setHeader('Content-Length', String(preview.length));
    response.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.end(request.method === 'HEAD' ? undefined : preview);
  } catch (error) {
    console.error('Property share image optimization failed:', error instanceof Error ? error.message : 'Unknown error');
    return sendError(response, 502, 'Could not prepare the property preview image');
  }
}
