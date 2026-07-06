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

      return (data || []).map((row: any): Lead => ({
        id: row.id,
        propertyId: row.property_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        status: row.status || 'Novo',
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

      const row = data as any;
      return {
        id: row.id,
        propertyId: row.property_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        message: row.message,
        status: row.status || 'Novo',
        createdAt: row.created_at,
      } as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          message: updates.message,
          status: updates.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
