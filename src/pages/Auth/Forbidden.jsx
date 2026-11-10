
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldX,
  LockKeyhole,
  LogOut,
  HeartPulse,
  ShieldCheck,
  UserRound,
  Headset,
} from "lucide-react";

import { logout } from "../../app/features/auth/authSlice";
import { api } from "../../app/services/api";

const Forbidden = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);

  const userName =
    user?.name ||
    user?.username ||
    user?.phone_number ||
    "Authenticated User";

  const userRole = String(user?.role || "Unknown")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const handleLogout = () => {
    localStorage.removeItem("pharmacy_auth");
    sessionStorage.removeItem("pharmacy_auth");

    dispatch(logout());
    dispatch(api.util.resetApiState());

    navigate("/login", { replace: true });
  };

  return (
    <main className="forbidden-page">
      <div className="forbidden-background forbidden-background-one" />
      <div className="forbidden-background forbidden-background-two" />

      <div className="forbidden-container">
        {/* Brand */}
        <header className="forbidden-brand">
          <div className="forbidden-brand-icon">
            <HeartPulse size={25} />
          </div>

          <div>
            <h2>PharmaCare</h2>
            <span>Pharmacy Management System</span>
          </div>
        </header>

        {/* Main content */}
        <section className="forbidden-content">
          <div className="forbidden-status">
            <span className="forbidden-status-dot" />
            ACCESS RESTRICTED
          </div>

          <div className="forbidden-icon-wrapper">
            <div className="forbidden-icon-circle">
              <ShieldX size={55} strokeWidth={1.5} />
            </div>

            <div className="forbidden-lock">
              <LockKeyhole size={20} />
            </div>
          </div>

          <div className="forbidden-error-code">403</div>

          <h1>Access Denied</h1>

          <p className="forbidden-description">
            Sorry, you don't have permission to access this section
            of the pharmacy management system.
          </p>

          {/* Account information */}
          <div className="forbidden-account">
            <div className="forbidden-account-icon">
              <UserRound size={22} />
            </div>

            <div className="forbidden-account-details">
              <span>Currently signed in as</span>
              <strong>{userName}</strong>
            </div>

            <div className="forbidden-role">
              {userRole}
            </div>
          </div>

          {/* Permission information */}
          <div className="forbidden-permissions">
            <div className="forbidden-permissions-heading">
              <ShieldCheck size={18} />
              <span>Authorized roles</span>
            </div>

            <div className="forbidden-role-list">
              <span>Administrator</span>
              <span>Pharmacist</span>
            </div>
          </div>

          <div className="forbidden-help">
            <Headset size={18} />
            <p>
              If you believe this is a mistake, please contact your
              system administrator to request access.
            </p>
          </div>

          <button
            type="button"
            className="forbidden-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout from system
          </button>
        </section>

        <footer className="forbidden-footer">
          <span>
            <LockKeyhole size={13} />
            Protected Pharmacy Management System
          </span>
          <span>© {new Date().getFullYear()} PharmaCare</span>
        </footer>
      </div>
    </main>
  );
};

export default Forbidden;
