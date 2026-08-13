// ============================================================
// SpenSight API Client
// Universal fetch helper with auth handling, 401 redirect,
// JSON error extraction and graceful failures.
// ============================================================

const API_BASE_URL = '/api';
const TOKEN_KEY = 'spensight_token';
const USER_KEY = 'spensight_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
  } catch (e) {
    return {};
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
 * @param {string} method  - HTTP verb
 * @param {object|null} data - JSON body
 * @param {boolean} requiresAuth - attach Bearer token
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
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
  }

  const contentType = response.headers.get('content-type') || '';
  const responseData = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : { error: await response.text() };

  if (!response.ok) {
    const error = new Error(responseData.error || `API request failed (${response.status})`);
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return responseData;
}

/**
 * POST JSON with Bearer token (alias kept for convenience).
 */
async function apiPost(endpoint, data = {}) {
  return apiRequest(endpoint, 'POST', data, true);
}

/**
 * Upload a file via multipart form-data with Bearer token.
 */
async function apiUpload(endpoint, file) {
  const formData = new FormData();
  formData.append('statement', file);

  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers, body: formData });
  } catch (netErr) {
    const error = new Error('Network error while uploading the file.');
    error.kind = 'network';
    throw error;
  }

  if (response.status === 401) handleUnauthorized();

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(responseData.error || 'File upload failed.');
    error.status = response.status;
    throw error;
  }
  return responseData;
}
