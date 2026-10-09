CREATE TABLE IF NOT EXISTS public.homepage_property_cards (
  position SMALLINT PRIMARY KEY CHECK (position BETWEEN 1 AND 4),
  property_id UUID NOT NULL UNIQUE REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_property_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read homepage property card selection"
  ON public.homepage_property_cards
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert homepage property cards"
  ON public.homepage_property_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete homepage property cards"
  ON public.homepage_property_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

REVOKE ALL ON TABLE public.homepage_property_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.homepage_property_cards TO anon, authenticated;
GRANT INSERT, DELETE ON TABLE public.homepage_property_cards TO authenticated;

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
  property.area
FROM public.homepage_property_cards AS cards
JOIN public.properties AS property ON property.id = cards.property_id;

REVOKE ALL ON public.homepage_property_cards_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.homepage_property_cards_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_homepage_property_cards(property_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  selected_ids UUID[] := COALESCE(property_ids, ARRAY[]::UUID[]);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF cardinality(selected_ids) > 4
    OR EXISTS (SELECT 1 FROM unnest(selected_ids) AS selected(id) WHERE selected.id IS NULL)
    OR (SELECT count(*) <> count(DISTINCT selected.id) FROM unnest(selected_ids) AS selected(id))
  THEN
    RAISE EXCEPTION 'Select at most four distinct properties';
  END IF;

  DELETE FROM public.homepage_property_cards
  WHERE position BETWEEN 1 AND 4;

  INSERT INTO public.homepage_property_cards (position, property_id)
  SELECT selected.ordinality::SMALLINT, selected.id
  FROM unnest(selected_ids) WITH ORDINALITY AS selected(id, ordinality);
END;
$$;

REVOKE ALL ON FUNCTION public.set_homepage_property_cards(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_homepage_property_cards(UUID[]) TO authenticated;
