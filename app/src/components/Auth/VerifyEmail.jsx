import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../config';
import './Auth.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 минут

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleResendCode = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Обрабатываем ответ с учетом возможных проблем с JSON
      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Ошибка при парсинге JSON:', jsonError);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при отправке кода');
      }

      setTimeLeft(300);
      alert('Новый код отправлен на вашу почту');
    } catch (err) {
      console.error('Ошибка при повторной отправке кода:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Отправка запроса на верификацию:', `${config.apiUrl}/auth/verify-email`, {
        email,
        code: verificationCode
      });
      
      const response = await fetch(`${config.apiUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode
        }),
      });

      console.log('Получен ответ с статусом:', response.status);
      
      // Обрабатываем ответ с учетом возможных проблем с JSON
      const responseText = await response.text();
      console.log('Текст ответа:', responseText);
      
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Ошибка при парсинге JSON:', jsonError);
        // Если ответ успешен, но JSON невалиден - считаем операцию успешной
        if (response.ok) {
          console.log('Ответ успешен, но JSON невалиден');
          navigate('/login', { state: { verified: true } });
          return;
        }
        throw new Error('Получен некорректный ответ от сервера');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при верификации');
      }

      console.log('Верификация успешна, перенаправление на логин');
      // Если верификация успешна, перенаправляем на страницу входа
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      console.error('Ошибка при верификации email:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Подтверждение Email</h2>
        <p className="verification-info">
          Мы отправили код подтверждения на {email}
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Введите код подтверждения"
              required
              className="auth-input"
              maxLength="6"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </form>
        <div className="resend-code">
          {timeLeft > 0 ? (
            <p>Отправить код повторно через {formatTime(timeLeft)}</p>
          ) : (
            <button 
              onClick={handleResendCode}
              className="resend-button"
            >
              Отправить код повторно
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 