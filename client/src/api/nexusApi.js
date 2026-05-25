import axios from 'axios';

const nexusApi = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Inject authorization token automatically into outgoing network calls
nexusApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default nexusApi;