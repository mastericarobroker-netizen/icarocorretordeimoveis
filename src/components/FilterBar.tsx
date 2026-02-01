import { useProperties } from '@/contexts/PropertyContext';
import { PropertyFilters } from '@/types/property';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters } = useProperties();

  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    if (value === 'all' || value === undefined) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const priceRanges = [
    { label: 'Qualquer preço', value: 'all' },
    { label: 'Até R$ 500 mil', value: '0-500000' },
    { label: 'R$ 500 mil - R$ 1M', value: '500000-1000000' },
    { label: 'R$ 1M - R$ 2M', value: '1000000-2000000' },
    { label: 'R$ 2M - R$ 5M', value: '2000000-5000000' },
    { label: 'Acima de R$ 5M', value: '5000000-' },
  ];

  const handlePriceChange = (value: string) => {
    if (value === 'all') {
      const newFilters = { ...filters };
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
      setFilters(newFilters);
    } else {
      const [min, max] = value.split('-').map(Number);
      setFilters({
        ...filters,
        minPrice: min || undefined,
        maxPrice: max || undefined,
      });
    }
  };

  const getCurrentPriceValue = () => {
    if (filters.minPrice === undefined && filters.maxPrice === undefined) {
      return 'all';
    }
    const minStr = filters.minPrice?.toString() || '0';
    const maxStr = filters.maxPrice?.toString() || '';
    return `${minStr}-${maxStr}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border-b border-border">
      {/* Listing Type */}
      <Select
        value={filters.listingType || 'all'}
        onValueChange={(value) => updateFilter('listingType', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo de Oferta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="sale">Comprar</SelectItem>
          <SelectItem value="rent">Alugar</SelectItem>
        </SelectContent>
      </Select>

      {/* Price */}
      <Select value={getCurrentPriceValue()} onValueChange={handlePriceChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Preço" />
        </SelectTrigger>
        <SelectContent>
          {priceRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Bedrooms */}
      <Select
        value={filters.bedrooms?.toString() || 'all'}
        onValueChange={(value) =>
          updateFilter('bedrooms', value === 'all' ? undefined : parseInt(value))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Quartos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Quartos</SelectItem>
          <SelectItem value="1">1+ quarto</SelectItem>
          <SelectItem value="2">2+ quartos</SelectItem>
          <SelectItem value="3">3+ quartos</SelectItem>
          <SelectItem value="4">4+ quartos</SelectItem>
          <SelectItem value="5">5+ quartos</SelectItem>
        </SelectContent>
      </Select>

      {/* Property Type */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => updateFilter('type', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo de Imóvel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="house">Casa</SelectItem>
          <SelectItem value="apartment">Apartamento</SelectItem>
          <SelectItem value="condo">Cobertura</SelectItem>
          <SelectItem value="land">Terreno</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
