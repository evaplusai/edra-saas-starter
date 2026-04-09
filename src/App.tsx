import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { PublicRoute } from '@/components/public-route';
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
import { CookieConsent } from '@/components/cookie-consent';
import { PageTrackingProvider } from '@/components/page-tracking-provider';

const queryClient = new QueryClient();

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
                <Routes>
                  <Route path="/" element={<LandingLayout />}>
                    <Route index element={<LandingIndex />} />
                  </Route>

                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                  </Route>

                  {/* Blog */}
                  <Route path="/blog" element={<BlogListingPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />

                  {/* Docs */}
                  <Route path="/docs" element={<DocsLayout />}>
                    <Route index element={<DocPage />} />
                    <Route path=":slug" element={<DocPage />} />
                  </Route>

                  {/* Legal */}
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="api-keys" element={<ApiKeysPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="admin/users" element={<AdminUsersPage />} />
                      <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
                      <Route path="admin/activity" element={<AdminActivityPage />} />
                    </Route>
                  </Route>
                </Routes>
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
