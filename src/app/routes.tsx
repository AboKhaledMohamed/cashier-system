import { createHashRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import { PermissionRouteGuard } from "./components/PermissionRouteGuard";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import PurchasesPage from "./pages/PurchasesPage";
import ReturnsPage from "./pages/ReturnsPage";

import ExpensesPage from "./pages/ExpensesPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";

// Use HashRouter for Electron compatibility (file:// protocol)
export const router = createHashRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "pos", element: <POSPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { 
        path: "inventory", 
        element: (
          <PermissionRouteGuard permission="can_manage_inventory">
            <InventoryPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "customers", 
        element: (
          <PermissionRouteGuard permission="can_add_customers">
            <CustomersPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "suppliers", 
        element: (
          <PermissionRouteGuard permission="can_add_suppliers">
            <SuppliersPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "reports", 
        element: (
          <PermissionRouteGuard permission="can_view_reports">
            <ReportsPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "purchases", 
        element: (
          <PermissionRouteGuard permission="can_manage_inventory">
            <PurchasesPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "returns", 
        element: (
          <PermissionRouteGuard permission="can_process_returns">
            <ReturnsPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "expenses", 
        element: (
          <PermissionRouteGuard permission="can_record_expenses">
            <ExpensesPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "users", 
        element: (
          <PermissionRouteGuard permission="can_manage_users">
            <UsersPage />
          </PermissionRouteGuard>
        ) 
      },
      { 
        path: "settings", 
        element: (
          <PermissionRouteGuard permission="can_manage_settings">
            <SettingsPage />
          </PermissionRouteGuard>
        ) 
      },
    ],
  },
]);
