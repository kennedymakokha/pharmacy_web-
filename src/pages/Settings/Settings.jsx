import React from "react";
import {
  Building2,
  ShieldCheck,
  Archive,
  Bell,
} from "lucide-react";

function SettingsPage({ notify }) {
  return (
    <div className="settings-grid">
      {/* Pharmacy information */}
      <div className="panel">
        <h3>
          <Building2 /> Pharmacy information
        </h3>

        <div className="settings-form">
          <label>
            Pharmacy name
            <input defaultValue="Good Health Pharmacy" />
          </label>

          <label>
            Phone number
            <input defaultValue="+254 700 000 000" />
          </label>

          <label>
            Email address
            <input defaultValue="info@example.com" />
          </label>

          <label>
            Address
            <input defaultValue="Nairobi, Kenya" />
          </label>

          <button
            className="btn primary"
            onClick={() => notify("Settings saved in this demo")}
          >
            Save changes
          </button>
        </div>
      </div>

      {/* Data backup */}
      <div className="panel">
        <h3>
          <ShieldCheck /> Data backup
        </h3>

        <p className="muted">
          Create a database backup and restore it when required.
          Connect these actions to your backend.
        </p>

        <button
          className="btn secondary"
          onClick={() =>
            notify("Connect database backup service to enable this action")
          }
        >
          <Archive size={16} />
          Back up data
        </button>
      </div>

      {/* Notifications */}
      <div className="panel">
        <h3>
          <Bell /> Notifications
        </h3>

        <label className="toggle-row">
          <span>Low stock alerts</span>
          <input type="checkbox" defaultChecked />
        </label>

        <label className="toggle-row">
          <span>Expiry alerts</span>
          <input type="checkbox" defaultChecked />
        </label>

        <label className="toggle-row">
          <span>Pending order alerts</span>
          <input type="checkbox" defaultChecked />
        </label>
      </div>
    </div>
  );
}

export default SettingsPage;