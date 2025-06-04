import React, { useState, useEffect } from 'react';
import './StarRating.css';

const RatingDistribution = ({ productId }) => {
  const [ratingData, setRatingData] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${productId}/ratings`);
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о рейтингах');
        }
        
        const data = await response.json();
        setRatingData(data);
      } catch (err) {
        console.error('Ошибка при загрузке рейтингов:', err);
        setError('Не удалось загрузить данные о рейтингах');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchRatingData();
    }
  }, [productId]);
  
  if (loading) {
    return <div className="rating-loading">Загрузка рейтингов...</div>;
  }
  
  if (error) {
    return <div className="rating-error">{error}</div>;
  }
  
  // Если нет оценок, показываем соответствующее сообщение
  if (ratingData.total === 0) {
    return <div className="rating-empty">У этого продукта пока нет оценок</div>;
  }
  
  // Рассчитываем процент для каждого рейтинга
  const getPercentage = (count) => {
    return (count / ratingData.total) * 100;
  };
  
  return (
    <div className="rating-summary">
      <div className="rating-header">
        <div className="rating-average">
          <span className="average-value">{ratingData.average.toFixed(1)}</span>
          <span className="average-stars">
            {'★'.repeat(Math.round(ratingData.average))}
            {'☆'.repeat(5 - Math.round(ratingData.average))}
          </span>
          <span className="total-ratings">На основе {ratingData.total} {getNumeralForm(ratingData.total, ['оценки', 'оценок', 'оценок'])}</span>
        </div>
      </div>
      
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="rating-bar">
            <div className="rating-level">
              <span className="star filled">{star}</span>
              <span className="star filled">★</span>
            </div>
            <div className="rating-progress">
              <div 
                className="rating-progress-value" 
                style={{ width: `${getPercentage(ratingData.distribution[star])}%` }}
              ></div>
            </div>
            <div className="rating-count">{ratingData.distribution[star]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Вспомогательная функция для правильного склонения существительных
const getNumeralForm = (number, forms) => {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return forms[2];
  }
  n %= 10;
  if (n === 1) {
    return forms[0];
  }
  if (n >= 2 && n <= 4) {
    return forms[1];
  }
  return forms[2];
};

export default RatingDistribution; 