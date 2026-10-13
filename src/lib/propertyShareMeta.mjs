const SITE_ORIGIN = 'https://imoveis.icaroimoveis.com.br';

const auctionModalityLabels = {
  first_auction: '1º Leilão',
  second_auction: '2º Leilão',
  open_bidding: 'Licitação Aberta',
  online_sale: 'Venda Online',
  direct_sale: 'Venda Direta',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plainText(value) {
  return String(value ?? '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, maxLength) {
  const characters = Array.from(value);
  if (characters.length <= maxLength) return value;
  return `${characters.slice(0, maxLength - 1).join('').trimEnd()}…`;
}

function publicImageUrl(images) {
  if (!Array.isArray(images)) return '';
  for (const image of images) {
    try {
      const url = new URL(image);
      if (url.protocol === 'https:') return url.toString();
    } catch {
      // Ignore non-absolute or malformed image URLs.
    }
  }
  return '';
}

function formatProperty(property) {
  const title = plainText(property.title) || 'Imóvel';
  const operation = property.listing_type === 'rent'
    ? 'para alugar'
    : property.listing_type === 'auction'
      ? 'em leilão'
      : 'à venda';
  const modality = auctionModalityLabels[property.auction_modality] || '';
  const priceValue = Number(property.price);
  const price = Number.isFinite(priceValue)
    ? new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(priceValue)
    : '';
  const location = [plainText(property.city), plainText(property.state)].filter(Boolean).join(' - ');
  const descriptionText = plainText(property.description);
  const summary = [
    price && `${price}${property.listing_type === 'rent' ? '/mês' : ''} ${operation}`,
    modality,
    location,
    descriptionText,
  ].filter(Boolean).join(' · ');

  return {
    title: truncate(`${title} | Ícaro Corretor de Imóveis`, 100),
    description: truncate(summary || 'Confira os detalhes deste imóvel no site Ícaro Corretor de Imóveis.', 200),
    image: publicImageUrl(property.images),
    location,
    price,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMeta(html, key, content) {
  if (!content) return html;
  const attribute = key.startsWith('og:') ? 'property' : 'name';
  const escapedKey = escapeRegExp(key);
  const source = `<meta\\b(?=[^>]*\\b(?:name|property)=["']${escapedKey}["'])[^>]*>`;
  const existing = new RegExp(source, 'i');
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  if (existing.test(html)) return html.replace(new RegExp(source, 'gi'), tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function setCanonical(html, canonicalUrl) {
  const source = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  if (source.test(html)) return html.replace(new RegExp(source.source, 'gi'), tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function renderPropertyHtml(shellHtml, property, canonicalUrl) {
  const meta = formatProperty(property);
  let html = shellHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = setMeta(html, 'description', meta.description);
  html = setMeta(html, 'og:type', 'article');
  html = setMeta(html, 'og:title', meta.title);
  html = setMeta(html, 'og:description', meta.description);
  html = setMeta(html, 'og:url', canonicalUrl);
  html = setMeta(html, 'og:site_name', 'Ícaro Corretor de Imóveis');
  html = setMeta(html, 'og:locale', 'pt_BR');
  html = setMeta(html, 'og:image', meta.image);
  html = setMeta(html, 'og:image:secure_url', meta.image);
  html = setMeta(html, 'og:image:alt', meta.title);
  html = setMeta(html, 'twitter:card', meta.image ? 'summary_large_image' : 'summary');
  html = setMeta(html, 'twitter:title', meta.title);
  html = setMeta(html, 'twitter:description', meta.description);
  html = setMeta(html, 'twitter:image', meta.image);
  html = setCanonical(html, canonicalUrl);

  const imageMarkup = meta.image
    ? `<img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title)}" style="display:block;width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:12px" />`
    : '';
  const bodyPreview = `<main style="max-width:720px;margin:32px auto;padding:0 16px;font-family:Arial,sans-serif;color:#17202a"><article>${imageMarkup}<h1>${escapeHtml(plainText(property.title) || 'Imóvel')}</h1><p>${escapeHtml(meta.description)}</p><a href="${escapeHtml(canonicalUrl)}">Ver anúncio completo</a></article></main>`;
  return html.replace(/<div\s+id=["']root["']\s*>\s*<\/div>/i, `<div id="root">${bodyPreview}</div>`);
}

function renderNotFoundHtml(shellHtml, canonicalUrl) {
  const title = 'Imóvel não encontrado | Ícaro Corretor de Imóveis';
  const description = 'Este anúncio não está disponível. Acesse o portal Ícaro Corretor de Imóveis para ver outros imóveis.';
  let html = shellHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, 'description', description);
  html = setMeta(html, 'robots', 'noindex, nofollow');
  html = setMeta(html, 'og:type', 'website');
  html = setMeta(html, 'og:title', title);
  html = setMeta(html, 'og:description', description);
  html = setMeta(html, 'og:url', canonicalUrl);
  html = setCanonical(html, canonicalUrl);
  return html.replace(/<div\s+id=["']root["']\s*>\s*<\/div>/i,
    '<div id="root"><main><h1>Imóvel não encontrado</h1><p>Este anúncio não está disponível.</p></main></div>');
}

export {
  SITE_ORIGIN,
  escapeHtml,
  formatProperty,
  renderPropertyHtml,
  renderNotFoundHtml,
};
