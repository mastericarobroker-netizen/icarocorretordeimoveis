interface ShareablePropertyVersion {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

function fingerprint(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function buildPropertyShareUrl(currentUrl: string, property: ShareablePropertyVersion): string {
  const shareUrl = new URL(currentUrl);
  const revision = property.updatedAt || property.createdAt || property.id;
  shareUrl.searchParams.set('wa_refresh', fingerprint(`${property.id}:${revision}`));
  shareUrl.hash = '';
  return shareUrl.toString();
}
