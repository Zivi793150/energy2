import axios from 'axios';
import config from '../config';

// Проверка доступности localStorage
function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage недоступен:', e);
    return false;
  }
}

// Получаем текущего пользователя из localStorage
function getCurrentUserId() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Получаем ID пользователя из localStorage, если он там сохранен
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      return parsedUserData._id || parsedUserData.id;
    }
    
    // Если информации о пользователе нет, получаем ID из токена
    // Токены JWT имеют формат header.payload.signature
    // Из payload можно получить userId
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
    } catch (e) {
      console.error('Не удалось получить ID пользователя из токена:', e);
      return null;
    }
  } catch (e) {
    console.error('Ошибка при получении ID пользователя:', e);
    return null;
  }
}

// Получить ключ для хранения избранных товаров, уникальный для каждого пользователя
function getFavoritesKey() {
  const userId = getCurrentUserId();
  return userId ? `favorites_${userId}` : 'favorites_guest';
}

// Получить избранное из localStorage
export function getFavorites() {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const favoritesKey = getFavoritesKey();
    console.log(`Получаем избранные товары с ключом: ${favoritesKey}`);
    
    const favorites = localStorage.getItem(favoritesKey);
    const result = favorites ? JSON.parse(favorites) : [];
    console.log('Получены избранные товары:', result);
    return result;
  } catch (e) {
    console.error('Ошибка при получении избранных товаров:', e);
    return [];
  }
}

// Сохранить избранное в localStorage
export function setFavorites(favorites) {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const favoritesKey = getFavoritesKey();
    console.log(`Сохраняем избранные товары с ключом: ${favoritesKey}`, favorites);
    
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  } catch (e) {
    console.error('Ошибка при сохранении избранных товаров:', e);
  }
}

// Функция сравнения ID продуктов
function isSameProduct(item1, item2) {
  const id1 = item1._id || item1.id;
  const id2 = item2._id || item2.id;
  
  if (!id1 || !id2) {
    console.error('ID продукта не найден', item1, item2);
    return false;
  }
  
  console.log(`Сравниваем продукты: ${id1} и ${id2}`, id1 === id2);
  return id1 === id2;
}

// Функция получения ID продукта (для унификации)
function getProductId(product) {
  const id = product._id || product.id;
  if (!id) {
    console.error('ID продукта не найден', product);
  }
  return id;
}

// Добавить товар в избранное
export function addToFavorites(product) {
  console.log('Пытаемся добавить в избранное:', product);
  const favorites = getFavorites();
  
  // Проверяем, нет ли уже этого товара в избранном
  const productId = getProductId(product);
  if (!productId) return false;
  
  if (!favorites.some(item => getProductId(item) === productId)) {
    favorites.push(product);
    setFavorites(favorites);
    console.log('Товар добавлен в избранное');
    return true; // Товар добавлен
  }
  console.log('Товар уже был в избранном');
  return false; // Товар уже был в избранном
}

// Удалить товар из избранного
export function removeFromFavorites(productId) {
  console.log('Пытаемся удалить из избранного товар с ID:', productId);
  const favorites = getFavorites();
  
  const newFavorites = favorites.filter(item => {
    const itemId = getProductId(item);
    return itemId !== productId;
  });
  
  setFavorites(newFavorites);
  const wasRemoved = favorites.length !== newFavorites.length;
  console.log('Товар был удален?', wasRemoved);
  return wasRemoved; // Возвращаем true, если товар был удален
}

// Проверить, есть ли товар в избранном
export function isInFavorites(productId) {
  if (!productId) {
    console.error('isInFavorites: ID не определен');
    return false;
  }
  
  const favorites = getFavorites();
  const result = favorites.some(item => {
    const itemId = getProductId(item);
    return itemId === productId;
  });
  
  console.log(`Проверка наличия товара ${productId} в избранном:`, result);
  return result;
}

// Переключить статус товара в избранном
export function toggleFavorite(product) {
  console.log('Переключаем статус товара в избранном:', product);
  
  const productId = getProductId(product);
  if (!productId) return false;
  
  if (isInFavorites(productId)) {
    return removeFromFavorites(productId);
  } else {
    return addToFavorites(product);
  }
}

// Получить избранное с сервера
export async function fetchFavoritesFromServer() {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${config.apiUrl}/auth/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Добавить товар в избранное на сервере
export async function addFavoriteToServer(productId) {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${config.apiUrl}/auth/favorites/${productId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Удалить товар из избранного на сервере
export async function removeFavoriteFromServer(productId) {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${config.apiUrl}/auth/favorites/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 