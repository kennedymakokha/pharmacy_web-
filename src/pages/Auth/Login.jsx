
import React, { useState } from "react";
import {
  LockKeyhole,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Pill,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { useLoginMutation } from "../../app/services/authApi";
import { setCredentials } from "../../app/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({
        phone_number: phone_number.trim(),
        password,
      }).unwrap();

      if (!response?.token) {
        throw new Error("Login response did not contain an authentication token.");
      }

      const credentials = {
        token: response.token,
        user: response.user,
        exp: response.exp,
      };

      // Clear previous sessions.
      localStorage.removeItem("pharmacy_auth");
      sessionStorage.removeItem("pharmacy_auth");

      // Persist session according to Remember me.
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem(
        "pharmacy_auth",
        JSON.stringify(credentials),
      );

      // Update Redux authentication state.
      dispatch(setCredentials(credentials));

      // Navigate to dashboard.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        typeof err?.data === "string"
          ? err.data
          : err?.data?.message ||
            err?.message ||
            "Unable to login. Please check your credentials.";

      setError(message);
    }
  };

  return (
    <div className="login-page">
      {/* Branding section */}
      <div className="login-brand-section">
        <div className="login-brand-content">
          <div className="login-brand">
            <div className="login-logo">
              <Pill size={27} />
            </div>

            <span>PharmaCare</span>
          </div>

          <div className="login-brand-message">
            <span className="login-eyebrow">
              PHARMACY MANAGEMENT SYSTEM
            </span>

            <h1>
              Smarter pharmacy
              <br />
              management starts here.
            </h1>

            <p>
              Manage medicines, track inventory, process sales and keep your
              pharmacy running efficiently from one central platform.
            </p>

            <div className="login-feature-list">
              <div>
                <span>
                  <Activity size={18} />
                </span>

                <p>
                  <strong>Real-time inventory</strong>
                  <small>
                    Stay updated on your stock levels.
                  </small>
                </p>
              </div>

              <div>
                <span>
                  <ShieldCheck size={18} />
                </span>

                <p>
                  <strong>Secure management</strong>
                  <small>
                    Your pharmacy data stays protected.
                  </small>
                </p>
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            © {new Date().getFullYear()} PharmaCare. All rights reserved.
          </div>
        </div>
      </div>

      {/* Login section */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <div className="login-logo">
              <Pill size={25} />
            </div>

            <span>PharmaCare</span>
          </div>

          <div className="login-form-heading">
            <span className="login-welcome">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to access your pharmacy dashboard.
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            {/* Phone number */}
            <div className="login-field">
              <label htmlFor="login-phone">
                Phone number
              </label>

              <div className="login-input-wrapper">
                <Phone size={18} />

                <input
                  id="login-phone"
                  type="tel"
                  name="phone_number"
                  value={phone_number}
                  placeholder="Enter phone number"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Login options */}
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="login-forgot"
                onClick={() =>
                  setError(
                    "Please contact your administrator to reset your password.",
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
            >
              <span>
                {isLoading ? "Signing in..." : "Sign in"}
              </span>

              {!isLoading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-security-note">
            <ShieldCheck size={16} />

            <span>
              Secure access to your pharmacy management system
            </span>
          </div>

          <div className="login-copyright">
            Powered by PharmaCare
          </div>
        </div>
      </div>
    </div>
  );
}
