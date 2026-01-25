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

  return (
    <Link
      to={`/imovel/${property.id}`}
      className={cn(
        'property-card block',
        isSelected && 'ring-2 ring-primary'
      )}
      onMouseEnter={() => onHover?.(property)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 text-xs font-semibold bg-card/90 backdrop-blur rounded text-foreground">
            {typeLabels[property.type]}
          </span>
          {property.featured && (
            <span className="px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded">
              Destaque
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'px-2 py-1 text-xs font-semibold rounded',
              property.listingType === 'sale'
                ? 'bg-success text-success-foreground'
                : 'bg-warning text-warning-foreground'
            )}
          >
            {property.listingType === 'sale' ? 'Venda' : 'Aluguel'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn('p-4', variant === 'compact' && 'p-3')}>
        {/* Price */}
        <p className="price-tag">{formatPrice(property.price, property.listingType)}</p>

        {/* Stats */}
        {property.type !== 'land' && (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms} quarto{property.bedrooms !== 1 && 's'}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms} banheiro{property.bathrooms !== 1 && 's'}
            </span>
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              {property.area} m²
            </span>
          </div>
        )}

        {/* Address */}
        <p className="flex items-start gap-1 mt-3 text-sm text-muted-foreground line-clamp-1">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          {property.address}, {property.city}
        </p>

        {/* Title */}
        {variant !== 'compact' && (
          <h3 className="mt-2 font-semibold text-foreground line-clamp-1">
            {property.title}
          </h3>
        )}
      </div>
    </Link>
  );
}
