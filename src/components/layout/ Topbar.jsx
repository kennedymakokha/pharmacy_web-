import React from "react";
import { Bell, ChevronDown, Menu, UserRound } from "lucide-react";

export default function Topbar({ currentUser, onMenuClick, onNotificationsClick }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn mobile-menu"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu />
      </button>

      <div className="top-spacer" />

      <button
        type="button"
        className="icon-btn notification"
        onClick={onNotificationsClick}
        aria-label="View inventory notifications"
      >
        <Bell size={19} />
        <i>3</i>
      </button>

      <div className="profile">
        <div className="avatar">
          <UserRound size={20} />
        </div>

        <div>
          <b>{currentUser?.name || "Pharmacy User"}</b>
          <small>{currentUser?.role || "Staff"}</small>
        </div>

        <ChevronDown size={15} />
      </div>
    </header>
  );
}