import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Copy, Plus, Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  revoked: boolean;
}

interface ApiKeysResponse {
  apiKeys: ApiKey[];
}

interface CreateKeyResponse {
  apiKey: {
    id: string;
    name: string;
    key: string;
    scopes: string[];
    created_at: string;
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ApiKeysResponse>({
    queryKey: ['api-keys'],
    queryFn: () => apiFetch('/api-keys'),
  });

  const createKey = useMutation({
    mutationFn: (name: string) =>
      apiFetch<CreateKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: (data) => {
      setNewKey(data.apiKey.key);
      setKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const revokeKey = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api-keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('API key revoked');
      setRevokeId(null);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const keys = data?.apiKeys ?? [];
  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <Button onClick={() => { setCreateOpen(true); setNewKey(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm">{key.prefix}</TableCell>
                    <TableCell>{formatDate(key.created_at)}</TableCell>
                    <TableCell>{key.last_used_at ? formatDate(key.last_used_at) : 'Never'}</TableCell>
                    <TableCell>
                      <Badge variant={key.revoked ? 'destructive' : 'default'}>
                        {key.revoked ? 'Revoked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!key.revoked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRevokeId(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No API keys yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
            <DialogDescription>
              {newKey
                ? 'Copy your key now. You will not be able to see it again.'
                : 'Give your API key a descriptive name.'}
            </DialogDescription>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <code className="flex-1 text-sm break-all">{newKey}</code>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(newKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setCreateOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createKey.mutate(keyName)}
                  disabled={!keyName.trim() || createKey.isPending}
                >
                  {createKey.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm Dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this key? This action cannot be undone and any
              applications using this key will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && revokeKey.mutate(revokeId)}
              disabled={revokeKey.isPending}
            >
              {revokeKey.isPending ? 'Revoking...' : 'Revoke Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
