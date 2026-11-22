
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  CalendarDays,
  Code2,
  ShieldCheck,
} from "lucide-react";
import userService from "../../services/userService";
import "./StudentDetails.css";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        setStudent(response.data);
      } catch (error) {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return <div className="student-details-loading">Loading student profile...</div>;
  }

  if (!student) {
    return (
      <div className="student-details-page">
        <h2>Student not found</h2>
        <button onClick={() => navigate("/admin/students")}>
          Back to Students
        </button>
      </div>
    );
  }

  const isActive = student.isActive !== false;

  return (
    <div className="student-details-page">
      <button className="student-back-btn"
        onClick={() => navigate("/admin/students")}
      >
        <ArrowLeft size={18} /> Back to Students
      </button>

      <div className="student-details-header">
        <div className="student-details-avatar">
          {(student.name || "S").charAt(0).toUpperCase()}
        </div>

        <div className="student-details-heading">
          <span className="student-details-label">STUDENT PROFILE</span>
          <h1>{student.name || "Unnamed Student"}</h1>
          <p>{student.email}</p>
        </div>

        <span className={`student-details-status ${isActive ? "active" : "inactive"}`}>
          {isActive ? "Active Account" : "Inactive Account"}
        </span>
      </div>

      <div className="student-details-grid">
        <div className="student-info-card">
          <h2><UserRound size={20} /> Personal Information</h2>

          <div className="student-info-row">
            <Mail size={18} />
            <div><span>Email Address</span><strong>{student.email || "—"}</strong></div>
          </div>

          <div className="student-info-row">
            <Phone size={18} />
            <div><span>Phone Number</span><strong>{student.phone || "Not provided"}</strong></div>
          </div>

          <div className="student-info-row">
            <ShieldCheck size={18} />
            <div><span>Account Role</span><strong>{student.role || "student"}</strong></div>
          </div>
        </div>

        <div className="student-info-card">
          <h2><GraduationCap size={20} /> Academic Information</h2>

          <div className="student-info-row">
            <Building2 size={18} />
            <div><span>College</span><strong>{student.college || "Not provided"}</strong></div>
          </div>

          <div className="student-info-row">
            <GraduationCap size={18} />
            <div><span>Course</span><strong>{student.course || "Not provided"}</strong></div>
          </div>

          <div className="student-info-row">
            <CalendarDays size={18} />
            <div><span>Graduation Year</span><strong>{student.graduationYear || "Not provided"}</strong></div>
          </div>
        </div>

        <div className="student-info-card student-skills-card">
          <h2><Code2 size={20} /> Technical Skills</h2>

          {student.skills?.length ? (
            <div className="student-skills-list">
              {student.skills.map((skill, index) => (
                <span key={`${skill}-${index}`}>{skill}</span>
              ))}
            </div>
          ) : (
            <p className="student-no-skills">No skills added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;
