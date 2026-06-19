
-- 1. Leads: restrict SELECT to property owners
DROP POLICY IF EXISTS "Leads are viewable" ON public.leads;
CREATE POLICY "Property owners can view their leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = leads.property_id AND p.user_id = auth.uid()
  )
);

-- 2. Properties: restrict write policies to authenticated owners
DROP POLICY IF EXISTS "Allow property inserts" ON public.properties;
DROP POLICY IF EXISTS "Allow property updates" ON public.properties;
DROP POLICY IF EXISTS "Allow property deletes" ON public.properties;

CREATE POLICY "Authenticated users can insert their own properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own properties"
ON public.properties
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Storage: restrict writes to authenticated users; remove public SELECT (listing).
-- Public URLs via /object/public/ still work because the bucket is public.
DROP POLICY IF EXISTS "Permitir upload de imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deletar imagens" ON storage.objects;
DROP POLICY IF EXISTS "Imagens são públicas" ON storage.objects;

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can delete property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

-- 4. Revoke public EXECUTE on SECURITY DEFINER trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
