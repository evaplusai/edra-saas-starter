import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pricing } from '@/components/pricing';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface Subscription {
  id: string;
  plan_name: string;
  tier: string;
  status: string;
  current_period_end: string | null;
}

async function fetchSubscription(): Promise<Subscription | null> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_URL}/billing/subscription`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch subscription');

  const data = await res.json();
  return data.subscription;
}

async function openPortal(): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API_URL}/billing/create-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      return_url: window.location.href,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Failed to open billing portal');
  }

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  }
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function SubscriptionPage() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle>{subscription.plan_name}</CardTitle>
              <Badge
                className={STATUS_STYLES[subscription.status] ?? ''}
              >
                {subscription.status}
              </Badge>
            </div>
            <CardDescription>
              {subscription.current_period_end
                ? `Current period ends ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : 'Free plan — no billing period'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription.tier !== 'free' && (
              <Button onClick={openPortal}>
                Manage Billing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>
              You are currently on the free plan.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Plans</h2>
        <Pricing currentTier={subscription?.tier ?? 'free'} />
      </div>
    </div>
  );
}
