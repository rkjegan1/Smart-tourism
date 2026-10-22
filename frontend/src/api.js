/**
 * Centralized API client configured for multi-environment cloud deployment:
 * - Local Dev: http://localhost:5000/api (or custom VITE_API_URL)
 * - CloudFront Production: /api (same-origin routing to Elastic Beanstalk via CloudFront Origin)
 */
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // In production builds behind CloudFront, use relative /api
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error(`Network error connecting to API: ${err.message}`);
  }

  const contentType = res.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    const rawText = await res.text();
    const isHtml =
      rawText.trim().toLowerCase().startsWith('<!doctype') ||
      rawText.trim().toLowerCase().startsWith('<html');

    if (isHtml) {
      if (!res.ok) {
        throw new Error(
          `Server returned HTTP ${res.status} (${res.statusText || 'Error'}) with an HTML page`
        );
      }
      throw new Error(
        `API endpoint '${path}' returned an HTML document instead of JSON (HTTP ${res.status}). Verify backend deployment and API routing.`
      );
    }

    data = { message: rawText.trim() || res.statusText };
  }

  if (!res.ok) {
    const errorMsg =
      data?.message || `Request failed with HTTP status ${res.status} (${res.statusText || 'Error'})`;
    throw new Error(errorMsg);
  }

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

export const getHealth = () => request('/health');

export default request;
