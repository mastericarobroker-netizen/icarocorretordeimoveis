REVOKE ALL ON public.homepage_property_cards_public FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.homepage_property_cards_public TO anon, authenticated;
