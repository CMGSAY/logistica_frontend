import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${backendUrl}/api`, 
});

export default api;
