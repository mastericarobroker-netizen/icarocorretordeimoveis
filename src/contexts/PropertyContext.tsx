import React, { createContext, useContext, useState, useCallback } from 'react';
import { Property, PropertyFilters, Lead } from '@/types/property';
import { mockProperties } from '@/data/mockProperties';

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
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter((property) => {
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

  const getPropertyById = useCallback((id: string) => {
    return properties.find((p) => p.id === id);
  }, [properties]);

  const addProperty = useCallback((property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setProperties((prev) => [...prev, newProperty]);
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);
  }, []);

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
