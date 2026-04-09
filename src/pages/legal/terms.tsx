import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEOHead } from '@/components/seo-head';
import { getLegalPage } from '@/lib/legal';

export default function TermsPage() {
  const page = getLegalPage('terms');

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Terms of Service - Edra"
        description="Read the terms and conditions for using the Edra platform."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{page.content}</Markdown>
        </div>
      </div>
    </>
  );
}
