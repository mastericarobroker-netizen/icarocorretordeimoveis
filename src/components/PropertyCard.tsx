import { Property } from '@/types/property';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  onHover?: (property: Property | null) => void;
  isSelected?: boolean;
}

export function PropertyCard({
  property,
  variant = 'default',
  onHover,
  isSelected,
}: PropertyCardProps) {
  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);

    return listingType === 'rent' ? `${formatted}/mês` : formatted;
  };

  const typeLabels: Record<Property['type'], string> = {
    house: 'Casa',
    apartment: 'Apartamento',
    condo: 'Cobertura',
    land: 'Terreno',
  };

  // Compact variant uses a horizontal layout like Zillow
  if (variant === 'compact') {
    return (
      <Link
        to={`/imovel/${property.id}`}
        className={cn(
          'property-card flex bg-card rounded-lg overflow-hidden transition-all duration-200 border border-transparent hover:border-primary/20',
          isSelected && 'ring-2 ring-primary border-primary'
        )}
        onMouseEnter={() => onHover?.(property)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Image - Left Side */}
        <div className="relative w-[40%] min-w-[140px] md:w-[180px]">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider',
                property.listingType === 'sale'
                  ? 'bg-white/90 text-foreground'
                  : 'bg-white/90 text-foreground'
              )}
            >
              {property.listingType === 'sale' ? 'Venda' : 'Aluguel'}
            </span>
          </div>
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="text-xl font-bold text-foreground">
                {formatPrice(property.price, property.listingType)}
              </p>
            </div>

            {property.type !== 'land' && (
              <div className="flex items-center gap-3 mt-1 text-sm text-foreground/80">
                <span className="flex items-center gap-1">
                  <span className="font-bold">{property.bedrooms}</span>
                  <span className="text-xs">bds</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold">{property.bathrooms}</span>
                  <span className="text-xs">ba</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold">{property.area}</span>
                  <span className="text-xs">m²</span>
                </span>
              </div>
            )}

            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {property.address}, {property.city}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded uppercase font-medium">
              {typeLabels[property.type]}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Vertical Card (Zillow Style)
  return (
    <Link
      to={`/imovel/${property.id}`}
      className={cn(
        'property-card block group h-full flex flex-col',
        isSelected && 'ring-2 ring-primary'
      )}
      onMouseEnter={() => onHover?.(property)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {property.featured && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/90 text-foreground uppercase tracking-wide rounded-sm shadow-sm">
              Destaque
            </span>
          )}
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/90 text-foreground uppercase tracking-wide rounded-sm shadow-sm">
            {typeLabels[property.type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Price */}
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {formatPrice(property.price, property.listingType)}
          </p>
        </div>

        {/* Stats - Pipe Separated */}
        {property.type !== 'land' && (
          <div className="flex items-center text-[15px] text-foreground font-normal leading-tight">
            <span className="font-bold">{property.bedrooms}</span>
            <span className="ml-1 mr-2">bds</span>
            <span className="text-border mx-1">|</span>

            <span className="font-bold ml-1">{property.bathrooms}</span>
            <span className="ml-1 mr-2">ba</span>
            <span className="text-border mx-1">|</span>

            <span className="font-bold ml-1">{property.area}</span>
            <span className="ml-1">m²</span>
            <span className="mx-2 text-muted-foreground">-</span>
            <span className="truncate text-muted-foreground">{typeLabels[property.type]} for {property.listingType === 'sale' ? 'sale' : 'rent'}</span>
          </div>
        )}

        {/* Address */}
        <p className="text-[13px] text-muted-foreground truncate leading-normal">
          {property.address}, {property.city}
        </p>
      </div>
    </Link>
  );
}
