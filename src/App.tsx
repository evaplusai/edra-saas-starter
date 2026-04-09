import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/protected-route';
import { PublicRoute } from '@/components/public-route';
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="api-keys" element={<ApiKeysPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="subscription" element={<SubscriptionPage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="admin/users" element={<AdminUsersPage />} />
                    <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
                    <Route path="admin/activity" element={<AdminActivityPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
