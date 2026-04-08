import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import ScreenConfig from "./pages/ScreenConfig";
import ScreenMaster from "./pages/ScreenMaster";
import ScreenGroups from './pages/ScreenGroups';
import FieldConfiguration from "./pages/FieldConfiguration";
import FieldValidations from "./pages/FieldValidations"; 
import ModuleMenuConfig from "./pages/ModuleMenuConfig";
import WorkflowConfig from "./pages/WorkflowConfig";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/screen-config" element={<ProtectedRoute><ScreenConfig /></ProtectedRoute>} />
        <Route path="/screen-master" element={<ProtectedRoute><ScreenMaster /></ProtectedRoute>} />
        <Route path="/screen-groups" element={<ProtectedRoute><ScreenGroups /></ProtectedRoute>} />
        <Route path="/field-config" element={<ProtectedRoute><FieldConfiguration /></ProtectedRoute>} />
        <Route path="/field-validations" element={<ProtectedRoute><FieldValidations /></ProtectedRoute>} />
        <Route path="/module-menu-config" element={<ProtectedRoute><ModuleMenuConfig /></ProtectedRoute>} />
        

        <Route path="/workflow" element={<ProtectedRoute><WorkflowConfig /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}