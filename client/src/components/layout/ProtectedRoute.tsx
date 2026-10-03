import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';

const AuthLoading = () => (
  <div className="login-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin-slow rounded-full border-2 border-(--border) border-t-(--accent)" />
      <p className="text-sm text-(--muted)">Loading…</p>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, isPending } = useAuth();
  const location = useLocation();

  if (isPending) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isSuperAdmin, isPending } = useAuth();

  if (isPending) return <AuthLoading />;

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) return <AuthLoading />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
