import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProperties } from '@/contexts/PropertyContext';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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
    setViewMode('list'); // Switch to list to see the highlighted card
    // Scroll to property card on mobile
    const element = document.getElementById(`property-${property.id}`);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
      <div className="split-view relative flex-1">
        {/* Map */}
        <div className={cn(
          "split-view-map",
          viewMode === 'list' ? "hidden lg:block" : "block"
        )}>
          <PropertyMap
            properties={filteredProperties}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Property List */}
        <div className={cn(
          "split-view-list scrollbar-thin",
          viewMode === 'map' ? "hidden lg:block" : "block"
        )}>
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

        {/* Floating Toggle Button (Mobile Only) */}
        <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <Button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 px-6 h-12 flex items-center gap-2 border-2 border-background/20"
          >
            {viewMode === 'map' ? (
              <><List className="w-4 h-4" /> Ver Lista</>
            ) : (
              <><Map className="w-4 h-4" /> Ver Mapa</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
