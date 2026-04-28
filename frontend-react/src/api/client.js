/**
 * API Client - connects React frontend to Java Servlet backend
 * Base URL: http://localhost:8080/hotel-system
 */

import { ROOMS, CUSTOMERS, BOOKINGS, REVENUE_DATA } from '../data/mockData';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hotel-system/api').replace(/\/$/, '');
let warnedOffline = false;

const mockStore = {
  rooms: [...ROOMS],
  customers: [...CUSTOMERS],
  reservations: [...BOOKINGS],
  payments: [],
  staff: [{ id: 1, name: 'Admin (Demo)', email: 'admin@harborview.lk', role: 'Admin' }],
  reviews: [],
  revenue: [...REVENUE_DATA],
};

function resolveMock(path) {
  if (path.startsWith('/rooms')) return mockStore.rooms;
  if (path.startsWith('/customers')) return mockStore.customers;
  if (path.startsWith('/reservations')) return mockStore.reservations;
  if (path.startsWith('/payments')) return mockStore.payments;
  if (path.startsWith('/staff')) return mockStore.staff;
  if (path.startsWith('/reviews')) return mockStore.reviews;
  if (path.startsWith('/reports/revenue')) return mockStore.revenue;
  if (path.startsWith('/reports')) {
    const totalRevenue = mockStore.reservations.reduce((sum, r) => sum + Number(r.totalAmount ?? r.total_amount ?? r.amount ?? 0), 0);
    const availableRooms = mockStore.rooms.filter(r => (r.status || '').toLowerCase() === 'available').length;
    return {
      totalReservations: mockStore.reservations.length,
      totalRevenue,
      availableRooms,
    };
  }
  return [];
}

function applyMockMutation(path, method, body) {
  const list = resolveMock(path);
  if (!Array.isArray(list)) return list;
  if (method === 'POST' && body && typeof body === 'object') {
    list.unshift({ ...body, id: body.id ?? `${Date.now()}` });
    return body;
  }
  if (method === 'PUT' && body && typeof body === 'object') {
    const id = body.id ?? body.roomId ?? body.customerId ?? body.reservationId;
    const idx = list.findIndex(item =>
      [item.id, item.roomId, item.customerId, item.reservationId].includes(id)
    );
    if (idx >= 0) list[idx] = { ...list[idx], ...body };
    return body;
  }
  if (method === 'DELETE') {
    const idMatch = /[?&]id=([^&]+)/.exec(path);
    if (idMatch) {
      const id = decodeURIComponent(idMatch[1]);
      const idx = list.findIndex(item =>
        [String(item.id), String(item.roomId), String(item.customerId), String(item.reservationId)].includes(String(id))
      );
      if (idx >= 0) list.splice(idx, 1);
    }
    return { success: true };
  }
  return list;
}

function offlineFallback(path, options = {}) {
  if (!warnedOffline) {
    console.warn('[API] Backend unreachable, using local dummy data.');
    warnedOffline = true;
  }
  const method = (options.method || 'GET').toUpperCase();
  const body = typeof options.body === 'string' ? JSON.parse(options.body || '{}') : options.body;
  if (path.startsWith('/staff/login')) {
    const email = body?.email || 'admin@harborview.lk';
    return { success: true, staff: { id: 1, name: 'Admin (Demo)', email, role: 'Admin' } };
  }
  if (method === 'GET') return resolveMock(path);
  return applyMockMutation(path, method, body);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return offlineFallback(path, options);
  }
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
  getAll:   ()     => request('/customers'),
  getById:  (id)   => request(`/customers?id=${id}`),
  login:    async (email, password) => {
    const custs = await request('/customers');
    const user = Array.isArray(custs) ? custs.find(c => c.email === email && c.password === password) : null;
    if (!user) throw new Error('Invalid credentials');
    return user;
  },
  register: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update:   (data) => request('/customers', { method: 'PUT',  body: JSON.stringify(data) }),
  delete:   (id)   => request(`/customers?id=${id}`, { method: 'DELETE' }),
};

// ─── Reservations ─────────────────────────────────────────────────────────────
export const reservationsApi = {
  getAll:  ()     => request('/reservations'),
  create:  (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data) => request('/reservations', { method: 'PUT',  body: JSON.stringify(data) }),
  cancel:  (id)   => request(`/reservations?id=${id}`, { method: 'DELETE' }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll:  ()     => request('/payments'),
  create:  (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data) => request('/payments', { method: 'PUT',  body: JSON.stringify(data) }),
};

// ─── Staff / Auth ─────────────────────────────────────────────────────────────
export const staffApi = {
  getAll:  ()                      => request('/staff'),
  login:   (email, password)       => request('/staff/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  create:  (data)                  => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update:  (data)                  => request('/staff', { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)                    => request(`/staff?id=${id}`, { method: 'DELETE' }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  getSummary: ()  => request('/reports'),
  getFull:    ()  => request('/reports/full'),
  getRevenue: ()  => request('/reports/revenue'),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll:  ()     => request('/reviews'),
  create:  (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};
