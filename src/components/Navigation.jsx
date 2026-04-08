import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Monitor, Boxes, GitBranch, LogOut } from "lucide-react"; 
import axios from "axios";
import "./Navigation.css";

export default function Navigation({ activePage }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false); 

 const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token"); 
    
    await axios.post("https://services.rs-apps.online/DynamicConfig/api/auth/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}` 
      },
      withCredentials: true
    });

    localStorage.clear();
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
    localStorage.clear();
    window.location.href = "/login";
  }
  };

  const getIconColor = (page) => (activePage === page ? "#ffffff" : "#4b5563");

  return (
    <div className="top-hub">

      <div className="left-hub-container" style={{ position: 'relative' }}>
        <div className="left-hub" onClick={() => setShowLogout(!showLogout)}>
          <div className="hub-icon-box">
            <LayoutDashboard size={24} color="white" fill="white" />
          </div>
          <div className="hub-text-wrapper">
            <div className="hub-main">Configuration Hub</div>
            <div className="hub-sub">Hierarchical structure</div>
          </div>
        </div>

        {showLogout && (
          <div className="logout-dropdown" onClick={handleLogout}>
            <LogOut size={16} color="#ef4444" />
            <span>Logout</span>
          </div>
        )}
      </div>

      <div className="nav-items">
      
      <div 
        className={`hub-item ${activePage === 'dashboard' ? 'active-dashboard' : ''}`} 
        onClick={() => navigate("/")}
      >
        <LayoutDashboard size={18} color={getIconColor('dashboard')} /> 

        <span style={{ color: getIconColor('dashboard') }}>Dashboard</span>
      </div>

        <div 
          className={`hub-item ${activePage === 'screen' ? 'active-screen' : ''}`} 
          onClick={() => navigate("/screen-config")} 
        >
          <Monitor size={18} color={getIconColor('screen')} /> 
          <span>Screen Configuration</span>
        </div>

        <div 
          className={`hub-item ${activePage === 'module' ? 'active-module' : ''}`} 
          onClick={() => navigate("/module-menu-config")}
        >
          <Boxes size={18} color={getIconColor('module')} /> 
          <span>Module & Menu Configuration</span>
        </div>

        <div 
          className={`hub-item ${activePage === 'workflow' ? 'active-workflow' : ''}`} 
          onClick={() => navigate("/workflow")}
        >
          <GitBranch size={18} color={getIconColor('workflow')} /> 
          <span>Workflow Configuration</span>
        </div>
      </div>
    </div>
  );
}