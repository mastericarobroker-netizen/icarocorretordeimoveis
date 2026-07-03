import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';

type DbProperty = {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  listing_type: string;
  images: string[] | null;
  features: string[] | null;
  year_built: number | null;
  parking: number | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

// Convert database row to app property format
const dbToProperty = (row: DbProperty): Property => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: row.price,
  address: row.address,
  city: row.city,
  state: row.state,
  zipCode: row.zip_code,
  lat: row.lat,
  lng: row.lng,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  area: row.area,
  type: row.type as Property['type'],
  listingType: row.listing_type as Property['listingType'],
  images: row.images || [],
  features: row.features || [],
  yearBuilt: row.year_built ?? undefined,
  parking: row.parking ?? undefined,
  featured: row.featured ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Convert app property to database insert format
const propertyToDb = (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => ({
  title: property.title,
  description: property.description,
  price: property.price,
  address: property.address,
  city: property.city,
  state: property.state,
  zip_code: property.zipCode,
  lat: property.lat,
  lng: property.lng,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  area: property.area,
  type: property.type,
  listing_type: property.listingType,
  images: property.images,
  features: property.features,
  year_built: property.yearBuilt ?? null,
  parking: property.parking ?? null,
  featured: property.featured ?? null,
});

export function usePropertiesQuery() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(dbToProperty);
    },
  });
}

export function usePropertyByIdQuery(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? dbToProperty(data) : null;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyToDb(property)])
        .select()
        .single();

      if (error) throw error;
      return dbToProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const dbUpdates: Record<string, any> = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
      if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
      if (updates.lng !== undefined) dbUpdates.lng = updates.lng;
      if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
      if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
      if (updates.area !== undefined) dbUpdates.area = updates.area;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.listingType !== undefined) dbUpdates.listing_type = updates.listingType;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.features !== undefined) dbUpdates.features = updates.features;
      if (updates.yearBuilt !== undefined) dbUpdates.year_built = updates.yearBuilt;
      if (updates.parking !== undefined) dbUpdates.parking = updates.parking;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

      const { data, error } = await supabase
        .from('properties')
        .update(dbUpdates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return dbToProperty(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
