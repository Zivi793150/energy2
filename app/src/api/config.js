const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // Продукты
  PRODUCTS: {
    LIST: `${API_BASE_URL}/products`,
    TOP_RATED: `${API_BASE_URL}/products/top-rated`,
    DETAIL: (id) => `${API_BASE_URL}/products/${id}`,
    RATE: (id) => `${API_BASE_URL}/products/${id}/rate`,
  },
  
  // Промокоды
  PROMOS: {
    VALIDATE: `${API_BASE_URL}/promos/validate`,
    DETAIL: (code) => `${API_BASE_URL}/promos/${code}`,
  }
};

// Функция для создания заголовков с токеном
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Базовые настройки для fetch
export const fetchConfig = {
  credentials: 'include',
  headers: getAuthHeaders(),
  mode: 'cors',
}; 