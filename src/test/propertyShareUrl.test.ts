import { describe, expect, it } from 'vitest';
import { buildPropertyShareUrl } from '@/lib/propertyShareUrl';

const currentUrl = 'https://imoveis.icaroimoveis.com.br/imovel/property-id?wa_refresh=old#details';
const property = {
  id: 'property-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-10-13T12:00:00.000Z',
};

describe('buildPropertyShareUrl', () => {
  it('replaces the old cache version while preserving the property route', () => {
    const result = new URL(buildPropertyShareUrl(currentUrl, property));
    expect(result.pathname).toBe('/imovel/property-id');
    expect(result.searchParams.get('wa_refresh')).not.toBe('old');
    expect(result.hash).toBe('');
  });

  it('keeps the same version for an unchanged listing and changes it after an edit', () => {
    const originalVersion = new URL(buildPropertyShareUrl(currentUrl, property)).searchParams.get('wa_refresh');
    const sameVersion = new URL(buildPropertyShareUrl(currentUrl, property)).searchParams.get('wa_refresh');
    const editedVersion = new URL(buildPropertyShareUrl(currentUrl, {
      ...property,
      updatedAt: '2026-10-14T12:00:00.000Z',
    })).searchParams.get('wa_refresh');

    expect(sameVersion).toBe(originalVersion);
    expect(editedVersion).not.toBe(originalVersion);
  });

  it('falls back to the creation date or property id when no update time is present', () => {
    const withCreationDate = new URL(buildPropertyShareUrl(currentUrl, {
      id: 'property-id',
      createdAt: property.createdAt,
    })).searchParams.get('wa_refresh');
    const withIdOnly = new URL(buildPropertyShareUrl(currentUrl, { id: 'property-id' })).searchParams.get('wa_refresh');

    expect(withCreationDate).toBeTruthy();
    expect(withIdOnly).toBeTruthy();
    expect(withCreationDate).not.toBe(withIdOnly);
  });
});
