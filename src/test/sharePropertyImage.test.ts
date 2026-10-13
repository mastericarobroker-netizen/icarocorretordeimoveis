import { afterEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import sharePropertyImage from '../../api/share-property-image.js';
import { renderPropertyHtml } from '../lib/propertyShareMeta.mjs';

const sourceImageUrl = 'https://yvzhiejargcejzjgrqwx.supabase.co/storage/v1/object/public/property-images/test-image.jpg';

function createResponse() {
  const headers: Record<string, string> = {};
  return {
    headers,
    statusCode: 200,
    body: undefined as Buffer | undefined,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    end(body?: Buffer) {
      this.body = body;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('property share image', () => {
  it('uses an optimized same-site URL for public Supabase property photos', () => {
    const html = renderPropertyHtml(
      '<html><head></head><body><div id="root"></div></body></html>',
      {
        title: 'Casa de teste',
        description: 'Descrição do imóvel',
        price: 275000,
        city: 'São José dos Campos',
        state: 'SP',
        listing_type: 'sale',
        images: [sourceImageUrl],
      },
      'https://imoveis.icaroimoveis.com.br/imovel/test-id',
    );

    const optimizedSource = `/api/share-property-image?source=${encodeURIComponent(sourceImageUrl)}`;
    expect(html).toContain(`property="og:image" content="https://imoveis.icaroimoveis.com.br${optimizedSource}"`);
    expect(html).not.toContain(`property="og:image" content="${sourceImageUrl}"`);
  });

  it('returns a JPEG preview below 600 KB and preserves the photo aspect ratio', async () => {
    const original = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 85, g: 120, b: 155 },
      },
    }).jpeg({ quality: 92 }).toBuffer();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get(name: string) {
          if (name.toLowerCase() === 'content-type') return 'image/jpeg';
          if (name.toLowerCase() === 'content-length') return String(original.length);
          return null;
        },
      },
      arrayBuffer: async () => original.buffer.slice(original.byteOffset, original.byteOffset + original.byteLength),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('AbortSignal', { timeout: () => undefined });

    const response = createResponse();
    await sharePropertyImage({
      method: 'GET',
      url: `/api/share-property-image?source=${encodeURIComponent(sourceImageUrl)}`,
      headers: { host: 'imoveis.icaroimoveis.com.br' },
    }, response);

    expect(response.statusCode).toBe(200);
    expect(response.headers['Content-Type']).toBe('image/jpeg');
    expect(response.body).toBeDefined();
    expect(response.body!.length).toBeLessThan(600_000);
    const metadata = await sharp(response.body!).metadata();
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBeLessThanOrEqual(1200);
    expect(metadata.height).toBeLessThanOrEqual(1200);
  });

  it('rejects image sources outside the public property-images bucket', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await sharePropertyImage({
      method: 'GET',
      url: `/api/share-property-image?source=${encodeURIComponent('https://example.com/image.jpg')}`,
      headers: { host: 'imoveis.icaroimoveis.com.br' },
    }, response);

    expect(response.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
