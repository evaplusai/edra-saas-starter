import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo-head';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { getAllPosts } from '@/lib/blog';

export default function BlogListingPage() {
  const posts = getAllPosts();

  return (
    <>
      <SEOHead
        title="Blog - Edra"
        description="Read the latest articles from the Edra team about building SaaS applications."
      />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground mb-8">
          Latest articles and updates from the Edra team.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardDescription>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      &middot; {post.author}
                    </CardDescription>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
