import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/types/property';
import { useProperties } from '@/contexts/PropertyContext';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (property: Property) => void;
}

function createPriceIcon(price: number, listingType: string, isSelected: boolean) {
  const formatted = listingType === 'rent'
    ? `R$ ${(price / 1000).toFixed(0)}k`
    : price >= 1000000
    ? `R$ ${(price / 1000000).toFixed(1)}M`
    : `R$ ${(price / 1000).toFixed(0)}k`;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="custom-marker" style="background: ${isSelected ? 'hsl(240 11% 18%)' : 'hsl(209 88% 48%)'}">${formatted}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
}

function MapEvents({ properties }: { properties: Property[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties.map((p) => [p.lat, p.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, map]);

  return null;
}

export function PropertyMap({
  properties,
  center = [-27.5969, -48.5495],
  zoom = 12,
  onMarkerClick,
}: PropertyMapProps) {
  const { selectedProperty, setSelectedProperty } = useProperties();
  const mapRef = useRef<L.Map>(null);

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
    return listingType === 'rent' ? `${formatted}/mês` : formatted;
  };

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      className="w-full h-full min-h-[400px]"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents properties={properties} />
      
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createPriceIcon(
            property.price,
            property.listingType,
            selectedProperty?.id === property.id
          )}
          eventHandlers={{
            click: () => {
              setSelectedProperty(property);
              onMarkerClick?.(property);
            },
          }}
        >
          <Popup>
            <div className="w-64 p-0">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-32 object-cover rounded-t"
              />
              <div className="p-3">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(property.price, property.listingType)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.bedrooms} quartos • {property.bathrooms} banheiros • {property.area} m²
                </p>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {property.address}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
