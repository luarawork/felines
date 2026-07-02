// Route-level loading state for /learn/:slug, matching the previous
// blank-screen gap while the article page's server component resolves.
export default function ArticleLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="felines-skeleton h-4 w-24 rounded" />
      <div className="felines-skeleton mt-6 h-8 w-5/6 rounded" />
      <div className="mt-6 space-y-3">
        <div className="felines-skeleton h-4 w-full rounded" />
        <div className="felines-skeleton h-4 w-full rounded" />
        <div className="felines-skeleton h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}
