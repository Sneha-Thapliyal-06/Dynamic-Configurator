import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://services.rs-apps.online/DynamicConfig/api/auth/login", {
        Email_Work: email,
        password: password,
      },
      {
        withCredentials: true 
      }
    );

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", response.data.username);

      localStorage.setItem("userId", response.data.id); 

      console.log("Login Success! User ID:", response.data.id);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Username or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        <div className="login-brand-section">
          
          <h2 className="brand-title">LOGIN</h2>
          <p className="brand-subtitle">Please enter your details to login</p>
        </div>

        <form onSubmit={handleLogin} className="login-main-form">
          {error && <div className="login-error-alert">{error}</div>}
          
          <div className="login-field-group">
            <label className="login-field-label">Employee Email</label>
            <input
              className="login-field-input"
              type="email"
              placeholder="e.g. name@company.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field-group">
            <label className="login-field-label">Password</label>
            <input
              className="login-field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-action" disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}