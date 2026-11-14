const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {}, token = null } = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Get token from localStorage if in browser and not provided
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('smart_rent_token');
  }

  const finalHeaders = {
    ...headers,
  };

  if (!(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (authToken) {
    finalHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.errors?.[0]?.message || data?.errors?.[0] || `Request failed with status ${res.status}`;
      const errorObj = new Error(errorMsg);
      errorObj.status = res.status;
      errorObj.data = data;
      throw errorObj;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
