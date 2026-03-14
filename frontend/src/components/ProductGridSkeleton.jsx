const ProductGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card bg-base-300 animate-pulse overflow-hidden">
          <div className="h-48 bg-base-200" />
          <div className="card-body p-4 space-y-3">
            <div className="h-4 bg-base-200 rounded w-3/4" />
            <div className="h-6 bg-base-200 rounded w-1/4" />
            <div className="h-4 bg-base-200 rounded w-full" />
            <div className="divider my-1"></div>
            <div className="flex justify-between">
                <div className="h-6 w-6 rounded-full bg-base-200" />
                <div className="h-4 w-12 bg-base-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
