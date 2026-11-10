
import React from "react";
import { NavLink } from "react-router-dom";

import {
  HeartPulse,
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Truck,
  Boxes,
  Users,
  Building2,
  ClipboardList,
  FileBarChart,
  UserRound,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ShieldCheck,
} from "lucide-react";

import {
  PAGE_PERMISSIONS,
  canAccessPage,
} from "../../app/permissions";

// --------------------------------------------------
// SIDEBAR ICONS
// --------------------------------------------------

const icons = {
  dashboard: LayoutDashboard,
  medicines: Pill,
  categories: HeartPulse,
  sales: ShoppingCart,
  purchases: Truck,
  inventory: Boxes,
  customers: Users,
  suppliers: Building2,
  prescriptions: ClipboardList,
  reports: FileBarChart,
  users: UserRound,
  roles: ShieldCheck,
  settings: HeartPulse,
  
};

// --------------------------------------------------
// SIDEBAR
// --------------------------------------------------

export default function Sidebar({
  currentUser,
  collapsed,
  onToggleCollapse,
  onLogout,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) {
  // Only display pages the current user can access.
  const visibleNav = Object.entries(PAGE_PERMISSIONS).filter(
    ([permission]) => canAccessPage(currentUser, permission)
  );

  return (
    <>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "show" : ""
        }`}
      >
        {/* BRAND */}
        <div className="brand">
          <span className="brand-mark">
            <HeartPulse size={25} />
          </span>

          {!collapsed && (
            <div className="brand-copy">
              <b>Pharmacy</b>
              <small>Management System</small>
            </div>
          )}

          {/* DESKTOP COLLAPSE */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {visibleNav.map(([permission, page]) => {
            const Icon = icons[permission] || ShieldCheck;

            return (
              <NavLink
                key={permission}
                to={page.path}
                end
                title={collapsed ? page.label : undefined}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={onNavigate}
              >
                <Icon size={18} />

                {!collapsed && (
                  <span>{page.label}</span>
                )}
              </NavLink>
            );
          })}

          {/* NO PERMISSIONS */}
          {visibleNav.length === 0 && (
            <div className="sidebar-empty">
              <ShieldCheck size={22} />
              {!collapsed && (
                <span>No accessible pages</span>
              )}
            </div>
          )}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          {!collapsed && (
            <>
              <div className="health-note">
                Better Health,
                <br />
                A Healthier Community
              </div>

              <div className="sidebar-heart">
                <HeartPulse size={32} />
              </div>
            </>
          )}

          {/* LOGOUT */}
          <button
            type="button"
            className="logout"
            onClick={onLogout}
            title="Log out"
          >
            <LogOut size={17} />

            {!collapsed && (
              <span>Log out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
