
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {ArrowLeft,BookOpen, Plus, Search, RefreshCw, Eye, Pencil, Trash2,FileText, Video, Link as LinkIcon, File, X, Upload,ChevronLeft, ChevronRight, ExternalLink, LayoutDashboard} from "lucide-react";
import { toast } from "react-toastify";
import materialService from "../../services/materialService";
import "./Materials.css";

const categories = [
  "aptitude", "reasoning", "verbal", "technical",
  "programming", "interview", "resume", "other",
];

const types = ["pdf", "video", "link", "document", "other"];

const emptyForm = {
  title: "",
  description: "",
  category: "aptitude",
  subject: "",
  topic: "",
  materialType: "pdf",
  file: null,
  fileUrl: "",
  thumbnailUrl: "",
  externalUrl: "",
  tags: "",
};

function Materials() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);

      const response = await materialService.getMaterials({
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(category && { category }),
        ...(materialType && { materialType }),
      });

      setMaterials(response.materials || []);
      setPagination(response.pagination || {
        total: 0,
        totalPages: 1,
      });
    } catch (error) {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, materialType]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const updateField = (event) => {
    const { name, value, files } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "file" ? files?.[0] || null : value,
    }));
  };

  const openAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setModal("add");
  };

  const openEdit = async (item) => {
    try {
      const response = await materialService.getMaterialById(item._id);
      const material = response.material;

      setSelected(material);
      setForm({
        title: material.title || "",
        description: material.description || "",
        category: material.category || "aptitude",
        subject: material.subject || "",
        topic: material.topic || "",
        materialType: material.materialType || "pdf",
        file: null,
        fileUrl: material.fileUrl || "",
        thumbnailUrl: material.thumbnailUrl || "",
        externalUrl: material.externalUrl || "",
        tags: (material.tags || []).join(", "),
      });

      setModal("edit");
    } catch (error) {
      
    }
  };

  const openView = async (item) => {
    try {
      const response = await materialService.getMaterialById(item._id);
      setSelected(response.material);
      setModal("view");
    } catch (error) {
      
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.subject.trim()) {
      toast.error("Title aur subject required hain.");
      return;
    }

    if (
      ["pdf", "document"].includes(form.materialType) &&
      !form.file &&
      !form.fileUrl.trim()
    ) {
      toast.error("File upload karo ya file URL do.");
      return;
    }

    if (
      ["video", "link"].includes(form.materialType) &&
      !form.externalUrl.trim()
    ) {
      toast.error("External URL required hai.");
      return;
    }

    const data = new FormData();

    data.append("title", form.title.trim());
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("subject", form.subject.trim());
    data.append("topic", form.topic);
    data.append("materialType", form.materialType);
    data.append("fileUrl", form.fileUrl);
    data.append("thumbnailUrl", form.thumbnailUrl);
    data.append("externalUrl", form.externalUrl);
    data.append(
      "tags",
      JSON.stringify(
        form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      )
    );

    if (form.file) {
      data.append("file", form.file);
    }

    try {
      setSaving(true);

      if (modal === "add") {
        await materialService.createMaterial(data);
        toast.success("Study material successfully add ho gaya.");
      } else {
        await materialService.updateMaterial(selected._id, data);
        toast.success("Study material update ho gaya.");
      }

      setModal("");
      setForm(emptyForm);
      setPage(1);
      await fetchMaterials();
    } catch (error) {
      
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await materialService.deleteMaterial(confirmDelete._id);
      toast.success("Study material deactivate ho gaya.");
      setConfirmDelete(null);
      await fetchMaterials();
    } catch (error) {
      
    }
  };

  const getIcon = (type) => {
    if (type === "pdf") return <FileText size={20} />;
    if (type === "video") return <Video size={20} />;
    if (type === "link") return <LinkIcon size={20} />;
    if (type === "document") return <File size={20} />;
    return <BookOpen size={20} />;
  };

  const closeModal = () => {
    setModal("");
    setSelected(null);
  };

  return (
    <div className="materials-page">
      <div className="materials-header">
        <div className="materials-header-content">
          <div className="materials-title-row">
            <button type="button" className="materials-dashboard-btn" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </button>

            <span className="materials-eyebrow">
              CONTENT MANAGEMENT
            </span>
          </div>

          <h1>Study Materials</h1>
          <p>Manage learning resources for students.</p>
        </div>

        <button className="material-primary-btn" onClick={openAdd}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="materials-summary">
        <div className="material-summary-icon">
          <BookOpen size={23} />
        </div>
        <div>
          <span>Total Materials</span>
          <strong>{pagination.total}</strong>
        </div>
      </div>

      <div className="materials-toolbar">
        <div className="material-search">
          <Search size={18} />
          <input value={search} placeholder="Search title, subject, topic..." onChange={(e) => { setSearch(e.target.value); setPage(1); }}/>
        </div>

        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1);}}>
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select value={materialType} onChange={(e) => { setMaterialType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button className="material-refresh-btn" onClick={fetchMaterials} disabled={loading} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="materials-table-card">
        <div className="materials-table-heading">
          <div>
            <h2>All Study Materials</h2>
            <p>Resources uploaded to the portal</p>
          </div>
          <span>{pagination.total} records</span>
        </div>

        <div className="materials-table-wrap">
          <table className="materials-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Subject / Topic</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="materials-state">
                    Loading materials...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan="6" className="materials-state">
                    <BookOpen size={30} />
                    <strong>No study materials found</strong>
                    <span>Add a new material to get started.</span>
                  </td>
                </tr>
              ) : (
                materials.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="material-name-cell">
                        <div className="material-type-icon">
                          {getIcon(item.materialType)}
                        </div>
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {item.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="material-category">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <strong>{item.subject}</strong>
                      <small>{item.topic || "—"}</small>
                    </td>

                    <td>
                      <span
                        className={`material-type-badge ${item.materialType}`}
                      >
                        {item.materialType}
                      </span>
                    </td>

                    <td>{item.uploadedBy?.name || "Admin"}</td>

                    <td>
                      <div className="material-actions">
                        <button title="View" onClick={() => openView(item)}>
                          <Eye size={17} />
                        </button>

                        <button title="Edit" onClick={() => openEdit(item)}>
                          <Pencil size={17} />
                        </button>

                        <button title="Deactivate" className="material-delete-action" onClick={() => setConfirmDelete(item)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="materials-pagination">
          <span>
            Page {page} of {Math.max(1, pagination.totalPages)}
          </span>

          <div>
            <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={18} /> Previous
            </button>

            <button disabled={page >= pagination.totalPages || loading} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="material-modal-overlay" onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="material-modal">
            <div className="material-modal-header">
              <div>
                <span>CONTENT LIBRARY</span>
                <h2>
                  {modal === "add"
                    ? "Add Study Material"
                    : "Edit Study Material"}
                </h2>
              </div>

              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="material-form-grid">
                <label className="material-form-full">
                  Title *
                  <input name="title" value={form.title} onChange={updateField} placeholder="Enter material title" required/>
                </label>

                <label>
                  Category *
                  <select name="category" value={form.category} onChange={updateField} >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Material Type *
                  <select name="materialType" value={form.materialType} onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        materialType: e.target.value,
                        file: null,
                      }))
                    }
                  >
                    {types.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Subject *
                  <input name="subject" value={form.subject} onChange={updateField} placeholder="e.g. Mathematics" required/>
                </label>

                <label>
                  Topic
                  <input name="topic" value={form.topic} onChange={updateField} placeholder="e.g. Percentage"/>
                </label>

                <label className="material-form-full">
                  Description
                  <textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="Describe this study material..." />
                </label>

                {["pdf", "document"].includes(form.materialType) && (
                  <>
                    <label className="material-form-full">
                      <span>
                        Upload{" "}
                        {form.materialType === "pdf" ? "PDF" : "DOC/DOCX"} file
                        {modal === "edit" ? " (optional)" : ""}
                      </span>

                      <div className="material-file-input">
                        <Upload size={20} />
                        <span>
                          {form.file?.name || "Choose a file"}
                        </span>
                        <input type="file" name="file"
                          accept={
                            form.materialType === "pdf"
                              ? ".pdf,application/pdf"
                              : ".doc,.docx"
                          }
                          onChange={updateField}
                        />
                      </div>
                    </label>

                    <label className="material-form-full">
                      Or existing File URL
                      <input name="fileUrl" value={form.fileUrl} onChange={updateField} placeholder="https://..."/>
                    </label>
                  </>
                )}

                {["video", "link"].includes(form.materialType) && (
                  <label className="material-form-full">
                    External URL *
                    <input name="externalUrl" type="url" value={form.externalUrl} onChange={updateField} placeholder="https://..." required/>
                  </label>
                )}

                <label className="material-form-full">
                  Thumbnail URL
                  <input name="thumbnailUrl" type="url" value={form.thumbnailUrl} onChange={updateField} placeholder="https://..." />
                </label>

                <label className="material-form-full">
                  Tags (comma separated)
                  <input name="tags" value={form.tags} onChange={updateField} placeholder="javascript, basics, placement"/>
                </label>
              </div>

              <div className="material-modal-footer">
                <button type="button" className="material-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>

                <button type="submit" className="material-primary-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : modal === "add"
                    ? "Save Material"
                    : "Update Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selected && (
        <div
          className="material-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="material-modal material-view-modal">
            <div className="material-modal-header">
              <div>
                <span>RESOURCE DETAILS</span>
                <h2>{selected.title}</h2>
              </div>

              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="material-detail-grid">
              <div>
                <span>Category</span>
                <strong>{selected.category}</strong>
              </div>

              <div>
                <span>Type</span>
                <strong>{selected.materialType}</strong>
              </div>

              <div>
                <span>Subject</span>
                <strong>{selected.subject}</strong>
              </div>

              <div>
                <span>Topic</span>
                <strong>{selected.topic || "—"}</strong>
              </div>

              <div className="material-detail-full">
                <span>Description</span>
                <p>
                  {selected.description || "No description provided."}
                </p>
              </div>

              <div className="material-detail-full">
                <span>Tags</span>
                <p>
                  {(selected.tags || []).join(", ") || "No tags"}
                </p>
              </div>

              <div className="material-detail-full">
                <span>Resource link</span>

                {selected.fileUrl || selected.externalUrl ? (
                  <a
                    href={selected.fileUrl || selected.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Material <ExternalLink size={15} />
                  </a>
                ) : (
                  <p>No link available</p>
                )}
              </div>
            </div>

            <div className="material-modal-footer">
              <button
                className="material-cancel-btn"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="material-modal-overlay">
          <div className="material-confirm-modal">
            <div className="material-confirm-icon">
              <Trash2 size={23} />
            </div>

            <h2>Deactivate Material?</h2>

            <p>
              Are you sure you want to deactivate
              <strong> {confirmDelete.title}</strong>?
            </p>

            <div className="material-modal-footer">
              <button className="material-cancel-btn" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>

              <button className="material-danger-btn" onClick={handleDelete}>
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Materials;
