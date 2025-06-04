// Базовый URL для API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Конфигурационный объект
const config = {
  apiUrl: API_URL,
  // Добавляем дополнительные настройки
  uploadsUrl: `${API_URL}/uploads`,
  authUrl: `${API_URL}/auth`,
  productsUrl: `${API_URL}/products`,
  ordersUrl: `${API_URL}/orders`
};

export default config; 