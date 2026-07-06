export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // sqft
  type: 'house' | 'apartment' | 'condo' | 'land';
  listingType: 'sale' | 'rent';
  images: string[];
  features: string[];
  yearBuilt?: number;
  parking?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  type?: Property['type'];
  listingType?: Property['listingType'];
  city?: string;
}

export interface Lead {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'Novo' | 'Tratando' | 'Finalizado';
  createdAt: string;
}
export interface PropertyCapture {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  status: 'Novo' | 'Tratando' | 'Finalizado';
  createdAt: string;
}
