import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertyCapture } from '@/types/property';

export function useCapturesQuery() {
    return useQuery({
        queryKey: ['property_captures'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('property_captures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map((row): PropertyCapture => ({
                id: row.id,
                name: row.name,
                phone: row.phone,
                address: row.address,
                description: row.description,
                status: row.status || 'Novo',
                createdAt: row.created_at,
            }));
        },
    });
}

export function useCreateCapture() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (capture: Omit<PropertyCapture, 'id' | 'createdAt'>) => {
            const { data, error } = await (supabase as any)
                .from('property_captures')
                .insert([{
                    name: capture.name,
                    phone: capture.phone,
                    address: capture.address,
                    description: capture.description,
                }])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                name: data.name,
                phone: data.phone,
                address: data.address,
                description: data.description,
                status: data.status || 'Novo',
                createdAt: data.created_at,
            } as PropertyCapture;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['property_captures'] });
        },
    });
}

export function useUpdateCapture() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<PropertyCapture> }) => {
            const { data, error } = await (supabase as any)
                .from('property_captures')
                .update({
                    name: updates.name,
                    phone: updates.phone,
                    address: updates.address,
                    description: updates.description,
                    status: updates.status,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['property_captures'] });
        },
    });
}

export function useDeleteCapture() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('property_captures')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['property_captures'] });
        },
    });
}
