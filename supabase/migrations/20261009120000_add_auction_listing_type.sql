ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_listing_type_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_listing_type_check
  CHECK (listing_type IN ('sale', 'rent', 'auction'));
