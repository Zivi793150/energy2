import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './StarRating.css';

const StarRating = ({ productId, initialRating = 0, readOnly = false, onRatingChange = null, size = 'medium' }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Получаем рейтинг пользователя при загрузке компонента
  useEffect(() => {
    if (isAuthenticated && productId && !readOnly) {
      const fetchUserRating = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/products/${productId}/my-rating`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserRating(data.rating);
            if (data.rating > 0) {
              setRating(data.rating);
            }
          }
        } catch (error) {
          console.error('Ошибка при получении рейтинга пользователя:', error);
        }
      };
      
      fetchUserRating();
    }
  }, [productId, isAuthenticated, readOnly]);

  // Функция для отправки рейтинга на сервер
  const submitRating = async (newRating) => {
    if (!isAuthenticated) {
      alert('Для оценки продукта необходимо войти в систему');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Отправка рейтинга ${newRating} для продукта ${productId}`);
      
      // Сначала обновляем локальное состояние, чтобы пользователь видел изменения
      setRating(newRating);
      setUserRating(newRating);
      
      // Если передан callback, вызываем его
      if (onRatingChange) {
        onRatingChange(newRating);
      }
      
      // Затем отправляем запрос на сервер
      const response = await fetch(`http://localhost:5000/api/products/${productId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: newRating })
      });
      
      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Не удалось сохранить рейтинг';
        try {
          const errorData = await response.json();
          console.error('Ошибка при сохранении рейтинга:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Ошибка при парсинге ответа с ошибкой:', e);
        }
        
        // Показываем ошибку только в консоли, не уведомляем пользователя
        console.warn(`Ошибка: ${errorMessage}`);
      } else {
        const data = await response.json();
        console.log('Успешный ответ:', data);
      }
    } catch (error) {
      console.error('Ошибка при отправке рейтинга:', error);
      // Не показываем ошибку пользователю, поскольку локальное состояние уже обновлено
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик клика по звезде
  const handleRatingClick = (value) => {
    if (readOnly || isSubmitting) return;
    
    setRating(value);
    submitRating(value);
  };

  const sizeClass = {
    small: 'star-rating-small',
    medium: 'star-rating-medium',
    large: 'star-rating-large'
  }[size] || 'star-rating-medium';

  return (
    <div className={`star-rating ${sizeClass} ${readOnly ? 'read-only' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : 'empty'} ${isSubmitting ? 'disabled' : ''}`}
          onClick={() => handleRatingClick(star)}
          onMouseEnter={readOnly ? null : () => setHover(star)}
          onMouseLeave={readOnly ? null : () => setHover(0)}
        >
          {star <= (hover || rating) ? '★' : '☆'}
        </span>
      ))}
      {!readOnly && (
        <span className="rating-text">
          {rating > 0 ? `Ваша оценка: ${rating}` : 'Оцените продукт'}
        </span>
      )}
    </div>
  );
};

export default StarRating; 