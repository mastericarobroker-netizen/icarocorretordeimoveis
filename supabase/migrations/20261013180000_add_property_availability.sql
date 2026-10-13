ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;

CREATE OR REPLACE VIEW public.homepage_property_cards_public
WITH (security_invoker = true)
AS
SELECT
  cards.position,
  property.id AS property_id,
  property.title,
  property.price,
  property.city,
  property.state,
  property.images,
  property.listing_type,
  property.auction_modality,
  property.type,
  property.bedrooms,
  property.bathrooms,
  property.area,
  property.is_available
FROM public.homepage_property_cards AS cards
JOIN public.properties AS property ON property.id = cards.property_id;
