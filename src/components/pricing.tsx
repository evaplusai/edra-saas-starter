import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface Plan {
  id: string;
  name: string;
  stripe_price_id: string | null;
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  features: string[];
}

async function fetchPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_URL}/billing/plans`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  const data = await res.json();
  return data.plans;
}

async function createCheckout(priceId: string): Promise<string> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_URL}/billing/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      price_id: priceId,
      success_url: `${window.location.origin}/dashboard/subscription?success=true`,
      cancel_url: `${window.location.origin}/dashboard/subscription?canceled=true`,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Failed to create checkout');
  }

  const data = await res.json();
  return data.url;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

interface PricingProps {
  currentTier?: string;
}

export function Pricing({ currentTier }: PricingProps) {
  const { isAuthenticated } = useAuth();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: fetchPlans,
  });

  async function handleSubscribe(plan: Plan) {
    if (!plan.stripe_price_id) return;

    try {
      const url = await createCheckout(plan.stripe_price_id);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    );
  }

  if (error || !plans) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Failed to load pricing plans.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = currentTier === plan.tier;
        const isPopular = plan.tier === 'pro';

        return (
          <Card
            key={plan.id}
            className={isPopular ? 'border-primary shadow-md' : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {isCurrent && <Badge variant="secondary">Current Plan</Badge>}
                {isPopular && !isCurrent && <Badge>Popular</Badge>}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground"> /month</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-primary">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.tier === 'free' ? (
                isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/signup">Get Started</a>
                  </Button>
                )
              ) : isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={!isAuthenticated}
                >
                  Subscribe
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
