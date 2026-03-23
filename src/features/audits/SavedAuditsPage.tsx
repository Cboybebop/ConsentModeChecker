import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { supabaseEnabled } from '../../lib/supabaseClient';
import { useSupabaseAudits } from '../../hooks/useSupabaseAudits';
import { useLocalAudits } from '../../hooks/useLocalAudits';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { AuditListItem } from './AuditListItem';
import { AuditDetail } from './AuditDetail';
import { AuditFilters } from './AuditFilters';

interface AuditRow {
  id: string;
  site_url: string;
  site_name: string | null;
  quality_index: number;
  summary: string | null;
  decoded: Record<string, unknown>;
  created_at: string;
}

export function SavedAuditsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabaseAudits = useSupabaseAudits();
  const localAudits = useLocalAudits();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [urlFilter, setUrlFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'quality'>('date');

  // In Supabase mode, redirect to login if not authenticated
  if (supabaseEnabled && !authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const isSupabase = supabaseEnabled && !!user;

  const rawAudits: AuditRow[] = isSupabase
    ? supabaseAudits.audits.map((a) => ({
        id: a.id,
        site_url: a.site_url,
        site_name: a.site_name,
        quality_index: a.quality_index,
        summary: a.summary,
        decoded: a.decoded,
        created_at: a.created_at,
      }))
    : localAudits.audits.map((a) => ({
        id: a.id,
        site_url: a.site_url,
        site_name: a.site_name,
        quality_index: a.quality_index,
        summary: a.summary,
        decoded: a.decoded,
        created_at: a.created_at,
      }));

  const filtered = useMemo(() => {
    let list = rawAudits;
    if (urlFilter.trim()) {
      const lower = urlFilter.toLowerCase();
      list = list.filter((a) => a.site_url.toLowerCase().includes(lower));
    }
    if (sortBy === 'quality') {
      list = [...list].sort((a, b) => b.quality_index - a.quality_index);
    }
    // Date sort is default (already sorted desc from source)
    return list;
  }, [rawAudits, urlFilter, sortBy]);

  const selected = selectedId ? filtered.find((a) => a.id === selectedId) : null;
  const previous = selected
    ? filtered.find(
        (a) => a.site_url === selected.site_url && a.created_at < selected.created_at,
      )
    : undefined;

  if (authLoading || supabaseAudits.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <AuditDetail
          audit={selected}
          previousAudit={previous}
          onBack={() => setSelectedId(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Saved Audits</h1>
      <p className="mb-6 text-gray-600">View and compare your past audit results.</p>

      {supabaseAudits.error && (
        <Alert variant="error" className="mb-4">{supabaseAudits.error}</Alert>
      )}

      <AuditFilters
        urlFilter={urlFilter}
        setUrlFilter={setUrlFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No audits yet. Run a Quick Check or Guided Audit to get started.
          </p>
        ) : (
          filtered.map((audit) => (
            <AuditListItem
              key={audit.id}
              siteName={audit.site_name ?? ''}
              siteUrl={audit.site_url}
              date={audit.created_at}
              qualityIndex={audit.quality_index}
              onClick={() => setSelectedId(audit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
