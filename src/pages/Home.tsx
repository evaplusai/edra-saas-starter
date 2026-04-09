import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">
        Edra SaaS Starter
      </h1>
      <p className="text-muted-foreground">
        Your project is ready. Start building.
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
