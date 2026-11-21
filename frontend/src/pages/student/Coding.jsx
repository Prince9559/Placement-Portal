
import { useMemo, useState } from "react";
import {
  Code2,
  Search,
  CheckCircle2,
  Clock3,
  Filter,
} from "lucide-react";
import "./Coding.css";

const codingQuestions = [
  {
    id: 1,
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "Easy",
    description: "Find two numbers in an array whose sum equals a target.",
  },
  {
    id: 2,
    title: "Reverse a String",
    topic: "Strings",
    difficulty: "Easy",
    description: "Reverse the given string without using a built-in reverse method.",
  },
  {
    id: 3,
    title: "Valid Parentheses",
    topic: "Stack",
    difficulty: "Medium",
    description: "Check whether the brackets in a string are balanced.",
  },
  {
    id: 4,
    title: "Binary Search",
    topic: "Searching",
    difficulty: "Medium",
    description: "Find the position of a target element in a sorted array.",
  },
  {
    id: 5,
    title: "Longest Substring",
    topic: "Strings",
    difficulty: "Hard",
    description: "Find the longest substring without repeating characters.",
  },
];

function Coding() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const filteredQuestions = useMemo(() => {
    return codingQuestions.filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(search.toLowerCase()) ||
        question.topic.toLowerCase().includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" || question.difficulty === difficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [search, difficulty]);

  return (
    <div className="coding-page">
      <header className="coding-header">
        <div>
          <span className="coding-eyebrow">PLACEMENT PREPARATION</span>
          <h1>Coding Practice</h1>
          <p>Improve your problem-solving skills with coding challenges.</p>
        </div>
        <div className="coding-header-icon">
          <Code2 size={34} />
        </div>
      </header>

      <section className="coding-stats">
        <div className="coding-stat-card">
          <Code2 size={22} />
          <div>
            <strong>{codingQuestions.length}</strong>
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
              placeholder="Search questions or topics..."
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
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <article className="coding-question-card" key={question.id}>
                <div className="coding-question-main">
                  <div className="coding-question-icon">
                    <Code2 size={21} />
                  </div>

                  <div className="coding-question-info">
                    <h3>{question.title}</h3>
                    <p>{question.description}</p>
                    <span className="coding-topic">{question.topic}</span>
                  </div>
                </div>

                <div className="coding-question-action">
                  <span
                    className={`coding-difficulty ${question.difficulty.toLowerCase()}`}
                  >
                    {question.difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Coding editor backend abhi connect nahi hua hai.")
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
              <h3>No questions found</h3>
              <p>Try another search term or difficulty.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Coding;
