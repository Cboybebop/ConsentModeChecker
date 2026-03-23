
interface AuditFiltersProps {
  urlFilter: string;
  setUrlFilter: (v: string) => void;
  sortBy: 'date' | 'quality';
  setSortBy: (v: 'date' | 'quality') => void;
}

export function AuditFilters({ urlFilter, setUrlFilter, sortBy, setSortBy }: AuditFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="text"
        placeholder="Filter by site URL…"
        value={urlFilter}
        onChange={(e) => setUrlFilter(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:max-w-xs"
      />
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Sort by:</span>
        <button
          className={`rounded px-2 py-1 ${sortBy === 'date' ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-100'}`}
          onClick={() => setSortBy('date')}
        >
          Date
        </button>
        <button
          className={`rounded px-2 py-1 ${sortBy === 'quality' ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-100'}`}
          onClick={() => setSortBy('quality')}
        >
          Quality Index
        </button>
      </div>
    </div>
  );
}
