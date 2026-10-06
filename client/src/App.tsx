import { Navigate, Route, Routes } from "react-router-dom";
import {
  AdminRoute,
  AppShell,
  GuestRoute,
  ProtectedRoute,
} from "./components/layout";
import { UsersAdminPage } from "./pages/admin/users/UsersAdminPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { ItemsPage } from "./pages/items/ItemsPage";
import { LoginPage } from "./pages/login/LoginPage";

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
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/items" element={<ItemsPage />} />

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
