import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {Search, Plus, Edit, Trash2, RefreshCw, X, MessageSquare, ChevronLeft, ChevronRight, Eye, EyeOff,ArrowLeft} from "lucide-react";
import api from "../../services/api";
import "./InterviewQuestions.css";

const categories = ["technical", "hr", "behavioral", "managerial"];

const emptyForm = {
  question: "",
  category: "technical",
  topic: "",
  difficulty: "medium",
  answer: "",
  tips: "",
  sampleAnswer: "",
  companies: "",
  tags: ""
};

function InterviewQuestions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [answerModal, setAnswerModal] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/interview", {
        params: {
          page,
          limit: 10,
          topic: search.trim() || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined
        }
      });

      setQuestions(response.data.questions || []);
      setPagination(response.data.pagination || {
        total: 0,
        totalPages: 1
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load interview questions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, search, category, difficulty]);

  const updateField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/interview/${id}`);
      const q = response.data.question;

      setEditingId(id);
      setForm({
        question: q.question || "",
        category: q.category || "technical",
        topic: q.topic || "",
        difficulty: q.difficulty || "medium",
        answer: "",
        tips: (q.tips || []).join("\n"),
        sampleAnswer: "",
        companies: (q.companies || []).join(", "),
        tags: (q.tags || []).join(", ")
      });

      const answerResponse = await api.get(`/interview/${id}/answer`);
      const answer = answerResponse.data.answer;

      setForm(prev => ({
        ...prev,
        answer: answer.answer || "",
        sampleAnswer: answer.sampleAnswer || ""
      }));

      setModalOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load question details"
      );
    }
  };

  const viewAnswer = async (id) => {
    try {
      setAnswerLoading(true);
      setAnswerModal(true);
      setAnswerData(null);

      const response = await api.get(`/interview/${id}/answer`);
      setAnswerData(response.data.answer);
    } catch (error) {
      setAnswerModal(false);
      toast.error(
        error.response?.data?.message || "Unable to load answer"
      );
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.question.trim() ||
      !form.topic.trim() ||
      !form.answer.trim()
    ) {
      toast.error("Question, topic and answer are required");
      return;
    }

    const payload = {
      ...form,
      question: form.question.trim(),
      topic: form.topic.trim(),
      answer: form.answer.trim(),
      tips: form.tips.split("\n").map(x => x.trim()).filter(Boolean),
      companies: form.companies.split(",").map(x => x.trim()).filter(Boolean),
      tags: form.tags.split(",").map(x => x.trim()).filter(Boolean)
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/interview/${editingId}`, payload);
        toast.success("Interview question updated successfully");
      } else {
        await api.post("/interview", payload);
        toast.success("Interview question created successfully");
      }

      setModalOpen(false);
      await fetchQuestions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save question"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await api.delete(`/interview/${id}`);
      toast.success("Interview question deleted successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete question"
      );
    }
  };

  return (
    <div className="interview-admin-page">
      <div className="interview-page-header">
        <div>
          <button type="button" className="interview-dashboard-btn" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <span className="interview-eyebrow">ADMIN PANEL</span>

          <h1>
            <MessageSquare size={28} /> Interview Questions
          </h1>

          <p>Manage technical, HR and behavioral interview questions.</p>
        </div>

        <button className="interview-primary-btn" onClick={openAddModal}>
          <Plus size={18} /> Add Question
        </button>
      </div>

      <div className="interview-toolbar">
        <div className="interview-search">
          <Search size={18} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by topic..."/>
        </div>

        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1);}}>
          <option value="">All Categories</option>
          {categories.map(item => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>

        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button className="interview-refresh-btn" onClick={fetchQuestions} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="interview-table-card">
        {loading ? (
          <div className="interview-loading">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="interview-empty">
            <MessageSquare size={40} />
            <h3>No interview questions found</h3>
            <p>Add your first interview question to get started.</p>
          </div>
        ) : (
          <div className="interview-table-scroll">
            <table className="interview-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Topic</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {questions.map(q => (
                  <tr key={q._id}>
                    <td>
                      <strong>{q.question}</strong>
                    </td>
                    <td>{q.topic}</td>
                    <td>
                      <span className="interview-category">
                        {q.category}
                      </span>
                    </td>
                    <td>
                      <span className={`interview-difficulty ${q.difficulty}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="interview-actions">
                        <button
                          title="View Answer"
                          onClick={() => viewAnswer(q._id)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => openEditModal(q._id)}
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Delete"
                          className="delete"
                          onClick={() => handleDelete(q._id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="interview-pagination">
        <span>
          Total Questions: <strong>{pagination.total}</strong>
        </span>

        <div>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={18} />
          </button>

          <span>Page {page} of {pagination.totalPages || 1}</span>

          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="interview-modal-overlay">
          <div className="interview-modal">
            <div className="interview-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Interview Question" : "Add Interview Question"}
                </h2>
                <p>Enter question details and suggested answer.</p>
              </div>

              <button type="button" onClick={() => setModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Question *</label>
              <textarea required rows="3" value={form.question} onChange={e => updateField("question", e.target.value)}  placeholder="Enter interview question..."/>

              <div className="interview-form-grid">
                <div>
                  <label>Category *</label>
                  <select value={form.category} onChange={e => updateField("category", e.target.value)}>
                    {categories.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Topic *</label>
                  <input required value={form.topic} onChange={e => updateField("topic", e.target.value)} placeholder="e.g. JavaScript"/>
                </div>

                <div>
                  <label>Difficulty</label>
                  <select value={form.difficulty} onChange={e => updateField("difficulty", e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <label>Answer *</label>
              <textarea required rows="5" value={form.answer} onChange={e => updateField("answer", e.target.value)} placeholder="Enter suggested answer..."/>

              <label>Sample Answer</label>
              <textarea rows="4" value={form.sampleAnswer} onChange={e => updateField("sampleAnswer", e.target.value)}/>

              <label>Tips (one per line)</label>
              <textarea rows="3" value={form.tips} onChange={e => updateField("tips", e.target.value)} placeholder="Be confident&#10;Give practical examples"/>

              <label>Companies (comma separated)</label>
              <input value={form.companies} onChange={e => updateField("companies", e.target.value)} placeholder="Google, Amazon, Microsoft" />

              <label>Tags (comma separated)</label>
              <inpu value={form.tags} onChange={e => updateField("tags", e.target.value)} placeholder="javascript, frontend"/>

              <div className="interview-modal-actions">
                <button type="button" className="interview-cancel-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>

                <button type="submit" className="interview-primary-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Question"
                      : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {answerModal && (
        <div className="interview-modal-overlay">
          <div className="interview-modal interview-answer-modal">
            <div className="interview-modal-header">
              <h2>Interview Answer</h2>

              <button type="button" onClick={() => setAnswerModal(false)}>
                <X size={22} />
              </button>
            </div>

            {answerLoading ? (
              <p>Loading answer...</p>
            ) : answerData ? (
              <>
                <h3>{answerData.question}</h3>

                <h4>Suggested Answer</h4>
                <p className="interview-answer-text">{answerData.answer}</p>

                {answerData.sampleAnswer && (
                  <>
                    <h4>Sample Answer</h4>
                    <p className="interview-answer-text">
                      {answerData.sampleAnswer}
                    </p>
                  </>
                )}

                {answerData.tips?.length > 0 && (
                  <>
                    <h4>Tips</h4>
                    <ul>
                      {answerData.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p>Answer not available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewQuestions;