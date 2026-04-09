import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RevenueData {
  mrr: { month: string; mrr: number }[];
  totalMrr: number;
}

interface SubscriberData {
  subscribers: { tier: string; count: number }[];
  totalUsers: number;
  transactions: {
    action: string;
    details: Record<string, unknown>;
    user_name: string;
    created_at: string;
  }[];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminAnalyticsPage() {
  const { data: revenue, isLoading: revLoading } = useQuery<RevenueData>({
    queryKey: ['admin-analytics-revenue'],
    queryFn: () => apiFetch('/admin/analytics/revenue'),
  });

  const { data: subs, isLoading: subsLoading } = useQuery<SubscriberData>({
    queryKey: ['admin-analytics-subscribers'],
    queryFn: () => apiFetch('/admin/analytics/subscribers'),
  });

  const mrrData = (revenue?.mrr ?? []).map((d) => ({
    ...d,
    label: formatMonth(d.month),
    value: d.mrr / 100,
  }));

  const subData = subs?.subscribers ?? [];
  const transactions = subs?.transactions ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {revLoading ? '...' : formatCurrency(revenue?.totalMrr ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {subsLoading ? '...' : (subs?.totalUsers ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MRR Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {revLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : mrrData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mrrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscribers by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          {subsLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : subData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No subscriber data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{tx.user_name}</TableCell>
                  <TableCell>{tx.action.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{formatDate(tx.created_at)}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No recent transactions.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
