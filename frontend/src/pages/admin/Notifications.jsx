
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft,Bell,Plus,Search,Trash2,RefreshCw,X,Send,ChevronLeft,ChevronRight, Megaphone,} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Notifications.css";

const initialForm = {
  title: "",
  message: "",
  type: "general",
  recipient: "",
  link: "",
};

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications/admin/all", {
        params: { page, limit: 10 },
      });

      const result = response.data;

      setNotifications(result.data || []);
      setPagination({
        total: result.total || 0,
        pages: result.pages || 1,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.title?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.recipient?.name?.toLowerCase().includes(query)
    );
  });

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        link: form.link.trim(),
        ...(form.recipient.trim()
          ? { recipient: form.recipient.trim() }
          : {}),
      };

      const response = await api.post("/notifications", payload);

      toast.success(response.data.message || "Notification created");

      setShowModal(false);
      setForm(initialForm);
      setPage(1);

      if (page === 1) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create notification"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/notifications/${deleteId}`);

      toast.success("Notification deleted successfully");
      setDeleteId(null);

      if (notifications.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchNotifications();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="admin-notifications">
      
      <div className="notification-header">
        <div>
          <button type="button" className="notification-dashboard-btn" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <h1>
            <Bell size={25} /> Notifications
          </h1>

          <p>Create and manage notifications for students.</p>
        </div>

        <button className="notification-primary-btn"onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Notification
        </button>
      </div>

      
      <div className="notification-stats">
        <div className="notification-stat-card">
          <span>Total Notifications</span>
          <strong>{pagination.total}</strong>
          <Bell size={25} />
        </div>

        <div className="notification-stat-card">
          <span>Current Page</span>
          <strong>
            {page} / {pagination.pages}
          </strong>
          <Megaphone size={25} />
        </div>
      </div>

      
      <div className="notification-toolbar">
        <div className="notification-search">
          <Search size={18} />

          <input value={search} onChange={(e) => setSearch(e.target.value)}placeholder="Search title, message or type..."/>
        </div>

        <button className="notification-refresh-btn" onClick={fetchNotifications}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      
      <div className="notification-table-card">
        <div className="notification-table-heading">
          <h2>All Notifications</h2>
          <span>{pagination.total} records</span>
        </div>

        {loading ? (
          <div className="notification-empty">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notification-empty">
            <Bell size={35} />
            <h3>No notifications found</h3>
            <p>Create a notification to get started.</p>
          </div>
        ) : (
          <div className="notification-table-wrapper">
            <table className="notification-table">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredNotifications.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.message}</small>
                    </td>

                    <td>
                      <span className="notification-type">
                        {item.type}
                      </span>
                    </td>

                    <td>
                      {item.recipient?.name || "All Students"}
                    </td>

                    <td>
                      {item.createdBy?.name || "Admin"}
                    </td>

                    <td>{formatDate(item.createdAt)}</td>

                    <td>
                      <button className="notification-delete-btn" title="Delete notification" onClick={() => setDeleteId(item._id)}>
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        
        <div className="notification-pagination">
          <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            <ChevronLeft size={17} /> Previous
          </button>

          <span>
            Page {page} of {pagination.pages}
          </span>

          <button disabled={page >= pagination.pages} onClick={() => setPage((prev) => prev + 1)}>
            Next <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {showModal && (
        <div className="notification-modal-overlay">
          <div className="notification-modal">
            <div className="notification-modal-header">
              <div>
                <h2>
                  <Send size={20} /> Create Notification
                </h2>
                <p>Send an announcement to students.</p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <label>Title *</label>

              <input name="title" value={form.title} onChange={updateField} maxLength={150} placeholder="Enter notification title" required/>

              <label>Message *</label>

              <textarea name="message" value={form.message} onChange={updateField} maxLength={1000} rows={4} placeholder="Write notification message" required
              />

              <label>Notification Type</label>

              <select name="type" value={form.type} onChange={updateField}
              >
                <option value="general">General</option>
                <option value="test">Test</option>
                <option value="study-material">Study Material</option>
                <option value="placement">Placement</option>
                <option value="announcement">Announcement</option>
              </select>

              <label>Recipient User ID (optional)</label>

              <input name="recipient"  value={form.recipient} onChange={updateField} placeholder="Blank = send to all users"/>

              <label>Link (optional)</label>

              <input name="link" value={form.link} onChange={updateField} placeholder="/student/tests"/>

              <div className="notification-form-actions">
                <button type="button" onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  <Send size={16} />
                  {saving ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {deleteId && (
        <div className="notification-modal-overlay">
          <div className="notification-delete-modal">
            <h2>Delete Notification?</h2>

            <p>
              This notification will be permanently deleted.
            </p>

            <div className="notification-form-actions">
              <button onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button className="notification-confirm-delete" onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
