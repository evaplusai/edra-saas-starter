import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ActivityLog {
  id: string;
  user_name: string;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

interface ActivityResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_OPTIONS = [
  'login',
  'signup',
  'logout',
  'password_change',
  'admin_update_user',
  'subscription_upgrade',
  'subscription_downgrade',
  'subscription_cancel',
  'payment_success',
  'payment_failure',
  'api_key_create',
  'api_key_revoke',
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncateDetails(details: Record<string, unknown>): string {
  const str = JSON.stringify(details);
  return str.length > 80 ? `${str.slice(0, 80)}...` : str;
}

export default function AdminActivityPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, fromDate, toDate]);

  const { data, isLoading } = useQuery<ActivityResponse>({
    queryKey: ['admin-activity', actionFilter, fromDate, toDate, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== 'all') params.set('action', actionFilter);
      if (fromDate) params.set('from', new Date(fromDate).toISOString());
      if (toDate) params.set('to', new Date(toDate + 'T23:59:59').toISOString());
      params.set('page', String(page));
      return apiFetch(`/admin/activity?${params.toString()}`);
    },
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div>
              <Label className="mb-1 text-xs">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ACTION_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 text-xs">From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div>
              <Label className="mb-1 text-xs">To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user_name}</TableCell>
                      <TableCell>{log.action.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {truncateDetails(log.details)}
                      </TableCell>
                      <TableCell className="text-xs">{log.ip_address ?? '-'}</TableCell>
                      <TableCell className="text-xs">{formatTimestamp(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No activity logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
