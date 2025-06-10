import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css';
import Button from './Button';
import { getCart, removeFromCart, updateCartItemQuantity } from '../utils/cartUtils';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DeliveryPointMap from './DeliveryPointMap';
import axios from 'axios';
import { API_URL } from '../config';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // pickup или courier
  const { refreshCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  // Состояния для промокода
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Загружаем корзину из localStorage при монтировании
  useEffect(() => {
    setCartItems(getCart());
    setLoading(false);

    // Проверяем, был ли сохранен пункт доставки
    const savedDeliveryPoint = localStorage.getItem('selectedDeliveryPoint');
    if (savedDeliveryPoint) {
      try {
        setSelectedDeliveryPoint(JSON.parse(savedDeliveryPoint));
      } catch (e) {
        console.error('Ошибка при загрузке пункта доставки:', e);
      }
    }

    // Проверяем, был ли сохранен метод доставки
    const savedDeliveryMethod = localStorage.getItem('deliveryMethod');
    if (savedDeliveryMethod) {
      setDeliveryMethod(savedDeliveryMethod);
    }
    
    // Проверяем, был ли сохранен примененный промокод
    const savedPromo = localStorage.getItem('appliedPromo');
    if (savedPromo) {
      try {
        const promoData = JSON.parse(savedPromo);
        setAppliedPromo(promoData);
        setPromoCode(promoData.code);
        setDiscount(promoData.discount || 0);
        setPromoSuccess(true);
        setPromoMessage(promoData.message || 'Промокод применен');
      } catch (e) {
        console.error('Ошибка при загрузке примененного промокода:', e);
        // Удаляем поврежденные данные
        localStorage.removeItem('appliedPromo');
      }
    }
  }, []);

  // Удаление товара
  const handleRemove = (cartItemId) => {
    removeFromCart(cartItemId);
    setCartItems(getCart());
    refreshCart(); // Обновляем счетчик корзины
    
    // Если есть примененный промокод, обновляем скидку
    if (appliedPromo) {
      applyPromoCode(promoCode);
    }
  };

  // Обновление количества
  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(cartItemId, newQuantity);
    setCartItems(getCart());
    refreshCart(); // Обновляем счетчик корзины
    
    // Если есть примененный промокод, обновляем скидку
    if (appliedPromo) {
      applyPromoCode(promoCode);
    }
  };

  // Обработчик выбора пункта доставки
  const handleSelectDeliveryPoint = (point) => {
    setSelectedDeliveryPoint(point);
    localStorage.setItem('selectedDeliveryPoint', JSON.stringify(point));
    
    // Если есть примененный промокод, обновляем скидку
    if (appliedPromo) {
      applyPromoCode(promoCode);
    }
  };

  // Обработчик изменения метода доставки
  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    localStorage.setItem('deliveryMethod', method);

    // Если выбрана курьерская доставка, сбрасываем выбранный пункт выдачи
    if (method === 'courier') {
      setSelectedDeliveryPoint(null);
      localStorage.removeItem('selectedDeliveryPoint');
    }
    
    // Если есть примененный промокод, обновляем скидку
    if (appliedPromo) {
      applyPromoCode(promoCode);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateDeliveryPrice = () => {
    // Если применен промокод с бесплатной доставкой
    if (appliedPromo && appliedPromo.deliveryPrice === 0) {
      return 0;
    }
    
    // Логика расчета стоимости доставки
    if (deliveryMethod === 'courier') {
      return 300; // Стоимость курьерской доставки
    } else if (selectedDeliveryPoint) {
      // Стоимость доставки до пункта выдачи
      return 150;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryPrice() - discount;
  };
  
  // Обработчик применения промокода
  const applyPromoCode = async (code) => {
    if (!code || code.trim() === '') {
      setPromoMessage({ type: 'error', text: 'Введите код промокода' });
      return;
    }
    
    setPromoLoading(true);
    setPromoMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/promos/apply`, {
        code,
        cart: cartItems,
        deliveryPrice: calculateDeliveryPrice()
      });
      
      if (response.data.success) {
        setPromoSuccess(true);
        setAppliedPromo({
          ...response.data,
          code
        });
        setDiscount(response.data.discount || 0);
        setPromoMessage({ type: 'success', text: response.data.message });
        
        // Сохраняем примененный промокод в localStorage
        localStorage.setItem('appliedPromo', JSON.stringify({
          ...response.data,
          code
        }));
        
        // Если промокод добавляет бесплатные товары, обновляем корзину
        if (response.data.cart && response.data.cart.length > cartItems.length) {
          setCartItems(response.data.cart);
        }
      } else {
        setPromoSuccess(false);
        setAppliedPromo(null);
        setDiscount(0);
        setPromoMessage({ type: 'error', text: response.data.message || 'Не удалось применить промокод' });
        localStorage.removeItem('appliedPromo');
      }
    } catch (error) {
      console.error('Ошибка при применении промокода:', error);
      setPromoSuccess(false);
      setAppliedPromo(null);
      setDiscount(0);
      setPromoMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Ошибка при применении промокода' 
      });
      localStorage.removeItem('appliedPromo');
    } finally {
      setPromoLoading(false);
    }
  };
  
  // Обработчик удаления промокода
  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscount(0);
    setPromoSuccess(false);
    setPromoMessage(null);
    localStorage.removeItem('appliedPromo');
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>Загрузка корзины...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Корзина</h1>
      
      {!isAuthenticated && (
        <div className="auth-banner">
          <p>Вы просматриваете корзину в режиме гостя.</p>
          <p>Для сохранения корзины между устройствами, пожалуйста, <Link to="/login" className="auth-link">войдите</Link> или <Link to="/register" className="auth-link">зарегистрируйтесь</Link>.</p>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="user-banner">
          <p>Здравствуйте, {user?.email}! Это ваша корзина.</p>
        </div>
      )}
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Ваша корзина пуста</p>
          <Link to="/catalog" className="continue-shopping-btn">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.cartItemId} className="cart-item">
                <div className="item-image">
                  <Link to={`/product/${item._id || item.id}`} className="cart-item-image-link">
                    <img 
                      src={(() => {
                        if (!item.image) return '';
                        if (typeof item.image === 'string') {
                          const fileName = item.image.split('\\').pop();
                          return `/images/${encodeURIComponent(fileName)}`;
                        }
                        return '';
                      })()} 
                      alt={item.name} 
                      className="cart-item-image"
                    />
                  </Link>
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-price">{item.price} руб.</p>
                </div>
                <div className="item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  {item.price * item.quantity} руб.
                </div>
                <button 
                  className="remove-item-btn"
                  onClick={() => handleRemove(item.cartItemId)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="delivery-section">
            <h2 className="section-title">Доставка</h2>
            
            <div className="delivery-methods">
              <div className="delivery-method-option">
                <input 
                  type="radio" 
                  id="pickup" 
                  name="delivery-method" 
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => handleDeliveryMethodChange('pickup')}
                />
                <label htmlFor="pickup">
                  <span className="radio-circle"></span>
                  Самовывоз из пункта выдачи
                  <span className="price-badge">
                    {appliedPromo && appliedPromo.deliveryPrice === 0 ? 'Бесплатно' : '150 ₽'}
                  </span>
                </label>
              </div>
              
              <div className="delivery-method-option">
                <input 
                  type="radio" 
                  id="courier" 
                  name="delivery-method" 
                  value="courier"
                  checked={deliveryMethod === 'courier'}
                  onChange={() => handleDeliveryMethodChange('courier')}
                />
                <label htmlFor="courier">
                  <span className="radio-circle"></span>
                  Курьерская доставка
                  <span className="price-badge">
                    {appliedPromo && appliedPromo.deliveryPrice === 0 ? 'Бесплатно' : '300 ₽'}
                  </span>
                </label>
              </div>
            </div>
            
            {deliveryMethod === 'pickup' && (
              <div className="delivery-point-section">
                <h3 className="subsection-title">Пункт выдачи</h3>
                <DeliveryPointMap 
                  onSelectPoint={handleSelectDeliveryPoint}
                  selectedPoint={selectedDeliveryPoint}
                />
              </div>
            )}
            
            {deliveryMethod === 'courier' && (
              <div className="courier-delivery-form">
                <h3 className="subsection-title">Адрес доставки</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Город</label>
                    <input type="text" id="city" name="city" placeholder="Введите город" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="street">Улица</label>
                    <input type="text" id="street" name="street" placeholder="Введите улицу" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="house">Дом</label>
                    <input type="text" id="house" name="house" placeholder="Номер дома" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apartment">Квартира</label>
                    <input type="text" id="apartment" name="apartment" placeholder="Номер квартиры" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Секция промокода */}
          <div className="promo-section">
            <h2 className="section-title">Промокод</h2>
            <div className="promo-form">
              <input 
                type="text" 
                className={`promo-input ${promoSuccess ? 'success' : promoMessage?.type === 'error' ? 'error' : ''}`}
                placeholder="Введите промокод" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoLoading || promoSuccess}
              />
              {promoSuccess ? (
                <button 
                  className="remove-promo-btn"
                  onClick={removePromoCode}
                  disabled={promoLoading}
                >
                  Удалить
                </button>
              ) : (
                <button 
                  className="apply-promo-btn"
                  onClick={() => applyPromoCode(promoCode)}
                  disabled={promoLoading || !promoCode}
                >
                  {promoLoading ? 'Проверяем...' : 'Применить'}
                </button>
              )}
            </div>
            {promoMessage && (
              <div className={`promo-message ${promoMessage.type}`}>
                {promoMessage.text}
              </div>
            )}
          </div>
          
          <div className="cart-summary">
            <div className="summary-details">
              <div className="summary-row">
                <span>Товары ({cartItems.length}):</span>
                <span>{calculateSubtotal()} руб.</span>
              </div>
              <div className="summary-row">
                <span>Доставка:</span>
                <span>{calculateDeliveryPrice()} руб.</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Скидка:</span>
                  <span className="discount-price">-{discount} руб.</span>
                </div>
              )}
              {appliedPromo && appliedPromo.cashbackPercent > 0 && (
                <div className="summary-row cashback-row">
                  <span>Кэшбэк:</span>
                  <span className="cashback-value">{appliedPromo.cashbackPercent}%</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Итого:</span>
                <span className="total-price">{calculateTotal()} руб.</span>
              </div>
            </div>
            
            <div className="cart-actions">
              <Link to="/catalog" className="continue-shopping-btn">
                Продолжить покупки
              </Link>
              <button 
                className="checkout-btn" 
                disabled={deliveryMethod === 'pickup' && !selectedDeliveryPoint}
              >
                Перейти к оплате
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 