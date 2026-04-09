import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { PublicRoute } from '@/components/public-route';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageTransition } from '@/components/page-transition';
import LandingLayout from '@/pages/landing/layout';
import LandingIndex from '@/pages/landing/index';
import DashboardLayout from '@/pages/dashboard/layout';
import DashboardHome from '@/pages/dashboard/index';
import SettingsPage from '@/pages/dashboard/settings';
import ProfilePage from '@/pages/dashboard/profile';
import ApiKeysPage from '@/pages/dashboard/api-keys';
import AdminPage from '@/pages/dashboard/admin';
import AdminUsersPage from '@/pages/admin/users';
import AdminAnalyticsPage from '@/pages/admin/analytics';
import AdminActivityPage from '@/pages/admin/activity';
import SubscriptionPage from '@/pages/dashboard/subscription';
import LoginPage from '@/pages/auth/login';
import SignupPage from '@/pages/auth/signup';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import ResetPasswordPage from '@/pages/auth/reset-password';
import BlogListingPage from '@/pages/blog/index';
import BlogPostPage from '@/pages/blog/[slug]';
import DocsLayout from '@/pages/docs/layout';
import DocPage from '@/pages/docs/[slug]';
import PrivacyPage from '@/pages/legal/privacy';
import TermsPage from '@/pages/legal/terms';
import NotificationsPage from '@/pages/dashboard/notifications';
import NotFoundPage from '@/pages/not-found';
import { CookieConsent } from '@/components/cookie-consent';
import { PageTrackingProvider } from '@/components/page-tracking-provider';

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<PageTransition><LandingIndex /></PageTransition>} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        </Route>

        {/* Blog */}
        <Route path="/blog" element={<PageTransition><BlogListingPage /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostPage /></PageTransition>} />

        {/* Docs */}
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<PageTransition><DocPage /></PageTransition>} />
          <Route path=":slug" element={<PageTransition><DocPage /></PageTransition>} />
        </Route>

        {/* Legal */}
        <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageTransition><DashboardHome /></PageTransition>} />
            <Route path="profile" element={<PageTransition><ProfilePage /></PageTransition>} />
            <Route path="api-keys" element={<PageTransition><ApiKeysPage /></PageTransition>} />
            <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
            <Route path="subscription" element={<PageTransition><SubscriptionPage /></PageTransition>} />
            <Route path="notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
            <Route path="admin" element={<PageTransition><AdminPage /></PageTransition>} />
            <Route path="admin/users" element={<PageTransition><AdminUsersPage /></PageTransition>} />
            <Route path="admin/analytics" element={<PageTransition><AdminAnalyticsPage /></PageTransition>} />
            <Route path="admin/activity" element={<PageTransition><AdminActivityPage /></PageTransition>} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <AuthProvider>
              <BrowserRouter>
                <PageTrackingProvider />
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
                <CookieConsent />
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
