import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== "/" && envUrl !== "") {
    return envUrl;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export default api;