ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS auction_modality TEXT;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_auction_modality_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_auction_modality_check
  CHECK (
    auction_modality IS NULL
    OR auction_modality IN (
      'first_auction',
      'second_auction',
      'open_bidding',
      'online_sale',
      'direct_sale'
    )
  );

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_auction_modality_matches_listing_check;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_auction_modality_matches_listing_check
  CHECK (
    (listing_type = 'auction' AND auction_modality IS NOT NULL)
    OR (listing_type IN ('sale', 'rent') AND auction_modality IS NULL)
  );
