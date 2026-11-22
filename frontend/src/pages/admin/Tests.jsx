
import { useEffect, useCallback, useState } from "react";
import {Plus, Search, Pencil, Eye, Trash2, X, ChevronLeft, ChevronRight,Clock, BookOpen, CheckCircle, Power, LoaderCircle} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Tests.css";

const categories = ["aptitude", "reasoning", "verbal", "technical", "mixed"];

const emptyQuestion = {
  question: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  marks: 1,
};

const emptyForm = {
  title: "",
  description: "",
  category: "aptitude",
  durationMinutes: 30,
  passingMarks: 0,
  questions: [{ ...emptyQuestion, options: [...emptyQuestion.options] }],
};

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/tests", {
        params: { page, limit: 10, category: category || undefined },
      });

      const data = response.data;
      setTests(data.tests || []);
      setPagination(data.pagination || {});
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredTests = tests.filter((test) =>
    `${test.title} ${test.description || ""} ${test.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({
      ...emptyForm,
      questions: [{ ...emptyQuestion, options: [...emptyQuestion.options] }],
    });
    setSelectedTest(null);
    setModal("form");
  };

  const openEdit = async (test) => {
    try {
      const response = await api.get(`/tests/admin/${test._id}`);
      const fullTest = response.data.test;

      setSelectedTest(fullTest);
      setForm({
        title: fullTest.title || "",
        description: fullTest.description || "",
        category: fullTest.category || "aptitude",
        durationMinutes: fullTest.durationMinutes || 30,
        passingMarks: fullTest.passingMarks || 0,
        questions: (fullTest.questions || []).map((q) => ({
          question: q.question || "",
          options: [...(q.options || [])],
          correctOptionIndex: q.correctOptionIndex ?? 0,
          marks: q.marks || 1,
        })),
      });
      setModal("form");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load test details");
    }
  };

  const openView = async (test) => {
    try {
      const response = await api.get(`/tests/admin/${test._id}`);
      setSelectedTest(response.data.test);
      setModal("view");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load test");
    }
  };

  const handleFormChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, name, value) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [name]: value } : q
      ),
    }));
  };

  const handleOptionChange = (qIndex, optionIndex, value) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { ...emptyQuestion, options: [...emptyQuestion.options] },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (form.questions.length <= 1) {
      toast.warning("A test must contain at least one question");
      return;
    }

    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (qIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  };

  const removeOption = (qIndex, optionIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q;

        if (q.options.length <= 2) {
          toast.warning("At least two options are required");
          return q;
        }

        const options = q.options.filter((_, j) => j !== optionIndex);
        let correctOptionIndex = q.correctOptionIndex;

        if (optionIndex === correctOptionIndex) {
          correctOptionIndex = 0;
        } else if (optionIndex < correctOptionIndex) {
          correctOptionIndex -= 1;
        }

        return { ...q, options, correctOptionIndex };
      }),
    }));
  };

  const totalMarks = form.questions.reduce(
    (sum, q) => sum + (Number(q.marks) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Test title is required");
      return;
    }

    if (!Number.isInteger(Number(form.durationMinutes)) || Number(form.durationMinutes) < 1) {
      toast.error("Duration must be a positive whole number");
      return;
    }

    if (!form.questions.length) {
      toast.error("Add at least one question");
      return;
    }

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];

      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }

      if (q.options.length < 2 || q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1}: add at least two non-empty options`);
        return;
      }

      if (
        !Number.isInteger(Number(q.correctOptionIndex)) ||
        Number(q.correctOptionIndex) < 0 ||
        Number(q.correctOptionIndex) >= q.options.length
      ) {
        toast.error(`Question ${i + 1}: select a valid correct answer`);
        return;
      }

      if (!Number.isInteger(Number(q.marks)) || Number(q.marks) < 1) {
        toast.error(`Question ${i + 1}: marks must be a positive integer`);
        return;
      }
    }

    if (
      !Number.isInteger(Number(form.passingMarks)) ||
      Number(form.passingMarks) < 0 ||
      Number(form.passingMarks) > totalMarks
    ) {
      toast.error(`Passing marks must be between 0 and ${totalMarks}`);
      return;
    }

    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      passingMarks: Number(form.passingMarks),
      questions: form.questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctOptionIndex: Number(q.correctOptionIndex),
        marks: Number(q.marks),
      })),
    };

    setSaving(true);
    try {
      if (selectedTest) {
        await api.put(`/tests/${selectedTest._id}`, payload);
        toast.success("Test updated successfully");
      } else {
        await api.post("/tests", payload);
        toast.success("Test created successfully");
      }

      setModal("");
      setSelectedTest(null);
      setPage(1);
      await fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (test) => {
    try {
      await api.delete(`/tests/${test._id}`);
      toast.success("Test deactivated successfully");
      setConfirmDelete(null);
      fetchTests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to deactivate test");
    }
  };

  const formatCategory = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";

  return (
    <div className="admin-tests">
      <div className="tests-page-header">
        <div>
          <h1>Tests Management</h1>
          <p>Create, manage and organize placement practice tests.</p>
        </div>
        <button className="tests-primary-btn" onClick={openAdd}>
          <Plus size={18} /> Create Test
        </button>
      </div>

      <div className="tests-summary">
        <div className="tests-summary-card">
          <BookOpen size={22} />
          <div>
            <span>Total Tests (current list)</span>
            <strong>{pagination.total ?? tests.length}</strong>
          </div>
        </div>
        <div className="tests-summary-card">
          <CheckCircle size={22} />
          <div>
            <span>Tests on this page</span>
            <strong>{tests.length}</strong>
          </div>
        </div>
      </div>

      <div className="tests-toolbar">
        <div className="tests-search">
          <Search size={18} />
          <input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategory(cat)}
            </option>
          ))}
        </select>
        <button className="tests-refresh-btn" onClick={fetchTests}>
          Refresh
        </button>
      </div>

      <div className="tests-table-card">
        {loading ? (
          <div className="tests-loading">
            <LoaderCircle className="tests-spinner" size={32} />
            <p>Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="tests-empty">
            <BookOpen size={42} />
            <h3>No tests found</h3>
            <p>Create a test or change your search/filter.</p>
          </div>
        ) : (
          <div className="tests-table-wrap">
            <table className="tests-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Total Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <div className="tests-title-cell">
                        <strong>{test.title}</strong>
                        <small>{test.description || "No description"}</small>
                      </div>
                    </td>
                    <td>
                      <span className="tests-category">
                        {formatCategory(test.category)}
                      </span>
                    </td>
                    <td><Clock size={15} /> {test.durationMinutes} min</td>
                    <td>{test.questionsCount ?? test.questions?.length ?? "-"}</td>
                    <td>{test.totalMarks ?? "-"}</td>
                    <td>
                      <span className="tests-status active">
                        Active
                      </span>
                    </td>
                    <td>
                      <div className="tests-actions">
                        <button title="View" onClick={() => openView(test)}>
                          <Eye size={17} />
                        </button>
                        <button title="Edit" onClick={() => openEdit(test)}>
                          <Pencil size={17} />
                        </button>
                        <button
                          title="Deactivate"
                          className="danger"
                          onClick={() => setConfirmDelete(test)}
                        >
                          <Power size={17} />
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

      <div className="tests-pagination">
        <span>
          Page {pagination.page || page} of {pagination.totalPages || 1}
        </span>
        <div>
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            disabled={page >= (pagination.totalPages || 1) || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {modal === "form" && (
        <div className="tests-modal-overlay">
          <div className="tests-modal tests-form-modal">
            <div className="tests-modal-header">
              <h2>{selectedTest ? "Edit Test" : "Create Test"}</h2>
              <button onClick={() => setModal("")}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="tests-form-grid">
                <label>
                  Test Title *
                  <input value={form.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder="Enter test title"
                  />
                </label>
                <label>
                  Category *
                  <select value={form.category} onChange={(e) => handleFormChange("category", e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{formatCategory(cat)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Duration (minutes) *
                  <input type="number" min="1" step="1" value={form.durationMinutes} onChange={(e) => handleFormChange("durationMinutes", e.target.value)}
                  />
                </label>
                <label>
                  Passing Marks *
                  <input type="number" min="0" step="1" value={form.passingMarks}
                    onChange={(e) => handleFormChange("passingMarks", e.target.value)}
                  />
                </label>
              </div>

              <label className="tests-description-label">
                Description
                <textarea rows="3" value={form.description} onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Describe this test"
                />
              </label>

              <div className="tests-question-heading">
                <h3>Questions</h3>
                <span>{form.questions.length} questions • {totalMarks} marks</span>
              </div>

              {form.questions.map((q, qIndex) => (
                <div className="tests-question-editor" key={qIndex}>
                  <div className="tests-question-editor-header">
                    <h4>Question {qIndex + 1}</h4>
                    <button type="button" className="tests-remove-btn" onClick={() => removeQuestion(qIndex)}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>

                  <label>
                    Question Text *
                    <textarea rows="3" value={q.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} placeholder="Enter question"
                    />
                  </label>

                  <div className="tests-options-heading">
                    <span>Options</span>
                    <button type="button" onClick={() => addOption(qIndex)}>
                      <Plus size={15} /> Add Option
                    </button>
                  </div>

                  {q.options.map((option, optionIndex) => (
                    <div className="tests-option-row" key={optionIndex}>
                      <label className="tests-correct-radio">
                        <input type="radio" name={`correct-${qIndex}`}  checked={Number(q.correctOptionIndex) === optionIndex} onChange={() => handleQuestionChange(qIndex, "correctOptionIndex", optionIndex)}
                        />
                        <span>Correct</span>
                      </label>
                      <input value={option} onChange={(e) => handleOptionChange(qIndex, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button type="button" className="tests-option-remove" title="Remove option" onClick={() => removeOption(qIndex, optionIndex)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  <label className="tests-marks-label">
                    Marks for this question *
                    <input type="number" min="1" step="1" value={q.marks} onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
                    />
                  </label>
                </div>
              ))}

              <button type="button" className="tests-add-question-btn" onClick={addQuestion}>
                <Plus size={18} /> Add Question
              </button>

              <div className="tests-form-footer">
                <span>Total: {totalMarks} marks</span>
                <div>
                  <button type="button" className="tests-cancel-btn" onClick={() => setModal("")}>
                    Cancel
                  </button>
                  <button type="submit" className="tests-primary-btn" disabled={saving}>
                    {saving ? "Saving..." : selectedTest ? "Update Test" : "Create Test"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedTest && (
        <div className="tests-modal-overlay">
          <div className="tests-modal tests-view-modal">
            <div className="tests-modal-header">
              <h2>Test Details</h2>
              <button onClick={() => setModal("")}><X size={20} /></button>
            </div>

            <div className="tests-view-content">
              <h3>{selectedTest.title}</h3>
              <p>{selectedTest.description || "No description"}</p>
              <div className="tests-view-meta">
                <span>{formatCategory(selectedTest.category)}</span>
                <span>{selectedTest.durationMinutes} minutes</span>
                <span>{selectedTest.totalMarks} marks</span>
                <span>Passing: {selectedTest.passingMarks}</span>
              </div>

              {selectedTest.questions?.map((q, i) => (
                <div className="tests-view-question" key={q._id || i}>
                  <h4>Q{i + 1}. {q.question}</h4>
                  <ul>
                    {q.options.map((option, j) => (
                      <li
                        key={j}
                        className={j === q.correctOptionIndex ? "correct" : ""}
                      >
                        {option}
                        {j === q.correctOptionIndex && (
                          <span> — Correct Answer</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <small>{q.marks} marks</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="tests-modal-overlay">
          <div className="tests-confirm-modal">
            <div className="tests-modal-header">
              <h2>Deactivate Test</h2>
              <button onClick={() => setConfirmDelete(null)}><X size={20} /></button>
            </div>
            <p>Are you sure you want to deactivate <strong>{confirmDelete.title}</strong>?</p>
            <p>This test will no longer be available to students.</p>
            <div className="tests-confirm-actions">
              <button className="tests-cancel-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="tests-danger-btn" onClick={() => handleDeactivate(confirmDelete)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
