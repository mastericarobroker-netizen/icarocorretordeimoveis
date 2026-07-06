-- ================================================================================
-- MIGRATION 1: Create properties and leads tables
-- File: 20260126084450_4adc6e88-63ce-4109-8145-0bfd2577715f.sql
-- ================================================================================

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

-- ================================================================================
-- MIGRATION 2: Create storage bucket for property images
-- File: 20260127021055_0732f659-e97f-4044-9994-8df72b975d21.sql
-- ================================================================================

-- Criar bucket para imagens de imóveis
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Permitir upload público (para simplificar - pode adicionar auth depois)
CREATE POLICY "Permitir upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images');

-- Permitir visualização pública
CREATE POLICY "Imagens são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Permitir deleção
CREATE POLICY "Permitir deletar imagens"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images');

-- Permitir atualização
CREATE POLICY "Permitir atualizar imagens"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images');

-- ================================================================================
-- MIGRATION 3: Create user profiles table
-- File: 20260128003209_3c527e99-f11b-42a2-b0f2-3341ea4b2245.sql
-- ================================================================================

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================================
-- MIGRATION 4: Add user_id to properties table
-- File: 20260128004003_73499f11-6535-496f-ab79-8dbeff3ea227.sql
-- ================================================================================

-- Adicionar coluna user_id para vincular imóveis a corretores
ALTER TABLE public.properties
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas por corretor
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
