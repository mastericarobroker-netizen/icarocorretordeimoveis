import React, { createContext, useContext, useState, useMemo } from 'react';
import { Property, PropertyFilters, Lead, PropertyCapture } from '@/types/property';
import { usePropertiesQuery, useCreateProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/usePropertiesQuery';
import { useLeadsQuery, useCreateLead, useUpdateLead, useDeleteLead } from '@/hooks/useLeadsQuery';
import { useCapturesQuery, useCreateCapture, useUpdateCapture, useDeleteCapture } from '@/hooks/useCapturesQuery';

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
  addLead: (lead: { propertyId: string; name: string; email: string; phone: string; message: string }) => Promise<any>;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  captures: PropertyCapture[];
  addCapture: (capture: { name: string; phone: string; address: string; description: string }) => Promise<any>;
  updateCapture: (id: string, updates: Partial<PropertyCapture>) => void;
  deleteCapture: (id: string) => void;
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
  const { data: captures = [] } = useCapturesQuery();

  // Mutations
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const createCaptureMutation = useCreateCapture();
  const updateCaptureMutation = useUpdateCapture();
  const deleteCaptureMutation = useDeleteCapture();

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
    return createLeadMutation.mutateAsync({ ...lead, status: 'Novo' });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    updateLeadMutation.mutate({ id, updates });
  };

  const deleteLead = (id: string) => {
    deleteLeadMutation.mutate(id);
  };

  const addCapture = (capture: { name: string; phone: string; address: string; description: string }) => {
    return createCaptureMutation.mutateAsync({ ...capture, status: 'Novo' });
  };

  const updateCapture = (id: string, updates: Partial<PropertyCapture>) => {
    updateCaptureMutation.mutate({ id, updates });
  };

  const deleteCapture = (id: string) => {
    deleteCaptureMutation.mutate(id);
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
        updateLead,
        deleteLead,
        captures,
        addCapture,
        updateCapture,
        deleteCapture,
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
