import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFavorites, toggleFavorite, fetchFavoritesFromServer, addFavoriteToServer, removeFavoriteFromServer } from '../utils/favoritesUtils';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Получить избранное (локально или с сервера)
  const loadFavorites = async () => {
    if (isAuthenticated) {
      try {
        const serverFavorites = await fetchFavoritesFromServer();
        setFavorites(serverFavorites);
        setFavoritesCount(serverFavorites.length);
        return;
      } catch (e) {
        console.error('Ошибка при получении избранного с сервера:', e);
      }
    }
    // Если не авторизован — localStorage
    const favs = getFavorites();
    setFavorites(favs);
    setFavoritesCount(favs.length);
  };

  useEffect(() => {
    loadFavorites();
    // Обновляем при инициализации
    const handleStorageChange = () => {
      loadFavorites();
    };

    // Слушаем изменение пользователя
    const handleUserChange = () => {
      console.log('Обнаружена смена пользователя, обновляем избранное');
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, [user, isAuthenticated]);

  // Функция для ручного обновления состояния избранного
  const refreshFavorites = () => {
    loadFavorites();
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Функция для переключения товара в избранное/не в избранное
  const toggleFavoriteItem = async (product) => {
    const productId = product._id || product.id;
    if (!productId) return;
    if (isAuthenticated) {
      // Проверяем, есть ли товар в избранном
      const isFav = favorites.some(item => (item._id || item.id) === productId);
      try {
        if (isFav) {
          await removeFavoriteFromServer(productId);
        } else {
          await addFavoriteToServer(productId);
        }
        await loadFavorites();
      } catch (e) {
        console.error('Ошибка при обновлении избранного на сервере:', e);
      }
    } else {
      toggleFavorite(product);
      loadFavorites();
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoritesCount, 
      refreshFavorites,
      toggleFavoriteItem
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Хук для использования контекста избранного
export function useFavorites() {
  return useContext(FavoritesContext);
} 