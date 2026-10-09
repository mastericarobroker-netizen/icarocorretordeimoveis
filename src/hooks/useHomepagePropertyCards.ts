import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const homepagePropertyCardsQueryKey = ['homepage-property-cards'] as const;

export function useHomepagePropertyCards() {
  return useQuery({
    queryKey: homepagePropertyCardsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_property_cards')
        .select('position, property_id')
        .order('position', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveHomepagePropertyCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyIds: string[]) => {
      const { error } = await supabase.rpc('set_homepage_property_cards', {
        property_ids: propertyIds,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homepagePropertyCardsQueryKey });
    },
  });
}
