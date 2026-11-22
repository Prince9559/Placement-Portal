import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Settings as SettingsIcon,User,Bell,LayoutDashboard,ShieldCheck,Save,RotateCcw,ArrowLeft,} from "lucide-react";
import { toast } from "react-toastify";
import "./Settings.css";

const defaultPreferences = {
  emailNotifications: true,
  announcementNotifications: true,
  compactTables: false,
};

const Settings = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "Not available",
    role: "admin",
  });

  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("placement_portal_user");

      if (savedUser) {
        const user = JSON.parse(savedUser);
        setAdmin({
          name: user.name || "Admin",
          email: user.email || "Not available",
          role: user.role || "admin",
        });
      }

      const savedPreferences = localStorage.getItem(
        "placement_admin_preferences"
      );

      if (savedPreferences) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(savedPreferences),
        });
      }
    } catch (error) {
      console.error("Unable to load admin settings:", error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;

    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        "placement_admin_preferences",
        JSON.stringify(preferences)
      );
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Unable to save settings");
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem("placement_admin_preferences");
    toast.success("Settings reset successfully");
  };

  return (
    <div className="admin-settings">
      <div className="settings-page-header">
        <div>
          <button type="button" className="settings-dashboard-btn" onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <h1>
            <SettingsIcon size={26} />
            Admin Settings
          </h1>
          <p>Manage your admin account and dashboard preferences.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-main-column">
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <User size={20} />
              </div>
              <div>
                <h2>Admin Profile</h2>
                <p>Your currently logged-in account details.</p>
              </div>
            </div>

            <div className="settings-profile">
              <div className="settings-avatar">
                {(admin.name || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{admin.name}</h3>
                <span className="settings-role-badge">
                  {admin.role}
                </span>
              </div>
            </div>

            <div className="settings-info-grid">
              <div className="settings-info-item">
                <span>Full Name</span>
                <strong>{admin.name}</strong>
              </div>
              <div className="settings-info-item">
                <span>Email Address</span>
                <strong>{admin.email}</strong>
              </div>
              <div className="settings-info-item">
                <span>Account Role</span>
                <strong>{admin.role}</strong>
              </div>
              <div className="settings-info-item">
                <span>Account Status</span>
                <strong className="settings-active-status">
                  Active Session
                </strong>
              </div>
            </div>

            <p className="settings-note">
              Profile details are displayed from your logged-in account.
              Profile editing is not available through the current backend API.
            </p>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <Bell size={20} />
              </div>
              <div>
                <h2>Notification Preferences</h2>
                <p>Choose your preferred notification options.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <h3>Email Notifications</h3>
                <p>Enable email notification preference.</p>
              </div>
              <label className="settings-switch">
                <input type="checkbox" name="emailNotifications" checked={preferences.emailNotifications} onChange={handleChange}
                />
                <span className="settings-switch-slider" />
              </label>
            </div>

            <div className="settings-option">
              <div>
                <h3>Announcement Notifications</h3>
                <p>Enable announcement notification preference.</p>
              </div>
              <label className="settings-switch">
                <input type="checkbox" name="announcementNotifications" checked={preferences.announcementNotifications} onChange={handleChange}
                />
                <span className="settings-switch-slider" />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h2>Dashboard Preferences</h2>
                <p>Customize the appearance of dashboard tables.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <h3>Compact Tables</h3>
                <p>Enable compact table display preference.</p>
              </div>
              <label className="settings-switch">
                <input type="checkbox" name="compactTables" checked={preferences.compactTables} onChange={handleChange}/>
                <span className="settings-switch-slider" />
              </label>
            </div>
          </section>

          <div className="settings-actions">
            <button className="settings-reset-btn" onClick={handleReset}>
              <RotateCcw size={17} />
              Reset
            </button>
            <button className="settings-save-btn" onClick={handleSave}>
              <Save size={17} />
              Save Settings
            </button>
          </div>
        </div>

        <aside className="settings-side-column">
          <div className="settings-security-card">
            <div className="settings-security-icon">
              <ShieldCheck size={25} />
            </div>
            <h2>Account Security</h2>
            <p>
              Your admin account is protected by the existing login
              authentication system.
            </p>
            <div className="settings-security-row">
              <span>Authentication</span>
              <strong>JWT</strong>
            </div>
            <div className="settings-security-row">
              <span>Account Role</span>
              <strong>Admin</strong>
            </div>
            <p className="settings-note">
              Password changes and security management are not supported
              by the current backend settings APIs.
            </p>
          </div>

          <div className="settings-info-card">
            <h3>About Preferences</h3>
            <p>
              Saved preferences are stored in this browser only. They do
              not change backend notification delivery or other users'
              settings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;