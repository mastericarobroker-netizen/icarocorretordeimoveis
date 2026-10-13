import {
  SITE_ORIGIN,
  renderPropertyHtml,
  renderNotFoundHtml,
} from '../src/lib/propertyShareMeta.mjs';

const PROPERTY_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROPERTY_FIELDS = 'id,title,description,price,city,state,images,listing_type,auction_modality';

function sendHtml(response, statusCode, html) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(html);
}

function getRequestPropertyId(request) {
  const url = new URL(request.url || '/', `https://${request.headers?.host || 'localhost'}`);
  return url.searchParams.get('id') || url.pathname.match(/\/imovel\/([^/]+)/)?.[1] || '';
}

function getDeploymentOrigin() {
  const deploymentHost = String(process.env.VERCEL_URL || 'imoveis.icaroimoveis.com.br')
    .replace(/^https?:\/\//i, '')
    .split('/')[0];
  if (!/^[a-z0-9.-]+$/i.test(deploymentHost)) return SITE_ORIGIN;
  return `https://${deploymentHost}`;
}

async function fetchShell() {
  const shellResponse = await fetch(`${getDeploymentOrigin()}/index.html`, {
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(8000),
  });
  if (!shellResponse.ok) throw new Error(`App shell returned HTTP ${shellResponse.status}`);
  return shellResponse.text();
}

function getSupabaseConfigFromBundle(bundle) {
  const supabaseUrl = bundle.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i)?.[0];
  const publishableKey = bundle.match(/\bsb_publishable_[A-Za-z0-9_-]+\b/)?.[0]
    || bundle.match(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/)?.[0];
  return { supabaseUrl, publishableKey };
}

async function fetchSupabaseConfig(shellHtml) {
  let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    const scriptPaths = [...shellHtml.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi)]
      .map((match) => match[1]);
    const origin = getDeploymentOrigin();

    for (const scriptPath of scriptPaths) {
      const bundleUrl = new URL(scriptPath, origin);
      if (bundleUrl.origin !== origin) continue;
      const bundleResponse = await fetch(bundleUrl, { signal: AbortSignal.timeout(8000) });
      if (!bundleResponse.ok) continue;
      const discovered = getSupabaseConfigFromBundle(await bundleResponse.text());
      supabaseUrl ||= discovered.supabaseUrl;
      publishableKey ||= discovered.publishableKey;
      if (supabaseUrl && publishableKey) break;
    }
  }

  if (!supabaseUrl || !publishableKey) {
    throw new Error('Supabase public configuration is unavailable to the share renderer');
  }

  return { supabaseUrl, publishableKey };
}

async function fetchProperty(propertyId, shellHtml) {
  const { supabaseUrl, publishableKey } = await fetchSupabaseConfig(shellHtml);

  const url = new URL('/rest/v1/properties', supabaseUrl);
  url.searchParams.set('select', PROPERTY_FIELDS);
  url.searchParams.set('id', `eq.${propertyId}`);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Property lookup returned HTTP ${response.status}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

export default async function shareProperty(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    return response.end('Method not allowed');
  }

  let propertyId;
  try {
    propertyId = getRequestPropertyId(request);
    const canonicalUrl = `${SITE_ORIGIN}/imovel/${encodeURIComponent(propertyId)}`;
    const shellHtml = await fetchShell();

    if (!PROPERTY_ID_PATTERN.test(propertyId)) {
      return sendHtml(response, 404, renderNotFoundHtml(shellHtml, canonicalUrl));
    }

    const property = await fetchProperty(propertyId, shellHtml);
    if (!property) return sendHtml(response, 404, renderNotFoundHtml(shellHtml, canonicalUrl));
    return sendHtml(response, 200, renderPropertyHtml(shellHtml, property, canonicalUrl));
  } catch (error) {
    console.error('Property share preview rendering failed:', error instanceof Error ? error.message : 'Unknown error');
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    return response.end('Não foi possível carregar a prévia deste anúncio no momento.');
  }
};
