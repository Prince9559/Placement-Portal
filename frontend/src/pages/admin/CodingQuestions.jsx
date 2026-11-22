
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Code2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../../services/api";
import "./CodingQuestions.css";

const categories = [
  "arrays",
  "strings",
  "linked-list",
  "stack",
  "queue",
  "tree",
  "graph",
  "sorting",
  "searching",
  "dynamic-programming",
  "math",
  "other"
];

const emptyForm = {
  title: "",
  description: "",
  category: "arrays",
  difficulty: "easy",
  constraints: "",
  inputFormat: "",
  outputFormat: "",
  sampleTestCases: [{ input: "", output: "", explanation: "" }],
  hiddenTestCases: [{ input: "", output: "" }],
  hints: "",
  companies: "",
  tags: "",
  timeLimit: 1000,
  memoryLimit: 256
};

function CodingQuestions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/coding", {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined
        }
      });

      setQuestions(response.data.questions || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          totalPages: 1,
          limit: 10
        }
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load coding questions"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, difficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sampleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }]
    });
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await api.get(`/coding/${id}`);
      const q = response.data.question;

      setEditingId(id);
      setForm({
        title: q.title || "",
        description: q.description || "",
        category: q.category || "arrays",
        difficulty: q.difficulty || "easy",
        constraints: (q.constraints || []).join("\n"),
        inputFormat: q.inputFormat || "",
        outputFormat: q.outputFormat || "",
        sampleTestCases: q.sampleTestCases?.length
          ? q.sampleTestCases.map(item => ({
              input: item.input || "",
              output: item.output || "",
              explanation: item.explanation || ""
            }))
          : [{ input: "", output: "", explanation: "" }],
        hiddenTestCases: q.hiddenTestCases?.length
          ? q.hiddenTestCases.map(item => ({
              input: item.input || "",
              output: item.output || ""
            }))
          : [{ input: "", output: "" }],
        hints: (q.hints || []).join("\n"),
        companies: (q.companies || []).join(", "),
        tags: (q.tags || []).join(", "),
        timeLimit: q.timeLimit ?? 1000,
        memoryLimit: q.memoryLimit ?? 256
      });

      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load question");
    }
  };

  const updateTestCase = (type, index, field, value) => {
    setForm(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addTestCase = (type) => {
    const newCase =
      type === "sampleTestCases"
        ? { input: "", output: "", explanation: "" }
        : { input: "", output: "" };

    setForm(prev => ({
      ...prev,
      [type]: [...prev[type], newCase]
    }));
  };

  const removeTestCase = (type, index) => {
    if (form[type].length === 1) {
      toast.info("At least one test case is required");
      return;
    }

    setForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const sampleTestCases = form.sampleTestCases.filter(
      item => item.input.trim() && item.output.trim()
    );

    const hiddenTestCases = form.hiddenTestCases.filter(
      item => item.input.trim() && item.output.trim()
    );

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      constraints: form.constraints
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean),
      hints: form.hints
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean),
      companies: form.companies
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      tags: form.tags
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
      sampleTestCases,
      hiddenTestCases,
      timeLimit: Number(form.timeLimit),
      memoryLimit: Number(form.memoryLimit)
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/coding/${editingId}`, payload);
        toast.success("Coding question updated successfully");
      } else {
        await api.post("/coding", payload);
        toast.success("Coding question created successfully");
      }

      setModalOpen(false);
      setPage(1);
      await fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await api.delete(`/coding/${id}`);
      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete question");
    }
  };

  return (
    <div className="coding-admin-page">
      <div className="coding-page-header">
        <div>
          <button
            type="button"
            className="coding-dashboard-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <span className="coding-eyebrow">ADMIN PANEL</span>

          <h1>
            <Code2 size={28} /> Coding Questions
          </h1>

          <p>Manage programming questions and test cases.</p>
        </div>

        <button className="coding-primary-btn" onClick={openAddModal}>
          <Plus size={18} /> Add Question
        </button>
      </div>

      <div className="coding-toolbar">
        <div className="coding-search">
          <Search size={18} />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search question title..."
          />
        </div>

        <select
          value={category}
          onChange={e => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map(item => (
            <option key={item} value={item}>
              {item.replaceAll("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={e => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          className="coding-refresh-btn"
          onClick={fetchQuestions}
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="coding-table-card">
        {loading ? (
          <div className="coding-loading">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="coding-empty">
            <Code2 size={40} />
            <h3>No coding questions found</h3>
            <p>Add your first coding question to get started.</p>
          </div>
        ) : (
          <div className="coding-table-scroll">
            <table className="coding-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Sample Cases</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {questions.map(q => (
                  <tr key={q._id}>
                    <td>
                      <strong>{q.title}</strong>
                      <small>{q.description.slice(0, 75)}...</small>
                    </td>

                    <td>{q.category}</td>

                    <td>
                      <span className={`coding-difficulty ${q.difficulty}`}>
                        {q.difficulty}
                      </span>
                    </td>

                    <td>{q.sampleTestCases?.length || 0}</td>

                    <td>
                      <span className="coding-status">Active</span>
                    </td>

                    <td>
                      <div className="coding-actions">
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

      <div className="coding-pagination">
        <span>
          Total Questions: <strong>{pagination.total}</strong>
        </span>

        <div>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>

          <span>
            Page {page} of {pagination.totalPages || 1}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="coding-modal-overlay">
          <div className="coding-modal">
            <div className="coding-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit Coding Question" : "Add Coding Question"}
                </h2>
                <p>Enter problem details and test cases.</p>
              </div>

              <button type="button" onClick={() => setModalOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Question Title *</label>
              <input
                required
                value={form.title}
                onChange={e => updateField("title", e.target.value)}
                placeholder="e.g. Two Sum"
              />

              <label>Description *</label>
              <textarea
                required
                rows="5"
                value={form.description}
                onChange={e => updateField("description", e.target.value)}
                placeholder="Describe the problem..."
              />

              <div className="coding-form-grid">
                <div>
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={e => updateField("category", e.target.value)}
                  >
                    {categories.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => updateField("difficulty", e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <label>Constraints (one per line)</label>
              <textarea
                rows="3"
                value={form.constraints}
                onChange={e => updateField("constraints", e.target.value)}
              />

              <label>Input Format</label>
              <textarea
                rows="2"
                value={form.inputFormat}
                onChange={e => updateField("inputFormat", e.target.value)}
              />

              <label>Output Format</label>
              <textarea
                rows="2"
                value={form.outputFormat}
                onChange={e => updateField("outputFormat", e.target.value)}
              />

              <div className="coding-test-section">
                <div className="coding-test-heading">
                  <h3>Sample Test Cases</h3>

                  <button
                    type="button"
                    onClick={() => addTestCase("sampleTestCases")}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                {form.sampleTestCases.map((item, index) => (
                  <div className="coding-test-card" key={index}>
                    <div className="coding-test-card-heading">
                      <strong>Sample Case {index + 1}</strong>

                      <button
                        type="button"
                        onClick={() => removeTestCase("sampleTestCases", index)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <label>Input</label>
                    <textarea
                      rows="2"
                      value={item.input}
                      onChange={e =>
                        updateTestCase(
                          "sampleTestCases",
                          index,
                          "input",
                          e.target.value
                        )
                      }
                    />

                    <label>Output</label>
                    <textarea
                      rows="2"
                      value={item.output}
                      onChange={e =>
                        updateTestCase(
                          "sampleTestCases",
                          index,
                          "output",
                          e.target.value
                        )
                      }
                    />

                    <label>Explanation</label>
                    <textarea
                      rows="2"
                      value={item.explanation}
                      onChange={e =>
                        updateTestCase(
                          "sampleTestCases",
                          index,
                          "explanation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="coding-test-section">
                <div className="coding-test-heading">
                  <h3>Hidden Test Cases</h3>

                  <button
                    type="button"
                    onClick={() => addTestCase("hiddenTestCases")}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                {form.hiddenTestCases.map((item, index) => (
                  <div className="coding-test-card" key={index}>
                    <div className="coding-test-card-heading">
                      <strong>Hidden Case {index + 1}</strong>

                      <button
                        type="button"
                        onClick={() => removeTestCase("hiddenTestCases", index)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <label>Input</label>
                    <textarea
                      rows="2"
                      value={item.input}
                      onChange={e =>
                        updateTestCase(
                          "hiddenTestCases",
                          index,
                          "input",
                          e.target.value
                        )
                      }
                    />

                    <label>Output</label>
                    <textarea
                      rows="2"
                      value={item.output}
                      onChange={e =>
                        updateTestCase(
                          "hiddenTestCases",
                          index,
                          "output",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <label>Hints (one per line)</label>
              <textarea
                rows="3"
                value={form.hints}
                onChange={e => updateField("hints", e.target.value)}
              />

              <label>Companies (comma separated)</label>
              <input
                value={form.companies}
                onChange={e => updateField("companies", e.target.value)}
                placeholder="Google, Amazon, Microsoft"
              />

              <label>Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={e => updateField("tags", e.target.value)}
                placeholder="array, hash-map"
              />

              <div className="coding-form-grid">
                <div>
                  <label>Time Limit (ms)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.timeLimit}
                    onChange={e => updateField("timeLimit", e.target.value)}
                  />
                </div>

                <div>
                  <label>Memory Limit (MB)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.memoryLimit}
                    onChange={e => updateField("memoryLimit", e.target.value)}
                  />
                </div>
              </div>

              <div className="coding-modal-actions">
                <button
                  type="button"
                  className="coding-cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coding-primary-btn"
                  disabled={saving}
                >
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
    </div>
  );
}

export default CodingQuestions;
