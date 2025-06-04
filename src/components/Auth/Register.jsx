import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      console.log('Отправка запроса на регистрацию по URL:', `${config.apiUrl}/auth/register`);
      const response = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      console.log('Получен ответ:', response.status, response.statusText);
      console.log('Тип содержимого:', response.headers.get('content-type'));
      
      // Обрабатываем успешный ответ напрямую
      if (response.status === 201) {
        console.log('Регистрация успешна, перенаправление на верификацию');
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }

      // Сначала проверяем текст ответа
      const responseText = await response.text();
      console.log('Ответ от сервера (текст):', responseText);
      
      // Если текст ответа начинается с "Регистрация успешна", считаем операцию успешной
      if (responseText.includes('Регистрация успешна')) {
        console.log('Получен успешный текстовый ответ');
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }
      
      // Если дошли до этой точки, пробуем распарсить JSON
      try {
        const data = responseText ? JSON.parse(responseText) : {};
        if (!response.ok) {
          throw new Error(data.message || 'Ошибка при регистрации');
        }
        console.log('Успешный ответ от сервера (JSON):', data);
        navigate('/verify-email', { state: { email: formData.email } });
      } catch (jsonError) {
        console.error('Ошибка при парсинге JSON:', jsonError);
        if (response.ok) {
          console.log('Ответ успешен, но JSON невалиден');
          navigate('/verify-email', { state: { email: formData.email } });
        } else {
          throw new Error('Получен некорректный ответ от сервера');
        }
      }
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Регистрация</h2>
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
              minLength="6"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Подтвердите пароль"
              required
              className="auth-input"
              minLength="6"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 