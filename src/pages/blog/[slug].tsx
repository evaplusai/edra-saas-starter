import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEOHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug } from '@/lib/blog';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The blog post you are looking for does not exist.
        </p>
        <Button asChild variant="outline">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} - Edra Blog`}
        description={post.excerpt}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-4">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {post.title}
          </h1>
          <p className="text-muted-foreground">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            &middot; {post.author}
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
        </div>
      </article>
    </>
  );
}
