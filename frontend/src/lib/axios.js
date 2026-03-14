import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Safeguard: If we are in production but the URL points to localhost, ignore it.
  // This prevents "Network Error" on mobile devices when Render is misconfigured.
  if (import.meta.env.PROD && envUrl && envUrl.includes("localhost")) {
    return "/api";
  }

  if (envUrl && envUrl !== "/" && envUrl !== "") {
    return envUrl;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export default api;