import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { List, LayoutGrid, Plus, Folder, Package, Menu, Pencil, Trash2, X, Save, GripVertical, ChevronRight, ChevronDown, Hash, Link as LinkIcon } from "lucide-react";
import axios from "axios";
import "./ModuleMenuConfig.css";

export default function ModuleMenuConfig() {
  const [viewMode, setViewMode] = useState("tree");
  const [headers, setHeaders] = useState([]);
  const [allModules, setAllModules] = useState([]); 
  const [allMenus, setAllMenus] = useState([]); 
  const [modules, setModules] = useState([]); 
  const [menus, setMenus] = useState([]); 
  const [showHeaderForm, setShowHeaderForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null); 
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false); 
  
  const [expandedItems, setExpandedItems] = useState({});

  const initialModuleState = { id: 0, moduleName: "", icon: "", status: "Active", link: "", sequence: 0, headerId: 0, mode: "A" };
  const initialMenuState = { id: 0, moduleId: 0, screenName: "", icon: "", screenUrl: "", isSelfService: "SS", isActive: true, status: "Active", userId: 0, sequence: 0, mode: "A" };
  const initialHeaderState = { id: 0, header: "", sequence: 0, mode: "A" };

  const [moduleFormData, setModuleFormData] = useState(initialModuleState);
  const [menuFormData, setMenuFormData] = useState(initialMenuState);
  const [headerFormData, setHeaderFormData] = useState(initialHeaderState);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [hRes, mRes, mnRes] = await Promise.all([
        axios.get("https://services.rs-apps.online/DynamicConfig/api/module-headers"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/modules"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/menus")
      ]);
      setHeaders(Array.isArray(hRes.data) ? hRes.data : []);
      setAllModules(Array.isArray(mRes.data) ? mRes.data : []);
      setAllMenus(Array.isArray(mnRes.data) ? mnRes.data : []);
    } catch (e) { console.error("Fetch failed", e); }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const newExpanded = {};
    headers.forEach(h => {
      newExpanded[`h-${h.id}`] = true;
      allModules.filter(m => m.headerId === h.id).forEach(m => {
        newExpanded[`m-${m.id}`] = true;
      });
    });
    setExpandedItems(newExpanded);
  };

  const handleCollapseAll = () => setExpandedItems({});

  

  const fetchModules = async (headerId) => {
  setLoading(true);
  try {
    const res = await axios.get("https://services.rs-apps.online/DynamicConfig/api/modules");

    const data = Array.isArray(res.data) ? res.data : [];
    const filtered = data.filter(m => (m.headerID == headerId || m.headerId == headerId));
    
    setModules(filtered);
  } catch (e) { 
    console.error("Fetch failed", e);
    setModules([]); 
  } finally {
    setLoading(false);
  }
};

const fetchMenus = async (moduleId) => {
  try {
    const res = await axios.get("https://services.rs-apps.online/DynamicConfig/api/menus");
  
    const filtered = Array.isArray(res.data) 
      ? res.data.filter(m => m.moduleId == moduleId) 
      : [];
    setMenus(filtered);
  } catch (e) { 
    console.error("Menu fetch error", e);
    setMenus([]); 
  }
};

  const handleHeaderClick = (h) => {
    setSelectedHeader(h);
    setSelectedModule(null);
    setMenus([]);
    setModuleFormData({ ...initialModuleState, headerId: h.id });
    setShowModuleForm(false); 
    setShowMenuForm(false);
    fetchModules(h.id);
  };

  const handleModuleClick = (m) => {
    setSelectedModule(m);
    setMenuFormData({ ...initialMenuState, moduleId: m.id });
    setShowMenuForm(false);
    fetchMenus(m.id);
  };

  const handleHeaderSave = async () => {
    if (!headerFormData.header) return alert("Header name is required");
    setLoading(true);
    try {
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/module-headers/manage", headerFormData);
      setShowHeaderForm(false);
      setHeaderFormData(initialHeaderState);
      fetchAllData();
    } catch (e) { alert("Operation failed"); }
    finally { setLoading(false); }
  };

  const handleModuleSave = async () => {
    if (!moduleFormData.moduleName) return alert("Module Name is required");
    setLoading(true);
    try {
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/modules/manage", moduleFormData);
      setShowModuleForm(false);
      setModuleFormData(initialModuleState);
      fetchAllData();
      if(selectedHeader) fetchModules(selectedHeader.id);
    } catch (e) { alert("Module Save failed"); }
    finally { setLoading(false); }
  };

  const handleMenuSave = async () => {
    if (!menuFormData.screenName) return alert("Menu Name is required");
    setLoading(true);
    try {
      await axios.post("https://services.rs-apps.online/DynamicConfig/api/menus/manage", menuFormData);
      setShowMenuForm(false);
      setMenuFormData(initialMenuState);
      fetchAllData();
      if(selectedModule) fetchMenus(selectedModule.id);
    } catch (e) { alert("Menu Save failed"); }
    finally { setLoading(false); }
  };

  const handleEditModule = (m) => { setModuleFormData({ ...m, mode: "E" }); setShowModuleForm(true); };
  const handleDeleteModule = async (m) => {
    if (!window.confirm("Delete?")) return;
    try { await axios.post("https://services.rs-apps.online/DynamicConfig/api/modules/manage", { ...m, mode: "D" }); fetchAllData(); if(selectedHeader) fetchModules(selectedHeader.id); } catch (e) { alert("Delete failed"); }
  };

  const handleEditMenu = (mn) => { setMenuFormData({ ...mn, mode: "E" }); setShowMenuForm(true); };
  const handleDeleteMenu = async (mn) => {
    if (!window.confirm("Delete?")) return;
    try { await axios.post("https://services.rs-apps.online/DynamicConfig/api/menus/manage", { ...mn, mode: "D" }); fetchAllData(); if(selectedModule) fetchMenus(selectedModule.id); } catch (e) { alert("Delete failed"); }
  };

  const handleEditHeader = (h) => { setHeaderFormData({ ...h, mode: "E" }); setShowHeaderForm(true); };
  const handleDeleteHeader = async (h) => {
    if (!window.confirm("Delete?")) return;
    try { await axios.post("https://services.rs-apps.online/DynamicConfig/api/module-headers/manage", { ...h, mode: "D" }); fetchAllData(); } catch (e) { alert("Delete failed"); }
  };

  return (
    <div className="module-menu-container">
      <Navigation activePage="module" />
      <div className="module-content-wrapper">
        <div className="module-header-flex">
          <div className="module-title-section">
            <h1 className="config-view-title">Configuration View</h1>
            <p className="config-view-sub">Manage hierarchy and management configurations</p>
          </div>
          <div className="mode-toggle-pill">
            <button className={`mode-btn ${viewMode === "tree" ? "active" : ""}`} onClick={() => setViewMode("tree")}><List size={16} /> Tree View</button>
            <button className={`mode-btn ${viewMode === "manage" ? "active" : ""}`} onClick={() => setViewMode("manage")}><LayoutGrid size={16} /> Manage</button>
          </div>
        </div>

        {viewMode === "tree" ? (
          <div className="module-main-card animate-fade-in">
            <div className="card-top-bar-clean">
              <div className="top-bar-left">
                <h2 className="inner-card-title">Hierarchical Tree View</h2>
                <p className="inner-card-sub">Module and menu structure visualizer</p>
              </div>
              <div className="top-bar-right">
                <button className="text-action-btn" onClick={handleExpandAll}>Expand All</button>
                <button className="text-action-btn" onClick={handleCollapseAll}>Collapse All</button>
              </div>
            </div>
            <div className="tree-rectangle-container-box">
              <div className="tree-scroll-container">
                {headers.map((h) => {
                  const hId = `h-${h.id}`;
                  const modulesForH = (allModules || []).filter(m => (m.headerID == h.id || m.headerId == h.id));
                  return (
                    <div key={hId} className="tree-node">
                      <div className="tree-row header-row-tree" onClick={() => toggleExpand(hId)}>
                        <div className="row-left">
                          {expandedItems[hId] ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                          <Folder size={22} className="indigo-icon" />
                          <span className="node-label-big">{h.header}</span>
                          <span className="count-pill-big">{modulesForH.length} Modules</span>
                        </div>
                        <div className="row-right">
                            <span className="seq-badge"><Hash size={12}/> {h.sequence}</span>
                            <span className="type-badge header-badge">Header</span>
                        </div>
                      </div>

                      {expandedItems[hId] && (
                        <div className="tree-children">
                          {modulesForH.map((m) => {
                            const mId = `m-${m.id}`;
                            const menusForM = allMenus.filter(mn => mn.moduleId === m.id);
                            return (
                              <div key={mId} className="tree-node">
                                <div className="tree-row module-row-tree" onClick={() => toggleExpand(mId)}>
                                  <div className="row-left">
                                    {expandedItems[mId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    <Package size={18} className="indigo-icon" />
                                    <span className="node-label-mid">{m.moduleName}</span>
                                    <span className="count-pill-mid">{menusForM.length} Menus</span>
                                  </div>
                                  <div className="row-right">
                                    <span className="seq-badge-mid"><Hash size={10}/> {m.sequence}</span>
                             
                                    <span className={`status-tag-big ${(m.status || "active").toLowerCase()}`}>
                                      {m.status || "Active"}
                                    </span>
                                  </div>
                                </div>

                                {expandedItems[mId] && (
                                  <div className="tree-children deeper">
                                    {menusForM.map((mn) => (
                                      <div key={mn.id} className="tree-row menu-row-tree">
                                        <div className="row-left">
                                          <Menu size={16} className="indigo-icon" />
                                          <div className="menu-labels-big">
                                            <span className="node-label-small">{mn.screenName}</span>
                                            <span className="url-label-big"><LinkIcon size={10}/> {mn.screenUrl || "No URL"}</span>
                                          </div>
                                        </div>
                                        <div className="row-right">
                                          <span className="seq-badge-small">Seq: {mn.sequence}</span>
                                          <span className={`status-tag-big ${mn.isActive ? 'active' : 'inactive'}`}>{mn.isActive ? 'Active' : 'Inactive'}</span>
                                          {mn.isSelfService === "SS" && <span className="ss-badge-big">SS</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="management-grid animate-fade-in">

            <div className="column-container">
              <div className="column-header">
                <div className="column-title-box"><Folder size={18} className="indigo-icon" /><span>Module Headers</span></div>
                {!showHeaderForm && <button className="add-square-btn" onClick={() => {setHeaderFormData(initialHeaderState); setShowHeaderForm(true);}}><Plus size={18} className="plus-purple" /></button>}
              </div>
              <div className="column-scroll-area">
                {showHeaderForm && (
                  <div className="inline-add-form animate-fade-in">
                    <div className="form-group"><label>Header Name <span className="req">*</span></label><input type="text" value={headerFormData.header} onChange={(e) => setHeaderFormData({...headerFormData, header: e.target.value})} placeholder="e.g. Main Menu" /></div>
                    <div className="form-group"><label>Sequence</label><input type="number" value={headerFormData.sequence} onChange={(e) => setHeaderFormData({...headerFormData, sequence: parseInt(e.target.value) || 0})} /></div>
                    <div className="inline-form-actions">
                      <button className="btn-save-inline" onClick={handleHeaderSave}><Save size={14} /> {headerFormData.mode === "E" ? "Update" : "Add"}</button>
                      <button className="btn-cancel-inline" onClick={() => setShowHeaderForm(false)}><X size={14} /> Cancel</button>
                    </div>
                  </div>
                )}
                {headers.map((h) => (
                  <div key={h.id} className={`config-list-item ${selectedHeader?.id === h.id ? "selected-header" : ""}`} onClick={() => handleHeaderClick(h)}>
                    <div className="item-content-info"><span className="item-name">{h.header}</span><span className="item-seq-tag">Sequence: {h.sequence}</span></div>
                    <div className="item-actions">
                      <button className="edit-mini" onClick={(e) => {e.stopPropagation(); handleEditHeader(h);}}><Pencil size={14} /></button>
                      <button className="del-mini" onClick={(e) => {e.stopPropagation(); handleDeleteHeader(h);}}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="column-container">
              <div className="column-header">
                <div className="column-title-box"><Package size={18} className="indigo-icon" /><span>Modules</span></div>
                {selectedHeader && !showModuleForm && <button className="add-square-btn" onClick={() => {setModuleFormData({...initialModuleState, headerId: selectedHeader.id}); setShowModuleForm(true);}}><Plus size={18} className="plus-purple" /></button>}
              </div>
              <div className="column-scroll-area">
                {showModuleForm && selectedHeader && (
                  <div className="inline-add-form animate-fade-in module-form-bg">
                    <div className="form-group"><label>Module Name <span className="req">*</span></label><input type="text" value={moduleFormData.moduleName} onChange={(e) => setModuleFormData({...moduleFormData, moduleName: e.target.value})} /></div>
                    <div className="form-row-2">
                        <div className="form-group"><label>Icon</label><input type="text" value={moduleFormData.icon} onChange={(e) => setModuleFormData({...moduleFormData, icon: e.target.value})} /></div>
                        <div className="form-group"><label>Status</label><select value={moduleFormData.status} onChange={(e) => setModuleFormData({...moduleFormData, status: e.target.value})}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                    </div>
                    <div className="form-group"><label>Link</label><input type="text" value={moduleFormData.link} onChange={(e) => setModuleFormData({...moduleFormData, link: e.target.value})} /></div>
                    <div className="form-group"><label>Sequence</label><input type="number" value={moduleFormData.sequence} onChange={(e) => setModuleFormData({...moduleFormData, sequence: parseInt(e.target.value) || 0})} /></div>
                    <div className="inline-form-actions">
                      <button className="btn-save-inline" onClick={handleModuleSave}><Save size={14} /> {moduleFormData.mode === "E" ? "Update" : "Add"}</button>
                      <button className="btn-cancel-inline" onClick={() => {setShowModuleForm(false); setModuleFormData(initialModuleState);}}><X size={14} /> Cancel</button>
                    </div>
                  </div>
                )}
                {selectedHeader && modules.map((m) => (
                  <div key={m.id} className={`module-item-card animate-fade-in ${selectedModule?.id === m.id ? "selected-header" : ""}`} onClick={() => handleModuleClick(m)}>
                    <div className="module-item-top">
                      <GripVertical size={14} className="drag-handle" />
                      <div className="module-text"><span className="m-name">{m.moduleName}</span><span className="m-subtext">{m.link || "No link"}</span></div>
 
                      <span className={`status-pill ${(m.status || "active").toLowerCase()}`}>
                        {m.status || "Active"}
                      </span>
                      <div className="item-actions">
                        <button className="edit-mini" onClick={(e) => {e.stopPropagation(); handleEditModule(m);}}><Pencil size={14} /></button>
                        <button className="del-mini" onClick={(e) => {e.stopPropagation(); handleDeleteModule(m);}}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="column-container">
              <div className="column-header">
                <div className="column-title-box"><Menu size={18} className="indigo-icon" /><span>Menus</span></div>
                {selectedModule && !showMenuForm && <button className="add-square-btn" onClick={() => {setMenuFormData({...initialMenuState, moduleId: selectedModule.id}); setShowMenuForm(true);}}><Plus size={18} className="plus-purple" /></button>}
              </div>
              <div className="column-scroll-area">
                {!selectedModule ? <div className="column-body-empty">Select a module</div> : (
                  <>
                    {showMenuForm && (
                      <div className="inline-add-form animate-fade-in menu-form-bg">
                        <div className="form-group"><label>Screen Name <span className="req">*</span></label><input type="text" value={menuFormData.screenName} onChange={(e) => setMenuFormData({...menuFormData, screenName: e.target.value})} /></div>
                        <div className="form-row-2">
                          <div className="form-group"><label>Icon</label><input type="text" value={menuFormData.icon} onChange={(e) => setMenuFormData({...menuFormData, icon: e.target.value})} placeholder="User" /></div>
                          <div className="form-group"><label>IsActive</label><select value={menuFormData.isActive ? "1" : "0"} onChange={(e) => setMenuFormData({...menuFormData, isActive: e.target.value === "1"})}><option value="1">Active</option><option value="0">Inactive</option></select></div>
                        </div>
                        <div className="form-group"><label>Screen URL</label><input type="text" value={menuFormData.screenUrl} onChange={(e) => setMenuFormData({...menuFormData, screenUrl: e.target.value})} placeholder="/users/list" /></div>
                        <div className="form-group"><label>Sequence</label><input type="number" value={menuFormData.sequence} onChange={(e) => setMenuFormData({...menuFormData, sequence: parseInt(e.target.value) || 0})} /></div>
                        <div className="form-group"><label>Service Type</label><div className="radio-options">
                            <label><input type="radio" value="SS" checked={menuFormData.isSelfService === "SS"} onChange={(e) => setMenuFormData({...menuFormData, isSelfService: e.target.value})} /> SS</label>
                            <label><input type="radio" value="HR" checked={menuFormData.isSelfService === "HR"} onChange={(e) => setMenuFormData({...menuFormData, isSelfService: e.target.value})} /> HR</label>
                            <label><input type="radio" value="BOTH" checked={menuFormData.isSelfService === "BOTH"} onChange={(e) => setMenuFormData({...menuFormData, isSelfService: e.target.value})} /> Both</label>
                        </div></div>
                        <div className="inline-form-actions">
                          <button className="btn-save-inline" onClick={handleMenuSave}><Save size={14} /> {menuFormData.mode === "E" ? "Update" : "Add"}</button>
                          <button className="btn-cancel-inline" onClick={() => {setShowMenuForm(false); setMenuFormData(initialMenuState);}}><X size={14} /> Cancel</button>
                        </div>
                      </div>
                    )}
                    {allMenus.filter(mn => mn.moduleId === selectedModule.id).map((mn) => (
                      <div key={mn.id} className="module-item-card animate-fade-in">
                        <div className="module-item-top">
                          <GripVertical size={14} className="drag-handle" />
                          <div className="module-text"><span className="m-name">{mn.screenName}</span><span className="m-subtext">{mn.screenUrl || "No URL"}</span></div>
                          <span className={`status-pill ${mn.isActive ? "active" : "inactive"}`}>{mn.isActive ? "Active" : "Inactive"}</span>
                          <div className="item-actions">
                            <button className="edit-mini" onClick={() => handleEditMenu(mn)}><Pencil size={14} /></button>
                            <button className="del-mini" onClick={() => handleDeleteMenu(mn)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
