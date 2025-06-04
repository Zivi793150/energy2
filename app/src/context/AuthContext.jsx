import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена при загрузке
    const token = localStorage.getItem('token');
    if (token) {
      // Пытаемся получить пользовательские данные из localStorage
      try {
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          setUser(JSON.parse(cachedUserData));
          setLoading(false);
        } else {
          // Если кэшированных данных нет, запрашиваем с сервера
          fetchUserData(token);
        }
      } catch (error) {
        console.error('Ошибка при восстановлении данных пользователя:', error);
        fetchUserData(token);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Оповещаем о смене пользователя для обновления избранных товаров
        window.dispatchEvent(new Event('userChanged'));
        window.dispatchEvent(new Event('favoritesUpdated'));
      } else {
        // Если токен невалиден, удаляем его
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Оповещаем о смене пользователя для обновления избранных товаров
    window.dispatchEvent(new Event('userChanged'));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Оповещаем о смене пользователя для обновления избранных товаров
    window.dispatchEvent(new Event('userChanged'));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 