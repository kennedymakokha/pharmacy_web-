
import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Lock,
  Save,
  CheckSquare,
  Square,
  KeyRound,
  UserRound,
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Package,
  FileBarChart,
  Settings,
} from "lucide-react";

import "./roles.css";

// --------------------------------------------------
// AVAILABLE PERMISSIONS
// Keep these keys consistent with app/permissions.js
// --------------------------------------------------

const permissionGroups = [
  {
    title: "General",
    description: "Access to the pharmacy overview.",
    permissions: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Medicine Management",
    description: "Manage medicines and their categories.",
    permissions: [
      { key: "medicines", label: "Medicines", icon: Pill },
      { key: "categories", label: "Categories", icon: Package },
    ],
  },
  {
    title: "Sales & Customers",
    description: "Manage sales transactions and customers.",
    permissions: [
      { key: "sales", label: "Sales", icon: ShoppingCart },
      { key: "customers", label: "Customers", icon: Users },
      { key: "prescriptions", label: "Prescriptions", icon: FileBarChart },
    ],
  },
  {
    title: "Stock & Suppliers",
    description: "Manage stock, purchases and suppliers.",
    permissions: [
      { key: "inventory", label: "Inventory", icon: Package },
      { key: "purchases", label: "Purchases", icon: ShoppingCart },
      { key: "suppliers", label: "Suppliers", icon: Users },
    ],
  },
  {
    title: "Administration",
    description: "Access reports and system administration.",
    permissions: [
      { key: "reports", label: "Reports", icon: FileBarChart },
      { key: "users", label: "Staff & Users", icon: UserRound },
      { key: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const ALL_PERMISSIONS = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

// --------------------------------------------------
// DEFAULT ROLES
// These are starter values for the screen.
// They will later be loaded from and saved to the API.
// --------------------------------------------------

const initialRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to every section of the pharmacy system.",
    permissions: [...ALL_PERMISSIONS],
    isSystem: true,
    isAdmin: true,
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    description: "Manages medicines, prescriptions and dispensing.",
    permissions: [
      "dashboard",
      "medicines",
      "categories",
      "sales",
      "inventory",
      "customers",
      "prescriptions",
      "reports",
    ],
    isSystem: true,
  },
  {
    id: "receptionist",
    name: "Receptionist",
    description: "Handles customer records and prescription reception.",
    permissions: [
      "dashboard",
      "customers",
      "prescriptions",
      "sales",
    ],
    isSystem: true,
  },
  {
    id: "storekeeper",
    name: "Storekeeper",
    description: "Manages medicine stock, purchases and suppliers.",
    permissions: [
      "dashboard",
      "medicines",
      "inventory",
      "purchases",
      "suppliers",
    ],
    isSystem: true,
  },
  {
    id: "cashier",
    name: "Cashier",
    description: "Processes sales and maintains customer records.",
    permissions: [
      "dashboard",
      "sales",
      "customers",
    ],
    isSystem: true,
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Reviews financial activity and pharmacy reports.",
    permissions: [
      "dashboard",
      "sales",
      "purchases",
      "reports",
    ],
    isSystem: true,
  },
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function createRoleId(name) {
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

function formatRoleName(name) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// --------------------------------------------------
// ROLES PAGE
// --------------------------------------------------

export default function RolesPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState("pharmacist");

  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState([]);

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const [toast, setToast] = useState("");

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId),
    [roles, selectedRoleId]
  );

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) =>
        role.name.toLowerCase().includes(search.toLowerCase())
      ),
    [roles, search]
  );

  useEffect(() => {
    if (!selectedRole) return;

    setRoleName(selectedRole.name);
    setRoleDescription(selectedRole.description || "");
    setPermissions([...selectedRole.permissions]);
  }, [selectedRole]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  // ------------------------------------------------
  // PERMISSION TOGGLE
  // ------------------------------------------------

  function togglePermission(permission) {
    if (selectedRole?.isAdmin) return;

    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  function toggleGroup(group) {
    if (selectedRole?.isAdmin) return;

    const groupPermissions = group.permissions.map(
      (permission) => permission.key
    );

    const allSelected = groupPermissions.every((permission) =>
      permissions.includes(permission)
    );

    setPermissions((current) =>
      allSelected
        ? current.filter(
            (permission) => !groupPermissions.includes(permission)
          )
        : [
            ...new Set([
              ...current,
              ...groupPermissions,
            ]),
          ]
    );
  }

  function selectAllPermissions() {
    if (selectedRole?.isAdmin) return;

    setPermissions([...ALL_PERMISSIONS]);
  }

  function clearAllPermissions() {
    if (selectedRole?.isAdmin) return;

    setPermissions([]);
  }

  // ------------------------------------------------
  // SAVE ROLE
  // ------------------------------------------------

  function saveRole() {
    if (!selectedRole) return;

    if (!roleName.trim()) {
      notify("Role name is required");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.id !== selectedRole.id &&
        role.name.trim().toLowerCase() ===
          roleName.trim().toLowerCase()
    );

    if (duplicate) {
      notify("A role with this name already exists");
      return;
    }

    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              name: roleName.trim(),
              description: roleDescription.trim(),
              permissions: role.isAdmin
                ? [...ALL_PERMISSIONS]
                : [...permissions],
            }
          : role
      )
    );

    notify("Role permissions updated");
  }

  // ------------------------------------------------
  // CREATE ROLE
  // ------------------------------------------------

  function createRole(e) {
    e.preventDefault();

    const name = formatRoleName(newRoleName);

    if (!name) {
      notify("Enter a role name");
      return;
    }

    const exists = roles.some(
      (role) =>
        role.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      notify("This role already exists");
      return;
    }

    const newRole = {
      id: createRoleId(name),
      name,
      description: newRoleDescription.trim(),
      permissions: [],
      isSystem: false,
      isAdmin: false,
    };

    setRoles((current) => [...current, newRole]);
    setSelectedRoleId(newRole.id);

    setNewRoleName("");
    setNewRoleDescription("");
    setShowCreateModal(false);

    notify("Role created. Configure its permissions.");
  }

  // ------------------------------------------------
  // DELETE ROLE
  // ------------------------------------------------

  function deleteRole(role) {
    if (role.isSystem) {
      notify("System roles cannot be deleted");
      return;
    }

    const confirmed = window.confirm(
      `Delete the "${role.name}" role?`
    );

    if (!confirmed) return;

    const remainingRoles = roles.filter(
      (item) => item.id !== role.id
    );

    setRoles(remainingRoles);
    setSelectedRoleId("pharmacist");

    notify("Role deleted");
  }

  // ------------------------------------------------
  // GROUP PERMISSION STATUS
  // ------------------------------------------------

  function groupIsSelected(group) {
    return group.permissions.every((permission) =>
      permissions.includes(permission.key)
    );
  }

  if (!selectedRole) return null;

  return (
    <div className="roles-page">
      {/* PAGE INTRO */}
      <div className="roles-intro">
        <div>
          <div className="roles-eyebrow">
            <ShieldCheck size={16} />
            ACCESS CONTROL
          </div>

          <h2>Roles & Permissions</h2>

          <p>
            Define what each staff role can access within your
            pharmacy management system.
          </p>
        </div>

        <button
          type="button"
          className="roles-primary-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create role
        </button>
      </div>

      {/* SUMMARY */}
      <div className="roles-stats">
        <div className="roles-stat-card">
          <div className="roles-stat-icon blue">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Total roles</span>
            <strong>{roles.length}</strong>
          </div>
        </div>

        <div className="roles-stat-card">
          <div className="roles-stat-icon green">
            <KeyRound size={20} />
          </div>

          <div>
            <span>Available permissions</span>
            <strong>{ALL_PERMISSIONS.length}</strong>
          </div>
        </div>

        <div className="roles-stat-card">
          <div className="roles-stat-icon orange">
            <Users size={20} />
          </div>

          <div>
            <span>Custom roles</span>
            <strong>
              {roles.filter((role) => !role.isSystem).length}
            </strong>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="roles-workspace">
        {/* ROLE LIST */}
        <aside className="roles-list-panel">
          <div className="roles-list-heading">
            <div>
              <h3>System roles</h3>
              <span>{roles.length} available roles</span>
            </div>
          </div>

          <div className="roles-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="roles-list">
            {filteredRoles.map((role) => {
              const active = selectedRoleId === role.id;

              return (
                <button
                  type="button"
                  key={role.id}
                  className={`role-list-item ${
                    active ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <div className="role-avatar">
                    {role.isAdmin ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <UserRound size={20} />
                    )}
                  </div>

                  <div className="role-list-info">
                    <strong>{role.name}</strong>

                    <span>
                      {role.isAdmin
                        ? "Full system access"
                        : `${role.permissions.length} permissions`}
                    </span>
                  </div>

                  {active && (
                    <span className="role-selected-indicator">
                      <Check size={15} />
                    </span>
                  )}
                </button>
              );
            })}

            {filteredRoles.length === 0 && (
              <div className="roles-empty">
                No roles found.
              </div>
            )}
          </div>
        </aside>

        {/* PERMISSION EDITOR */}
        <section className="roles-editor">
          <div className="roles-editor-header">
            <div className="roles-editor-title">
              <div className="role-avatar large">
                {selectedRole.isAdmin ? (
                  <ShieldCheck size={23} />
                ) : (
                  <UserRound size={23} />
                )}
              </div>

              <div>
                <div className="roles-title-line">
                  <h3>{selectedRole.name}</h3>

                  {selectedRole.isSystem && (
                    <span className="role-system-badge">
                      System role
                    </span>
                  )}
                </div>

                <p>
                  {selectedRole.description ||
                    "Configure permissions for this role."}
                </p>
              </div>
            </div>

            {!selectedRole.isSystem && (
              <button
                type="button"
                className="roles-delete-btn"
                onClick={() => deleteRole(selectedRole)}
                title="Delete role"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>

          {/* ROLE DETAILS */}
          <div className="roles-details">
            <label className="roles-field">
              <span>Role name</span>

              <input
                type="text"
                value={roleName}
                disabled={selectedRole.isAdmin}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
              />
            </label>

            <label className="roles-field">
              <span>Description</span>

              <input
                type="text"
                value={roleDescription}
                disabled={selectedRole.isAdmin}
                onChange={(e) =>
                  setRoleDescription(e.target.value)
                }
                placeholder="Describe this role"
              />
            </label>
          </div>

          {/* ADMIN NOTICE */}
          {selectedRole.isAdmin && (
            <div className="roles-admin-notice">
              <Lock size={18} />

              <div>
                <strong>Administrator has full access</strong>

                <p>
                  Administrators automatically have access to
                  every page. These permissions cannot be restricted.
                </p>
              </div>
            </div>
          )}

          {/* PERMISSION TOOLBAR */}
          <div className="permissions-heading">
            <div>
              <h3>Page permissions</h3>

              <p>
                Select the sections this role is allowed to access.
              </p>
            </div>

            <span className="permission-count">
              {selectedRole.isAdmin
                ? ALL_PERMISSIONS.length
                : permissions.length}
              {" / "}
              {ALL_PERMISSIONS.length} selected
            </span>
          </div>

          {!selectedRole.isAdmin && (
            <div className="permissions-toolbar">
              <button
                type="button"
                onClick={selectAllPermissions}
              >
                <CheckSquare size={16} />
                Select all
              </button>

              <button
                type="button"
                onClick={clearAllPermissions}
              >
                <Square size={16} />
                Clear all
              </button>
            </div>
          )}

          {/* PERMISSION GROUPS */}
          <div className="permission-groups">
            {permissionGroups.map((group) => {
              const allSelected =
                selectedRole.isAdmin || groupIsSelected(group);

              return (
                <div
                  className="permission-group"
                  key={group.title}
                >
                  <div className="permission-group-heading">
                    <div>
                      <h4>{group.title}</h4>
                      <p>{group.description}</p>
                    </div>

                    {!selectedRole.isAdmin && (
                      <button
                        type="button"
                        className={`permission-select-group ${
                          allSelected ? "active" : ""
                        }`}
                        onClick={() => toggleGroup(group)}
                      >
                        {allSelected
                          ? "Clear group"
                          : "Select group"}
                      </button>
                    )}
                  </div>

                  <div className="permission-options">
                    {group.permissions.map((permission) => {
                      const Icon = permission.icon;

                      const checked =
                        selectedRole.isAdmin ||
                        permissions.includes(permission.key);

                      return (
                        <label
                          key={permission.key}
                          className={`permission-option ${
                            checked ? "checked" : ""
                          } ${
                            selectedRole.isAdmin ? "locked" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={selectedRole.isAdmin}
                            onChange={() =>
                              togglePermission(permission.key)
                            }
                          />

                          <span className="permission-checkbox">
                            {checked && <Check size={13} />}
                          </span>

                          <span className="permission-option-icon">
                            <Icon size={17} />
                          </span>

                          <span className="permission-option-label">
                            {permission.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* EDITOR FOOTER */}
          <div className="roles-editor-footer">
            <div className="roles-footer-info">
              <ShieldCheck size={17} />

              <span>
                Changes affect users assigned to this role once
                saved to the system.
              </span>
            </div>

            <button
              type="button"
              className="roles-primary-btn"
              onClick={saveRole}
              disabled={selectedRole.isAdmin}
            >
              <Save size={17} />
              Save changes
            </button>
          </div>
        </section>
      </div>

      {/* CREATE ROLE MODAL */}
      {showCreateModal && (
        <div
          className="roles-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="roles-modal">
            <div className="roles-modal-header">
              <div>
                <h3>Create new role</h3>
                <p>
                  Add a role, then configure its page permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createRole}>
              <label className="roles-field">
                <span>Role name</span>

                <input
                  autoFocus
                  required
                  value={newRoleName}
                  onChange={(e) =>
                    setNewRoleName(e.target.value)
                  }
                  placeholder="e.g. Branch Manager"
                />
              </label>

              <label className="roles-field">
                <span>Description</span>

                <textarea
                  rows={3}
                  value={newRoleDescription}
                  onChange={(e) =>
                    setNewRoleDescription(e.target.value)
                  }
                  placeholder="What will this role be responsible for?"
                />
              </label>

              <div className="roles-modal-actions">
                <button
                  type="button"
                  className="roles-cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="roles-primary-btn"
                >
                  <Plus size={17} />
                  Create role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="roles-toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
