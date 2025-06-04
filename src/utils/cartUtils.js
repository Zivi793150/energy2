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

// Получить ключ для хранения корзины, уникальный для каждого пользователя
function getCartKey() {
  const userId = getCurrentUserId();
  return userId ? `cart_${userId}` : 'cart_guest';
}

// Получить корзину из localStorage
export function getCart() {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const cartKey = getCartKey();
    console.log(`Получаем корзину с ключом: ${cartKey}`);
    
    const cart = localStorage.getItem(cartKey);
    const result = cart ? JSON.parse(cart) : [];
    console.log('Получена корзина:', result);
    return result;
  } catch (e) {
    console.error('Ошибка при получении корзины:', e);
    return [];
  }
}

// Сохранить корзину в localStorage
export function setCart(cart) {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const cartKey = getCartKey();
    console.log(`Сохраняем корзину с ключом: ${cartKey}`, cart);
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch (e) {
    console.error('Ошибка при сохранении корзины:', e);
  }
}

// Генерировать уникальный ID для товара в корзине
function generateCartItemId() {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Добавить товар в корзину
export function addToCart(product, quantity = 1) {
  const cart = getCart();
  // Всегда добавляем как новый товар с уникальным cartItemId
  cart.push({ 
    ...product, 
    quantity,
    cartItemId: generateCartItemId() 
  });
  setCart(cart);
}

// Удалить товар из корзины
export function removeFromCart(cartItemId) {
  const cart = getCart().filter(item => item.cartItemId !== cartItemId);
  setCart(cart);
}

// Обновить количество товара
export function updateCartItemQuantity(cartItemId, quantity) {
  const cart = getCart().map(item =>
    item.cartItemId === cartItemId ? { ...item, quantity } : item
  );
  setCart(cart);
} 