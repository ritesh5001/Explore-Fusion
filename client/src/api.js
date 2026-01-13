import axios from 'axios';

// UPDATED: Pointing to Gateway on Port 5050
const API = axios.create({
  baseURL: 'http://localhost:5050/api/v1',
});

// Automatically add the Token to every request if we have one
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;