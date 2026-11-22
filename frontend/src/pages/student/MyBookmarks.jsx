
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Search,
  Trash2,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import bookmarkService from "../../services/bookmarkService";
import "./MyBookmarks.css";

function MyBookmarks() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookmarkService.getMyBookmarks();

      const list =
        response.bookmarks ||
        response.data?.bookmarks ||
        response.data ||
        [];

      setBookmarks(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Bookmarks load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const getQuestion = (item) => item.question || item;

  const getQuestionId = (item) => {
    const question = getQuestion(item);
    return question?._id || item.questionId || item._id;
  };

  const filteredBookmarks = bookmarks.filter((item) => {
    const question = getQuestion(item);
    const text = [
      question?.question,
      question?.category,
      question?.difficulty,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const handleRemove = async (item) => {
    const questionId = getQuestionId(item);
    if (!questionId) {
      toast.error("Question ID nahi mila.");
      return;
    }

    try {
      setRemovingId(questionId);
      await bookmarkService.removeBookmark(questionId);
      setBookmarks((previous) =>
        previous.filter((bookmark) => getQuestionId(bookmark) !== questionId)
      );
      toast.success("Bookmark removed successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Bookmark remove nahi hua."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bookmarks-page">
      <header className="bookmarks-topbar">
        <button className="bookmark-back-btn" onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="bookmark-brand">
          <span className="bookmark-brand-icon">
            <Bookmark size={19} />
          </span>
          Placement Portal
        </div>
      </header>

      <main className="bookmarks-container">
        <section className="bookmarks-heading">
          <div>
            <span className="bookmark-eyebrow">YOUR PERSONAL COLLECTION</span>
            <h1>My Bookmarks</h1>
            <p>Save important questions and revise them whenever you want.</p>
          </div>

          <div className="bookmark-count-card">
            <Bookmark size={22} />
            <div>
              <strong>{bookmarks.length}</strong>
              <span>Saved Questions</span>
            </div>
          </div>
        </section>

        <section className="bookmark-toolbar">
          <div className="bookmark-search">
            <Search size={19} />
            <input type="text" placeholder="Search your saved questions..." value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button className="bookmark-refresh-btn" onClick={loadBookmarks} disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "bookmark-spinning" : ""} />
            Refresh
          </button>
        </section>

        {loading ? (
          <div className="bookmark-state">
            <span className="bookmark-loader"></span>
            <h3>Loading bookmarks...</h3>
            <p>Please wait while we fetch your saved questions.</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bookmark-empty">
            <div className="bookmark-empty-icon">
              {search ? <Search size={30} /> : <Bookmark size={30} />}
            </div>
            <h2>{search ? "No matching questions" : "No bookmarks yet"}</h2>
            <p>
              {search
                ? "Try another search term."
                : "Questions you bookmark during practice will appear here."}
            </p>
            {!search && (
              <button onClick={() => navigate("/student/tests")}>
                <BookOpen size={17} />
                Explore Practice Tests
              </button>
            )}
          </div>
        ) : (
          <section className="bookmark-list">
            <div className="bookmark-list-heading">
              <div>
                <h2>Saved Questions</h2>
                <p>{filteredBookmarks.length} questions found</p>
              </div>
            </div>

            {filteredBookmarks.map((item) => {
              const question = getQuestion(item);
              const questionId = getQuestionId(item);

              return (
                <article className="bookmark-card" key={questionId}>
                  <div className="bookmark-card-icon">
                    <Bookmark size={20} />
                  </div>

                  <div className="bookmark-card-content">
                    <div className="bookmark-tags">
                      {question?.category && (
                        <span className="bookmark-category">
                          {question.category}
                        </span>
                      )}
                      {question?.difficulty && (
                        <span className="bookmark-difficulty">
                          {question.difficulty}
                        </span>
                      )}
                    </div>

                    <h3>{question?.question || "Question details unavailable"}</h3>

                    {Array.isArray(question?.options) &&
                      question.options.length > 0 && (
                        <div className="bookmark-options">
                          {question.options.map((option, index) => (
                            <div className="bookmark-option" key={index}>
                              <span>{String.fromCharCode(65 + index)}</span>
                              {typeof option === "string"
                                ? option
                                : option.text || option.option || ""}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  <button className="bookmark-remove-btn" onClick={() => handleRemove(item)} disabled={removingId === questionId} title="Remove bookmark"
                  >
                    <Trash2 size={17} />
                    {removingId === questionId ? "Removing..." : "Remove"}
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyBookmarks;
