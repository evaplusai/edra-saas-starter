import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Preferences {
  email_marketing: boolean;
  email_product: boolean;
  in_app: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ preferences: Preferences }>({
    queryKey: ['user-preferences'],
    queryFn: () => apiFetch('/users/me/preferences'),
  });

  const updatePreferences = useMutation({
    mutationFn: (prefs: Partial<Preferences>) =>
      apiFetch('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(prefs),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast.success('Preferences updated');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const prefs = data?.preferences ?? {
    email_marketing: false,
    email_product: true,
    in_app: true,
  };

  function handleToggle(key: keyof Preferences, value: boolean) {
    updatePreferences.mutate({ [key]: value });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading preferences...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and promotions.
                  </p>
                </div>
                <Switch
                  checked={prefs.email_marketing}
                  onCheckedChange={(val: boolean) => handleToggle('email_marketing', val)}
                  disabled={updatePreferences.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your account and billing.
                  </p>
                </div>
                <Switch
                  checked={prefs.email_product}
                  onCheckedChange={(val: boolean) => handleToggle('email_product', val)}
                  disabled={updatePreferences.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notification badges and alerts in the dashboard.
                  </p>
                </div>
                <Switch
                  checked={prefs.in_app}
                  onCheckedChange={(val: boolean) => handleToggle('in_app', val)}
                  disabled={updatePreferences.isPending}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
