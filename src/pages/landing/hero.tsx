import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo-head';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Edra',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
  description:
    'The modern SaaS starter kit for building production-ready applications.',
};

export function Hero() {
  return (
    <>
      <SEOHead
        title="Edra - Modern SaaS Starter Kit"
        description="Ship your SaaS faster with authentication, billing, dashboards, and more built in. Production-ready from day one."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:flex-row lg:px-8">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build your SaaS{' '}
              <span className="text-primary">faster than ever</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground lg:text-xl">
              Ship production-ready applications with authentication, billing,
              dashboards, and admin tools built in. Focus on what makes your
              product unique.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-1 items-center justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="flex h-64 w-full max-w-lg items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground sm:h-80 lg:h-96">
              <span className="text-sm">Hero Illustration</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
