
import React, { useState } from "react";

import Sidebar from "./ Sidebar";
import Topbar from "./ Topbar";

export default function  AppLayout({
  currentUser,
  onLogout,
  onNotificationsClick,
  onNavigate,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div
      className={`app-shell ${
        collapsed ? "sidebar-is-collapsed" : ""
      }`}
    >
      <Sidebar
        currentUser={currentUser}
        collapsed={collapsed}
        onToggleCollapse={() =>
          setCollapsed((value) => !value)
        }
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        onNavigate={() => {
          closeMobile();
          onNavigate?.();
        }}
      />

      <main className="main">
        <Topbar
          currentUser={currentUser}
          onMenuClick={() =>
            setMobileOpen(true)
          }
          onNotificationsClick={onNotificationsClick}
        />

        {children}
      </main>
    </div>
  );
}
