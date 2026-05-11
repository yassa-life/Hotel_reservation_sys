/**
 * API Client — connects React frontend to Java Servlet backend
 * Base URL: http://localhost:8080/hotel-system/api
 *
 * All functions throw on error — callers handle their own fallback/UX.
 * NO silent dummy-data injection for auth calls.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hotel-system/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (!res.ok) {
    // Use backend error message if available
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return body;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomsApi = {
  getAll:  ()     => request('/rooms'),
  getById: (id)   => request(`/rooms?id=${id}`),
  create:  (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data) => request('/rooms', { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)   => request(`/rooms?id=${id}`, { method: 'DELETE' }),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  getAll: () => request('/customers'),
  getById: (id) => request(`/customers?id=${id}`),

  /** Secure server-side login — returns { success, customer } */
  login: async (email, password) => {
    const data = await request('/customers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!data.success) throw new Error(data.message || 'Login failed');
    return data.customer;
  },

  /** Register a new customer — returns { success, customer } */
  register: async (data) => {
    const result = await request('/customers', { method: 'POST', body: JSON.stringify(data) });
    if (!result.success) throw new Error(result.message || 'Registration failed');
    return result.customer;
  },

  /** Update profile — returns { success } */
  update: (data) => request('/customers', { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) => request(`/customers?id=${id}`, { method: 'DELETE' }),
};

// ─── Reservations ─────────────────────────────────────────────────────────────
export const reservationsApi = {
  getAll: () => request('/reservations'),

  /** Get reservations for a specific customer */
  getByCustomer: (customerId) => request(`/reservations?customerId=${customerId}`),

  /** Get booked date ranges for a specific room (for date picker blocking) */
  getBookedDates: (roomId) => request(`/reservations?roomId=${roomId}&bookedDates=true`),

  create: (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  update: (data) => request('/reservations', { method: 'PUT',  body: JSON.stringify(data) }),
  cancel: (id)   => request(`/reservations?id=${id}`, { method: 'DELETE' }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll:  ()     => request('/payments'),
  create:  (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data) => request('/payments', { method: 'PUT',  body: JSON.stringify(data) }),
};

// ─── Staff / Admin ────────────────────────────────────────────────────────────
export const staffApi = {
  getAll:  ()               => request('/staff'),
  login:   (email, password) => request('/staff/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  create:  (data)           => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data)           => request('/staff', { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)             => request(`/staff?id=${id}`, { method: 'DELETE' }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  getSummary: ()       => request('/reports'),
  getFull:    ()       => request('/reports/full'),
  /** Pass year (e.g. 2025) or 0 / undefined for current year */
  getRevenue: (year)   => request(`/reports/revenue${year ? `?year=${year}` : ''}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll:         ()             => request('/reviews'),
  /** Get reviews written by a specific customer (includes room info) */
  getByCustomer:  (customerId)   => request(`/reviews?customerId=${customerId}`),
  create:         (data)         => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  /** Update rating + comment for a review the customer owns */
  update:         (data)         => request('/reviews', { method: 'PUT',  body: JSON.stringify(data) }),
  /** Delete a review — pass customerId for owner-safe delete */
  delete:         (id, customerId) =>
    request(`/reviews?id=${id}${customerId ? `&customerId=${customerId}` : ''}`, { method: 'DELETE' }),
};
