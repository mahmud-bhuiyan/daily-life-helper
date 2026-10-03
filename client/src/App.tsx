import { Navigate, Route, Routes } from "react-router-dom";
import {
  AdminRoute,
  AppShell,
  GuestRoute,
  PageHeader,
  ProtectedRoute,
} from "./components/layout";
import { Card } from "./components/ui";
import { UsersAdminPage } from "./pages/admin/users/UsersAdminPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LoginPage } from "./pages/login/LoginPage";

const PlaceholderPage = ({ title, step }: { title: string; step: string }) => (
  <>
    <PageHeader title={title} description={`This module ships in ${step}.`} />
    <Card variant="highlight">
      <p className="text-sm leading-relaxed text-(--muted)">
        The layout, navigation, and auth shell are ready. Feature screens will
        plug in here next.
      </p>
    </Card>
  </>
);

/**
 * Route table — keep routes only here, no providers.
 */
const App = () => (
  <div className="flex flex-1 flex-col">
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/expenses"
            element={<PlaceholderPage title="Expenses" step="Step 03" />}
          />
          <Route
            path="/items"
            element={<PlaceholderPage title="Items" step="Step 05" />}
          />

          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<UsersAdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </div>
);

export default App;
