import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { AppShell, AuthGate } from "@/components/AppShell";

// Lazy-load page components for better code splitting
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import WalletPage from "@/pages/WalletPage";
import GigsList from "@/pages/GigsList";
import GigDetail from "@/pages/GigDetail";
import NewGig from "@/pages/NewGig";
import ManageGigs from "@/pages/ManageGigs";
import EditGig from "@/pages/EditGig";
import HirePage from "@/pages/HirePage";
import MessagePage from "@/pages/MessagePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: false,
    },
  },
});

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <AuthGate>
            <AppShell />
          </AuthGate>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/gigs" element={<GigsList />} />
        <Route path="/gigs/new" element={<NewGig />} />
        <Route path="/gigs/manage" element={<ManageGigs />} />
        <Route path="/gigs/:gigId" element={<GigDetail />} />
        <Route path="/gigs/:gigId/edit" element={<EditGig />} />
        <Route path="/gigs/:gigId/hire" element={<HirePage />} />
        <Route path="/messages/:sellerId" element={<MessagePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}