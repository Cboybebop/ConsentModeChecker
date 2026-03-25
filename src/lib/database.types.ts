export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      audits: {
        Row: {
          id: string;
          user_id: string;
          site_url: string;
          site_name: string | null;
          quality_index: number;
          summary: string | null;
          raw_input: Record<string, unknown>;
          decoded: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          site_url: string;
          site_name?: string | null;
          quality_index?: number;
          summary?: string | null;
          raw_input?: Record<string, unknown>;
          decoded?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          site_url?: string;
          site_name?: string | null;
          quality_index?: number;
          summary?: string | null;
          raw_input?: Record<string, unknown>;
          decoded?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
