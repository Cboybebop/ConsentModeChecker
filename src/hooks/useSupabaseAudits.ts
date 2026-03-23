import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseEnabled } from '../lib/supabaseClient';
import { useAuth } from '../features/auth/useAuth';

export interface SupabaseAudit {
  id: string;
  user_id: string;
  site_url: string;
  site_name: string | null;
  quality_index: number;
  summary: string | null;
  raw_input: Record<string, unknown>;
  decoded: Record<string, unknown>;
  created_at: string;
}

export function useSupabaseAudits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: audits = [],
    isLoading,
    error,
  } = useQuery<SupabaseAudit[]>({
    queryKey: ['audits', user?.id],
    queryFn: async () => {
      if (!supabase || !supabaseEnabled || !user) return [];
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as SupabaseAudit[];
    },
    enabled: supabaseEnabled && !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (
      audit: Omit<SupabaseAudit, 'id' | 'user_id' | 'created_at'>,
    ): Promise<SupabaseAudit> => {
      if (!supabase || !user) throw new Error('Not authenticated');
      const row = { ...audit, user_id: user.id } as Record<string, unknown>;
      const { data, error } = await supabase
        .from('audits')
        .insert(row as never)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as SupabaseAudit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.from('audits').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits', user?.id] });
    },
  });

  return {
    audits,
    isLoading,
    error: error ? (error as Error).message : null,
    saveAudit: saveMutation.mutateAsync,
    deleteAudit: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
