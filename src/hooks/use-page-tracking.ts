import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getSessionId(): string {
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
}

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem('cookie-consent');
    if (!raw) return false;
    const consent = JSON.parse(raw) as { analytics?: boolean };
    return consent.analytics === true;
  } catch {
    return false;
  }
}

export function usePageTracking(): void {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    if (!hasAnalyticsConsent()) return;

    const sessionId = getSessionId();

    fetch(`${API_URL}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        page: location.pathname,
        referrer: document.referrer || undefined,
      }),
    }).catch(() => {
      // Silently ignore analytics failures
    });
  }, [location.pathname]);
}
