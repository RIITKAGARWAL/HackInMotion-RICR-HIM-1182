// ============================================================
// SpenSight API Client
// Universal fetch helper with dynamic environment detection,
// auth handling, 401 redirect, JSON error extraction, and REST helpers.
// ============================================================

// Dynamically target local port 5000 if frontend is served via Live Server (5500 / other ports),
// or use relative '/api' when running from Express backend or deployed on Render.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isDifferentLocalPort = isLocal && window.location.port !== '5000' && window.location.port !== '';

const API_BASE_URL = isDifferentLocalPort ? `http://${window.location.hostname}:5000/api` : '/api';

const TOKEN_KEY = 'spensight_token';
const USER_KEY = 'spensight_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (!window.location.pathname.endsWith('login.html')) {
    window.location.href = 'login.html';
  }
}

/**
 * Universal fetch helper.
 * @param {string} endpoint - API path (e.g. '/transactions')
 * @param {string} method - HTTP verb (GET, POST, PUT, DELETE)
 * @param {object|null} data - JSON body
 * @param {boolean} requiresAuth - attach Bearer token
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = { method, headers };

  if (data !== null && data !== undefined) {
    config.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (netErr) {
    const error = new Error('Network error — please check your connection.');
    error.kind = 'network';
    throw error;
  }

  if (response.status === 401 && requiresAuth) {
    handleUnauthorized();
    const error = new Error('Session expired. Please log in again.');
    error.status = 401;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { error: await response.text() };

  if (!response.ok) {
    const error = new Error(responseData.error || responseData.message || `API request failed (${response.status})`);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

/**
 * REST Helper Methods
 */
async function apiGet(endpoint, requiresAuth = true) {
  return apiRequest(endpoint, 'GET', null, requiresAuth);
}

async function apiPost(endpoint, data = {}, requiresAuth = true) {
  return apiRequest(endpoint, 'POST', data, requiresAuth);
}

async function apiPut(endpoint, data = {}, requiresAuth = true) {
  return apiRequest(endpoint, 'PUT', data, requiresAuth);
}

async function apiDelete(endpoint, requiresAuth = true) {
  return apiRequest(endpoint, 'DELETE', null, requiresAuth);
}

/**
 * Upload a file via multipart form-data with Bearer token.
 * @param {string} endpoint - API path (e.g. '/transactions/upload-csv')
 * @param {File} file - CSV or statement file
 * @param {string} fieldName - Form field name (defaults to 'statement')
 * @param {Object} [extraFields] - additional text fields appended to the body
 */
async function apiUpload(endpoint, file, fieldName = 'statement', extraFields = null) {
  const formData = new FormData();
  formData.append(fieldName, file);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (netErr) {
    const error = new Error('Network error while uploading the file.');
    error.kind = 'network';
    throw error;
  }

  if (response.status === 401) {
    handleUnauthorized();
    const error = new Error('Unauthorized upload.');
    error.status = 401;
    throw error;
  }

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(responseData.error || responseData.message || 'File upload failed.');
    error.status = response.status;
    throw error;
  }
  return responseData;
}
