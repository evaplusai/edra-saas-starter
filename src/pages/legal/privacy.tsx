import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEOHead } from '@/components/seo-head';
import { getLegalPage } from '@/lib/legal';

export default function PrivacyPage() {
  const page = getLegalPage('privacy');

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
        title="Privacy Policy - Edra"
        description="Learn how Edra collects, uses, and protects your personal information."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{page.content}</Markdown>
        </div>
      </div>
    </>
  );
}
