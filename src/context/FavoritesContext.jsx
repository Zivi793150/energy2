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
    console.log('FavoritesContext: loadFavorites вызвана.');
    if (isAuthenticated) {
      console.log('FavoritesContext: Пользователь авторизован, пытаемся получить избранное с сервера.');
      try {
        const serverFavorites = await fetchFavoritesFromServer();
        setFavorites(serverFavorites);
        setFavoritesCount(serverFavorites.length);
        console.log('FavoritesContext: Избранные товары успешно получены с сервера:', serverFavorites);
        return;
      } catch (e) {
        console.error('FavoritesContext: Ошибка при получении избранного с сервера:', e);
        // В случае ошибки загружаем из localStorage
        console.log('FavoritesContext: Получаем избранное из localStorage в качестве запасного варианта.');
        const favs = getFavorites();
        setFavorites(favs);
        setFavoritesCount(favs.length);
        console.log('FavoritesContext: Избранные товары загружены из localStorage (после ошибки сервера):', favs);
      }
    } else {
      // Если не авторизован — localStorage
      console.log('FavoritesContext: Пользователь не авторизован, получаем избранное из localStorage.');
      const favs = getFavorites();
      setFavorites(favs);
      setFavoritesCount(favs.length);
      console.log('FavoritesContext: Избранные товары загружены из localStorage (неавторизованный):', favs);
    }
  };

  useEffect(() => {
    loadFavorites();
    
    const handleStorageChange = () => {
      loadFavorites();
    };

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
  }, [user, isAuthenticated]); // Убрали favorites из зависимостей

  // Функция для ручного обновления состояния избранного
  const refreshFavorites = () => {
    loadFavorites();
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // Функция для переключения товара в избранное/не в избранное
  const toggleFavoriteItem = async (product) => {
    const productId = product._id || product.id;
    if (!productId) {
      console.error('Не удалось получить ID продукта:', product);
      return;
    }

    if (isAuthenticated) {
      try {
        // Проверяем, есть ли товар в избранном
        const isFav = favorites.some(item => (item._id || item.id) === productId);
        
        if (isFav) {
          await removeFavoriteFromServer(productId);
          console.log('Товар удален из избранного на сервере');
        } else {
          await addFavoriteToServer(productId);
          console.log('Товар добавлен в избранное на сервере');
        }
        
        await loadFavorites();
      } catch (e) {
        console.error('Ошибка при обновлении избранного на сервере:', e);
        // В случае ошибки пробуем локальное обновление
        toggleFavorite(product);
        loadFavorites();
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