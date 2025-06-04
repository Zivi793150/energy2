import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import './Auth.css';

const ViewCode = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Запрос кода для:', email);
      const response = await fetch(`${config.apiUrl}/auth/get-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Ошибка при парсинге JSON:', jsonError);
        setError('Получен некорректный ответ от сервера');
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при получении кода');
      }
      
      setCode(data.code);
    } catch (err) {
      console.error('Ошибка при получении кода:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Просмотр кода подтверждения</h2>
        <p className="verification-info">
          Только для тестирования! Введите email для просмотра кода.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
              className="auth-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {code && (
            <div className="code-display">
              <h3>Код подтверждения:</h3>
              <div className="verification-code">{code}</div>
            </div>
          )}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Получить код'}
          </button>
        </form>
        <button 
          onClick={() => navigate('/verify-email', { state: { email } })}
          className="auth-button"
          style={{ marginTop: '10px' }}
          disabled={!email}
        >
          Перейти к подтверждению
        </button>
      </div>
    </div>
  );
};

export default ViewCode; 