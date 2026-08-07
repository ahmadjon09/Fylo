export const Skeleton = ({ className='', ...props }) => (
  <div className={`animate-pulse rounded-[10px] bg-muted ${className}`} {...props} />
);

export const CardSkeleton = () => (
  <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-[10px]" />
    </div>
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export const TableSkeleton = ({ rows=5 }) => (
  <div className="rounded-[12px] border border-border overflow-hidden">
    <div className="bg-muted/50 p-3 flex gap-3">
      {Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-4 flex-1" />)}
    </div>
    <div className="divide-y divide-border">
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="p-4 flex gap-3">
          {Array.from({length:5}).map((_,j)=><Skeleton key={j} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-[16px] border border-border bg-card p-5">
    <Skeleton className="h-5 w-40 mb-6" />
    <Skeleton className="h-[240px] w-full rounded-[12px]" />
  </div>
);

export const FormSkeleton = () => (
  <div className="rounded-[16px] border border-border bg-card p-6 space-y-5">
    {Array.from({length:4}).map((_,i)=>(
      <div key={i} className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);
