import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProperties } from '@/contexts/PropertyContext';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { Property } from '@/types/property';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    filteredProperties,
    setFilters,
    setSearchQuery,
    selectedProperty,
    setSelectedProperty,
  } = useProperties();

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    if (query) {
      setSearchQuery(query);
    }

    if (type === 'sale' || type === 'rent') {
      setFilters({ listingType: type });
    }
  }, [searchParams, setFilters, setSearchQuery]);

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    // Scroll to property card on mobile
    const element = document.getElementById(`property-${property.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePropertyHover = (property: Property | null) => {
    setSelectedProperty(property);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Search Header Container */}
      <div className="flex-none bg-card z-10 shadow-sm">
        <div className="border-b border-border p-4">
          <div className="container mx-auto">
            <SearchBar
              onSearch={(query) => {
                setSearchQuery(query);
                navigate(`/buscar?q=${encodeURIComponent(query)}`);
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <FilterBar />

        {/* Results Count */}
        <div className="border-b border-border px-4 py-3 bg-secondary/10">
          <div className="container mx-auto">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredProperties.length}
              </span>{' '}
              imóveis encontrados
            </p>
          </div>
        </div>
      </div>

      {/* Split View Layout */}
      <div className="split-view relative">
        {/* Map */}
        <div className="split-view-map">
          <PropertyMap
            properties={filteredProperties}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Property List */}
        <div className="split-view-list scrollbar-thin">
          {filteredProperties.length > 0 ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredProperties.map((property) => (
                <div key={property.id} id={`property-${property.id}`}>
                  <PropertyCard
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onHover={handlePropertyHover}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou buscar por outra região.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
