
export const PAGE_PERMISSIONS = {
  dashboard: {
    label: "Dashboard",
    path: "/dashboard",
  },
  medicines: {
    label: "Medicines",
    path: "/medicines",
  },
  categories: {
    label: "Categories",
    path: "/categories",
  },
  sales: {
    label: "Sales",
    path: "/sales",
  },
  purchases: {
    label: "Purchases",
    path: "/purchases",
  },
  inventory: {
    label: "Inventory",
    path: "/inventory",
  },
  customers: {
    label: "Customers",
    path: "/customers",
  },
  suppliers: {
    label: "Suppliers",
    path: "/suppliers",
  },
  prescriptions: {
    label: "Prescriptions",
    path: "/prescriptions",
  },
  reports: {
    label: "Reports",
    path: "/reports",
  },
  roles: {
    label: "Roles & Permissions",
    path: "/roles",
  },
  users: {
    label: "Staff & Users",
    path: "/users",
  },
  settings: {
    label: "Settings",
    path: "/settings",
  },
};

// --------------------------------------------------
// ROLE HELPERS
// --------------------------------------------------

export function getUserRole(user) {
  const role =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.name || user?.role?.slug || "";

  return String(role).trim().toLowerCase();
}

export function isAdmin(user) {
  return ["admin", "administrator"].includes(getUserRole(user));
}

// --------------------------------------------------
// ADMIN-ONLY PAGES
// --------------------------------------------------

const ADMIN_ONLY_PAGES = ["users", "roles"];

// --------------------------------------------------
// DEFAULT ROLE PERMISSIONS
// --------------------------------------------------

const DEFAULT_ROLE_PERMISSIONS = {
  pharmacist: [
    "dashboard",
    "medicines",
    "sales",
    "customers",
    "reports",
  ],

  receptionist: [
    "dashboard",
    "customers",
    "prescriptions",
    "sales",
  ],

  storekeeper: [
    "dashboard",
    "medicines",
    "inventory",
    "purchases",
    "suppliers",
  ],

  cashier: [
    "dashboard",
    "sales",
    "customers",
  ],

  accountant: [
    "dashboard",
    "sales",
    "purchases",
    "reports",
  ],
};

// --------------------------------------------------
// GET USER PERMISSIONS
// --------------------------------------------------

export function getUserPermissions(user) {
  if (!user) return [];

  const directPermissions = Array.isArray(user.permissions)
    ? user.permissions
    : [];

  const rolePermissions = Array.isArray(user.role?.permissions)
    ? user.role.permissions
    : [];

  if (directPermissions.length || rolePermissions.length) {
    return [...new Set([...directPermissions, ...rolePermissions])];
  }

  return DEFAULT_ROLE_PERMISSIONS[getUserRole(user)] || [];
}

// --------------------------------------------------
// CHECK PAGE ACCESS
// --------------------------------------------------

export function canAccessPage(user, permission) {
  if (!user) return false;

  if (isAdmin(user)) return true;

  // Staff and role management are administrator-only.
  if (ADMIN_ONLY_PAGES.includes(permission)) {
    return false;
  }

  const permissions = getUserPermissions(user);

  return (
    permissions.includes("*") ||
    permissions.includes(permission) ||
    permissions.includes(`${permission}.view`)
  );
}

// --------------------------------------------------
// FIRST ACCESSIBLE PAGE
// --------------------------------------------------

export function getFirstAccessiblePath(user) {
  const page = Object.entries(PAGE_PERMISSIONS).find(
    ([permission]) => canAccessPage(user, permission)
  );

  return page?.[1].path || "/forbidden";
}
