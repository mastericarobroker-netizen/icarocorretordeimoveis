import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/property';

export function useLeadsQuery() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((row): Lead => ({
        id: row.id,
        propertyId: row.property_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        createdAt: row.created_at,
      }));
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          property_id: lead.propertyId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        propertyId: data.property_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        createdAt: data.created_at,
      } as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
