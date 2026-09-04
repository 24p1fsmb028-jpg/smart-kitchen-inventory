/**
 * Centralized API client for Smart Kitchen Inventory
 */

// Dynamically resolve API base:
// - Port 3000 → use Vite proxy (/api)
// - Port 3001+ → Vite proxy not available, hit backend directly
const API_BASE = (typeof window !== 'undefined' && window.location.port === '3001')
  ? `http://${window.location.hostname}:5000/api`
  : '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const tryFetch = async (baseUrl) => {
    const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`API returned unexpected format (${res.status}).`);
    }
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || json.message || `Request failed with status ${res.status}`);
    }
    return json;
  };

  try {
    return await tryFetch('/api');
  } catch (err) {
    try {
      const fallbackHost = typeof window !== 'undefined' && window.location.hostname
        ? window.location.hostname
        : 'localhost';
      return await tryFetch(`http://${fallbackHost}:5000/api`);
    } catch (fallbackErr) {
      console.warn(`API [${options.method || 'GET'} ${endpoint}]:`, err.message);
      throw err;
    }
  }
}

export const api = {
  // Stats
  getStats: () => request('/stats'),

  // Categories
  getCategories: () => request('/categories'),
  getCategory: (id) => request(`/categories/${id}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.append('category_id', params.category_id);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request(`/items${qs ? `?${qs}` : ''}`);
  },
  getItem: (id) => request(`/items/${id}`),
  createItem: (data) => request('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adjustItemQuantity: (id, delta, quantity) =>
    request(`/items/${id}/quantity`, { method: 'PATCH', body: JSON.stringify({ delta, quantity }) }),
  restockItem: (id, quantity) =>
    request(`/items/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Alerts
  getAlerts: (limit = 100) => request(`/alerts?limit=${limit}`),
  getUnreadCount: () => request('/alerts/unread-count'),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: 'PATCH' }),
  markAllAlertsRead: () => request('/alerts/read-all', { method: 'POST' }),
  deleteAlert: (id) => request(`/alerts/${id}`, { method: 'DELETE' }),
  clearAllAlerts: () => request('/alerts', { method: 'DELETE' }),

  // Shopping List
  getShoppingList: () => request('/shopping-list'),
  toggleShoppingItem: (itemId, checked) =>
    request(`/shopping-list/check/${itemId}`, { method: 'PATCH', body: JSON.stringify({ checked }) }),
  restockCheckedShoppingList: () =>
    request('/shopping-list/restock-checked', { method: 'POST' }),

  // Settings & Data
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => request('/settings/reset', { method: 'POST' }),
  exportData: () => request('/settings/export'),
  importData: (data) => request('/settings/import', { method: 'POST', body: JSON.stringify(data) })
};
