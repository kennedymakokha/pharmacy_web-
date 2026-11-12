import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Check } from "lucide-react";

import AppLayout from "./components/layout/AppLayout";
import PageHeader from "./components/layout/PageHeader";

import "./styles.css";
import "./layout-sidebar.css";

// Authentication
import { logout, selectIsAuthenticated } from "./app/features/auth/authSlice";

import { api } from "./app/services/api";

// Shared permissions
import { PAGE_PERMISSIONS, isAdmin, canAccessPage } from "./app/permissions";

// Pages
import Login from "./pages/Auth/Login";
import Forbidden from "./pages/Auth/Forbidden";
import CategoriesPage from "./pages/Categories/Categories";
import MedicinesPage from "./pages/Medicines/Medicines";
import Dashboard from "./pages/Dashboard/Dashboard";
import SalesPage from "./pages/Sales/Sales";
import PurchasesPage from "./pages/Purchases/Purchases";
import InventoryPage from "./pages/Inventory/Inventory";
import CustomersPage from "./pages/Customers/Customers";
import SuppliersPage from "./pages/Suppliers/Suppliers";
import PrescriptionsPage from "./pages/Prescriptions/Prescriptions";
import ReportsPage from "./pages/Reports/Reports";
import UsersPage from "./pages/Users/Users";
import SettingsPage from "./pages/Settings/Settings";
import RolesPage from "./pages/Roles/Roles";

// --------------------------------------------------
// PAGE ROUTES
// --------------------------------------------------

const pageRoutes = Object.entries(PAGE_PERMISSIONS).map(
  ([permission, page]) => ({
    permission,
    label: page.label,
    path: page.path,
  }),
);

// --------------------------------------------------
// PERMISSION HELPERS
// --------------------------------------------------

function getFirstAccessiblePath(user) {
  const accessiblePage = pageRoutes.find((page) =>
    canAccessPage(user, page.permission),
  );

  return accessiblePage?.path || "/forbidden";
}

// --------------------------------------------------
// APP
// --------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <PharmacyApp />
    </BrowserRouter>
  );
}

function PharmacyApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ------------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------------

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector((state) => state.auth?.user || null);

  const adminUser = isAdmin(currentUser);
  const isLoginPage = location.pathname === "/login";

  // ------------------------------------------------
  // LOCAL STATE
  // ------------------------------------------------

  const [toast, setToast] = useState("");

  // ------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------

  function notify(message) {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2600);
  }

  // ------------------------------------------------
  // LOGOUT
  // ------------------------------------------------

  function handleLogout() {
    localStorage.removeItem("pharmacy_auth");
    sessionStorage.removeItem("pharmacy_auth");

    dispatch(logout());
    dispatch(api.util.resetApiState());

    navigate("/login", { replace: true });
  }

  // ------------------------------------------------
  // PAGE ACCESS
  // ------------------------------------------------

  function protectPage(permission, element) {
    if (!canAccessPage(currentUser, permission)) {
      return <Navigate to={getFirstAccessiblePath(currentUser)} replace />;
    }

    return element;
  }

  // ------------------------------------------------
  // PAGE INFORMATION
  // ------------------------------------------------

  const currentPage =
    pageRoutes.find((page) => page.path === location.pathname)?.label ||
    (location.pathname === "/roles" ? "Roles & Permissions" : "Dashboard");

  // ------------------------------------------------
  // NAVIGATION HELPERS
  // ------------------------------------------------

  function setPage(pageName) {
    const target = pageRoutes.find((page) => page.label === pageName);

    if (!target) return;

    if (!canAccessPage(currentUser, target.permission)) {
      notify("You do not have permission to access this page");
      return;
    }

    navigate(target.path);
  }

  // ------------------------------------------------
  // DASHBOARD QUICK ACTIONS
  // ------------------------------------------------

  function openAdd(type) {
    const destinations = {
      medicine: {
        permission: "medicines",
        path: "/medicines",
      },

      order: {
        permission: "purchases",
        path: "/purchases",
      },

      purchase: {
        permission: "purchases",
        path: "/purchases",
      },

      supplier: {
        permission: "suppliers",
        path: "/suppliers",
      },

      prescription: {
        permission: "prescriptions",
        path: "/prescriptions",
      },
    };

    const destination = destinations[type];

    if (!destination) {
      notify("This action is not available");
      return;
    }

    if (!canAccessPage(currentUser, destination.permission)) {
      notify("You do not have permission to access this page");
      return;
    }

    navigate(destination.path);
  }

  // ------------------------------------------------
  // AUTHENTICATION GUARDS
  // ------------------------------------------------

  if (!isAuthenticated) {
    if (isLoginPage) {
      return <Login />;
    }

    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (isLoginPage) {
    return <Navigate to={getFirstAccessiblePath(currentUser)} replace />;
  }

  if (location.pathname === "/forbidden") {
    return <Forbidden />;
  }

  const hasAnyPageAccess = pageRoutes.some((page) =>
    canAccessPage(currentUser, page.permission),
  );

  if (!hasAnyPageAccess) {
    return <Forbidden />;
  }

  // ------------------------------------------------
  // MAIN APPLICATION LAYOUT
  // ------------------------------------------------

  return (
    <>
      <AppLayout
        currentUser={currentUser}
        onLogout={handleLogout}
        onNotificationsClick={() => {
          if (canAccessPage(currentUser, "inventory")) {
            navigate("/inventory");
          } else {
            notify("You do not have permission to access inventory");
          }
        }}
        onNavigate={() => {}}
      >
        <section className="content">
          <PageHeader
            title={currentPage}
            subtitle={pageSubtitle(currentPage)}
          />

          <Routes>
            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={protectPage(
                "dashboard",
                <Dashboard setPage={setPage} openAdd={openAdd} />,
              )}
            />

            {/* MEDICINES */}
            <Route
              path="/medicines"
              element={protectPage("medicines", <MedicinesPage />)}
            />

            {/* CATEGORIES */}
            <Route
              path="/categories"
              element={protectPage("categories", <CategoriesPage />)}
            />

            {/* SALES */}
            <Route
              path="/sales"
              element={protectPage("sales", <SalesPage />)}
            />

            {/* PURCHASES */}
            <Route
              path="/purchases"
              element={protectPage("purchases", <PurchasesPage />)}
            />

            {/* INVENTORY */}
            <Route
              path="/inventory"
              element={protectPage("inventory", <InventoryPage />)}
            />

            {/* CUSTOMERS */}
            <Route
              path="/customers"
              element={protectPage("customers", <CustomersPage />)}
            />

            {/* SUPPLIERS */}
            <Route
              path="/suppliers"
              element={protectPage("suppliers", <SuppliersPage />)}
            />

            {/* PRESCRIPTIONS */}
            <Route
              path="/prescriptions"
              element={protectPage("prescriptions", <PrescriptionsPage />)}
            />

            {/* ROLES & PERMISSIONS */}
            <Route
              path="/roles"
              element={
                adminUser ? (
                  <RolesPage />
                ) : (
                  <Navigate to={getFirstAccessiblePath(currentUser)} replace />
                )
              }
            />

            {/* REPORTS */}
            {/* REPORTS */}
            <Route
              path="/reports"
              element={protectPage("reports", <ReportsPage />)}
            />

            {/* STAFF & USERS */}
            <Route
              path="/users"
              element={protectPage("users", <UsersPage />)}
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={protectPage(
                "settings",
                <SettingsPage notify={notify} />,
              )}
            />

            {/* DEFAULT ROUTES */}
            <Route
              path="/"
              element={
                <Navigate to={getFirstAccessiblePath(currentUser)} replace />
              }
            />

            <Route
              path="*"
              element={
                <Navigate to={getFirstAccessiblePath(currentUser)} replace />
              }
            />
          </Routes>
        </section>
      </AppLayout>

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </>
  );
}

// --------------------------------------------------
// PAGE SUBTITLES
// --------------------------------------------------

function pageSubtitle(page) {
  return (
    {
      Dashboard: "Welcome back. Here's what's happening at the pharmacy today.",

      Medicines: "Register, search and maintain medicine records.",

      Categories: "Organise medicines into searchable categories.",

      Sales: "Process customer purchases and generate receipts.",

      Purchases: "Create supplier orders and record received stock.",

      Inventory: "Monitor stock quantities, batches and expiry dates.",

      Customers: "Maintain customer details and purchase history.",

      Suppliers: "Manage supplier contact details and relationships.",

      Prescriptions: "Record and verify prescriptions before dispensing.",

      Reports: "Review pharmacy performance and export reports.",

      "Staff & Users": "Manage staff accounts and assign system roles.",

      "Roles & Permissions":
        "Create staff roles and control access to pharmacy system pages.",

      Settings: "Configure pharmacy information and system preferences.",
    }[page] || ""
  );
}

export default App;
