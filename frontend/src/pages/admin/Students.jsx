
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldOff,
  UserCog,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

import userService from "../../services/userService";
import "./Students.css";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const pageSize = 8;

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await userService.getAllUsers({
        role: "student",
        page,
        limit: pageSize,
      });

      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return students;

    return students.filter((student) => {
      return (
        (student.name || "").toLowerCase().includes(term) ||
        (student.email || "").toLowerCase().includes(term) ||
        (student.college || "").toLowerCase().includes(term)
      );
    });
  }, [students, search]);

  const activeStudents = students.filter(
    (student) => student.isActive !== false
  ).length;

  const inactiveStudents = students.length - activeStudents;

  const handleViewStudent = (student) => {
    const studentId = student._id || student.id;
    if (studentId) navigate(`/admin/students/${studentId}`);
  };

  const handleToggleStatus = async (student) => {
    const studentId = student._id || student.id;

    if (!studentId) {
      toast.error("Student ID not found.");
      return;
    }

    const nextStatus = student.isActive === false;

    try {
      setUpdatingId(studentId);

      const response = await userService.updateUserStatus(
        studentId,
        nextStatus
      );

      setStudents((previous) =>
        previous.map((item) =>
          (item._id || item.id) === studentId
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      toast.success(response.message || "Account status updated.");
    } catch (error) {
      // API interceptor displays the error toast.
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedStudent) return;

    const studentId = selectedStudent._id || selectedStudent.id;
    const nextRole =
      selectedStudent.role === "admin" ? "student" : "admin";

    try {
      setRoleUpdating(true);

      const response = await userService.updateUserRole(
        studentId,
        nextRole
      );

      setStudents((previous) =>
        previous.filter(
          (item) => (item._id || item.id) !== studentId
        )
      );

      setSelectedStudent(null);

      toast.success(
        response.message || `Role changed to ${nextRole}.`
      );
    } catch (error) {
      // API interceptor displays the error toast.
    } finally {
      setRoleUpdating(false);
    }
  };

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <span className="students-eyebrow">ADMINISTRATION</span>
          <h1>Students Management</h1>
          <p>Manage student accounts, profiles and permissions.</p>
        </div>

        <button
          type="button"
          className="students-refresh-btn"
          onClick={fetchStudents}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="students-stats">
        <div className="students-stat-card">
          <div className="students-stat-icon total">
            <Users size={22} />
          </div>
          <div>
            <span>Students Loaded</span>
            <h2>{students.length}</h2>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon active">
            <UserCheck size={22} />
          </div>
          <div>
            <span>Active Accounts</span>
            <h2>{activeStudents}</h2>
          </div>
        </div>

        <div className="students-stat-card">
          <div className="students-stat-icon inactive">
            <UserX size={22} />
          </div>
          <div>
            <span>Inactive Accounts</span>
            <h2>{inactiveStudents}</h2>
          </div>
        </div>
      </div>

      <div className="students-content">
        <div className="students-toolbar">
          <div>
            <h2>All Students</h2>
            <p>View profiles and manage account permissions.</p>
          </div>

          <div className="students-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search name, email or college..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College</th>
                <th>Course</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="students-empty">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="students-empty">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentId = student._id || student.id;
                  const isActive = student.isActive !== false;
                  const isUpdating = updatingId === studentId;

                  return (
                    <tr key={studentId}>
                      <td>
                        <button
                          type="button"
                          className="student-name-button"
                          onClick={() => handleViewStudent(student)}
                        >
                          <div className="student-avatar">
                            {(student.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span>
                            {student.name || "Unnamed Student"}
                          </span>
                        </button>

                        <span className="student-email-mobile">
                          {student.email}
                        </span>
                      </td>

                      <td>{student.college || "—"}</td>
                      <td>{student.course || "—"}</td>

                      <td>
                        <span
                          className={`student-role-badge ${
                            student.role === "admin" ? "admin" : ""
                          }`}
                        >
                          {student.role || "student"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`student-status-badge ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          <span className="status-dot" />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="student-actions">
                          <button
                            type="button"
                            className="student-view-btn"
                            title="View profile"
                            onClick={() => handleViewStudent(student)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className={`student-toggle-btn ${
                              isActive ? "deactivate" : "activate"
                            }`}
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(student)}
                          >
                            {isActive ? (
                              <ShieldOff size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}

                            {isUpdating
                              ? "Updating..."
                              : isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="student-role-btn"
                            title="Change student role"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <UserCog size={16} />
                            Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="students-pagination">
          <span>Page {page}</span>

          <div>
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>

            <button
              type="button"
              disabled={students.length < pageSize || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div
          className="role-modal-overlay"
          onClick={() => {
            if (!roleUpdating) setSelectedStudent(null);
          }}
        >
          <div
            className="role-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="role-modal-close"
              onClick={() => setSelectedStudent(null)}
              disabled={roleUpdating}
            >
              <X size={19} />
            </button>

            <div className="role-modal-icon">
              <AlertTriangle size={25} />
            </div>

            <span className="role-modal-label">ROLE MANAGEMENT</span>
            <h2>Change Account Role?</h2>

            <p>
              You are changing the role for{" "}
              <strong>{selectedStudent.name}</strong>.
            </p>

            <div className="role-change-preview">
              <div>
                <span>Current Role</span>
                <strong>{selectedStudent.role}</strong>
              </div>

              <span className="role-change-arrow">→</span>

              <div>
                <span>New Role</span>
                <strong>
                  {selectedStudent.role === "admin"
                    ? "student"
                    : "admin"}
                </strong>
              </div>
            </div>

            <p className="role-modal-warning">
              Admin access provides additional permissions. Only assign it
              to trusted accounts.
            </p>

            <div className="role-modal-actions">
              <button
                type="button"
                className="role-cancel-btn"
                disabled={roleUpdating}
                onClick={() => setSelectedStudent(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="role-confirm-btn"
                disabled={roleUpdating}
                onClick={handleRoleChange}
              >
                {roleUpdating ? "Updating..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
