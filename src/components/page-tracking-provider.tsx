import { usePageTracking } from '@/hooks/use-page-tracking';

export function PageTrackingProvider() {
  usePageTracking();
  return null;
}
