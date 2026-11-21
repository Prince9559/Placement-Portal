
import { useState } from "react";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BriefcaseBusiness,
  Users,
  Code2,
} from "lucide-react";
import "./Interview.css";

const interviewTopics = [
  {
    id: 1,
    category: "HR Interview",
    icon: Users,
    questions: [
      {
        question: "Tell me about yourself.",
        answer:
          "Introduce yourself briefly. Explain your education, technical skills, projects and career goals. Keep your answer clear and relevant to the job.",
      },
      {
        question: "What are your strengths?",
        answer:
          "Mention strengths relevant to the role, such as problem-solving, teamwork, communication and willingness to learn. Support your answer with a short example.",
      },
      {
        question: "Why should we hire you?",
        answer:
          "Explain how your skills, projects, learning attitude and dedication can contribute to the company and the role.",
      },
    ],
  },
  {
    id: 2,
    category: "Technical Interview",
    icon: Code2,
    questions: [
      {
        question: "What is the difference between let, const and var?",
        answer:
          "var is function-scoped, while let and const are block-scoped. A let variable can be reassigned, but a const variable cannot be reassigned.",
      },
      {
        question: "What is Object-Oriented Programming?",
        answer:
          "Object-Oriented Programming is a programming approach based on objects and classes. Its main concepts include encapsulation, inheritance, polymorphism and abstraction.",
      },
      {
        question: "What is the difference between SQL and NoSQL?",
        answer:
          "SQL databases generally store structured data in tables. NoSQL databases support flexible data models such as documents, key-value pairs and graphs.",
      },
    ],
  },
  {
    id: 3,
    category: "Group Discussion",
    icon: BriefcaseBusiness,
    questions: [
      {
        question: "How do you start a group discussion?",
        answer:
          "Understand the topic, introduce the main idea clearly and support your opening point with a relevant example or fact.",
      },
      {
        question: "How should you handle disagreement?",
        answer:
          "Listen carefully, respect other opinions and explain your point politely with logical reasons. Avoid interrupting others.",
      },
    ],
  },
];

function Interview() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openQuestion, setOpenQuestion] = useState(null);

  const visibleTopics =
    activeCategory === "All"
      ? interviewTopics
      : interviewTopics.filter(
          (topic) => topic.category === activeCategory
        );

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  return (
    <div className="interview-page">
      <header className="interview-header">
        <div>
          <span className="interview-eyebrow">CAREER DEVELOPMENT</span>
          <h1>Interview Preparation</h1>
          <p>Prepare confidently for HR, technical and group discussions.</p>
        </div>

        <div className="interview-header-icon">
          <MessageSquare size={34} />
        </div>
      </header>

      <section className="interview-welcome">
        <h2>Prepare. Practise. Succeed.</h2>
        <p>
          Explore common interview questions and learn how to structure
          your answers.
        </p>
      </section>

      <section className="interview-content">
        <div className="interview-section-heading">
          <div>
            <h2>Interview Questions</h2>
            <p>Select a category to explore questions and answers.</p>
          </div>
        </div>

        <div className="interview-tabs">
          <button
            className={activeCategory === "All" ? "active" : ""}
            onClick={() => {
              setActiveCategory("All");
              setOpenQuestion(null);
            }}
          >
            All Topics
          </button>

          {interviewTopics.map((topic) => (
            <button
              key={topic.id}
              className={
                activeCategory === topic.category ? "active" : ""
              }
              onClick={() => {
                setActiveCategory(topic.category);
                setOpenQuestion(null);
              }}
            >
              {topic.category}
            </button>
          ))}
        </div>

        <div className="interview-topic-list">
          {visibleTopics.map((topic) => {
            const TopicIcon = topic.icon;

            return (
              <article className="interview-topic-card" key={topic.id}>
                <div className="interview-topic-heading">
                  <div className="interview-topic-icon">
                    <TopicIcon size={21} />
                  </div>
                  <div>
                    <h3>{topic.category}</h3>
                    <span>{topic.questions.length} Questions</span>
                  </div>
                </div>

                <div className="interview-question-list">
                  {topic.questions.map((item, index) => {
                    const questionId = `${topic.id}-${index}`;
                    const isOpen = openQuestion === questionId;

                    return (
                      <div
                        className="interview-question"
                        key={questionId}
                      >
                        <button
                          className="interview-question-toggle"
                          onClick={() => toggleQuestion(questionId)}
                        >
                          <span>{item.question}</span>
                          {isOpen ? (
                            <ChevronUp size={19} />
                          ) : (
                            <ChevronDown size={19} />
                          )}
                        </button>

                        {isOpen && (
                          <div className="interview-answer">
                            <strong>Suggested Answer</strong>
                            <p>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Interview;
