
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Download,
  GraduationCap,
  Filter,
  ArrowLeft,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import materialService from "../../services/materialService";
import "./StudyMaterial.css";

const categories = [
  "all",
  "aptitude",
  "reasoning",
  "verbal",
  "technical",
  "programming",
  "interview",
  "resume",
  "other",
];

function StudyMaterials() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const fetchMaterials = useCallback(async (refresh = false) =>    {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await materialService.getMaterials();

      setMaterials(
        Array.isArray(response.materials)
          ? response.materials
          : Array.isArray(response.data?.materials)
          ? response.data.materials
          : Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Study materials error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to load study materials."
      );
      setMaterials([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const filteredMaterials = useMemo(() => {
    const term = search.trim().toLowerCase();

    return materials.filter((item) => {
      const title = item.title || "";
      const description = item.description || "";
      const itemCategory = item.category || "";

      const matchesSearch = `${title} ${description} ${itemCategory}`
        .toLowerCase()
        .includes(term);

      const matchesCategory =
        category === "all" ||
        itemCategory.toLowerCase() === category;

      return matchesSearch && matchesCategory;
    });
  }, [materials, search, category]);

  const formatLabel = (value) =>
    value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : "General";

  const getMaterialType = (item) => {
    const type = (item.type || "").toLowerCase();

    if (type === "video") return "Video";
    if (type === "link") return "External Link";
    if (type === "pdf") return "PDF Document";
    if (type === "document") return "Document";

    return "Study Resource";
  };

  const getMaterialIcon = (item) => {
    const type = (item.type || "").toLowerCase();

    if (type === "video") return <Video size={22} />;
    if (type === "link") return <ExternalLink size={22} />;

    return <FileText size={22} />;
  };

  const getMaterialUrl = (item) =>
    item.fileUrl || item.externalUrl || item.url || "";

  const openMaterial = (item) => {
    const url = getMaterialUrl(item);

    if (!url) {
      toast.error("Material link is not available.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadMaterial = (item) => {
    const url = getMaterialUrl(item);

    if (!url) {
      toast.error("Download link is not available.");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = item.title || "study-material";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResourceAction = (item) => {
    const type = (item.type || "").toLowerCase();

    if (type === "pdf" || type === "document") {
      downloadMaterial(item);
    } else {
      openMaterial(item);
    }
  };

  return (
    <main className="study-materials-page">
      <header className="sm-header">
        <div className="sm-header-inner">
          <button
            className="sm-back-btn"
            onClick={() => navigate("/student/dashboard")}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="sm-heading">
            <span>LEARN • PRACTICE • GROW</span>
            <h1>Study Materials</h1>
            <p>
              Explore learning resources and prepare confidently
              for your placement journey.
            </p>
          </div>

          <button
            className="sm-refresh-btn"
            onClick={() => fetchMaterials(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "sm-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <section className="sm-content">
        <div className="sm-overview-card">
          <div className="sm-overview-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <span>YOUR LEARNING LIBRARY</span>
            <h2>{materials.length} Learning Resources</h2>
            <p>
              All your placement preparation resources in one place.
            </p>
          </div>

          <div className="sm-overview-count">
            <BookOpen size={20} />
            <strong>{filteredMaterials.length}</strong>
            <span>Showing</span>
          </div>
        </div>

        <section className="sm-library-panel">
          <div className="sm-library-heading">
            <div>
              <h2>Explore Resources</h2>
              <p>
                Find the right material for your preparation.
              </p>
            </div>
          </div>

          <div className="sm-toolbar">
            <div className="sm-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search by title or keyword..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="sm-filter-label">
              <Filter size={16} />
              Filter by category
            </div>
          </div>

          <div className="sm-category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {formatLabel(item)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="sm-state">
              <RefreshCw className="sm-spin" size={32} />
              <h3>Loading study materials...</h3>
              <p>
                Please wait while we fetch your resources.
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="sm-state">
              <div className="sm-empty-icon">
                <BookOpen size={30} />
              </div>

              <h3>
                {materials.length
                  ? "No matching resources found"
                  : "No study materials available"}
              </h3>

              <p>
                {materials.length
                  ? "Try another search term or category."
                  : "Study resources will appear here when they are published."}
              </p>

              {(search || category !== "all") && (
                <button
                  className="sm-primary-btn"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="sm-grid">
              {filteredMaterials.map((item) => (
                <article className="sm-card" key={item._id}>
                  <div className="sm-card-top">
                    <div
                      className={`sm-card-icon ${(item.type || "other").toLowerCase()}`}
                    >
                      {getMaterialIcon(item)}
                    </div>

                    <span className="sm-type-badge">
                      {getMaterialType(item)}
                    </span>
                  </div>

                  <span className="sm-category-badge">
                    {formatLabel(item.category)}
                  </span>

                  <h3>{item.title || "Untitled Resource"}</h3>

                  <p className="sm-description">
                    {item.description ||
                      "Explore this learning resource."}
                  </p>

                  <div className="sm-card-footer">
                    <button
                      className="sm-details-btn"
                      onClick={() => setSelectedMaterial(item)}
                    >
                      View Details
                    </button>

                    <button
                      className="sm-open-btn"
                      onClick={() => handleResourceAction(item)}
                      aria-label={
                        (item.type || "").toLowerCase() === "pdf" ||
                        (item.type || "").toLowerCase() === "document"
                          ? "Download resource"
                          : "Open resource"
                      }
                    >
                      {(item.type || "").toLowerCase() === "pdf" ||
                      (item.type || "").toLowerCase() === "document" ? (
                        <Download size={17} />
                      ) : (
                        <ExternalLink size={17} />
                      )}

                      {(item.type || "").toLowerCase() === "pdf" ||
                      (item.type || "").toLowerCase() === "document"
                        ? "Download"
                        : "Open"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {selectedMaterial && (
        <div
          className="sm-modal-overlay"
          onClick={() => setSelectedMaterial(null)}
        >
          <section
            className="sm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sm-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="sm-modal-close"
              onClick={() => setSelectedMaterial(null)}
              aria-label="Close details"
            >
              <X size={20} />
            </button>

            <div className="sm-modal-icon">
              {getMaterialIcon(selectedMaterial)}
            </div>

            <span className="sm-category-badge">
              {formatLabel(selectedMaterial.category)}
            </span>

            <h2 id="sm-modal-title">
              {selectedMaterial.title}
            </h2>

            <p className="sm-modal-description">
              {selectedMaterial.description ||
                "No description available."}
            </p>

            <div className="sm-modal-meta">
              <div>
                <span>Resource Type</span>
                <strong>
                  {getMaterialType(selectedMaterial)}
                </strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {formatLabel(selectedMaterial.category)}
                </strong>
              </div>
            </div>

            <button
              className="sm-modal-open-btn"
              onClick={() => handleResourceAction(selectedMaterial)}
            >
              {(selectedMaterial.type || "").toLowerCase() === "pdf" ||
              (selectedMaterial.type || "").toLowerCase() === "document" ? (
                <Download size={17} />
              ) : (
                <ExternalLink size={17} />
              )}

              {(selectedMaterial.type || "").toLowerCase() === "pdf" ||
              (selectedMaterial.type || "").toLowerCase() === "document"
                ? "Download Resource"
                : "Open Learning Resource"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default StudyMaterials;
