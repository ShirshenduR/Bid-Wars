import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'player';
}

export interface Item {
  id: number;
  title: string;
  description: string;
  starting_price: string;
  max_amount?: string;
  created_at: string;
  is_active: boolean;
  created_by: string;
  current_highest_bid: string;
  current_highest_bidder: string | null;
  bid_count: number;
}

export interface Bid {
  id: number;
  item: number;
  user: string;
  bid_amount: string;
  bid_time: string;
  item_title: string;
}

export interface BidHistory {
  id: number;
  user: string;
  bid_amount: string;
  bid_time: string;
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },
  
  register: async (username: string, email: string, password: string, password_confirm: string, role: string = 'player') => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm,
      role,
    });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
};

// Items API
export const itemsAPI = {
  getAll: async () => {
    const response = await api.get('/items/');
    return response.data;
  },
  
  getActive: async () => {
    const response = await api.get('/items/active/');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/items/${id}/`);
    return response.data;
  },
  
  create: async (item: Partial<Item>) => {
    const response = await api.post('/items/', item);
    return response.data;
  },
  
  update: async (id: number, item: Partial<Item>) => {
    const response = await api.put(`/items/${id}/`, item);
    return response.data;
  },
  
  toggleStatus: async (id: number) => {
    const response = await api.post(`/items/${id}/toggle-status/`);
    return response.data;
  },
  
  getCurrentHighestBid: async (id: number) => {
    const response = await api.get(`/items/${id}/highest-bid/`);
    return response.data;
  },
  
  getBidHistory: async (id: number) => {
    const response = await api.get(`/items/${id}/bids/`);
    return response.data;
  },
};

// Bids API
export const bidsAPI = {
  create: async (itemId: number, bidAmount: string) => {
    const response = await api.post('/bids/', {
      item: itemId,
      bid_amount: bidAmount,
    });
    return response.data;
  },
  
  getUserBids: async () => {
    const response = await api.get('/bids/');
    return response.data;
  },
  
  getItemBids: async (itemId: number) => {
    const response = await api.get(`/bids/?item_id=${itemId}`);
    return response.data;
  },
};

export default api;