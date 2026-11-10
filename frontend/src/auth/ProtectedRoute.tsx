import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext";
import {
  permissionLevel,
  type Module,
  type PermissionLevel,
} from "../config/types";

type ProtectedRouteProps = {
  module?: Module;
  requiredPermission?: PermissionLevel;
};

export default function ProtectedRoute({
  module,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (module && requiredPermission !== undefined) {
    if (
      module &&
      (user.permissions[module] ?? permissionLevel.none) < requiredPermission!
    ) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
