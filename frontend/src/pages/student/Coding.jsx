
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  Search,
  CheckCircle2,
  Clock3,
  Filter,
} from "lucide-react";

import codingService from "../../services/codingService";
import "./Coding.css";

function Coding() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (difficulty !== "All") {
          params.difficulty = difficulty.toLowerCase();
        }

        const data = await codingService.getCodingQuestions(params);

        setQuestions(data.questions || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load coding questions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [search, difficulty]);

  return (
    <div className="coding-page">
      <header className="coding-header">
        <div>
          <span className="coding-eyebrow">
            PLACEMENT PREPARATION
          </span>

          <h1>Coding Practice</h1>

          <p>
            Improve your problem-solving skills with coding challenges.
          </p>
        </div>

        <div className="coding-header-icon">
          <Code2 size={34} />
        </div>
      </header>

      <section className="coding-stats">
        <div className="coding-stat-card">
          <Code2 size={22} />

          <div>
            <strong>{questions.length}</strong>
            <span>Available Questions</span>
          </div>
        </div>

        <div className="coding-stat-card">
          <CheckCircle2 size={22} />

          <div>
            <strong>0</strong>
            <span>Solved Questions</span>
          </div>
        </div>

        <div className="coding-stat-card">
          <Clock3 size={22} />

          <div>
            <strong>3</strong>
            <span>Difficulty Levels</span>
          </div>
        </div>
      </section>

      <section className="coding-content">
        <div className="coding-section-heading">
          <div>
            <h2>Practice Questions</h2>
            <p>Choose a problem and start practising.</p>
          </div>

          <Filter size={21} />
        </div>

        <div className="coding-filters">
          <div className="coding-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="coding-question-list">
          {loading ? (
            <div className="coding-empty">
              <p>Loading coding questions...</p>
            </div>
          ) : error ? (
            <div className="coding-empty">
              <h3>Unable to Load Questions</h3>
              <p>{error}</p>
            </div>
          ) : questions.length > 0 ? (
            questions.map((question) => (
              <article
                className="coding-question-card"
                key={question._id}
              >
                <div className="coding-question-main">
                  <div className="coding-question-icon">
                    <Code2 size={21} />
                  </div>

                  <div className="coding-question-info">
                    <h3>{question.title}</h3>

                    <p>{question.description}</p>

                    <span className="coding-topic">
                      {question.category}
                    </span>
                  </div>
                </div>

                <div className="coding-question-action">
                  <span
                    className={`coding-difficulty ${question.difficulty}`}
                  >
                    {question.difficulty}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/student/coding/${question._id}`)
                    }
                  >
                    Solve Problem
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="coding-empty">
              <Search size={30} />

              <h3>No Questions Found</h3>

              <p>Try another search term or difficulty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Coding;
