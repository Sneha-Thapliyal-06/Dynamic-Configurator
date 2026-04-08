import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { 
  Type, Plus, ChevronRight, ArrowLeft, ArrowRight, X, 
  AlignLeft, List, Calendar, FileUp, Save, Pencil, 
  Trash2, CircleQuestionMark 
} from "lucide-react";
import axios from "axios";
import "./FieldConfiguration.css";

export default function FieldConfiguration() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [fields, setFields] = useState([]); 
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState([]);

  const initialFieldState = {
    sysId: 0,
    groupId: 0,
    lookUpId: 0,
    isPrimery: "No",
    fkId: "No",
    fieldName: "",
    fieldType: "",
    fieldControl: "TextBox",
    hintText: "",
    labelText: "",
    showInGrid: "Yes",
    showInScreen: "Yes",
    sequence: 1,
    mode: "A"
  };

  const [formData, setFormData] = useState(initialFieldState);

  const controlOptions = [
    { label: "TextBox", desc: "Standard text input", icon: <AlignLeft size={20} /> },
    { label: "DropDown", desc: "List of options", icon: <List size={20} /> },
    { label: "Date", desc: "Date picker calendar", icon: <Calendar size={20} /> },
    { label: "FileUpload", desc: "Upload documents", icon: <FileUp size={20} /> }
  ];

  useEffect(() => {
    const savedScreenId = localStorage.getItem("currentScreenId");
    if (savedScreenId) {
      fetchGroups(Number(savedScreenId));
      fetchLookups();
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchFields(selectedGroup.sysID || selectedGroup.sysId);
    }
  }, [selectedGroup]);

  const fetchGroups = async (screenId) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://services.rs-apps.online/DynamicConfig/api/groups`);
      const allData = Array.isArray(response.data) ? response.data : [];
      const filtered = allData.filter(g => Number(g.screenId) === screenId);
      setGroups(filtered);
      if (filtered.length > 0) setSelectedGroup(filtered[0]);
    } catch (error) { console.error("Groups fetch failed", error); }
    finally { setLoading(false); }
  };

  const fetchFields = async (currentGroupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://services.rs-apps.online/DynamicConfig/api/group-fields`);
      const allFields = Array.isArray(response.data) ? response.data : [];
      const filtered = allFields.filter(f => Number(f.groupId) === Number(currentGroupId));
      setFields(filtered);
    } catch (error) {
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const res = await axios.get("https://services.rs-apps.online/DynamicConfig/api/LookUp");
      setLookups(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.log("Lookup fetch failed", e); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (field) => {
    setFormData({
      ...field,
      mode: "E",
      isPrimery: field.isPrimery === true || field.isPrimery === "Yes" ? "Yes" : "No",
      fkId: field.fkId === true || field.fkId === "Yes" ? "Yes" : "No",
      showInGrid: field.showInGrid === true || field.showInGrid === "Yes" ? "Yes" : "No",
      showInScreen: field.showInScreen === true || field.showInScreen === "Yes" ? "Yes" : "No",
    });
    setShowForm(true);
  };

  const handleDelete = async (field) => {
    if (!window.confirm(`Delete field "${field.labelText}"?`)) return;
    try {
      const payload = { ...field, sysId: field.sysId || field.sysID, mode: "D" };
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/group-fields/manage", payload);
      fetchFields(selectedGroup.sysID || selectedGroup.sysId);
    } catch (error) { alert("Delete failed"); }
  };

  const handleSaveField = async () => {
    if (!formData.fieldName || !formData.labelText || !formData.fieldType) {
      alert("Field Name, Type and Label are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        groupId: selectedGroup.sysID || selectedGroup.sysId,
        isPrimery: formData.isPrimery === "Yes",
        fkId: formData.fkId === "Yes",
        showInGrid: formData.showInGrid === "Yes",
        showInScreen: formData.showInScreen === "Yes",
        lookUpId: Number(formData.lookUpId),
        sequence: Number(formData.sequence)
      };
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/group-fields/manage", payload);
      setShowForm(false);
      setFormData(initialFieldState);
      fetchFields(selectedGroup.sysID || selectedGroup.sysId);
    } catch (error) { alert("Failed to save field"); }
    finally { setLoading(false); }
  };

  return (
    <div className="screen-container">
      <Navigation activePage="screen" />
      <div className="main-content-wrapper figma-layout">
        
        <div className="master-header-row">
          <div className="header-titles">
            <h1 className="master-title">Create New Screen</h1>
            <p className="master-subtitle">Step 3 of 4: Fields Configuration</p>
          </div>
          <div className="cancel-top-btn" onClick={() => navigate("/")}><X size={18} /> Cancel</div>
        </div>

        <div className="stepper-card">
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Screen Master</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Screen Groups</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper active"><div className="step-circle">3</div><div className="step-label">Fields Configuration</div></div>
          <div className="step-line"></div>
          <div className="step-wrapper"><div className="step-circle">4</div><div className="step-label">Field Validations</div></div>
        </div>

        <div className="field-config-container wide-card">
          <aside className="groups-sidebar">
            <div className="sidebar-header"><Type size={18} className="blue-icon" /><span>Groups</span></div>
            <div className="sidebar-list">
              {groups.map((group) => (
                <div 
                  key={group.sysID || group.sysId} 
                  className={`sidebar-item ${selectedGroup?.sysID === (group.sysID || group.sysId) ? "active" : "inactive"}`} 
                  onClick={() => { setSelectedGroup(group); setShowForm(false); }}
                >
                  <div className="item-info">
                    <span className="group-name">{group.heading}</span>
                    <span className="fields-count">{selectedGroup?.sysID === (group.sysID || group.sysId) ? fields.length : 0} fields added</span>
                  </div>
                  <ChevronRight size={16} className="chevron-icon" />
                </div>
              ))}
            </div>
          </aside>

          <main className="fields-display-area">
            <div className="fields-header">
              <div className="fields-title-box">
                <h3 className="fields-heading">Fields for "{selectedGroup?.heading || "..."}"</h3>
                <p className="fields-subheading">Add and configure fields for this group</p>
              </div>
              {!showForm && <button className="add-field-btn" onClick={() => { setFormData({...initialFieldState, mode: "A"}); setShowForm(true); }}><Plus size={16} /> Add Field</button>}
            </div>

            {showForm ? (
              <div className="add-field-form-container animate-fade-in">
                <div className="form-inner-header-label">
                    <Plus size={18} color="#2563eb" /> 
                    <span>{formData.mode === "E" ? "Edit" : "Add New"} Field for <strong>"{selectedGroup?.heading}"</strong></span>
                </div>
                
                <div className="grid-2 mt-4">
                  <div className="form-group"><label>Field Name <span className="req">*</span></label><input name="fieldName" value={formData.fieldName} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Label Text <span className="req">*</span></label><input name="labelText" value={formData.labelText} onChange={handleInputChange} /></div>
                </div>

                <div className="form-group mt-4"><label>Field Type <span className="req">*</span></label><input name="fieldType" value={formData.fieldType} onChange={handleInputChange} /></div>

                <div className="field-type-section mt-5">
                  <label className="type-label">Field Control <span className="req">*</span></label>
                  <div className="type-grid">
                    {controlOptions.map((opt) => (
                      <div key={opt.label} className={`type-card ${formData.fieldControl === opt.label ? "selected" : ""}`} onClick={() => setFormData(prev => ({ ...prev, fieldControl: opt.label }))}>
                        <div className="type-icon-box">{opt.icon}</div>
                        <div className="type-info"><span className="type-title">{opt.label}</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid-2 mt-5">
                  <div className="form-group"><label>Hint Text</label><input name="hintText" value={formData.hintText} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Sequence <span className="req">*</span></label><input name="sequence" type="number" value={formData.sequence} onChange={handleInputChange} /></div>
                </div>

                {formData.fieldControl === "DropDown" && (
                  <div className="form-group mt-4 full-width">
                    <label>LookUp <span className="req">*</span></label>
                    <select name="lookUpId" value={formData.lookUpId} onChange={handleInputChange} className="lookup-dropdown-ui">
                      <option value="0">-- Select Lookup Data --</option>
                      {lookups.map(l => (<option key={l.lookUpId} value={l.lookUpId}>{l.lookUpName}</option>))}
                    </select>
                  </div>
                )}

                <div className="dropdown-grid-row mt-5">
                    <div className="form-group"><label>Is Primary?</label><select name="isPrimery" value={formData.isPrimery} onChange={handleInputChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                    <div className="form-group"><label>Foreign Key?</label><select name="fkId" value={formData.fkId} onChange={handleInputChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                    <div className="form-group"><label>Show In Grid?</label><select name="showInGrid" value={formData.showInGrid} onChange={handleInputChange}><option value="Yes">Yes</option><option value="No">No</option></select></div>
                    <div className="form-group"><label>Show In Screen?</label><select name="showInScreen" value={formData.showInScreen} onChange={handleInputChange}><option value="Yes">Yes</option><option value="No">No</option></select></div>
                </div>

                <div className="form-actions-footer mt-5">
                  <button type="button" className="btn-cancel-figma-inline" onClick={() => setShowForm(false)}><X size={16} /> Cancel</button>
                  <button type="button" className="btn-save-figma" onClick={handleSaveField} disabled={loading}><Save size={16} /> Save Field</button>
                </div>
              </div>
            ) : (
              <div className="fields-list-content">
                {fields.length > 0 ? (
                  <div className="added-fields-container">
                    <div className="fields-stats-bar"><span>Fields in this group</span><span className="badge-total">{fields.length} total</span></div>
                    {fields.map((field, index) => (
                      <div key={index} className="field-visual-card animate-fade-in">
                        <div className="field-card-number">{index + 1}</div>
                        <div className="field-card-content">
                          <div className="field-card-header">
                            <span className="field-card-label">{field.labelText}</span>
                            <div className="field-card-badges">
                              <span className="badge type">{field.fieldType}</span>
                            </div>
                          </div>
                          <div className="field-card-details">
                            <div className="detail-item"><strong>Field Name:</strong> <span>{field.fieldName}</span></div>
                            <div className="detail-item"><strong>Control:</strong> <span>{field.fieldControl}</span></div>
                          </div>
                        </div>
                        <div className="field-actions">
                          <button className="action-icon-btn edit" onClick={() => handleEdit(field)}><Pencil size={18} /></button>
                          <button className="action-icon-btn delete" onClick={() => handleDelete(field)}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="progress-alert-bar">
                      <CircleQuestionMark size={18} color="#16a34a" />
                      <span><strong>Great progress!</strong> You have {fields.length} fields in this group.</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-fields-placeholder dotted-box">
                    <div className="icon-circle"><Type size={48} color="#94a3b8" /></div>
                    <h4 className="placeholder-title">No fields yet</h4>
                    <p className="placeholder-text">Add fields to the <strong>"{selectedGroup?.heading}"</strong> group. Each field represents an input in your form.</p>
                    <button className="create-first-field-btn primary-blue" onClick={() => setShowForm(true)}><Plus size={18} /> Add Your First Field</button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <div className="master-footer-actions">
          <button className="btn-back-figma" onClick={() => navigate("/screen-groups")}><ArrowLeft size={16} /> Back</button>
          <button className="btn-next-figma" onClick={() => navigate("/field-validations")}>Next <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}