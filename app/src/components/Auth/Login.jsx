import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const tryLogin = async (retryAttempt = 0) => {
    try {
      console.log(`Попытка входа ${retryAttempt + 1}/${maxRetries + 1}`);
      console.log('Отправка данных:', formData);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
        signal: AbortSignal.timeout(15000)
      });

      console.log('Получен ответ от сервера:', response.status, response.statusText);
      
      // Сначала получаем текст ответа
      const responseText = await response.text();
      console.log('Ответ от сервера (текст):', responseText);
      
      // Пробуем распарсить JSON только если есть текст ответа
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log('Распарсенные данные:', data);
      } catch (jsonError) {
        console.error('Ошибка при парсинге JSON:', jsonError);
        throw new Error('Получен некорректный ответ от сервера');
      }

      if (!response.ok) {
        // Особая обработка ошибки базы данных
        if (response.status === 503 || (data && data.message && (
            data.message.includes('база данных') || 
            data.message.includes('временно недоступен') ||
            data.message.includes('buffering timed out')
        ))) {
          throw new Error('Проблема подключения к базе данных. Пожалуйста, попробуйте позже.');
        }
        throw new Error(data.message || 'Ошибка при входе');
      }

      console.log('Успешный вход, данные пользователя:', data.user);
      
      // Проверяем наличие роли
      if (!data.user.role) {
        console.warn('Роль пользователя отсутствует в ответе!', data.user);
        // Если роль отсутствует, но мы знаем, что пользователь админ, добавляем роль
        if (formData.email === 'zivi793150@yandex.ru') {
          console.log('Добавляем роль администратора явно');
          data.user.role = 'admin';
        }
      }
      
      // Используем функцию login из AuthContext
      console.log('Вызов функции login с данными:', data.user, data.token);
      login(data.user, data.token);
      
      // Перенаправляем на главную страницу
      console.log('Перенаправление на главную страницу');
      navigate('/');
      return true;
    } catch (err) {
      console.error('Ошибка при логине:', err);
      
      // Проверяем, связана ли ошибка с подключением к серверу или базой данных
      const isConnectionError = 
        err.name === 'AbortError' || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('Network Error') ||
        err.message.includes('timeout') ||
        err.message.includes('недоступен') ||
        err.message.includes('подключиться к базе данных') ||
        err.message.includes('Проблема подключения к базе данных');
      
      // Если это ошибка подключения и у нас остались попытки, пробуем еще раз
      if (isConnectionError && retryAttempt < maxRetries) {
        console.log(`Проблемы с подключением. Повторная попытка ${retryAttempt + 2}/${maxRetries + 1} через 2 секунды...`);
        setError(`Проблемы с подключением к базе данных. Повторная попытка через 2 секунды...`);
        
        // Ждем 2 секунды перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 2000));
        return tryLogin(retryAttempt + 1);
      }
      
      // Если все попытки исчерпаны или это не ошибка подключения
      if (isConnectionError) {
        setError('Не удалось подключиться к серверу или базе данных. Пожалуйста, проверьте подключение и попробуйте позже.');
      } else {
        setError(err.message);
      }
      
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRetryCount(0);

    try {
      console.log('Начало процесса входа');
      await tryLogin();
    } finally {
      setLoading(false);
    }
  };

  // Функция для ручного повтора попытки входа
  const handleRetry = async () => {
    if (loading) return;
    
    setError('');
    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await tryLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="auth-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Пароль"
              required
              className="auth-input"
            />
          </div>
          {error && (
            <div className="error-message">
              {error}
              {error.includes('подключиться') && (
                <button 
                  onClick={handleRetry} 
                  className="retry-button"
                  type="button"
                >
                  Попробовать снова
                </button>
              )}
            </div>
          )}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <p className="auth-forgot">
          <Link to="/forgot-password">Забыли пароль?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 