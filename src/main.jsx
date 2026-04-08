import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'

axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
      
        const res = await axios.post('https://services.rs-apps.online/DynamicConfig/api/auth/refresh', {}, {
          _retry: true 
        });
        if (res.status === 200) {
          const newToken = res.data.token;

          localStorage.setItem("token", newToken);

          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {

        console.error("Refresh token expired. Logging out...");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

window.addEventListener("beforeunload", (event) => {

  const logoutUrl = 'https://services.rs-apps.online/DynamicConfig/api/auth/logout';
  navigator.sendBeacon(logoutUrl);
  
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)