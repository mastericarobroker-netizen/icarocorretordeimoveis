-- Create properties table
CREATE TABLE public.properties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('house', 'apartment', 'condo', 'land')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    year_built INTEGER,
    parking INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Properties: Public read access (anyone can view)
CREATE POLICY "Properties are viewable by everyone" 
ON public.properties 
FOR SELECT 
USING (true);

-- Properties: Allow inserts for now (we can add auth later)
CREATE POLICY "Allow property inserts" 
ON public.properties 
FOR INSERT 
WITH CHECK (true);

-- Properties: Allow updates for now
CREATE POLICY "Allow property updates" 
ON public.properties 
FOR UPDATE 
USING (true);

-- Properties: Allow deletes for now
CREATE POLICY "Allow property deletes" 
ON public.properties 
FOR DELETE 
USING (true);

-- Leads: Allow inserts (visitors can submit contact forms)
CREATE POLICY "Anyone can submit leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Leads: Public read for now (can restrict to admin later)
CREATE POLICY "Leads are viewable" 
ON public.leads 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();