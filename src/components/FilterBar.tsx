import { useProperties } from '@/contexts/PropertyContext';
import { AuctionModality, auctionModalityLabels, PropertyFilters } from '@/types/property';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const priceRanges = [
  { label: 'Qualquer preço', value: 'all' },
  { label: 'Até R$ 500 mil', value: '0-500000' },
  { label: 'R$ 500 mil – R$ 1 mi', value: '500000-1000000' },
  { label: 'R$ 1 mi – R$ 2 mi', value: '1000000-2000000' },
  { label: 'R$ 2 mi – R$ 5 mi', value: '2000000-5000000' },
  { label: 'Acima de R$ 5 mi', value: '5000000-' },
];

function filtersToParams(filters: PropertyFilters, current: URLSearchParams) {
  const next = new URLSearchParams();
  for (const key of ['q', 'sort'] as const) {
    const value = current.get(key);
    if (value) next.set(key, value);
  }
  if (filters.listingType) next.set('type', filters.listingType);
  if (filters.auctionModality) next.set('auctionModality', filters.auctionModality);
  if (filters.city) next.set('city', filters.city);
  if (filters.minPrice !== undefined) next.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) next.set('maxPrice', String(filters.maxPrice));
  if (filters.bedrooms !== undefined) next.set('beds', String(filters.bedrooms));
  if (filters.bathrooms !== undefined) next.set('baths', String(filters.bathrooms));
  if (filters.type) next.set('propertyType', filters.type);
  if (filters.minArea !== undefined) next.set('minArea', String(filters.minArea));
  if (filters.maxArea !== undefined) next.set('maxArea', String(filters.maxArea));
  if (filters.parking !== undefined) next.set('parking', String(filters.parking));
  return next;
}

export function FilterBar() {
  const { filters, setFilters } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();

  const apply = (next: PropertyFilters) => {
    const normalized = { ...next };
    if (normalized.listingType !== 'auction') delete normalized.auctionModality;
    setFilters(normalized);
    setSearchParams(filtersToParams(normalized, searchParams), { replace: true });
  };

  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K] | 'all') => {
    const next = { ...filters };
    if (value === 'all' || value === undefined) delete next[key];
    else next[key] = value;
    apply(next);
  };

  const handlePriceChange = (value: string) => {
    const next = { ...filters };
    delete next.minPrice;
    delete next.maxPrice;
    if (value !== 'all') {
      const [min, max] = value.split('-');
      if (min) next.minPrice = Number(min);
      if (max) next.maxPrice = Number(max);
    }
    apply(next);
  };

  const priceValue = priceRanges.find(({ value }) => {
    if (value === 'all') return filters.minPrice === undefined && filters.maxPrice === undefined;
    const [min, max] = value.split('-');
    return filters.minPrice === (min ? Number(min) : undefined) && filters.maxPrice === (max ? Number(max) : undefined);
  })?.value ?? 'all';

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="search-filters" aria-label="Filtros de imóveis">
      <Select value={filters.listingType || 'sale'} onValueChange={(v) => updateFilter('listingType', v as PropertyFilters['listingType'])}>
        <SelectTrigger className="filter-select filter-select-primary"><SelectValue placeholder="Finalidade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="sale">À venda</SelectItem>
          <SelectItem value="rent">Para alugar</SelectItem>
          <SelectItem value="auction">Imóveis em Leilão</SelectItem>
        </SelectContent>
      </Select>

      {filters.listingType === 'auction' && (
        <Select value={filters.auctionModality || 'all'} onValueChange={(v) => updateFilter('auctionModality', v === 'all' ? undefined : v as AuctionModality)}>
          <SelectTrigger className="filter-select"><SelectValue placeholder="Modalidade do leilão" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as modalidades</SelectItem>
            {Object.entries(auctionModalityLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <Select value={priceValue} onValueChange={handlePriceChange}>
        <SelectTrigger className="filter-select"><SelectValue placeholder="Preço" /></SelectTrigger>
        <SelectContent>{priceRanges.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filters.bedrooms?.toString() || 'all'} onValueChange={(v) => updateFilter('bedrooms', v === 'all' ? undefined : Number(v))}>
        <SelectTrigger className="filter-select"><SelectValue placeholder="Quartos" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Quartos</SelectItem>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+ {n === 1 ? 'quarto' : 'quartos'}</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filters.bathrooms?.toString() || 'all'} onValueChange={(v) => updateFilter('bathrooms', v === 'all' ? undefined : Number(v))}>
        <SelectTrigger className="filter-select"><SelectValue placeholder="Banheiros" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Banheiros</SelectItem>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}+ banheiros</SelectItem>)}</SelectContent>
      </Select>

      <Select value={filters.type || 'all'} onValueChange={(v) => updateFilter('type', v === 'all' ? undefined : v as PropertyFilters['type'])}>
        <SelectTrigger className="filter-select"><SelectValue placeholder="Tipo de imóvel" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="house">Casa</SelectItem>
          <SelectItem value="apartment">Apartamento</SelectItem>
          <SelectItem value="condo">Cobertura</SelectItem>
          <SelectItem value="land">Terreno</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.minArea?.toString() || 'all'} onValueChange={(v) => updateFilter('minArea', v === 'all' ? undefined : Number(v))}>
        <SelectTrigger className="filter-select"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue placeholder="Mais filtros" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Área: qualquer</SelectItem>
          {[50, 75, 100, 150, 200, 300].map((n) => <SelectItem key={n} value={String(n)}>Área: {n}+ m²</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.parking?.toString() || 'all'} onValueChange={(v) => updateFilter('parking', v === 'all' ? undefined : Number(v))}>
        <SelectTrigger className="filter-select"><SelectValue placeholder="Vagas" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Vagas: qualquer</SelectItem>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n}+ {n === 1 ? 'vaga' : 'vagas'}</SelectItem>)}</SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => apply({ listingType: filters.listingType })} className="filter-clear">
          <X className="h-4 w-4" /> Limpar
        </Button>
      )}
    </div>
  );
}
