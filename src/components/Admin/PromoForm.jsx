import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import './PromoForm.css';

const PromoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Состояние формы
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchaseAmount: 0,
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
    freeItem: ''
  });

  // Дополнительные состояния
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [selectAllCategories, setSelectAllCategories] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Загрузка данных для редактирования и списков продуктов/категорий
  useEffect(() => {
    // Форматируем текущую дату для полей validFrom и validUntil
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${now.getFullYear()}-${month}-${day}`;
    
    // Устанавливаем дату начала действия промокода (сегодня)
    setFormData(prev => ({
      ...prev,
      startDate: today,
      endDate: '' // Оставляем пустым для ввода пользователем
    }));

    // Загрузка списка продуктов
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products?limit=1000`);
        if (response.data.products) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error('Ошибка при загрузке продуктов:', err);
      }
    };

    // Загрузка списка категорий
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };

    // Загрузка данных промокода для редактирования
    const fetchPromoData = async () => {
      if (isEditMode) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/promos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success && response.data.promo) {
            const promo = response.data.promo;
            
            // Форматируем даты для input type="date"
            const formatDate = (dateString) => {
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
            };
            
            const updatedFormData = {
              code: promo.code || '',
              description: promo.description || '',
              discountType: promo.type || 'PERCENTAGE',
              discountValue: promo.value !== undefined ? promo.value : '',
              minPurchaseAmount: promo.minPurchase !== undefined ? promo.minPurchase : 0,
              maxDiscountAmount: promo.maxDiscount || '',
              startDate: formatDate(promo.validFrom),
              endDate: formatDate(promo.validUntil),
              usageLimit: promo.usageLimit || '',
              isActive: promo.isActive !== undefined ? promo.isActive : true,
              applicableProducts: promo.applicableProducts || [],
              applicableCategories: promo.applicableCategories || [],
              freeItem: promo.freeItem || '',
              usageCount: promo.usageCount || 0
            };
            
            setFormData(updatedFormData);
            setSelectedProducts(updatedFormData.applicableProducts);
            setSelectedCategories(updatedFormData.applicableCategories);
          } else {
            setError('Не удалось загрузить данные промокода');
          }
        } catch (err) {
          console.error('Ошибка при загрузке промокода:', err);
          setError(err.response?.data?.message || 'Ошибка при загрузке промокода');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    fetchCategories();
    fetchPromoData();
  }, [id, isEditMode]);

  // Обработка изменений полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Обработчик для выбора товаров
  const handleProductSelect = (productId) => {
    let newSelected = [...selectedProducts];
    
    if (newSelected.includes(productId)) {
      newSelected = newSelected.filter(id => id !== productId);
    } else {
      newSelected.push(productId);
    }
    
    setSelectedProducts(newSelected);
    setFormData({ ...formData, applicableProducts: newSelected });
  };
  
  // Обработчик для выбора категорий
  const handleCategorySelect = (categoryId) => {
    let newSelected = [...selectedCategories];
    
    if (newSelected.includes(categoryId)) {
      newSelected = newSelected.filter(id => id !== categoryId);
    } else {
      newSelected.push(categoryId);
    }
    
    setSelectedCategories(newSelected);
    setFormData({ ...formData, applicableCategories: newSelected });
  };
  
  // Обработчик для "Выбрать все товары"
  const handleSelectAllProducts = () => {
    const newSelectAll = !selectAllProducts;
    setSelectAllProducts(newSelectAll);
    
    if (newSelectAll) {
      const allProductIds = products.map(product => product._id);
      setSelectedProducts(allProductIds);
      setFormData({ ...formData, applicableProducts: allProductIds });
    } else {
      setSelectedProducts([]);
      setFormData({ ...formData, applicableProducts: [] });
    }
  };
  
  // Обработчик для "Выбрать все категории"
  const handleSelectAllCategories = () => {
    const newSelectAll = !selectAllCategories;
    setSelectAllCategories(newSelectAll);
    
    if (newSelectAll) {
      const allCategoryIds = categories.map(category => category.value || category._id);
      setSelectedCategories(allCategoryIds);
      setFormData({ ...formData, applicableCategories: allCategoryIds });
    } else {
      setSelectedCategories([]);
      setFormData({ ...formData, applicableCategories: [] });
    }
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Формируем данные для отправки
      const promoData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: Boolean(formData.isActive),
        minPurchaseAmount: Number(formData.minPurchaseAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        applicableCategories: formData.applicableCategories || [],
        excludedProducts: formData.excludedProducts || [],
        freeItem: formData.freeItem || null
      };
      
      let response;
      if (isEditMode) {
        response = await axios.put(`${API_URL}/promos/${id}`, promoData, { headers });
      } else {
        response = await axios.post(`${API_URL}/promos`, promoData, { headers });
      }
      
      if (response.data) {
        setSuccess(`Промокод успешно ${isEditMode ? 'обновлен' : 'создан'}`);
        
        // Редирект на страницу списка промокодов после небольшой задержки
        setTimeout(() => {
          navigate('/admin/promos');
        }, 1500);
      } else {
        setError(response.data?.message || `Не удалось ${isEditMode ? 'обновить' : 'создать'} промокод`);
      }
    } catch (err) {
      console.error('Ошибка при сохранении промокода:', err);
      setError(err.response?.data?.message || `Ошибка при ${isEditMode ? 'обновлении' : 'создании'} промокода`);
    } finally {
      setSubmitting(false);
    }
  };

  // Проверка, нужно ли отображать поле значения скидки
  const showValueField = ['PERCENTAGE', 'FIXED', 'CASHBACK'].includes(formData.discountType);
  
  // Проверка, нужно ли отображать поле максимальной скидки
  const showMaxDiscountField = formData.discountType === 'PERCENTAGE';
  
  // Проверка, нужно ли отображать поле выбора товара для подарка
  const showFreeItemField = formData.discountType === 'FREE_ITEM';
  
  // Фильтрация товаров по поиску
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productFilter.toLowerCase())
  );
  
  // Фильтрация категорий по поиску
  const filteredCategories = categories.filter(category => 
    (category.label || category.name || '').toLowerCase().includes(categoryFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="promo-form-container">
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promo-form-container">
      <h2>{isEditMode ? 'Редактирование промокода' : 'Создание нового промокода'}</h2>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="promo-form">
        <div className="form-group">
          <label htmlFor="code">Код промокода*</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Например, SUMMER2023"
            required
            className="form-control"
            maxLength="20"
            disabled={submitting}
          />
          <small className="form-text">Код будет автоматически преобразован в верхний регистр</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание промокода"
            required
            className="form-control"
            disabled={submitting}
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discountType">Тип промокода*</label>
            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="form-control"
              disabled={submitting}
              required
            >
              <option value="PERCENTAGE">Скидка в процентах (%)</option>
              <option value="FIXED">Фиксированная скидка (руб.)</option>
              <option value="FREE_DELIVERY">Бесплатная доставка</option>
              <option value="BUY_ONE_GET_ONE">2 по цене 1</option>
              <option value="FREE_ITEM">Товар в подарок</option>
              <option value="CASHBACK">Кэшбэк (%)</option>
            </select>
          </div>
          
          {showValueField && (
            <div className="form-group">
              <label htmlFor="discountValue">
                {formData.discountType === 'PERCENTAGE' || formData.discountType === 'CASHBACK' ? 'Процент скидки (%)' : 'Сумма скидки (руб.)'}*
              </label>
              <input
                type="number"
                id="discountValue"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'PERCENTAGE' || formData.discountType === 'CASHBACK' ? "Например, 10" : "Например, 500"}
                required
                className="form-control"
                min="0"
                max={formData.discountType === 'PERCENTAGE' || formData.discountType === 'CASHBACK' ? "100" : ""}
                disabled={submitting}
              />
            </div>
          )}
        </div>

        {showFreeItemField && (
          <div className="form-group">
            <label htmlFor="freeItem">Товар в подарок*</label>
            <select
              id="freeItem"
              name="freeItem"
              value={formData.freeItem}
              onChange={handleChange}
              className="form-control"
              disabled={submitting}
              required={formData.discountType === 'FREE_ITEM'}
            >
              <option value="">Выберите товар</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minPurchaseAmount">Минимальная сумма заказа (руб.)</label>
            <input
              type="number"
              id="minPurchaseAmount"
              name="minPurchaseAmount"
              value={formData.minPurchaseAmount}
              onChange={handleChange}
              placeholder="0"
              className="form-control"
              min="0"
              disabled={submitting}
            />
          </div>
          
          {showMaxDiscountField && (
            <div className="form-group">
              <label htmlFor="maxDiscountAmount">Максимальная сумма скидки (руб.)</label>
              <input
                type="number"
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="Без ограничений"
                className="form-control"
                min="0"
                disabled={submitting}
              />
              <small className="form-text">Оставьте пустым для скидки без ограничений</small>
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Дата начала действия*</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-control"
              required
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">Дата окончания действия*</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-control"
              required
              disabled={submitting}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="usageLimit">Ограничение по использованиям</label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Без ограничений"
              className="form-control"
              min="1"
              disabled={submitting}
            />
            <small className="form-text">Оставьте пустым для неограниченного использования</small>
          </div>
          
          {isEditMode && (
            <div className="form-group">
              <label htmlFor="usageCount">Текущее количество использований</label>
              <input
                type="number"
                id="usageCount"
                name="usageCount"
                value={formData.usageCount}
                onChange={handleChange}
                className="form-control"
                min="0"
                disabled={submitting}
              />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={submitting}
            />
            <label htmlFor="isActive">Активен</label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="applicableProducts">Применимо к товарам (опционально)</label>
          
          <div className="modern-select-container">
            <div className="modern-select-header">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="select-all-option">
                <input
                  type="checkbox"
                  id="selectAllProducts"
                  checked={selectAllProducts}
                  onChange={handleSelectAllProducts}
                  disabled={submitting}
                />
                <label htmlFor="selectAllProducts">Выбрать все товары</label>
              </div>
            </div>
            
            <div className="modern-select-options">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div key={product._id} className="option-item">
                    <input
                      type="checkbox"
                      id={`product-${product._id}`}
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleProductSelect(product._id)}
                      disabled={submitting}
                    />
                    <label htmlFor={`product-${product._id}`}>{product.name}</label>
                  </div>
                ))
              ) : (
                <div className="no-options-message">
                  {productFilter ? "Нет товаров, соответствующих поиску" : "Список товаров пуст"}
                </div>
              )}
            </div>
            
            <div className="selected-count">
              Выбрано: {selectedProducts.length} из {products.length}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="applicableCategories">Применимо к категориям (опционально)</label>
          
          <div className="modern-select-container">
            <div className="modern-select-header">
              <div className="search-filter">
                <input
                  type="text"
                  placeholder="Поиск категорий..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="select-all-option">
                <input
                  type="checkbox"
                  id="selectAllCategories"
                  checked={selectAllCategories}
                  onChange={handleSelectAllCategories}
                  disabled={submitting}
                />
                <label htmlFor="selectAllCategories">Выбрать все категории</label>
              </div>
            </div>
            
            <div className="modern-select-options">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div 
                    key={category.value || category._id} 
                    className="option-item"
                  >
                    <input
                      type="checkbox"
                      id={`category-${category.value || category._id}`}
                      checked={selectedCategories.includes(category.value || category._id)}
                      onChange={() => handleCategorySelect(category.value || category._id)}
                      disabled={submitting}
                    />
                    <label htmlFor={`category-${category.value || category._id}`}>
                      {category.label || category.name}
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-options-message">
                  {categoryFilter ? "Нет категорий, соответствующих поиску" : "Список категорий пуст"}
                </div>
              )}
            </div>
            
            <div className="selected-count">
              Выбрано: {selectedCategories.length} из {categories.length}
            </div>
          </div>
        </div>
        
        <div className="form-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin/promos')}
            disabled={submitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={submitting}
          >
            {submitting ? 'Сохранение...' : isEditMode ? 'Сохранить изменения' : 'Создать промокод'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoForm; 