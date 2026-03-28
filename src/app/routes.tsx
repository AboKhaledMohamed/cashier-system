import { createHashRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
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
      { path: "inventory", element: <InventoryPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "returns", element: <ReturnsPage /> },

      { path: "expenses", element: <ExpensesPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
