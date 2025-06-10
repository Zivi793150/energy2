import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
      if (data.userRating) {
        setRating(data.userRating);
      }
    } catch (err) {
      setError('Ошибка при загрузке продукта');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await productService.rateProduct(id, newRating);
      setRating(newRating);
      fetchProduct(); // Обновляем данные продукта
    } catch (err) {
      setError('Ошибка при оценке продукта');
    }
  };

  const handleAddToCart = () => {
    // TODO: Реализовать добавление в корзину
    console.log('Добавлено в корзину:', { product, quantity });
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Продукт не найден</div>;

  return (
    <div className="product-detail">
      <div className="product-images">
        {product.images.map((image, index) => (
          <img key={index} src={image} alt={`${product.name} - фото ${index + 1}`} />
        ))}
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        
        <div className="rating-section">
          <div className="stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`star ${i < Math.round(product.ratingAvg) ? 'filled' : ''}`}
                onClick={() => handleRatingChange(i + 1)}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-count">
            {product.ratingCount} {product.ratingCount === 1 ? 'оценка' : 'оценок'}
          </span>
        </div>

        <p className="price">{product.price} ₽</p>
        
        <div className="description">
          <h3>Описание</h3>
          <p>{product.description}</p>
        </div>

        <div className="characteristics">
          <h3>Характеристики</h3>
          <ul>
            <li>Производитель: {product.firm}</li>
            <li>Вкус: {product.flavor}</li>
            <li>Объем: {product.volume} мл</li>
            <li>Энергетическая ценность: {product.energyValue} ккал</li>
          </ul>
        </div>

        <div className="purchase-section">
          <div className="quantity-selector">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
            >
              +
            </button>
          </div>

          <button
            className="add-to-cart"
            onClick={handleAddToCart}
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 