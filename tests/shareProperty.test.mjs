import test from 'node:test';
import assert from 'node:assert/strict';
import shareProperty from '../api/share-property.js';

const propertyId = '123e4567-e89b-42d3-a456-426614174000';
const shell = '<!doctype html><html lang="pt-BR"><head><title>Ícaro</title><meta name="description" content="geral"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    end(body = '') { this.body = body; },
  };
}

test('serves a crawler-ready HTML response for a valid property URL', async () => {
  const originalFetch = global.fetch;
  const originalEnv = {
    VERCEL_URL: process.env.VERCEL_URL,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  process.env.VERCEL_URL = 'deployment-test.vercel.app';
  process.env.VITE_SUPABASE_URL = 'https://project-test.supabase.co';
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'public-test-key';

  global.fetch = async (url, options) => {
    const requestUrl = String(url);
    if (requestUrl === 'https://deployment-test.vercel.app/index.html') {
      return new Response(shell, { status: 200 });
    }
    assert.match(requestUrl, /^https:\/\/project-test\.supabase\.co\/rest\/v1\/properties\?/);
    assert.equal(options.headers.apikey, 'public-test-key');
    assert.match(requestUrl, /id=eq\.123e4567-e89b-42d3-a456-426614174000/);
    return new Response(JSON.stringify([{
      id: propertyId,
      title: 'Apartamento ensolarado',
      description: 'Perto do parque.',
      price: 410000,
      city: 'São José dos Campos',
      state: 'SP',
      images: ['https://project-test.supabase.co/storage/v1/object/public/property-images/capa.jpg'],
      listing_type: 'sale',
      auction_modality: null,
    }]), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const request = {
    method: 'GET',
    url: `/api/share-property?id=${propertyId}`,
    headers: { host: 'imoveis.icaroimoveis.com.br' },
  };
  const response = makeResponse();

  try {
    await shareProperty(request, response);
    assert.equal(response.statusCode, 200);
    assert.match(response.headers['Content-Type'], /text\/html/);
    assert.match(response.body, /property="og:image" content="https:\/\/project-test\.supabase\.co\/storage/);
    assert.match(response.body, /Apartamento ensolarado/);
    assert.match(response.body, /rel="canonical" href="https:\/\/imoveis\.icaroimoveis\.com\.br\/imovel\/123e4567-e89b-42d3-a456-426614174000"/);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
