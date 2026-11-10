
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
  users: {
    label: "Staff & Users",
    path: "/users",
  },
  settings: {
    label: "Settings",
    path: "/settings",
  },
  roles: {
  label: "Roles & Permissions",
  path: "/roles",
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
// DEFAULT ROLE PERMISSIONS
// --------------------------------------------------

const DEFAULT_ROLE_PERMISSIONS = {
  pharmacist: [
    "dashboard",
    "medicines",
    "categories",
    "sales",
    "inventory",
    "customers",
    "prescriptions",
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
  const directPermissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  const rolePermissions = Array.isArray(user?.role?.permissions)
    ? user.role.permissions
    : [];

  // Explicit permissions take priority.
  if (directPermissions.length || rolePermissions.length) {
    return [...new Set([...directPermissions, ...rolePermissions])];
  }

  // Fall back to default role permissions.
  return DEFAULT_ROLE_PERMISSIONS[getUserRole(user)] || [];
}

// --------------------------------------------------
// CHECK PAGE ACCESS
// --------------------------------------------------

export function canAccessPage(user, permission) {
  if (!user) return false;

  if (isAdmin(user)) return true;

  // Only administrators can manage role permissions.
  if (permission === "roles") return false;

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
