import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Plus, Database, Edit2, Trash2 } from "lucide-react";
import Navigation from "../components/Navigation";
import axios from "axios";
import "./ScreenConfig.css";

export default function ScreenConfig() {
  const navigate = useNavigate();
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreensAndCounts();
  }, []);

  const fetchScreensAndCounts = async () => {
    try {
      setLoading(true);
      

      const screensRes = await axios.get("https://services.rs-apps.online/DynamicConfig/api/screens");
      const screenData = Array.isArray(screensRes.data) ? screensRes.data : [];

      const [groupsRes, fieldsRes, valRes] = await Promise.all([
        axios.get("https://services.rs-apps.online/DynamicConfig/api/groups"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/group-fields"),
        axios.get("https://services.rs-apps.online/DynamicConfig/api/field-validation")
      ]);

      const allGroups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
      const allFields = Array.isArray(fieldsRes.data) ? fieldsRes.data : [];
      const allValidations = Array.isArray(valRes.data) ? valRes.data : [];

      const enrichedScreens = screenData.map(screen => {
        const sId = screen.sysID || screen.sysId;


        const screenGroups = allGroups.filter(g => Number(g.screenId) === Number(sId));
        const gCount = screenGroups.length;


        const groupIds = screenGroups.map(g => g.sysID || g.sysId);
        const fCount = allFields.filter(f => groupIds.includes(Number(f.groupId))).length;


        const fieldIds = allFields
          .filter(f => groupIds.includes(Number(f.groupId)))
          .map(f => f.sysId || f.sysID);
        const vCount = allValidations.filter(v => fieldIds.includes(Number(v.fieldID))).length;

        return {
          ...screen,
          groupCount: gCount,
          fieldCount: fCount,
          validationCount: vCount
        };
      });

      setScreens(enrichedScreens);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleEdit = (screen) => {
    localStorage.setItem("currentScreenId", screen.sysID || screen.sysId);
    const editData = { ...screen, sysId: screen.sysID || screen.sysId, mode: "E" };
    localStorage.setItem("editScreenData", JSON.stringify(editData));
    navigate("/screen-master");
  };

  const handleDelete = async (screen) => {
    if (window.confirm(`Are you sure you want to delete "${screen.screenName}"?`)) {
      try {
        const payload = { sysId: Number(screen.sysID || screen.sysId), mode: "D", userId: 0 };
        await axios.post("https://services.rs-apps.online/DynamicConfig/api/screens/manage", payload);
        alert("Screen deleted successfully");
        fetchScreensAndCounts();
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="screen-container">
      <Navigation activePage="screen" />
      <div className="main-content-wrapper">
        <div className="header">
          <div>
            <div className="title">Screen Configuration</div>
            <div className="subtitle">Manage all screen configurations in one place</div>
          </div>
          <button className="btn-primary" onClick={() => {
            localStorage.removeItem("currentScreenId");
            localStorage.removeItem("editScreenData");
            navigate("/screen-master");
          }}>
            <Plus size={18} /> Add New Screen
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading configurations...</div>
        ) : screens.length > 0 ? (
          <div className="screen-grid">
            {screens.map((screen) => (
              <div key={screen.sysID || screen.sysId} className="screen-card">
                <div className="card-header-top">
                  <div className="icon-box"><Monitor size={24} color="#2563eb" /></div>
                  <div className="header-info">
                    <h3 className="screen-name">{screen.screenName}</h3>
                    <span className="screen-type-badge">{screen.screenType || "Form"}</span>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(screen)} className="edit-btn"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(screen)} className="del-btn"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="table-row">
                  <Database size={14} /> 
                  <span>Table: <span className="table-pill">{screen.tableName}</span></span>
                </div>


                <div className="stats-container">
                  <div className="stat-box">
                    <div className="stat-val blue">{screen.groupCount}</div>
                    <div className="stat-lbl">Groups</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-box">
                    <div className="stat-val green">{screen.fieldCount}</div>
                    <div className="stat-lbl">Fields</div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-box">
                    <div className="stat-val orange">{screen.validationCount}</div>
                    <div className="stat-lbl">Validations</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-box">
             <Monitor size={70} color="#cbd5e1" />
             <div className="empty-text">No screens configured yet</div>
             <button className="btn-primary" onClick={() => navigate("/screen-master")}>+ Create Screen</button>
          </div>
        )}
      </div>
    </div>
  );
}