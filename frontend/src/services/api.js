const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred.');
  }
  return data;
}

export const api = {
  async getHealth() { return handleResponse(await fetch(`${API_BASE_URL}/health`)); },
  async login(email, password) {
    return handleResponse(await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }));
  },
  async checkAuth() { return handleResponse(await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })); },
  async logout() { return handleResponse(await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' })); },
  async getDashboard() { return handleResponse(await fetch(`${API_BASE_URL}/dashboard/summary`, { credentials: 'include' })); },
  async getClients(search = '') { return handleResponse(await fetch(`${API_BASE_URL}/clients?search=${encodeURIComponent(search)}`, { credentials: 'include' })); },
  async getClient(id) { return handleResponse(await fetch(`${API_BASE_URL}/clients/${id}`, { credentials: 'include' })); },
  async createClient(data) {
    return handleResponse(await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async updateClient(id, data) {
    return handleResponse(await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async getQuotations() { return handleResponse(await fetch(`${API_BASE_URL}/quotations`, { credentials: 'include' })); },
  async getQuotation(id) { return handleResponse(await fetch(`${API_BASE_URL}/quotations/${id}`, { credentials: 'include' })); },
  async createQuotation(data) {
    return handleResponse(await fetch(`${API_BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async updateQuotation(id, data) {
    return handleResponse(await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async shareQuotation(id) { return handleResponse(await fetch(`${API_BASE_URL}/quotations/${id}/share`, { method: 'POST', credentials: 'include' })); },
  async revokeQuotationShare(id) { return handleResponse(await fetch(`${API_BASE_URL}/quotations/${id}/revoke`, { method: 'POST', credentials: 'include' })); },
  async getPublicQuotation(token) { return handleResponse(await fetch(`${API_BASE_URL}/quotations/public/${token}`)); },
  async getInvoices() { return handleResponse(await fetch(`${API_BASE_URL}/invoices`, { credentials: 'include' })); },
  async getInvoice(id) { return handleResponse(await fetch(`${API_BASE_URL}/invoices/${id}`, { credentials: 'include' })); },
  async createInvoice(data) {
    return handleResponse(await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async addPayment(id, data) {
    return handleResponse(await fetch(`${API_BASE_URL}/invoices/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async cancelInvoice(id) { return handleResponse(await fetch(`${API_BASE_URL}/invoices/${id}/cancel`, { method: 'POST', credentials: 'include' })); },
  async getReceipts() { return handleResponse(await fetch(`${API_BASE_URL}/receipts`, { credentials: 'include' })); },
  async getReceipt(id) { return handleResponse(await fetch(`${API_BASE_URL}/receipts/${id}`, { credentials: 'include' })); },
  async createStandaloneReceipt(data) {
    return handleResponse(await fetch(`${API_BASE_URL}/receipts/standalone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
  async cancelReceipt(id) { return handleResponse(await fetch(`${API_BASE_URL}/receipts/${id}/cancel`, { method: 'POST', credentials: 'include' })); },
  async getFinancialReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return handleResponse(await fetch(`${API_BASE_URL}/reports?${query}`, { credentials: 'include' }));
  },
  async getSettings() { return handleResponse(await fetch(`${API_BASE_URL}/settings`, { credentials: 'include' })); },
  async updateSettings(data) {
    return handleResponse(await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }));
  },
};