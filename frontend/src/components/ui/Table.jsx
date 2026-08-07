import { useState, useEffect } from 'react';
import { FiChevronUp, FiChevronDown, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi';

function usePersistentVisibility(key, defaultVis) {
  const [vis, setVis] = useState(()=>{
    if (!key) return defaultVis;
    try {
      const saved = localStorage.getItem(`fylo:table:${key}`);
      if (saved) return { ...defaultVis, ...JSON.parse(saved) };
    } catch {}
    return defaultVis;
  });
  useEffect(()=>{
    if (!key) return;
    try { localStorage.setItem(`fylo:table:${key}`, JSON.stringify(vis)); } catch {}
  }, [key, vis]);
  const toggle = (colKey)=> setVis(prev=> ({ ...prev, [colKey]: !prev[colKey] }));
  return [vis, toggle, setVis];
}

export const PremiumTable = ({ columns=[], data=[], loading=false, searchable=true, onSearch, searchValue, sortBy, sortOrder, onSort, pagination, onPageChange, columnVisibility: propVis, onColumnVisibilityChange: propToggle, storageKey, className='' }) => {
  const [localSearch, setLocalSearch] = useState('');
  const defaultVis = Object.fromEntries(columns.map(c=> [c.key, true]));
  const [persistedVis, persistedToggle] = usePersistentVisibility(storageKey, defaultVis);

  const columnVisibility = propVis ?? persistedVis;
  const onColumnVisibilityChange = propToggle ?? persistedToggle;

  const visibleColumns = columns.filter(c=> columnVisibility?.[c.key]!==false);

  return (
    <div className={`rounded-[14px] border border-border bg-card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b border-border bg-muted/30">
        {searchable && (
          <div className="relative flex-1 max-w-full sm:max-w-[320px] w-full">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={searchValue ?? localSearch}
              onChange={e=>{ setLocalSearch(e.target.value); onSearch?.(e.target.value); }}
              className="h-8 w-full rounded-[8px] border border-border bg-background pl-8 pr-3 text-[13px] outline-none focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.06] placeholder:text-muted-foreground/60"
            />
          </div>
        )}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 sm:py-0 w-full sm:w-auto">
          {columns.filter(c=> c.key!=='actions' && c.key!=='image' && c.key!=='avatar').map(col=>(
            <button
              key={col.key}
              onClick={()=> onColumnVisibilityChange?.(col.key)}
              className={`h-7 px-2.5 rounded-[8px] text-[11px] font-[550] border flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors ${columnVisibility[col.key]===false ? 'bg-muted text-muted-foreground border-border' : 'bg-foreground text-background border-foreground'}`}
              title={col.title}
            >
              {columnVisibility[col.key]===false ? <FiEyeOff className="h-3 w-3" /> : <FiEye className="h-3 w-3" />} <span className="hidden sm:inline">{col.title}</span><span className="sm:hidden">{col.title.slice(0,3)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-[12px] border-b border-border">
            <tr>
              {visibleColumns.map(col=>(
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`text-left px-4 py-3 text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:text-foreground hover:bg-accent/50' : ''}`}
                  onClick={()=> col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.title}
                    {col.sortable && sortBy===col.key && (sortOrder==='asc' ? <FiChevronUp className="h-3 w-3" /> : <FiChevronDown className="h-3 w-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              Array.from({length:6}).map((_,i)=>(
                <tr key={i} className="animate-pulse">
                  {visibleColumns.map((_,j)=><td key={j} className="px-4 py-4"><div className="h-4 w-full bg-muted rounded" /></td>)}
                </tr>
              ))
            ) : data.length===0 ? (
              <tr><td colSpan={visibleColumns.length} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">∅</div>
                  <p className="text-[13px] font-[500] text-muted-foreground">No data found</p>
                </div>
              </td></tr>
            ) : data.map((row,i)=>(
              <tr key={row._id || i} className="group hover:bg-accent/40 transition-colors">
                {visibleColumns.map(col=>(
                  <td key={col.key} className="px-4 py-3 text-[13.5px] font-[450] tabular-nums">
                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-t border-border bg-muted/20 text-[12.5px]">
          <span className="text-muted-foreground text-center sm:text-left">Page {pagination.page} of {pagination.pages} • {pagination.total} total</span>
          <div className="flex gap-1.5 justify-center sm:justify-end">
            <button disabled={pagination.page<=1} onClick={()=>onPageChange(pagination.page-1)} className="h-8 px-4 rounded-[10px] border border-border bg-background disabled:opacity-50 hover:bg-accent text-[12px] font-[600]">Prev</button>
            <button disabled={!pagination.hasNext} onClick={()=>onPageChange(pagination.page+1)} className="h-8 px-4 rounded-[10px] border border-border bg-background disabled:opacity-50 hover:bg-accent text-[12px] font-[600]">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumTable;
