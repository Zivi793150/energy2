import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import BuyButton from './BuyButton';
import FavoriteCheckbox from './FavoriteCheckbox';
import SimilarProducts from './SimilarProducts';
import StarRating from './StarRating';
import RatingDistribution from './RatingDistribution';
import './ProductPage.css';
import { addToCart } from '../utils/cartUtils';
import { isInFavorites } from '../utils/favoritesUtils';
import { findSimilarProducts } from '../utils/productUtils';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

// Функция для преобразования значения вкуса в читаемый текст
function getFlavorDisplayName(flavor) {
  const flavorNames = {
    'classic': 'Классический',
    'tropic': 'Тропический',
    'berry': 'Ягодный',
    'citrus': 'Цитрусовый',
    'cola': 'Кола',
    'original': 'Оригинальный',
    'mixed': 'Микс',
    'exotic': 'Экзотический',
    'mint': 'Мятный',
    'cherry': 'Вишневый',
    'chocolate': 'Шоколадный',
    'other': 'Другой'
  };
  
  return flavorNames[flavor] || 'Не указан';
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const { refreshCart } = useCart();
  const { toggleFavoriteItem } = useFavorites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Пытаемся загрузить продукт с ID:', id);
      
      try {
        // Проверяем кэш
        const cachedProduct = sessionStorage.getItem(`product_${id}`);
        const cacheTimestamp = sessionStorage.getItem(`product_${id}_timestamp`);
        const now = Date.now();
        
        // Если есть кэш и он не старше 5 минут, используем его
        if (cachedProduct && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
          console.log('Используем кэшированные данные продукта');
          const productData = JSON.parse(cachedProduct);
          setProduct(productData);
          
          // Загружаем похожие продукты
          const similar = findSimilarProducts(productData, JSON.parse(sessionStorage.getItem('allProducts') || '[]'), 6);
          setSimilarProducts(similar);
          setLoading(false);
          return;
        }
        
        // Загружаем все продукты сначала
        const allProductsResponse = await fetch('http://localhost:5000/api/products');
        
        if (!allProductsResponse.ok) {
          throw new Error('Не удалось загрузить список продуктов');
        }
        
        const allProductsData = await allProductsResponse.json();
        console.log('Загружено продуктов:', allProductsData.products?.length || 0);
        setAllProducts(allProductsData.products || []);
        
        // Кэшируем все продукты
        sessionStorage.setItem('allProducts', JSON.stringify(allProductsData.products || []));
        
        // Пробуем получить конкретный продукт
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        console.log('Статус ответа API:', response.status);
        
        let currentProduct;
        
        if (!response.ok) {
          // Если API для отдельного продукта не работает, ищем в списке всех продуктов
          const foundProduct = allProductsData.products?.find(product => 
            product._id === id || product.id === id
          );
          
          if (foundProduct) {
            console.log('Продукт найден в общем списке:', foundProduct);
            currentProduct = foundProduct;
            setProduct(foundProduct);
          } else {
            console.error('Продукт не найден в списке');
            throw new Error('Продукт не найден');
          }
        } else {
          const data = await response.json();
          console.log('Продукт получен напрямую из API:', data);
          currentProduct = data;
          setProduct(data);
        }
        
        // Кэшируем продукт
        sessionStorage.setItem(`product_${id}`, JSON.stringify(currentProduct));
        sessionStorage.setItem(`product_${id}_timestamp`, now.toString());
        
        // Находим похожие продукты
        const similar = findSimilarProducts(currentProduct, allProductsData.products || [], 6);
        console.log('Найдены похожие продукты:', similar.length);
        setSimilarProducts(similar);
        
      } catch (err) {
        console.error('Ошибка при загрузке продукта:', err);
        setError('Не удалось загрузить информацию о продукте');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError('ID продукта не указан');
      setLoading(false);
    }
  }, [id]);

  const handleBackClick = () => {
    navigate(-1); // Вернуться на предыдущую страницу
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleBuy = () => {
    addToCart(product, quantity);
    refreshCart(); // Обновляем счетчик корзины
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1200);
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavoriteItem(product);
    }
  };

  // Функция для обновления рейтинга продукта
  const handleRatingChange = async (newRating) => {
    console.log(`Продукт оценен на ${newRating} звезд`);
    
    // Обновляем локальное состояние продукта для немедленной обратной связи
    setProduct(prevProduct => ({
      ...prevProduct,
      userRating: newRating
    }));
    
    // Запрашиваем обновленные данные о продукте после изменения рейтинга
    try {
      setTimeout(async () => {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (response.ok) {
          const updatedProduct = await response.json();
          console.log('Получены обновленные данные о продукте:', updatedProduct);
          setProduct(updatedProduct);
        }
      }, 500); // Небольшая задержка для завершения обновления на сервере
    } catch (error) {
      console.error('Ошибка при обновлении информации о продукте:', error);
    }
  };

  if (loading) {
    return (
      <div className="product-page-container">
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>Загрузка информации о продукте...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page-container">
        <div className="error-message">
          {error || 'Произошла ошибка при загрузке продукта'}
        </div>
        <Link to="/catalog" className="back-button">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <div className="product-navigation">
        <Button onClick={handleBackClick} text="Назад" />
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">Главная</Link> / 
          <Link to="/catalog" className="breadcrumb-link">Каталог</Link> / 
          <span className="current-page">{product.name}</span>
        </div>
      </div>

      <div className="product-page-content">
        <div className="product-image-container">
          <div className="product-badges">
            {product.isNew && <span className="badge new-badge">Новинка</span>}
            {product.onSale && <span className="badge sale-badge">Акция</span>}
            {product.flavor && (
              <span className={`badge flavor-badge flavor-${product.flavor}`}>
                {getFlavorDisplayName(product.flavor)}
              </span>
            )}
          </div>
          <div className="product-favorite">
            <FavoriteCheckbox 
              productId={product._id || product.id} 
              initialChecked={isInFavorites(product._id || product.id)}
              onChange={handleToggleFavorite}
            />
          </div>
          <img 
            src={product.images} 
            alt={product.name} 
            className="product-main-image" 
          />
        </div>
        
        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-id">Артикул: {product._id || product.id}</div>
            <div className="product-availability">
              <span className="availability-indicator in-stock"></span>
              В наличии
            </div>
          </div>
          
          {/* Рейтинг */}
          <div className="product-rating-container">
            <div className="rating-summary">
              <span className="rating-value">{product.ratingAvg ? product.ratingAvg.toFixed(1) : '0.0'}</span>
              <StarRating
                productId={product._id || product.id}
                initialRating={product.ratingAvg || 0}
                readOnly={true}
                size="medium"
              />
              <span className="rating-count">
                ({product.ratingCount || 0})
              </span>
            </div>
          </div>
          
          {/* Цена */}
          <div className="product-price-container">
            <span className="product-price">{product.price} руб.</span>
            {product.oldPrice && (
              <span className="product-old-price">{product.oldPrice} руб.</span>
            )}
          </div>
          
          {/* Описание */}
          <div className="product-description">
            <h2>Описание</h2>
            <p>{product.description || 'Описание отсутствует'}</p>
          </div>
          
          {/* Количество */}
          <div className="quantity-selector">
            <span className="quantity-label">Количество:</span>
            <div className="quantity-controls">
              <button 
                className="quantity-btn" 
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                className="quantity-input" 
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button 
                className="quantity-btn"
                onClick={handleIncreaseQuantity}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Кнопка покупки */}
          <div className="product-actions">
            <BuyButton onClick={handleBuy} />
          </div>
        </div>
      </div>
      
      {/* Пользовательская оценка */}
      {isAuthenticated && (
        <div className="user-rating-container">
          <h3>Ваша оценка</h3>
          <StarRating 
            productId={product._id || product.id}
            onRatingChange={handleRatingChange}
            size="large"
          />
        </div>
      )}
      
      {/* Похожие товары */}
      <SimilarProducts products={similarProducts} />
      
      {showAdded && (
        <div className="cart-added-notification">Товар добавлен в корзину!</div>
      )}
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

export default ProductPage;