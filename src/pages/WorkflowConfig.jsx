import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Plus, GitBranch, X, Save, User, Layers, Monitor, Trash2, ChevronDown, ChevronUp,Pencil } from "lucide-react";
import axios from "axios";
import "./WorkflowConfig.css";

export default function WorkflowConfig() {
  const [showForm, setShowForm] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [employees, setEmployees] = useState([]);


  const [approvalName, setApprovalName] = useState("");
  const [editId, setEditId] = useState(null); 

  const [approvers, setApprovers] = useState([]);
  const [showApproverMiniForm, setShowApproverMiniForm] = useState(false);
  const [approverData, setApproverData] = useState({ employeeID: "", employeeName: "", sequence: 1 });


  const [availableScreens, setAvailableScreens] = useState([]);
  const [selectedScreens, setSelectedScreens] = useState([]);
  const [showScreensList, setShowScreensList] = useState(false);

  useEffect(() => {
    fetchScreens();
    fetchWorkflows();
    fetchEmployees(); 
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("https://services.rs-apps.online/DynamicConfig/api/auth/employees");
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Employees fetch failed", e); }
  };

  const fetchScreens = async () => {
    try {
      const res = await axios.get("https://services.rs-apps.online/DynamicConfig/api/screens");
      setAvailableScreens(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Screens fetch failed", e); }
  };

  const fetchWorkflows = async () => {
    try {
      const [appRes, provRes, mapRes, screenRes] = await Promise.all([
        axios.get("https://services.rs-apps.online/DynamicConfig/api/workflow/approval"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/workflow/approver"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/workflow/mapping"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/screens")
      ]);

      const approvals = appRes.data || [];
      const allApprovers = provRes.data || [];
      const allMappings = mapRes.data || [];
      const allScreens = screenRes.data || [];

      setAvailableScreens(allScreens);

      const combined = approvals.map(app => ({
        ...app,
        chain: allApprovers
          .filter(p => p.approvalTypeID === app.id)
          .sort((a, b) => Number(a.sequence) - Number(b.sequence)),
        mappedScreens: allMappings.filter(m => m.approvalID === app.id)
      }));

      setWorkflows(combined);
    } catch (e) {
      console.error("Workflows fetch failed", e);
    }
  };

  const handleEmployeeChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedEmp = employees.find(emp => Number(emp.id) === selectedId);
    if (selectedEmp) {
      setApproverData({
        ...approverData,
        employeeID: selectedEmp.id,
        employeeName: selectedEmp.empName
      });
    }
  };

  const handleAddApprover = () => {
    if (!approverData.employeeID) return alert("Please select an employee");
    setApprovers([...approvers, { ...approverData, id: Date.now() }]);
    setApproverData({ employeeID: "", employeeName: "", sequence: approvers.length + 2 });
    setShowApproverMiniForm(false);
  };

  const removeApprover = (id) => setApprovers(approvers.filter(a => a.id !== id));

  const toggleScreenSelection = (screenID) => {
    setSelectedScreens(prev => 
      prev.includes(screenID) ? prev.filter(id => id !== screenID) : [...prev, screenID]
    );
  };

  const handleEdit = (wf) => {
    setEditId(wf.id); 
    setApprovalName(wf.approvalName);
    setApprovers(wf.chain.map(c => ({
        id: c.id,
        employeeID: c.employeeID,
        employeeName: c.employeeName,
        sequence: c.sequence
    })));
    setSelectedScreens(wf.mappedScreens.map(m => m.screenID));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    
    setLoading(true);
    try {
        const workflowToDelete = workflows.find(w => w.id === id);

        if (workflowToDelete) {
            for (const app of workflowToDelete.chain) {
                await axios.post("https://services.rs-apps.online/DynamicConfig/api/workflow/manage-approver", {
                    id: app.id,
                    approvalTypeID: id,
                    employeeID: app.employeeID,
                    employeeName: app.employeeName,
                    sequence: app.sequence,
                    mode: 'D' 
                });
            }

            for (const map of workflowToDelete.mappedScreens) {
                await axios.post("https://services.rs-apps.online/DynamicConfig/api/workflow/manage-mapping", {
                    id: map.id,
                    screenID: map.screenID,
                    approvalID: id,
                    mode: 'D' 
                });
            }
        }

        await axios.post("https://services.rs-apps.online/DynamicConfig/api/workflow/manage-approval", {
            id: id,
            approvalName: "", 
            mode: 'D' 
        });

        alert("Workflow and all related data deleted successfully!");
        fetchWorkflows(); 
    } catch (e) {
        console.error("Delete failed", e);
    } finally {
        setLoading(false);
    }
};

 const handleFinalSave = async () => {
  if (!approvalName) return alert("Approval Name is required");

  setLoading(true);

  try {

      const approvalRes = await axios.post(
        "https://services.rs-apps.online/DynamicConfig/api/workflow/manage-approval",
        {
          id: editId ? Number(editId) : 0,
          approvalName: approvalName,
          mode: editId ? "E" : "A"
        }
      );


      const approvalID = editId || (typeof approvalRes.data === 'object' ? approvalRes.data.id : approvalRes.data);

    if (editId) {
      for (const old of workflows.find(w => w.id === editId)?.chain || []) {
        await axios.post("https://services.rs-apps.online/DynamicConfig/api/workflow/manage-approver", {
          id: old.id,
          approvalTypeID: approvalID,
          employeeID: old.employeeID,
          employeeName: old.employeeName,
          sequence: old.sequence,
          mode: "D"
        });
      }

      for (const old of workflows.find(w => w.id === editId)?.mappedScreens || []) {
        await axios.post("https://services.rs-apps.online/DynamicConfig/api/workflow/manage-mapping", {
          id: old.id,
          screenID: old.screenID,
          approvalID: approvalID,
          mode: "D"
        });
      }
    }


    for (const app of approvers) {
      await axios.post(
        "https://services.rs-apps.online/DynamicConfig/api/workflow/manage-approver",
        {
          id: 0,
          approvalTypeID: Number(approvalID),

          employeeID: app.employeeID.toString(), 
          employeeName: app.employeeName,
          sequence: Number(app.sequence),
          mode: "A",

          model: app.employeeName || "Approver" 
        }
      );
    }

    for (const sID of selectedScreens) {
      await axios.post(
        "https://services.rs-apps.online/DynamicConfig/api/workflow/manage-mapping",
        {
          id: 0,
          screenID: sID,
          approvalID: approvalID,
          mode: "A"
        }
      );
    }

    alert(editId ? "Workflow updated successfully!" : "Workflow created successfully!");
    setShowForm(false);
    resetForm();
    fetchWorkflows();
    setEditId(null);

  } catch (err) {
    console.error("SAVE ERROR 👉", err.response || err);
    alert("Error saving workflow. Check console.");
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setApprovalName(""); 
    setApprovers([]); 
    setSelectedScreens([]);
    setEditId(null); 
    setApproverData({ employeeID: "", employeeName: "", sequence: 1 });
    setShowApproverMiniForm(false);
    setShowScreensList(false);
};

  return (
    <div className="wf-container">
      <Navigation activePage="workflow" />
      <div className="wf-content-wrapper">
        <div className="wf-header-flex">
          <div className="wf-title-section">
            <h1 className="wf-main-title">Workflow Configuration</h1>
            <p className="wf-sub-title">Manage approval workflows and screen mappings</p>
          </div>
          {!showForm &&
                <button 
                  className="btn-add-wf" 
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                >
                  <Plus size={18} /> Add New Workflow
                </button>}
        </div>

        {showForm ? (
          <div className="wf-main-form-card animate-fade-in">
            <div className="wf-form-header">
              <div className="wf-header-icon-title"><Plus size={20} className="green-text" /> <span>Add New Workflow</span></div>
              <span className="required-note">* Required fields</span>
            </div>

            <div className="wf-form-row">
              <div className="form-group-wf">
                <label>Workflow Name <span className="req">*</span></label>
                <input type="text" value={approvalName} onChange={(e) => setApprovalName(e.target.value)} placeholder="e.g., Leave Approval, Purchase Order" />
                <p className="field-hint">Descriptive name for the workflow</p>
              </div>
            </div>

            <div className="wf-section-container">
              <div className="section-header-flex">
                <div className="section-title-box"><Layers size={18} className="green-text" /> <span>Approval Levels</span></div>
                <button className="btn-section-add" onClick={() => setShowApproverMiniForm(true)}><Plus size={16} /> Add Approval</button>
              </div>
              <p className="wf-count-indicator">{approvers.length} approvals configured</p>

              {showApproverMiniForm && (
                <div className="approver-mini-form animate-fade-in">
                  <h4>New Approval Level</h4>
                  <div className="mini-form-row">
         
                    <div className="mini-input">
                      <label>Employee <span className="req">*</span></label>
                      <select 
                        value={approverData.employeeID} 
                        onChange={handleEmployeeChange}
                        className="wf-dropdown-select"
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.empName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mini-input">
                      <label>Sequence <span className="req">*</span></label>
                      <input type="number" value={approverData.sequence} onChange={(e)=>setApproverData({...approverData, sequence: parseInt(e.target.value)})}/>
                    </div>
                  </div>
                  <div className="mini-form-actions">
                    <button className="btn-mini-add" onClick={handleAddApprover}>Add</button>
                    <button className="btn-mini-cancel" onClick={() => setShowApproverMiniForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="approvers-list-container">
                {approvers.length === 0 ? <div className="empty-section-placeholder">No approval levels configured yet</div> : (
                  approvers.map((app, idx) => (
                    <div key={app.id} className="approver-list-item">
                      <div className="idx-circle">{idx + 1}</div>
                      <div className="approver-info">
                        <span className="app-name">{app.employeeName || "Unknown Employee"}</span>
                        <span className="app-id">Employee ID: {app.employeeID}</span>
                      </div>
                      <button className="btn-del-app" onClick={() => removeApprover(app.id)}><Trash2 size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="wf-section-container">
            <div className="section-header-flex">
                <div className="section-title-box">
                <Monitor size={18} className="green-text" /> <span>Map to Screens</span>
                </div>
                <button type="button" className="btn-show-screens" onClick={() => setShowScreensList(!showScreensList)}>
                {showScreensList ? "Hide Screens" : "Show Screens"}
                </button>
            </div>
            <p className="wf-count-indicator">{selectedScreens.length} screens mapped</p>

            {showScreensList && (
                <div className="screens-selection-grid animate-fade-in">
                {availableScreens.map(screen => {
                  const isSelected = selectedScreens.includes(screen.sysId);

                  return (
                    <div
                      key={screen.sysId}
                      className={`screen-checkbox-item ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleScreenSelection(screen.sysId)}
                    >
                      <input type="checkbox" checked={isSelected} readOnly />
                      <Monitor size={14} />
                      <span>{screen.screenName}</span>
                    </div>
                  );
                })}

                </div>
            )}
            </div>
            
            <div className="wf-form-footer">
               <button className="btn-cancel-wf" onClick={() => setShowForm(false)}><X size={18} /> Cancel</button>
               <button className="btn-save-wf" onClick={handleFinalSave} disabled={loading}>
                 {loading ? "Saving..." : <><Save size={18} /> Add Workflow</>}
               </button>
            </div>
          </div>
        ) : (
          <div className="wf-list-view">
            {workflows.length === 0 ? (
              <div className="wf-empty-card animate-fade-in">
                <div className="wf-empty-content">
                  <div className="wf-icon-circle"><GitBranch size={40} color="#94a3b8" /></div>
                  <h3 className="wf-empty-title">No workflows yet</h3>
                  <p className="wf-empty-desc">Create approval workflows to manage business processes and map them to screens.</p>
                  <button className="btn-create-first" onClick={() => setShowForm(true)}><Plus size={18} /> Create Your First Workflow</button>
                </div>
              </div>
            ) : (
              <div className="wf-grid-container">
                <div className="wf-list-meta">
                   <span>Configured Workflows</span>
                   <span className="meta-count">{workflows.length} total</span>
                </div>
                {workflows.map((wf) => (
                  <div key={wf.id} className="wf-card">
                    <div className="wf-card-header">
                      <div className="wf-card-icon-box"><GitBranch size={20} color="white" /></div>
                      <div className="wf-card-info">
                        <h3>{wf.approvalName}</h3>
                        <p>{wf.approvalName} Approval</p>
                      </div>
                      <div className="wf-card-actions">
                        <button className="wf-action-btn edit" onClick={() => handleEdit(wf)}>
                            <Pencil size={18} strokeWidth={2.5} />
                        </button>
                        <button className="wf-action-btn delete" onClick={() => handleDelete(wf.id)}>
                            <Trash2 size={18} strokeWidth={2.5}/>
                        </button>
                    </div>
                                        </div>
                    <div className="wf-card-body">
                      <div className="body-section">
                        <div className="section-label"><Layers size={14}/> Approval Chain:</div>
                        <div className="chain-row">
                          {wf.chain.map((c, i) => (
                            <React.Fragment key={c.id}>
      
                              <div className="chain-pill">
                                {i + 1}. {c.employeeName || c.employeeID}
                              </div>
                              {i < wf.chain.length - 1 && <span className="chain-arrow">→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="body-section">
                        <div className="section-label">
                          <Monitor size={14}/> Mapped to {wf.mappedScreens.length} screens:
                        </div>

                        <div className="mapped-pill-row">
                          {wf.mappedScreens.length > 0 ? (
                            wf.mappedScreens.map(m => {
                              const screenObj = availableScreens.find(
                                s => s.sysId === m.screenID
                              );

                              return (
                                <span key={m.id} className="mapped-tag">
                                  {screenObj ? screenObj.screenName : `Screen (ID: ${m.screenID})`}
                                </span>
                              );
                            })
                            
                          ) : (
                            <span className="no-screens-text">No screens mapped</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="wf-tip-box">
                  <div className="tip-icon">?</div>
                  <p><strong>Tip:</strong> Workflows define approval sequences for business processes.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}