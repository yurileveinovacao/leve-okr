'use client'

interface FilterOption {
  label: string
  value: string
  count?: number
}

export default function PortalTaskFilters({
  filters,
  active,
  onFilter,
}: {
  filters: FilterOption[]
  active: string
  onFilter: (value: string) => void
}) {
  return (
    <div className="portal-filters">
      {filters.map(f => (
        <button
          key={f.value}
          className={`portal-filter-btn ${active === f.value ? 'portal-filter-active' : ''}`}
          onClick={() => onFilter(f.value)}
        >
          {f.label}
          {f.count !== undefined && <span className="portal-filter-count">{f.count}</span>}
        </button>
      ))}
    </div>
  )
}
