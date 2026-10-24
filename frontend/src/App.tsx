import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import { navigation } from "./config/navigation";

import MainLayout from "./layouts/MainLayout.tsx";
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
import Loading from "./components/Loading";

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          {navigation.map(({ path, name, component: Page }) => (
            <Route key={name} path={path} element={<Page />} />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
