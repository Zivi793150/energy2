import { API_ENDPOINTS, fetchConfig } from './config.js';

// Аутентификация
export const authService = {
  async register(userData) {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async login(credentials) {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  async getCurrentUser() {
    const response = await fetch(API_ENDPOINTS.AUTH.ME, fetchConfig);
    return response.json();
  },

  logout() {
    localStorage.removeItem('token');
  }
};

// Продукты
export const productService = {
  async getProducts(params = {}) {
    // Удаляем undefined значения
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${API_ENDPOINTS.PRODUCTS.LIST}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Request URL:', url); // Для отладки
    
    const response = await fetch(url, fetchConfig);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async getTopProducts(limit = 10) {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS.TOP_RATED}?limit=${limit}`, fetchConfig);
    return response.json();
  },

  async getProduct(id) {
    const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id), fetchConfig);
    return response.json();
  },

  async rateProduct(id, ratingData) {
    const response = await fetch(API_ENDPOINTS.PRODUCTS.RATE(id), {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
    return response.json();
  }
};

// Промокоды
export const promoService = {
  async validatePromo(code, amount) {
    const response = await fetch(API_ENDPOINTS.PROMOS.VALIDATE, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    });
    return response.json();
  },

  async getPromo(code) {
    const response = await fetch(API_ENDPOINTS.PROMOS.DETAIL(code), fetchConfig);
    return response.json();
  }
}; 