import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEOHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllDocs, getDocBySlug } from '@/lib/docs';

export default function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? getDocBySlug(slug) : undefined;
  const allDocs = getAllDocs();

  if (!doc) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">
          The documentation page you are looking for does not exist.
        </p>
      </div>
    );
  }

  const currentIndex = allDocs.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : undefined;
  const nextDoc =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : undefined;

  return (
    <>
      <SEOHead
        title={`${doc.title} - Edra Docs`}
        description={`Documentation for ${doc.title}`}
      />

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
      </div>

      <nav className="mt-12 flex items-center justify-between border-t pt-6">
        {prevDoc ? (
          <Button asChild variant="ghost">
            <Link to={`/docs/${prevDoc.slug}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {prevDoc.title}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextDoc ? (
          <Button asChild variant="ghost">
            <Link to={`/docs/${nextDoc.slug}`}>
              {nextDoc.title}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </nav>
    </>
  );
}
