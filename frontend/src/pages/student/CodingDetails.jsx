
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Code2, Lightbulb, Clock3 } from "lucide-react";
import codingService from "../../services/codingService";
import "./CodingDetails.css";

function CodingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await codingService.getCodingQuestionById(id);
        setQuestion(data.question);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Question details load nahi ho paye."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  if (loading) {
    return <div className="coding-details-page">Loading question...</div>;
  }

  if (error || !question) {
    return (
      <div className="coding-details-page">
        <button onClick={() => navigate("/student/coding")}>
          <ArrowLeft size={17} /> Back to Coding Practice
        </button>
        <p>{error || "Question not found."}</p>
      </div>
    );
  }

  return (
    <div className="coding-details-page">
      <button className="coding-back-btn" onClick={() => navigate("/student/coding")}
      >
        <ArrowLeft size={18} /> Back to Coding Practice
      </button>

      <div className="coding-details-card">
        <div className="coding-details-heading">
          <div>
            <span className="coding-details-category">
              {question.category}
            </span>
            <h1>{question.title}</h1>
          </div>

          <span className={`coding-difficulty ${question.difficulty}`}>
            {question.difficulty}
          </span>
        </div>

        <section className="coding-details-section">
          <h2><Code2 size={20} /> Problem Description</h2>
          <p>{question.description}</p>
        </section>

        {question.constraints?.length > 0 && (
          <section className="coding-details-section">
            <h2>Constraints</h2>
            <ul>
              {question.constraints.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {question.inputFormat && (
          <section className="coding-details-section">
            <h2>Input Format</h2>
            <p>{question.inputFormat}</p>
          </section>
        )}

        {question.outputFormat && (
          <section className="coding-details-section">
            <h2>Output Format</h2>
            <p>{question.outputFormat}</p>
          </section>
        )}

        {question.sampleTestCases?.length > 0 && (
          <section className="coding-details-section">
            <h2>Sample Test Cases</h2>

            {question.sampleTestCases.map((testCase, index) => (
              <div className="coding-sample-case" key={index}>
                <h3>Example {index + 1}</h3>
                <p><strong>Input:</strong> {testCase.input}</p>
                <p><strong>Output:</strong> {testCase.output}</p>
                {testCase.explanation && (
                  <p><strong>Explanation:</strong> {testCase.explanation}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {question.hints?.length > 0 && (
          <section className="coding-details-section">
            <h2><Lightbulb size={20} /> Hints</h2>
            <ul>
              {question.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="coding-details-limits">
          <span><Clock3 size={17} /> Time Limit: {question.timeLimit} ms</span>
          <span>Memory Limit: {question.memoryLimit} MB</span>
        </div>
      </div>
    </div>
  );
}

export default CodingDetails;
