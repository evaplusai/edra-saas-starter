import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, DollarSign, Eye } from 'lucide-react';
import { Link } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

interface SubscribersData {
  subscribers: { tier: string; count: number }[];
  totalUsers: number;
}

interface RevenueData {
  totalMrr: number;
}

interface PageViewsData {
  count: number;
}

export default function AdminPage() {
  const { data: subscribersData, isLoading: loadingSubs } = useQuery({
    queryKey: ['admin', 'subscribers'],
    queryFn: () => fetchJson<SubscribersData>('/admin/analytics/subscribers'),
  });

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: () => fetchJson<RevenueData>('/admin/analytics/revenue'),
  });

  const { data: pageViewsData, isLoading: loadingViews } = useQuery({
    queryKey: ['admin', 'pageviews-today'],
    queryFn: () => fetchJson<PageViewsData>('/admin/analytics/pageviews-today'),
  });

  const totalUsers = subscribersData?.totalUsers ?? 0;
  const activeSubscriptions = subscribersData?.subscribers?.reduce(
    (sum, s) => sum + s.count,
    0,
  ) ?? 0;
  const mrr = revenueData?.totalMrr ?? 0;
  const pageViewsToday = pageViewsData?.count ?? 0;

  const cards = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      description: 'Registered accounts',
      icon: Users,
      href: '/dashboard/admin/users',
      loading: loadingSubs,
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions.toLocaleString(),
      description: 'Paid plans',
      icon: CreditCard,
      href: '/dashboard/admin/analytics',
      loading: loadingSubs,
    },
    {
      title: 'MRR',
      value: `$${(mrr / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      description: 'Monthly recurring revenue',
      icon: DollarSign,
      href: '/dashboard/admin/analytics',
      loading: loadingRevenue,
    },
    {
      title: 'Page Views Today',
      value: pageViewsToday.toLocaleString(),
      description: 'Unique page views',
      icon: Eye,
      href: '/dashboard/admin/analytics',
      loading: loadingViews,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Administration overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} to={card.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.loading ? '...' : card.value}
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
