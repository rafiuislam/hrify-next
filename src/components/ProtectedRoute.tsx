import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

export function ProtectedRoute({ children, requireActive = true }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If requireActive is true and user status is pending, redirect to pending page
  if (requireActive && user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // If user status is rejected, redirect to rejected page
  if (user?.status === 'rejected') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}