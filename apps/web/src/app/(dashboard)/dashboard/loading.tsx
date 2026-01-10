export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="h-8 w-32 bg-[rgb(var(--muted))] rounded-lg mb-2" />
          <div className="h-4 w-24 bg-[rgb(var(--muted))] rounded" />
        </div>
        <div className="h-10 w-28 bg-[rgb(var(--muted))] rounded-lg" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 bg-[rgb(var(--muted))] rounded-lg" />
        ))}
      </div>

      {/* Section */}
      <div className="space-y-8">
        <div>
          <div className="h-4 w-32 bg-[rgb(var(--muted))] rounded mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-[rgb(var(--muted))]" />
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <div className="h-5 w-16 bg-[rgb(var(--muted))] rounded-full" />
                      <div className="h-5 w-24 bg-[rgb(var(--muted))] rounded" />
                    </div>
                    <div className="h-5 w-48 bg-[rgb(var(--muted))] rounded" />
                  </div>
                  <div className="h-5 w-16 bg-[rgb(var(--muted))] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
