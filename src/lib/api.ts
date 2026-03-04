import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// tRPC-like helper for query/mutation
async function trpcQuery<T>(path: string, input?: Record<string, unknown>): Promise<T> {
  const params = input ? { input: JSON.stringify(input) } : {};
  const res = await api.get(`/trpc/${path}`, { params });
  return res.data?.result?.data;
}

async function trpcMutation<T>(path: string, input: Record<string, unknown>): Promise<T> {
  const res = await api.post(`/trpc/${path}`, input);
  return res.data?.result?.data;
}

// ==================== SETTINGS ====================
export const settingsApi = {
  get: () => trpcQuery<any>('settings.get'),
  update: (data: any) => trpcMutation<any>('settings.update', data),
};

// ==================== BARBERS ====================
export const barbersApi = {
  list: () => trpcQuery<any[]>('barbers.list'),
  get: (id: number) => trpcQuery<any>('barbers.get', { id }),
  create: (data: any) => trpcMutation<any>('barbers.create', data),
  update: (id: number, data: any) => trpcMutation<any>('barbers.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('barbers.delete', { id }),
};

// ==================== SERVICES ====================
export const servicesApi = {
  list: () => trpcQuery<any[]>('services.list'),
  get: (id: number) => trpcQuery<any>('services.get', { id }),
  create: (data: any) => trpcMutation<any>('services.create', data),
  update: (id: number, data: any) => trpcMutation<any>('services.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('services.delete', { id }),
};

// ==================== CLIENTS ====================
export const clientsApi = {
  list: () => trpcQuery<any[]>('clients.list'),
  get: (id: number) => trpcQuery<any>('clients.get', { id }),
  create: (data: any) => trpcMutation<any>('clients.create', data),
  update: (id: number, data: any) => trpcMutation<any>('clients.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('clients.delete', { id }),
};

// ==================== APPOINTMENTS ====================
export const appointmentsApi = {
  list: (filters?: { date?: string; barberId?: number; status?: string }) => trpcQuery<any[]>('appointments.list', filters),
  get: (id: number) => trpcQuery<any>('appointments.get', { id }),
  create: (data: any) => trpcMutation<any>('appointments.create', data),
  update: (id: number, data: any) => trpcMutation<any>('appointments.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('appointments.delete', { id }),
};

// ==================== FINANCIAL ====================
export const financialApi = {
  list: (filters?: { startDate?: string; endDate?: string; type?: string }) => trpcQuery<any[]>('financial.list', filters),
  create: (data: any) => trpcMutation<any>('financial.create', data),
  update: (id: number, data: any) => trpcMutation<any>('financial.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('financial.delete', { id }),
};

// ==================== COMMISSIONS ====================
export const commissionsApi = {
  list: (filters?: { barberId?: number; period?: string }) => trpcQuery<any[]>('commissions.list', filters),
  create: (data: any) => trpcMutation<any>('commissions.create', data),
  update: (id: number, data: any) => trpcMutation<any>('commissions.update', { id, data }),
};

// ==================== PARTNERS ====================
export const partnersApi = {
  list: () => trpcQuery<any[]>('partners.list'),
  create: (data: any) => trpcMutation<any>('partners.create', data),
  update: (id: number, data: any) => trpcMutation<any>('partners.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('partners.delete', { id }),
};

// ==================== PRODUCTS ====================
export const productsApi = {
  list: () => trpcQuery<any[]>('products.list'),
  get: (id: number) => trpcQuery<any>('products.get', { id }),
  create: (data: any) => trpcMutation<any>('products.create', data),
  update: (id: number, data: any) => trpcMutation<any>('products.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('products.delete', { id }),
};

// ==================== REVIEWS ====================
export const reviewsApi = {
  list: (barberId?: number) => trpcQuery<any[]>('reviews.list', barberId ? { barberId } : undefined),
  create: (data: any) => trpcMutation<any>('reviews.create', data),
};

// ==================== LOYALTY ====================
export const loyaltyApi = {
  rewards: {
    list: () => trpcQuery<any[]>('loyalty.rewards.list'),
    create: (data: any) => trpcMutation<any>('loyalty.rewards.create', data),
    update: (id: number, data: any) => trpcMutation<any>('loyalty.rewards.update', { id, data }),
    delete: (id: number) => trpcMutation<void>('loyalty.rewards.delete', { id }),
  },
  transactions: {
    list: (clientId?: number) => trpcQuery<any[]>('loyalty.transactions.list', clientId ? { clientId } : undefined),
    create: (data: any) => trpcMutation<any>('loyalty.transactions.create', data),
  },
};

// ==================== APP USERS ====================
export const appUsersApi = {
  list: () => trpcQuery<any[]>('appUsers.list'),
  get: (id: number) => trpcQuery<any>('appUsers.get', { id }),
  create: (data: any) => trpcMutation<any>('appUsers.create', data),
  update: (id: number, data: any) => trpcMutation<any>('appUsers.update', { id, data }),
  delete: (id: number) => trpcMutation<void>('appUsers.delete', { id }),
};

// ==================== PROFIT DISTRIBUTIONS ====================
export const profitDistributionsApi = {
  list: () => trpcQuery<any[]>('profitDistributions.list'),
  create: (data: any) => trpcMutation<any>('profitDistributions.create', data),
  update: (id: number, data: any) => trpcMutation<any>('profitDistributions.update', { id, data }),
};

export default api;
