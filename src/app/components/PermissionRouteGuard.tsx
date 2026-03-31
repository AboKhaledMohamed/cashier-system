import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Route Guard component that checks if user has specific permission
 * If not, redirects to dashboard or shows fallback
 */
export function PermissionRouteGuard({ 
  permission, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission as any)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redirect to dashboard if no permission
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

interface RoleRouteGuardProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Route Guard component that checks if user has specific role
 * If not, redirects to dashboard or shows fallback
 */
export function RoleRouteGuard({ 
  roles, 
  children, 
  fallback 
}: RoleRouteGuardProps) {
  const { getRole } = usePermissions();
  const userRole = getRole();

  if (!roles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redirect to dashboard if role not allowed
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
