import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to ship your SaaS?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Get started in minutes. No credit card required. Build, launch, and
          scale with confidence.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link to="/signup">Start Building Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
