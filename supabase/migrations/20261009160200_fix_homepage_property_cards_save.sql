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
