import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch unread count');
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 30_000,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/notifications?page=1&limit=5`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json() as Promise<{ notifications: Notification[] }>;
    },
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.notifications ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-1 cursor-pointer"
              onClick={() => {
                if (!n.read) markRead.mutate(n.id);
              }}
            >
              <div className="flex w-full items-center gap-2">
                <span className="text-sm font-medium truncate flex-1">{n.title}</span>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {n.message}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NavLink
            to="/dashboard/notifications"
            className="w-full text-center text-sm text-muted-foreground"
          >
            View all
          </NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
