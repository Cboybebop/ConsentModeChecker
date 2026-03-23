import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cmc_audits';

export interface LocalAudit {
  id: string;
  site_url: string;
  site_name: string;
  quality_index: number;
  summary: string;
  raw_input: Record<string, unknown>;
  decoded: Record<string, unknown>;
  created_at: string;
}

function readAudits(): LocalAudit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalAudit[]) : [];
  } catch {
    return [];
  }
}

function writeAudits(audits: LocalAudit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
}

export function useLocalAudits() {
  const [audits, setAudits] = useState<LocalAudit[]>(readAudits);

  const refresh = useCallback(() => {
    setAudits(readAudits());
  }, []);

  const saveAudit = useCallback(
    (audit: Omit<LocalAudit, 'id' | 'created_at'>) => {
      const newAudit: LocalAudit = {
        ...audit,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const updated = [newAudit, ...readAudits()];
      writeAudits(updated);
      setAudits(updated);
      return newAudit;
    },
    [],
  );

  const deleteAudit = useCallback((id: string) => {
    const updated = readAudits().filter((a) => a.id !== id);
    writeAudits(updated);
    setAudits(updated);
  }, []);

  return { audits, saveAudit, deleteAudit, refresh };
}
