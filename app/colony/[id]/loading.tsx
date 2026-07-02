// Route-level loading state for /colony/:id — shown by Next.js while the
// server component above (page.tsx) is fetching colony data. Previously
// this route had no loading UI at all (a blank screen during the fetch);
// this shimmer skeleton roughly matches the page's header + tabs shape.
export default function ColonyLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="felines-skeleton h-8 w-2/3 max-w-md rounded" />
      <div className="felines-skeleton mt-3 h-4 w-1/3 max-w-xs rounded" />

      <div className="mt-8 flex gap-2">
        <div className="felines-skeleton h-9 w-24 rounded-full" />
        <div className="felines-skeleton h-9 w-24 rounded-full" />
        <div className="felines-skeleton h-9 w-24 rounded-full" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="felines-skeleton h-40 rounded-xl" />
        <div className="felines-skeleton h-40 rounded-xl" />
        <div className="felines-skeleton h-40 rounded-xl" />
      </div>
    </div>
  );
}
