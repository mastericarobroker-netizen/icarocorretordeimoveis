import React, { createContext, useContext, useState, useMemo } from 'react';
import { Property, PropertyFilters, Lead } from '@/types/property';
import { usePropertiesQuery, useCreateProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/usePropertiesQuery';
import { useLeadsQuery, useCreateLead } from '@/hooks/useLeadsQuery';

interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  getPropertyById: (id: string) => Property | undefined;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  leads: Lead[];
  addLead: (lead: { propertyId: string; name: string; email: string; phone: string; message: string }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Query properties from database
  const { data: properties = [], isLoading } = usePropertiesQuery();
  const { data: leads = [] } = useLeadsQuery();
  
  // Mutations
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();
  const createLeadMutation = useCreateLead();

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          property.title.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query) ||
          property.city.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Price filter
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;

      // Bedrooms filter
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;

      // Bathrooms filter
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;

      // Type filter
      if (filters.type && property.type !== filters.type) return false;

      // Listing type filter
      if (filters.listingType && property.listingType !== filters.listingType) return false;

      // City filter
      if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) return false;

      return true;
    });
  }, [properties, searchQuery, filters]);

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  const addProperty = (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    createPropertyMutation.mutate(property);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    updatePropertyMutation.mutate({ id, updates });
  };

  const deleteProperty = (id: string) => {
    deletePropertyMutation.mutate(id);
  };

  const addLead = (lead: { propertyId: string; name: string; email: string; phone: string; message: string }) => {
    createLeadMutation.mutate(lead);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties,
        filters,
        setFilters,
        getPropertyById,
        addProperty,
        updateProperty,
        deleteProperty,
        leads,
        addLead,
        searchQuery,
        setSearchQuery,
        selectedProperty,
        setSelectedProperty,
        isLoading,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
