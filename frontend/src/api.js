const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const registerUser = (body) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(body) });

export const loginUser = (body) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const getPlaces = () => request('/places');

export const searchPlaces = (query) => request(`/places/search?q=${encodeURIComponent(query)}`);

export const getRecommendation = (answers) =>
  request('/recommend', { method: 'POST', body: JSON.stringify(answers) });

export const getPlaceById = (id) => request(`/places/${id}`);

export default request;
