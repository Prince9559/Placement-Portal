
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft,Plus,Search,RefreshCw, Pencil,Trash2,Eye,X,CheckCircle,BookOpen, Filter,ChevronLeft,ChevronRight,LoaderCircle,AlertCircle,Tag,} from "lucide-react";
import { toast } from "react-toastify";
import questionService from "../../services/questionService";
import "./Questions.css";

const initialForm = {
  question: "",
  category: "aptitude",
  topic: "",
  difficulty: "medium",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  explanation: "",
  company: "",
  tags: [],
};

const categories = ["aptitude", "reasoning", "verbal", "technical"];
const difficulties = ["easy", "medium", "hard"];

function Questions() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [tagInput, setTagInput] = useState("");

  const fetchQuestions = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(search.trim() && { topic: search.trim() }),
      };

      const response = await questionService.getQuestions(params);

      setQuestions(response.questions || []);
      setPagination(
        response.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Questions fetch error:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, search]);

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      options: initialForm.options.map((option) => ({ ...option })),
      tags: [],
    });
    setTagInput("");
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await questionService.getQuestionById(id);
      const question = response.question;

      if (!question) {
        toast.error("Question details not found.");
        return;
      }

      setEditingId(id);
      setForm({
        question: question.question || "",
        category: question.category || "aptitude",
        topic: question.topic || "",
        difficulty: question.difficulty || "medium",
        options:
          question.options?.length >= 2
            ? question.options.map((option) => ({
                text: option.text || "",
                isCorrect: Boolean(option.isCorrect),
              }))
            : initialForm.options.map((option) => ({ ...option })),
        explanation: question.explanation || "",
        company: question.company || "",
        tags: Array.isArray(question.tags) ? question.tags : [],
      });
      setTagInput("");
      setModalOpen(true);
    } catch (error) {
      console.error("Question details error:", error);
    }
  };

  const openViewModal = async (id) => {
    try {
      const response = await questionService.getQuestionById(id);
      setSelectedQuestion(response.question || null);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Question view error:", error);
    }
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateOption = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((option, optionIndex) => ({
        ...option,
        [field]:
          field === "isCorrect"
            ? optionIndex === index
            : optionIndex === index
              ? value
              : option[field],
      })),
    }));
  };

  const addOption = () => {
    if (form.options.length >= 6) {
      toast.info("Maximum 6 options allowed.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      options: [...previous.options, { text: "", isCorrect: false }],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) {
      toast.info("At least 2 options are required.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      options: previous.options
        .filter((_, optionIndex) => optionIndex !== index)
        .map((option, optionIndex) => ({
          ...option,
          isCorrect:
            previous.options[index].isCorrect && optionIndex === 0
              ? true
              : option.isCorrect,
        })),
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) return;

    if (form.tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      toast.info("This tag already exists.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      tags: [...previous.tags, tag],
    }));
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setForm((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.question.trim() || !form.topic.trim()) {
      toast.error("Question and topic are required.");
      return;
    }

    if (form.options.some((option) => !option.text.trim())) {
      toast.error("Please fill all option fields.");
      return;
    }

    if (form.options.filter((option) => option.isCorrect).length !== 1) {
      toast.error("Please select exactly one correct answer.");
      return;
    }

    const payload = {
      ...form,
      question: form.question.trim(),
      topic: form.topic.trim(),
      options: form.options.map((option) => ({
        text: option.text.trim(),
        isCorrect: option.isCorrect,
      })),
      tags: form.tags,
    };

    setSaving(true);

    try {
      if (editingId) {
        await questionService.updateQuestion(editingId, payload);
        toast.success("Question updated successfully.");
      } else {
        await questionService.createQuestion(payload);
        toast.success("Question added successfully.");
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditingId(null);
      fetchQuestions(1);
    } catch (error) {
      console.error("Question save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this question?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await questionService.deleteQuestion(id);
      toast.success("Question deactivated successfully.");

      const nextPage =
        questions.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      fetchQuestions(nextPage);
    } catch (error) {
      console.error("Question delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const closeFormModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
  };

  const getDifficultyClass = (value) => {
    return `difficulty-badge ${value || "medium"}`;
  };

  return (
    <div className="questions-page">
      <div className="questions-header">
        <div>
          <button type="button" className="questions-dashboard-btn" onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            <span>Dashboard</span>
          </button>

          <span className="questions-eyebrow">CONTENT MANAGEMENT</span>
          <h1>Questions Management</h1>
          <p>Create, organize and manage your placement preparation questions.</p>
        </div>

        <button className="question-primary-btn" onClick={openAddModal}>
          <Plus size={19} />
          Add Question
        </button>
      </div>

      <div className="questions-stats">
        <div className="question-stat-card">
          <div className="question-stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Total Questions</span>
            <h3>{pagination.total}</h3>
          </div>
        </div>

        <div className="question-stat-card">
          <div className="question-stat-icon blue">
            <Filter size={22} />
          </div>
          <div>
            <span>Current Page</span>
            <h3>{pagination.page} / {Math.max(pagination.totalPages, 1)}</h3>
          </div>
        </div>

        <div className="question-stat-card">
          <div className="question-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Showing Questions</span>
            <h3>{questions.length}</h3>
          </div>
        </div>
      </div>

      <div className="questions-content">
        <div className="questions-toolbar">
          <div className="questions-search">
            <Search size={19} />
            <input type="text" placeholder="Search by topic..." value={search} onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>

          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Filter by difficulty"
          >
            <option value="">All Difficulties</option>
            {difficulties.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>

          <button className="questions-refresh-btn" onClick={() => fetchQuestions(1)} disabled={loading} title="Refresh questions"
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </div>

        <div className="questions-table-heading">
          <div>
            <h2>Question Library</h2>
            <p>Manage all active questions from one place.</p>
          </div>
          <span>{pagination.total} questions</span>
        </div>

        <div className="questions-table-wrap">
          <table className="questions-table">
            <thead>
              <tr>
                <th>QUESTION</th>
                <th>CATEGORY</th>
                <th>TOPIC</th>
                <th>DIFFICULTY</th>
                <th>OPTIONS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="questions-state-cell">
                    <LoaderCircle className="spin" size={30} />
                    <span>Loading questions...</span>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="questions-state-cell">
                    <AlertCircle size={30} />
                    <span>No questions found.</span>
                    <small>Try changing your filters or add a new question.</small>
                  </td>
                </tr>
              ) : (
                questions.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="question-table-text">
                        {item.question}
                      </div>
                    </td>
                    <td>
                      <span className="question-category-badge">
                        {item.category}
                      </span>
                    </td>
                    <td>{item.topic}</td>
                    <td>
                      <span className={getDifficultyClass(item.difficulty)}>
                        {item.difficulty || "medium"}
                      </span>
                    </td>
                    <td>{item.options?.length || 0} options</td>
                    <td>
                      <div className="question-actions">
                        <button className="view" title="View question" onClick={() => openViewModal(item._id)}
                        >
                          <Eye size={17} />
                        </button>
                        <button className="edit" title="Edit question" onClick={() => openEditModal(item._id)} >
                          <Pencil size={17} />
                        </button>
                        <button className="delete" title="Deactivate question" disabled={deletingId === item._id} onClick={() => handleDelete(item._id)}
                        >
                          {deletingId === item._id ? (
                            <LoaderCircle size={17} className="spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="questions-pagination">
          <span>
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </span>

          <div>
            <button disabled={loading || pagination.page <= 1} onClick={() => fetchQuestions(pagination.page - 1)}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              disabled={
                loading ||
                pagination.page >= pagination.totalPages
              }
              onClick={() => fetchQuestions(pagination.page + 1)}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="question-modal-overlay" onMouseDown={closeFormModal}>
          <div
            className="question-modal question-form-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="question-modal-header">
              <div>
                <span>QUESTION LIBRARY</span>
                <h2>{editingId ? "Edit Question" : "Add New Question"}</h2>
              </div>
              <button type="button" onClick={closeFormModal} disabled={saving} aria-label="Close">
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="question-form-body">
                <div className="question-form-group full">
                  <label>Question <span>*</span></label>
                  <textarea rows="3" placeholder="Enter your question..." value={form.question} onChange={(event) => updateField("question", event.target.value)} required
                  />
                </div>

                <div className="question-form-grid">
                  <div className="question-form-group">
                    <label>Category <span>*</span></label>
                    <select value={form.category} onChange={(event) => updateField("category", event.target.value)
                      }
                    >
                      {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="question-form-group">
                    <label>Difficulty <span>*</span></label>
                    <select value={form.difficulty} onChange={(event) =>
                        updateField("difficulty", event.target.value)
                      }
                    >
                      {difficulties.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="question-form-group">
                    <label>Topic <span>*</span></label>
                    <input type="text" placeholder="e.g. Percentage" value={form.topic}
                      onChange={(event) =>
                        updateField("topic", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="question-form-group">
                    <label>Company</label>
                    <input type="text" placeholder="e.g. TCS, Infosys" value={form.company}
                      onChange={(event) =>
                        updateField("company", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="question-options-heading">
                  <div>
                    <h3>Answer Options</h3>
                    <p>Select the radio button for the correct answer.</p>
                  </div>
                  <span>{form.options.length}/6</span>
                </div>

                <div className="question-option-list">
                  {form.options.map((option, index) => (
                    <div
                      className={`question-option-row ${option.isCorrect ? "correct" : ""}`}
                      key={index}
                    >
                      <label className="correct-radio" title="Mark as correct">
                        <input type="radio" name="correctOption" checked={option.isCorrect}
                          onChange={() =>
                            updateOption(index, "isCorrect", true)
                          }
                        />
                        <span>{String.fromCharCode(65 + index)}</span>
                      </label>

                      <input type="text" placeholder={`Option ${index + 1}`} value={option.text}
                        onChange={(event) =>
                          updateOption(index, "text", event.target.value)
                        }
                      />

                      {option.isCorrect && (
                        <span className="correct-answer-label">Correct</span>
                      )}

                      <button type="button" className="remove-option-btn" disabled={form.options.length <= 2}
                        onClick={() => removeOption(index)}
                        title="Remove option"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="add-option-btn" onClick={addOption} disabled={form.options.length >= 6}
                >
                  <Plus size={16} /> Add Option
                </button>

                <div className="question-form-group full">
                  <label>Explanation</label>
                  <textare rows="3" placeholder="Explain why the correct answer is right..." value={form.explanation}
                    onChange={(event) =>
                      updateField("explanation", event.target.value)
                    }
                  />
                </div>

                <div className="question-form-group full">
                  <label>Tags</label>
                  <div className="question-tag-input">
                    <input type="text" placeholder="Enter a tag and press Add" value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button type="button" onClick={addTag}>
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  <div className="question-tags-list">
                    {form.tags.map((tag) => (
                      <span key={tag}>
                        <Tag size={13} /> {tag}
                        <button type="button" onClick={() => removeTag(tag)}
                          aria-label={`Remove ${tag}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="question-modal-footer">
                <button  type="button"  className="question-cancel-btn" onClick={closeFormModal} disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="question-save-btn" disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={17} />
                      {editingId ? "Update Question" : "Save Question"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && selectedQuestion && (
        <div
          className="question-modal-overlay"
          onMouseDown={() => setViewModalOpen(false)}
        >
          <div
            className="question-modal question-view-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="question-modal-header">
              <div>
                <span>QUESTION DETAILS</span>
                <h2>View Question</h2>
              </div>
              <button onClick={() => setViewModalOpen(false)} aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="question-view-body">
              <div className="question-view-meta">
                <span className="question-category-badge">
                  {selectedQuestion.category}
                </span>
                <span className={getDifficultyClass(selectedQuestion.difficulty)}>
                  {selectedQuestion.difficulty}
                </span>
                <span>{selectedQuestion.topic}</span>
              </div>

              <h3>{selectedQuestion.question}</h3>

              <div className="question-view-options">
                {selectedQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    className={option.isCorrect ? "correct" : ""}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <p>{option.text}</p>
                    {option.isCorrect && (
                      <CheckCircle size={18} />
                    )}
                  </div>
                ))}
              </div>

              {selectedQuestion.explanation && (
                <div className="question-view-explanation">
                  <strong>Explanation</strong>
                  <p>{selectedQuestion.explanation}</p>
                </div>
              )}

              {selectedQuestion.company && (
                <p className="question-view-company">
                  <strong>Company:</strong> {selectedQuestion.company}
                </p>
              )}

              {selectedQuestion.tags?.length > 0 && (
                <div className="question-tags-list">
                  {selectedQuestion.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="question-modal-footer">
              <button className="question-cancel-btn" onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
              <button className="question-save-btn" onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(selectedQuestion._id);
                }}
              >
                <Pencil size={16} /> Edit Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Questions;
