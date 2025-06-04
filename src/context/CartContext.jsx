import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCart } from '../utils/cartUtils';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  // Обновляем количество товаров при загрузке и изменении localStorage или пользователя
  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartItems(cart);
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
      console.log(`Обновлена корзина. Текущий пользователь: ${user ? user._id : 'гость'}, количество товаров: ${cart.length}`);
    };

    // Обновляем при инициализации
    updateCartCount();

    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    // Слушаем изменение пользователя
    const handleUserChange = () => {
      console.log('Обнаружена смена пользователя, обновляем корзину');
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, [user]);

  // Функция для ручного обновления корзины
  const refreshCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    // Вызываем кастомное событие для обновления всех компонентов
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования контекста корзины
export function useCart() {
  return useContext(CartContext);
} 