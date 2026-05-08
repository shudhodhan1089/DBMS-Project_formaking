import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { apiService } from "../services/api";
import "../styles/AdminScholarships.css";

function AdminScholarships() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_cgpa: "",
    max_income: "",
    category: "General",
    gender: "all",
    hosteller: null,
    amount: "",
    deadline: "",
    is_active: true,
  });

  // Fetch scholarships on mount
  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await apiService.getScholarships();
      setScholarships(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load scholarships. Please try again.");
      console.error("Error fetching scholarships:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter scholarships
  const filteredScholarships = scholarships.filter((s) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!s.name?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filter !== "all" && s.category !== filter) {
      return false;
    }
    return true;
  });

  // Handle scholarship list report generation
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      console.log('Generating scholarship list report...');

      const pdfBlob = await apiService.generateScholarshipListReport();
      const filename = `scholarship-list-report-${new Date().toISOString().split('T')[0]}.pdf`;

      // Download the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Scholarship list report generated successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleEdit = (scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      name: scholarship.name || "",
      description: scholarship.description || "",
      min_cgpa: scholarship.min_cgpa || "",
      max_income: scholarship.max_income || "",
      category: scholarship.category || "General",
      gender: scholarship.gender || "all",
      hosteller: scholarship.hosteller,
      amount: scholarship.amount || "",
      deadline: scholarship.deadline || "",
      is_active: scholarship.is_active ?? true,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      min_cgpa: "",
      max_income: "",
      category: "General",
      gender: "all",
      hosteller: null,
      amount: "",
      deadline: "",
      is_active: true,
    });
    setEditingScholarship(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this scholarship?")) {
      try {
        await apiService.deleteScholarship(id);
        await fetchScholarships();
      } catch (err) {
        alert("Failed to delete scholarship: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScholarship) {
        await apiService.updateScholarship(editingScholarship.scholarship_id, formData);
      } else {
        await apiService.createScholarship(formData);
      }
      setShowAddModal(false);
      resetForm();
      await fetchScholarships();
    } catch (err) {
      alert("Failed to save scholarship: " + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getStatusBadge = (status) => {
    return status === "Active" ? (
      <span className="status-badge active">
        <CheckCircle className="badge-icon" />
        Active
      </span>
    ) : (
      <span className="status-badge inactive">
        <XCircle className="badge-icon" />
        Inactive
      </span>
    );
  };

  const categories = ["all", "SC", "ST", "OBC", "General", "EWS", "NT", "VJ", "SBC"];

  return (
    <div className="admin-scholarships-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Manage Scholarships</h1>
          <p>Add, edit, and manage scholarship programs</p>
        </div>
        <div className="header-buttons" style={{ display: 'flex', gap: '10px' }}>
          <button className="export-btn" onClick={handleGenerateReport} disabled={generatingReport}>
            {generatingReport ? (
              <>
                <Loader2 className="btn-icon loading" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="btn-icon" />
                Generate Report
              </>
            )}
          </button>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <Plus className="btn-icon" />
            Add Scholarship
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={filter === cat ? "active" : ""}
              onClick={() => setFilter(cat)}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <Loader2 className="loading-icon" />
          <p>Loading scholarships...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchScholarships}>Retry</button>
        </div>
      )}

      {/* Scholarships Table */}
      {!loading && !error && (
      <div className="scholarships-table-container">
        <table className="scholarships-table">
          <thead>
            <tr>
              <th>Scholarship Name</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScholarships.map((scholarship) => (
              <tr key={scholarship.scholarship_id}>
                <td>
                  <div className="scholarship-cell">
                    <span className="scholarship-name">{scholarship.name}</span>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{scholarship.category}</span>
                </td>
                <td>
                  <span className="amount">₹{scholarship.amount?.toLocaleString()}</span>
                </td>
                <td>
                  <div className="deadline-cell">
                    <Calendar className="cell-icon" />
                    <span>{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </td>
                <td>{getStatusBadge(scholarship.is_active ? "Active" : "Inactive")}</td>
                <td>
                  <div className="actions-cell">
                    <button
                      className="action-btn view"
                      onClick={() => navigate(`/scholarships/${scholarship.scholarship_id}`)}
                      title="View"
                    >
                      <Eye className="action-icon" />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(scholarship)}
                      title="Edit"
                    >
                      <Edit2 className="action-icon" />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(scholarship.scholarship_id)}
                      title="Delete"
                    >
                      <Trash2 className="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredScholarships.length === 0 && (
          <div className="empty-state">
            <p>No scholarships found</p>
            <button onClick={() => { setSearchQuery(""); setFilter("all"); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingScholarship ? "Edit Scholarship" : "Add New Scholarship"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <X className="close-icon" />
              </button>
            </div>

            <form className="scholarship-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Scholarship Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter scholarship name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General</option>
                    <option value="EWS">EWS</option>
                    <option value="NT">NT</option>
                    <option value="VJ">VJ</option>
                    <option value="SBC">SBC</option>
                    <option value="ALL">ALL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter scholarship amount"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hosteller Only</label>
                  <select
                    name="hosteller"
                    value={formData.hosteller === null ? "" : formData.hosteller}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hosteller: e.target.value === "" ? null : e.target.value === "true"
                    }))}
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Minimum CGPA</label>
                  <input
                    type="number"
                    name="min_cgpa"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.min_cgpa}
                    onChange={handleInputChange}
                    placeholder="e.g., 6.50"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Income (₹)</label>
                  <input
                    type="number"
                    name="max_income"
                    value={formData.max_income}
                    onChange={handleInputChange}
                    placeholder="Annual family income limit"
                    min="0"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter scholarship description"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingScholarship ? "Save Changes" : "Add Scholarship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminScholarships;
