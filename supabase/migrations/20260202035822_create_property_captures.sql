-- Create property_captures table
CREATE TABLE public.property_captures (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_captures ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Anyone can submit property captures" 
ON public.property_captures 
FOR INSERT 
WITH CHECK (true);

-- Allow public select for now (like leads)
CREATE POLICY "Property captures are viewable" 
ON public.property_captures 
FOR SELECT 
USING (true);
