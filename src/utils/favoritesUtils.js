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
    if (!token) {
      console.log('Токен не найден в localStorage');
      return null;
    }
    
    // Сначала пробуем получить из userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData && (parsedUserData._id || parsedUserData.id)) {
          console.log('ID пользователя получен из userData:', parsedUserData._id || parsedUserData.id);
          return parsedUserData._id || parsedUserData.id;
        }
      } catch (e) {
        console.error('Ошибка при парсинге userData:', e);
      }
    }
    
    // Если не получилось из userData, пробуем из токена
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const userId = decodedPayload.id || decodedPayload.userId || decodedPayload.sub;
      if (userId) {
        console.log('ID пользователя получен из токена:', userId);
        return userId;
      }
    } catch (e) {
      console.error('Ошибка при получении ID пользователя из токена:', e);
    }
    
    console.log('Не удалось получить ID пользователя ни из userData, ни из токена');
    return null;
  } catch (e) {
    console.error('Общая ошибка при получении ID пользователя:', e);
    return null;
  }
}

// Получить ключ для хранения избранных товаров, уникальный для каждого пользователя
function getFavoritesKey() {
  const userId = getCurrentUserId();
  const key = userId ? `favorites_${userId}` : 'favorites_guest';
  console.log('Используется ключ для избранного:', key);
  return key;
}

// Получить избранные товары
export function getFavorites() {
  try {
    const key = getFavoritesKey();
    const favorites = localStorage.getItem(key);
    if (!favorites) {
      console.log('Избранные товары не найдены в localStorage, инициализируем пустой массив');
      const emptyFavorites = [];
      localStorage.setItem(key, JSON.stringify(emptyFavorites));
      return emptyFavorites;
    }
    const parsedFavorites = JSON.parse(favorites);
    console.log('Получены избранные товары:', parsedFavorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch (e) {
    console.error('Ошибка при получении избранных товаров:', e);
    return [];
  }
}

// Сохранить избранные товары
export function setFavorites(favorites) {
  try {
    const key = getFavoritesKey();
    if (!Array.isArray(favorites)) {
      console.error('Попытка сохранить невалидные данные избранного:', favorites);
      return;
    }
    localStorage.setItem(key, JSON.stringify(favorites));
    console.log('Избранные товары сохранены:', favorites);
    window.dispatchEvent(new Event('favoritesUpdated'));
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

// Получить ID продукта
export function getProductId(product) {
  if (!product) {
    console.error('getProductId: продукт не определен');
    return null;
  }
  return product._id || product.id;
}

// Проверить, есть ли товар в избранном
export function isInFavorites(productId, favoritesArray) {
  if (!productId) {
    console.error('isInFavorites: ID не определен');
    return false;
  }

  // Если favoritesArray передан, используем его, иначе получаем из localStorage
  const currentFavorites = favoritesArray || getFavorites();
  console.log(`isInFavorites: проверка ID продукта: ${productId} с использованием массива избранного из контекста (или localStorage)`);

  const result = currentFavorites.some(item => {
    const itemId = getProductId(item);
    // console.log(`isInFavorites: сравниваем ID избранного товара (${itemId}) с productId (${productId})`);
    return itemId === productId;
  });

  console.log(`Проверка наличия товара ${productId} в избранном:`, result);
  return result;
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