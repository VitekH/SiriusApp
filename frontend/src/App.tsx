import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import { navigation } from "./config/navigation.ts";
import { routes } from "./config/routes.ts";

import MainLayout from "./layouts/MainLayout.tsx";
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
import Loading from "./components/Loading";
import ProtectedRoute from "./auth/ProtectedRoute.tsx";

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            {navigation.map(
              ({ path, name, module, requiredPermission, component: Page }) => (
                <Route
                  key={name}
                  element={
                    <ProtectedRoute
                      module={module}
                      requiredPermission={requiredPermission}
                    />
                  }
                >
                  <Route key={name} path={path} element={<Page />} />
                </Route>
              ),
            )}
            {routes.map(
              ({ path, name, module, requiredPermission, component: Page }) => (
                <Route
                  key={name}
                  element={
                    <ProtectedRoute
                      module={module}
                      requiredPermission={requiredPermission}
                    />
                  }
                >
                  <Route key={name} path={path} element={<Page />} />
                </Route>
              ),
            )}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
