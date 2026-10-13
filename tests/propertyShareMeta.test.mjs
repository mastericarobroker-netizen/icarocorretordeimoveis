import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatProperty,
  renderPropertyHtml,
  renderNotFoundHtml,
} from '../src/lib/propertyShareMeta.mjs';

const property = {
  title: 'Casa <sol> & praia',
  description: 'Casa ampla <script>alert(1)</script> perto do mar.',
  price: 520000,
  city: 'Santos',
  state: 'SP',
  listing_type: 'sale',
  auction_modality: null,
  images: ['https://yvzhiejargcejzjgrqwx.supabase.co/storage/v1/object/public/property-images/casa.jpg'],
};
const shell = '<!doctype html><html lang="pt-BR"><head><title>Ícaro</title><meta name="description" content="geral"><meta property="og:title" content="geral"><meta name="twitter:card" content="summary_large_image"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';

test('builds unique property share metadata with its public photo and canonical URL', () => {
  const meta = formatProperty(property);
  const html = renderPropertyHtml(shell, property, 'https://imoveis.icaroimoveis.com.br/imovel/123');
  assert.match(meta.description, /Santos - SP/);
  assert.match(html, /property="og:image" content="https:\/\/yvzhiejargcejzjgrqwx\.supabase\.co\/storage\/v1\/object\/public\/property-images\/casa\.jpg"/);
  assert.match(html, /rel="canonical" href="https:\/\/imoveis\.icaroimoveis\.com\.br\/imovel\/123"/);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
  assert.match(html, /Casa &amp; praia/);
  assert.doesNotMatch(html, /<sol>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('uses first valid HTTPS image and supports leilão modalities', () => {
  const meta = formatProperty({
    ...property,
    images: ['not-a-url', 'http://insecure.example/photo.jpg', 'https://example.com/photo.jpg'],
    listing_type: 'auction',
    auction_modality: 'online_sale',
  });
  assert.equal(meta.image, 'https://example.com/photo.jpg');
  assert.match(meta.description, /Venda Online/);
  assert.match(meta.description, /em leilão/);
});

test('returns a noindex page for a missing property', () => {
  const html = renderNotFoundHtml(shell, 'https://imoveis.icaroimoveis.com.br/imovel/missing');
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /Imóvel não encontrado/);
  assert.doesNotMatch(html, /content="geral"/);
});
