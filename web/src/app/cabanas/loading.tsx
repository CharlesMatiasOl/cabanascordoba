export default function LoadingCabins() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-44 rounded-xl bg-slate-200" />
        <div className="h-4 w-72 rounded-xl bg-slate-200 mt-3" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="h-5 w-48 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-2/3 bg-slate-200 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-xl" />
              <div className="h-4 w-full bg-slate-200 rounded-xl" />
              <div className="h-4 w-5/6 bg-slate-200 rounded-xl" />
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
