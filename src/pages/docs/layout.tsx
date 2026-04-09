import { NavLink, Outlet, Navigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getAllDocs } from '@/lib/docs';

export default function DocsLayout() {
  const { slug } = useParams<{ slug: string }>();
  const docs = getAllDocs();

  // Redirect /docs to the first doc
  if (!slug && docs.length > 0) {
    return <Navigate to={`/docs/${docs[0].slug}`} replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0">
          <h2 className="text-lg font-semibold mb-4">Documentation</h2>
          <nav className="flex flex-col gap-1">
            {docs.map((doc) => (
              <NavLink
                key={doc.slug}
                to={`/docs/${doc.slug}`}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                    isActive && 'bg-muted font-medium'
                  )
                }
              >
                {doc.title}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
