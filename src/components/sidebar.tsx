import { NavLink, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { navConfig } from '@/lib/nav-config';
import { useAuth } from '@/hooks/use-auth';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const visibleItems = navConfig.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return user?.role ? item.roles.includes(user.role) : false;
  });

  return (
    <aside className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Edra</span>
        </NavLink>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {visibleItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
