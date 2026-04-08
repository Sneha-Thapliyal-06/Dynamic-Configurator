import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Layers, Plus, X, ArrowLeft, ArrowRight, Pencil, Trash2, CircleQuestionMark } from "lucide-react"; 
import axios from "axios";
import "./ScreenGroups.css";

export default function ScreenGroups() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);


  const loggedInUserId = Number(localStorage.getItem("userId")) || 4;

  const initialFormState = {
    sysID: 0,
    screenId: 0, 
    sequence: "",
    colspan: "2",
    heading: "",
    groupType: "DataTable",
    groupIcon: "",
    groupTable: "",
    groupViewTable: "",
    query: "",
    linkButton: "",
    insertQuery: "",
    updateQuery: "",
    deleteQuery: "",
    status: "A", 
    isMain: "No", 
    userId: loggedInUserId,
    mode: "A",
    model: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {

    const savedScreenId = localStorage.getItem("currentScreenId");
    if (savedScreenId) {
      const sId = Number(savedScreenId);
      setFormData(prev => ({ ...prev, screenId: sId }));
      fetchGroups(sId);
    }
  }, []);

  const fetchGroups = async (currentScreenId) => {
    try {
      setLoading(true);

      const response = await axios.get(`https://services.rs-apps.online/DynamicConfig/api/groups`);
      const allData = Array.isArray(response.data) ? response.data : [];
      

      const filtered = allData.filter(g => Number(g.screenId) === currentScreenId);
      setGroups(filtered);
    } catch (error) {
      console.error("Fetch Error:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (group) => {

    setFormData({ 
      ...group, 
      mode: "E", 
      model: group.heading,
      userId: loggedInUserId,
      isMain: group.isMain === true || group.isMain === "Yes" ? "Yes" : "No"
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (group) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${group.heading}"?`);
    if (confirmDelete) {
      try {
        const payload = { 
          ...group, 
          mode: "D", 
          model: group.heading, 
          sysID: Number(group.sysID || group.sysId),
          userId: loggedInUserId 
        };
        await axios.post("https://services.rs-apps.online/DynamicConfig/api/groups/manage", payload);
        fetchGroups(formData.screenId);
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  const handleSaveAPI = async () => {
    if (!formData.heading || !formData.sequence || !formData.groupTable) {
      alert("Required fields: Heading, Sequence, and Group Table");
      return;
    }

    setLoading(true);
    try {
      const isNewRecord = Number(formData.sysID || formData.sysId || 0) === 0;
      
      const payload = {
        ...formData,
        sysID: Number(formData.sysID || formData.sysId || 0),
        screenId: Number(formData.screenId),
        userId: loggedInUserId,
        mode: isNewRecord ? "A" : "E",
        model: formData.heading,
        isMain: formData.isMain === "Yes",
        status: formData.status || "A"
      };

      const response = await axios.post("https://services.rs-apps.online/DynamicConfig/api/groups/manage", payload);
      
      if (response.status === 200 || response.status === 201) {
        fetchGroups(formData.screenId);
        setShowForm(false);
        setFormData({ ...initialFormState, screenId: payload.screenId });
      }
    } catch (error) {
      console.error("Save Error:", error.response?.data);
      alert(error.response?.data || "Failed to save group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <Navigation activePage="screen" />
      <div className="main-content-wrapper figma-layout">
        
        <div className="master-header">
          <div>
            <div className="master-title">Create New Screen</div>
            <div className="master-subtitle">Step 2 of 4: Screen Groups</div>
          </div>
          <div className="cancel-btn" onClick={() => navigate("/screen-config")}><X size={18} /> Cancel</div>
        </div>

        <div className="stepper-card">
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Screen Master</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper done"><div className="step-circle">2</div><div className="step-label">Screen Groups</div></div>
          <div className="step-line"></div>
          <div className="step-wrapper"><div className="step-circle">3</div><div className="step-label">Fields Configuration</div></div>
          <div className="step-line"></div>
          <div className="step-wrapper"><div className="step-circle">4</div><div className="step-label">Field Validations</div></div>
        </div>

        <div className="form-container wide-card">
          <div className="groups-header-row">
            <div className="groups-title-box">
              <div className="title-with-icon"><Layers size={22} className="blue-icon" /><span>Screen Groups</span></div>
              <p className="subtitle-text">Groups help organize your fields into logical sections</p>
              {groups.length > 0 && <p className="groups-count-text">{groups.length} groups created</p>}
            </div>
            {!showForm && (
              <button className="add-group-btn" onClick={() => { setFormData({...initialFormState, screenId: formData.screenId, mode: "A"}); setShowForm(true); }}>
                <Plus size={16} /> Add Group
              </button>
            )}
          </div>

          {showForm ? (
            <div className="group-form-wrapper">
              <div className="form-inner-header">
                <span className="add-label">{formData.mode === "E" ? <Pencil size={18} /> : <Plus size={18} />} {formData.mode === "E" ? "Edit Group" : "Add New Group"}</span>
                <span className="req-indicator">* Required fields</span>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Heading <span className="req">*</span></label>
                  <input name="heading" value={formData.heading} onChange={handleInputChange} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Sequence <span className="req">*</span></label>
                  <input name="sequence" value={formData.sequence} onChange={handleInputChange} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Colspan <span className="req">*</span></label>
                  <select name="colspan" value={formData.colspan} onChange={handleInputChange}>
                    <option value="2">2</option><option value="3">3</option><option value="4">4</option>
                  </select>
                </div>
              </div>

              <div className="grid-3 mt-2">
                <div className="form-group">
                  <label>Group Type <span className="req">*</span></label>
                  <select name="groupType" value={formData.groupType} onChange={handleInputChange}>
                    <option value="DataTable">DataTable</option><option value="Form">Form</option><option value="DataView">DataView</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Group Table <span className="req">*</span></label>
                  <input name="groupTable" value={formData.groupTable} onChange={handleInputChange} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Group View Table</label>
                  <input name="groupViewTable" value={formData.groupViewTable} onChange={handleInputChange} autoComplete="off" />
                </div>
              </div>

              <div className="grid-3 mt-2">
                <div className="form-group"><label>Group Icon</label><input name="groupIcon" value={formData.groupIcon} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Link Button</label><input name="linkButton" value={formData.linkButton} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Select Query</label><input name="query" value={formData.query} onChange={handleInputChange} /></div>
              </div>

              <div className="grid-3 mt-2">
                <div className="form-group"><label>Insert Query</label><input name="insertQuery" value={formData.insertQuery} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Update Query</label><input name="updateQuery" value={formData.updateQuery} onChange={handleInputChange} /></div>
                <div className="form-group"><label>Delete Query</label><input name="deleteQuery" value={formData.deleteQuery} onChange={handleInputChange} /></div>
              </div>

              <div className="grid-3 mt-2">
                <div className="form-group">
                  <label>Status</label>
                  <input name="status" placeholder="eg:- A" value={formData.status} onChange={handleInputChange} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Is Main Group? <span className="req">*</span></label>
                  <select name="isMain" value={formData.isMain} onChange={handleInputChange}>
                    <option value="No">No</option><option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-btns">
                <button className="btn-cancel-figma" onClick={() => setShowForm(false)} disabled={loading}><X size={16} /> Cancel</button>
                <button className="btn-save-figma" onClick={handleSaveAPI} disabled={loading}>{loading ? "Saving..." : "Save Group"}</button>
              </div>
            </div>
          ) : (
            <div className="groups-list-area">
              {loading ? (
                <div className="loading-state">Loading screen groups...</div>
              ) : groups.length > 0 ? (
                <>
                  <div className="your-groups-subheader">
                    <span>Your Groups</span>
                    <span className="total-indicator">{groups.length} total</span>
                  </div>
                  <div className="list-container">
                    {groups.map((item, idx) => (
                      <div key={idx} className="group-detail-card">
                        <div className="card-left">
                          <div className="seq-circle">{idx + 1}</div>
                          <div className="card-info">
                            <div className="card-title-row">
                              <span className="card-heading">{item.heading}</span>
                              <span className="badge-type">{item.groupType}</span>
                              <span className="badge-layout">{item.colspan} Col</span>
                            </div>
                            <div className="card-table-info">Table: <span className="table-name">{item.groupTable}</span></div>
                          </div>
                        </div>
                        <div className="card-right-actions">
                          <button className="action-btn edit-btn" onClick={() => handleEdit(item)}><Pencil size={18} /></button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(item)}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ready-msg-inline">
                    <CircleQuestionMark size={20} className="ready-icon-green" />
                    <span>Ready for the next step! You have <b>{groups.length} groups</b> configured. Click "Next" to add fields to your groups.</span>
                  </div>
                </>
              ) : (
                <div className="empty-state-card figma-style">
                   <Layers size={64} color="#94a3b8" strokeWidth={1} />
                   <h4 className="no-groups-title">No groups yet for this screen</h4>
                   <button className="create-first-btn" onClick={() => setShowForm(true)}><Plus size={18} /> Create First Group</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="master-footer">
          <button className="btn-back-figma" onClick={() => navigate("/screen-master")}><ArrowLeft size={16} /> Back</button>
          <button className="btn-next-figma" onClick={() => navigate("/field-config")}>Next <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}