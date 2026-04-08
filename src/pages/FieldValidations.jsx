import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { 
  Layers, Type, Shield, Plus, ChevronRight, 
  ArrowLeft, Save, X, Trash2, Pencil, CheckCircle2 
} from "lucide-react";
import axios from "axios";
import "./FieldValidations.css";

export default function FieldValidations() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [fields, setFields] = useState([]);
  const [validations, setValidations] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    id: 0,
    groupID: 0,
    fieldID: 0,
    validation: "",  
    value: "",       
    status: "",      
    errorMessage: null, 
    mode: "A"
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const savedScreenId = localStorage.getItem("currentScreenId");
    if (savedScreenId) { fetchGroups(Number(savedScreenId)); }
  }, []);

  const fetchGroups = async (screenId) => {
    try {
      const res = await axios.get(`hhttps://services.rs-apps.online/DynamicConfig/api/groups`);
      const allGroups = Array.isArray(res.data) ? res.data : [];
      const filtered = allGroups.filter(g => Number(g.screenId) === screenId);
      setGroups(filtered);
      if (filtered.length > 0) setSelectedGroup(filtered[0]);
    } catch (e) { console.error("Groups fetch failed", e); }
  };

  useEffect(() => {
    if (selectedGroup) {
      const gId = selectedGroup.sysID || selectedGroup.sysId;
      fetchFields(gId);
    }
  }, [selectedGroup]);

  const fetchFields = async (groupId) => {
    try {
      const res = await axios.get(`https://services.rs-apps.online/DynamicConfig/api/group-fields`);
      const allFields = Array.isArray(res.data) ? res.data : [];
      const filtered = allFields.filter(f => Number(f.groupId) === Number(groupId));
      setFields(filtered);
      setSelectedField(null);
      setValidations([]);
    } catch (e) { console.error("Fields fetch failed", e); }
  };

  useEffect(() => {
    if (selectedField) {
      const fId = selectedField.sysId || selectedField.sysID;
      fetchValidations(fId);
    }
  }, [selectedField]);

  const fetchValidations = async (fieldId) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://services.rs-apps.online/DynamicConfig/api/field-validation`);
      const allValidations = Array.isArray(res.data) ? res.data : [];
      const filtered = allValidations.filter(v => Number(v.fieldID) === Number(fieldId));
      setValidations(filtered);
    } catch (e) { 
        setValidations([]); 
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (val) => {
    setFormData({ ...val, mode: "E", errorMessage: null });
    setShowForm(true);
  };

  const handleDelete = async (val) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/field-validation/manage", { ...val, mode: "D" });
      fetchValidations(selectedField.sysId || selectedField.sysID);
    } catch (e) { alert("Delete failed"); }
  };

  const handleSave = async () => {
    if (!formData.validation || !formData.value) {
      alert("Validation Type and Value are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        groupID: selectedGroup.sysID || selectedGroup.sysId,
        fieldID: selectedField.sysId || selectedField.sysID,
        errorMessage: null 
      };
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/field-validation/manage", payload);
      setShowForm(false);
      setFormData(initialFormState);
      fetchValidations(payload.fieldID);
    } catch (e) { alert("Save failed"); }
    finally { setLoading(false); }
  };

  const handleFinalSave = () => {
    alert("Configuration Saved Successfully!");
    navigate("/"); 
  };

  return (
    <div className="screen-container">
      <Navigation activePage="screen" />
      <div className="main-content-wrapper figma-layout full-screen-layout">
        
        <div className="master-header-row">
          <div className="header-titles">
            <h1 className="master-title">Create New Screen</h1>
            <p className="master-subtitle">Step 4 of 4: Field Validations</p>
          </div>
          <div className="cancel-top-btn" onClick={() => navigate("/screen-config")}><X size={18} /> Cancel</div>
        </div>

        <div className="stepper-card">
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Screen Master</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Screen Groups</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper done"><div className="step-circle">✓</div><div className="step-label">Fields Configuration</div></div>
          <div className="step-line done"></div>
          <div className="step-wrapper active"><div className="step-circle">4</div><div className="step-label">Field Validations</div></div>
        </div>

        <div className="validation-main-grid">
          <aside className="val-column groups-col">
            <div className="col-header"><Layers size={18} /> Groups</div>
            <div className="col-list">
              {groups.map(g => (
                <div key={g.sysID || g.sysId} className={`val-item ${selectedGroup?.sysID === (g.sysID || g.sysId) ? "active" : ""}`} onClick={() => setSelectedGroup(g)}>
                  <div className="val-item-info">
                    <span className="val-label">{g.heading}</span>
                    <span className="val-sub">{selectedGroup?.sysID === (g.sysID || g.sysId) ? fields.length : 0} fields</span>
                  </div>
                  <ChevronRight size={14} className="chevron" />
                </div>
              ))}
            </div>
          </aside>

          <aside className="val-column fields-col">
            <div className="col-header"><Type size={18} /> Fields</div>
            <div className="col-list">
              {fields.map(f => (
                <div key={f.sysId || f.sysID} className={`val-item ${selectedField?.sysId === (f.sysId || f.sysID) ? "active" : ""}`} onClick={() => setSelectedField(f)}>
                  <div className="val-item-info">
                    <span className="val-label">{f.labelText}</span>
                    <span className="val-sub">{f.fieldType}</span>
                  </div>
                  <ChevronRight size={14} className="chevron" />
                </div>
              ))}
            </div>
          </aside>

          <main className="val-column content-col">
            <div className="col-header"><Shield size={18} /> Validations</div>
            
            {!selectedField ? (
              <div className="empty-center">
                <Shield size={64} color="#cbd5e1" strokeWidth={1} />
                <p>Select a field to configure validations</p>
              </div>
            ) : (
              <div className="validation-content-area">
                <div className="field-info-bar">
                  <div className="info-text">Setting rules for <strong>"{selectedField.labelText}"</strong></div>
                  {!showForm && <button className="add-rule-btn-top" onClick={() => {setFormData(initialFormState); setShowForm(true);}}><Plus size={14} /> Add Rule</button>}
                </div>

                {showForm ? (
                  <div className="add-rule-card orange-bg animate-fade-in enlarged-form">
                    <div className="rule-card-header"><Shield size={20} color="#f97316" /> {formData.mode === "E" ? "Edit" : "Add"} Validation Rule</div>
                    
                    <div className="form-group mt-4">
                      <label>Validation Type <span className="req">*</span></label>
                      <input className="dark-input large-input" value={formData.validation} onChange={(e) => setFormData({...formData, validation: e.target.value})} placeholder="eg:- Required" />
                    </div>

                    <div className="grid-2 mt-4">
                        <div className="form-group">
                            <label>Value <span className="req">*</span></label>
                            <input className="dark-input large-input" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder="eg:- 10" />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <input className="dark-input large-input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} placeholder="eg:- A" />
                        </div>
                    </div>

                    <div className="rule-actions-spaced mt-5">
                      <button className="btn-cancel-large" onClick={() => setShowForm(false)}><X size={16} /> Cancel</button>
                      <button className="btn-add-rule-large" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : formData.mode === "E" ? "Update Rule" : "Add Rule"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rules-list-container">
                    {validations.length > 0 ? (
                      <>
                        <div className="active-rules-label">Active validation rules <span>{validations.length} total</span></div>
                        {validations.map((v, i) => (
                          <div key={i} className="rule-visual-card animate-fade-in">
                            <div className="rule-card-top">
                                <div className="rule-badge-index">{i + 1}</div>
                                <div className="rule-main-content">
                                    <div className="rule-type-row">
                                        <span className="rule-name-text">{v.validation}</span>
                                        <span className="rule-value-tag dark-text">{v.value}</span>
                                    </div>
                                    <div className="rule-info-row">Status: <strong className="status-blue">{v.status || 'N/A'}</strong></div>
                                </div>
                                <div className="rule-action-btns">
                                    <button className="val-action-btn edit" onClick={() => handleEdit(v)}><Pencil size={18} /></button>
                                    <button className="val-action-btn delete" onClick={() => handleDelete(v)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                          </div>
                        ))}
                        <div className="success-banner-modern">
                            <CheckCircle2 size={20} color="#16a34a" />
                            <div className="banner-text">
                                <strong>Validation configured!</strong> This field has {validations.length} validation rule(s). Select another field or finish configuration.
                            </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-rules-box">
                         <Shield size={48} color="#e2e8f0" strokeWidth={1} />
                         <p>No validation rules yet for "{selectedField.labelText}"</p>
                         <button className="btn-orange-add" onClick={() => setShowForm(true)}>+ Add First Rule</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <div className="master-footer-actions">
          <button className="btn-back-figma" onClick={() => navigate("/field-config")}><ArrowLeft size={16} /> Back</button>
          <button className="btn-save-config-final" onClick={handleFinalSave}><Save size={16} /> Save Configuration</button>
        </div>
      </div>
    </div>
  );
}