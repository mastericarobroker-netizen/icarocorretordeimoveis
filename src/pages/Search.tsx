import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProperties } from '@/contexts/PropertyContext';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyMap } from '@/components/PropertyMap';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { AuctionModality, auctionModalityLabels, Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Map, List, Search as SearchIcon, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const { filteredProperties, setFilters, setSearchQuery, searchQuery, selectedProperty, setSelectedProperty } = useProperties();

  useEffect(() => {
    const type = searchParams.get('type');
    const modalityParam = searchParams.get('auctionModality');
    const auctionModality = modalityParam && Object.prototype.hasOwnProperty.call(auctionModalityLabels, modalityParam)
      ? modalityParam as AuctionModality
      : undefined;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const beds = searchParams.get('beds');
    const baths = searchParams.get('baths');
    const propertyType = searchParams.get('propertyType');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const parking = searchParams.get('parking');
    const city = searchParams.get('city');
    const query = searchParams.get('q') || '';

    setSearchQuery(query);
    setFilters({
      listingType: type === 'rent' ? 'rent' : type === 'auction' ? 'auction' : 'sale',
      ...(type === 'auction' && auctionModality ? { auctionModality } : {}),
      ...(minPrice ? { minPrice: Number(minPrice) } : {}),
      ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
      ...(beds ? { bedrooms: Number(beds) } : {}),
      ...(baths ? { bathrooms: Number(baths) } : {}),
      ...(propertyType ? { type: propertyType as Property['type'] } : {}),
      ...(minArea ? { minArea: Number(minArea) } : {}),
      ...(maxArea ? { maxArea: Number(maxArea) } : {}),
      ...(parking ? { parking: Number(parking) } : {}),
      ...(city ? { city } : {}),
    });
  }, [searchParams, setFilters, setSearchQuery]);

  const sort = searchParams.get('sort') || 'recommended';
  const properties = useMemo(() => {
    const results = [...filteredProperties];
    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    if (sort === 'newest') results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === 'area-desc') results.sort((a, b) => b.area - a.area);
    return results;
  }, [filteredProperties, sort]);

  const handleMarkerClick = (property: Property) => {
    setSelectedProperty(property);
    setViewMode('list');
    const element = document.getElementById(`property-${property.id}`);
    if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'recommended') next.delete('sort');
    else next.set('sort', value);
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="search-page">
      <div className="search-topbar">
        <div className="search-input-wrap">
          <SearchBar onSearch={(query) => {
            const next = new URLSearchParams(searchParams);
            if (query.trim()) next.set('q', query.trim()); else next.delete('q');
            setSearchQuery(query.trim());
            setSearchParams(next);
          }} />
        </div>
        <FilterBar />
      </div>

      <section className="search-workspace" aria-label="Resultados de imóveis">
        <div className={cn('search-map-pane', viewMode === 'list' ? 'mobile-hidden' : '')}>
          <PropertyMap properties={properties} onMarkerClick={handleMarkerClick} />
          <div className="map-result-pill">{properties.length.toLocaleString('pt-BR')} imóveis nesta busca</div>
        </div>

        <div className={cn('search-results-pane', viewMode === 'map' ? 'mobile-hidden' : '')}>
          <div className="results-heading">
            <div>
              <p className="results-eyebrow">{searchParams.get('type') === 'auction' ? 'Oportunidades em leilão' : 'Explore imóveis'}</p>
              <h1>{searchQuery ? `Imóveis em ${searchQuery}` : searchParams.get('type') === 'auction' ? 'Imóveis em Leilão' : 'Imóveis para encontrar seu próximo capítulo'}</h1>
              <p className="results-count"><strong>{properties.length.toLocaleString('pt-BR')}</strong> resultados disponíveis</p>
            </div>
            <label className="sort-control"><ArrowUpDown size={15} /><span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(e) => handleSort(e.target.value)} aria-label="Ordenar imóveis">
                <option value="recommended">Relevância</option>
                <option value="newest">Mais recentes</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="area-desc">Maior área</option>
              </select>
            </label>
          </div>

          {properties.length > 0 ? (
            <div className="property-results-grid">
              {properties.map((property) => (
                <div key={property.id} id={`property-${property.id}`}>
                  <PropertyCard property={property} isSelected={selectedProperty?.id === property.id} onHover={setSelectedProperty} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <span className="empty-results-icon"><SearchIcon size={22} /></span>
              <h2>{searchParams.get('type') === 'auction' ? 'Ainda não há imóveis em leilão' : 'Nenhum imóvel encontrado'}</h2>
              <p>{searchParams.get('type') === 'auction' ? 'Novos anúncios de leilão aparecerão aqui assim que forem cadastrados.' : 'Tente ampliar a região ou remover algum filtro para ver mais opções.'}</p>
              <Button variant="outline" onClick={() => navigate(searchParams.get('type') === 'auction' ? '/buscar?type=sale' : `/buscar?type=${searchParams.get('type') === 'rent' ? 'rent' : 'sale'}`)}>
                {searchParams.get('type') === 'auction' ? 'Ver imóveis à venda' : searchParams.get('type') === 'rent' ? 'Ver todos para alugar' : 'Ver todos à venda'}
              </Button>
            </div>
          )}
        </div>

        <div className="mobile-view-toggle">
          <Button onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')} className="toggle-view-button">
            {viewMode === 'map' ? <><List size={17} /> Ver lista</> : <><Map size={17} /> Ver mapa</>}
          </Button>
        </div>
      </section>
    </main>
  );
}
