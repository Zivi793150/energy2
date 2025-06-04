import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ReviewSlider.css';

// Данные отзывов (в будущем можно перенести в API)
const reviewsData = [
  {
    id: 1,
    name: 'Алексей',
    content: 'Отличный магазин! Очень быстрая доставка, заказал Monster Ultra и получил уже на следующий день. Буду заказывать еще!',
    rating: 5,
    color: '#4285F4'
  },
  {
    id: 2,
    name: 'Мария',
    content: 'Прекрасный выбор энергетиков. Нашла даже редкие вкусы Red Bull, которые давно искала. Спасибо за качественный сервис!',
    rating: 5,
    color: '#EA4335'
  },
  {
    id: 3,
    name: 'Дмитрий',
    content: 'Приятно удивлен ассортиментом и ценами. Заказал набор разных энергетиков - все пришло в идеальном состоянии.',
    rating: 4,
    color: '#FBBC05'
  },
  {
    id: 4,
    name: 'Екатерина',
    content: 'The Energy Lab - лучший магазин энергетиков! Я постоянный клиент уже больше года. Всегда свежие напитки и отличные акции.',
    rating: 5,
    color: '#34A853'
  },
  {
    id: 5,
    name: 'Иван',
    content: 'Порадовала система лояльности и бонусы за покупки. С каждым заказом накапливаются баллы, которые можно потратить на следующие заказы.',
    rating: 4,
    color: '#9C27B0'
  },
];

const ReviewSlider = () => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  // Функция для получения инициалов из имени
  const getInitials = (name) => {
    return name.charAt(0);
  };

  // Функция для отображения звездного рейтинга
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Создаем дублированные отзывы для бесконечной прокрутки
  const allReviews = [...reviewsData, ...reviewsData];

  return (
    <div className="reviews-section">
      <h2 className="reviews-title">Отзывы наших клиентов</h2>
      <div 
        className="reviews-container" 
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div 
          className="reviews-slider"
          initial={{ x: 0 }}
          animate={{ 
            x: isPaused ? 0 : '-50%' 
          }}
          transition={{ 
            x: { 
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            },
            repeatDelay: 0
          }}
          onClick={() => setIsPaused(!isPaused)}
        >
          {allReviews.map((review, index) => (
            <div className="review-card" key={`${review.id}-${index}`}>
              <div className="review-header">
                <div 
                  className="review-avatar-initial" 
                  style={{ backgroundColor: review.color }}
                >
                  {getInitials(review.name)}
                </div>
                <div className="review-info">
                  <h3 className="review-name">{review.name}</h3>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <p className="review-content">{review.content}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewSlider; 