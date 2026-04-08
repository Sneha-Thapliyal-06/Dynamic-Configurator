import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import axios from "axios";
import "./ScreenMaster.css";

export default function ScreenMaster() {
  const navigate = useNavigate();

  const loggedInUserId = Number(localStorage.getItem("userId")) || 0;

  const [formData, setFormData] = useState({
    sysId: 0,
    screenName: "",
    tableName: "",
    viewName: "",
    isSubmit: false,
    screenType: "",
    navigation: "",
    addbtn_qry: null,
    userId: loggedInUserId, 
    mode: "A",
  });

  useEffect(() => {
    const editData = localStorage.getItem("editScreenData");
    if (editData) {
      const parsed = JSON.parse(editData);
      setFormData({
        sysId: parsed.sysId || 0,
        screenName: parsed.screenName || "",
        tableName: parsed.tableName || parsed.screenTable || "",
        viewName: parsed.viewName || parsed.viewTableName || "",
        isSubmit: parsed.isSubmit || false,
        screenType: parsed.screenType || "",
        navigation: parsed.navigation || "",
        addbtn_qry: parsed.addbtn_qry || null,
        userId: loggedInUserId,
        mode: "E",
      });
    }
  }, [loggedInUserId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = async () => {
  
    if (!formData.screenName || !formData.tableName || !formData.screenType || !formData.navigation) {
      alert("Please fill all required fields marked with *");
      return;
    }

    try {
      const apiUrl = "https://services.rs-apps.online/DynamicConfig/api/screens/manage";
  
      const payload = {
        ...formData,
        sysId: Number(formData.sysId),
        userId: Number(loggedInUserId)
      };

      const response = await axios.post(apiUrl, payload);

      if (response.status === 200 || response.status === 201) {
  
        const generatedId = response.data.sysId || response.data;
        localStorage.setItem("currentScreenId", generatedId);

        navigate("/screen-groups");
      }
    } catch (error) {
      console.error("Error saving screen master:", error);
      alert("Failed to save data. Please check API connection.");
    }
  };

  return (
    <div className="screen-container">
      <Navigation activePage="screen" />
      <div className="main-content-wrapper">
        <div className="master-header">
          <div>
            <div className="master-title">
              {formData.mode === "E" ? "Edit Screen" : "Create New Screen"}
            </div>
            <div className="master-subtitle">Step 1 of 4: Screen Master</div>
          </div>
          <div className="cancel-btn" onClick={() => {
              localStorage.removeItem("editScreenData");
              navigate("/screen-config");
            }}>
            <span>✕</span> Cancel
          </div>
        </div>

        <div className="stepper-card">
          <div className="step-wrapper active">
            <div className="step-circle">1</div>
            <div className="step-label">Screen Master</div>
          </div>
          <div className="step-line"></div>
          <div className="step-wrapper">
            <div className="step-circle">2</div>
            <div className="step-label">Screen Groups</div>
          </div>
          <div className="step-line"></div>
          <div className="step-wrapper">
            <div className="step-circle">3</div>
            <div className="step-label">Fields Configuration</div>
          </div>
          <div className="step-line"></div>
          <div className="step-wrapper">
            <div className="step-circle">4</div>
            <div className="step-label">Field Validations</div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-header-group">
            <div className="form-title">Screen Master</div>
            <div className="form-desc">Define the basic properties of your screen</div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Screen Name <span className="req">*</span></label>
              <input name="screenName" type="text" autoComplete="off" value={formData.screenName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Table <span className="req">*</span></label>
              <input name="tableName" type="text" autoComplete="off" value={formData.tableName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Screen Type <span className="req">*</span></label>
              <select name="screenType" className="custom-select" value={formData.screenType} onChange={handleChange}>
                <option value="">Select type...</option>
                <option value="Master">Master</option>
                <option value="Transaction">Transaction</option>
                <option value="Report">Report</option>
              </select>
            </div>

            <div className="form-group">
              <label>View Name <span className="req">*</span></label>
              <input name="viewName" type="text" autoComplete="off" value={formData.viewName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Navigation <span className="req">*</span></label>
              <select name="navigation" className="custom-select" value={formData.navigation} onChange={handleChange}>
                <option value="">Select navigation...</option>
                <option value="EntityGrid">EntityGrid</option>
                <option value="EntityEdit">EntityEdit</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input name="isSubmit" type="checkbox" checked={formData.isSubmit} onChange={handleChange} />
                <span>Is Submit Screen? <span className="req">*</span></span>
              </label>
            </div>
          </div>
        </div>


        <div className="master-footer">
          <button className="btn-secondary" onClick={() => navigate("/screen-config")}>
            ‹ Back
          </button>
          <button className="btn-primary-next" onClick={handleNext}>
            {formData.mode === "E" ? "Update & Next ›" : "Next ›"}
          </button>
        </div>
      </div>
    </div>
  );
}