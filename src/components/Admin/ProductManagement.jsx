import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    firm: '',
    name: '',
    description: '',
    price: '',
    image: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Не авторизован');
        }

        console.log('Запрос на получение продуктов:', `${config.apiUrl}/admin/products`);
        const response = await axios.get(`${config.apiUrl}/admin/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Полученные продукты:', response.data);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении списка продуктов:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      await axios.delete(`${config.apiUrl}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Удаляем продукт из списка
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct({ ...editProduct, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const response = await axios.put(
        `${config.apiUrl}/admin/products/${editProduct._id}`,
        editProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Обновляем продукт в списке
      setProducts(products.map(product => 
        product._id === editProduct._id ? response.data : product
      ));

      setEditProduct(null);
    } catch (error) {
      console.error('Ошибка при обновлении продукта:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const response = await axios.post(
        `${config.apiUrl}/admin/products`,
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Добавляем новый продукт в список
      setProducts([response.data, ...products]);

      // Сбрасываем форму
      setNewProduct({
        firm: '',
        name: '',
        description: '',
        price: '',
        image: ''
      });
      
      setShowAddForm(false);
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <div className="admin-loading">Загрузка списка продуктов...</div>;
  }

  if (error) {
    return <div className="admin-error">Ошибка: {error}</div>;
  }

  return (
    <div className="product-management">
      <h1>Управление продуктами</h1>
      
      <button 
        className="add-product-btn"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? 'Отменить' : 'Добавить новый продукт'}
      </button>
      
      {showAddForm && (
        <div className="add-product-form-container">
          <form onSubmit={handleAddSubmit} className="product-form">
            <h2>Добавить новый продукт</h2>
            
            <div className="form-group">
              <label htmlFor="firm">Производитель</label>
              <input
                type="text"
                id="firm"
                name="firm"
                value={newProduct.firm}
                onChange={handleNewProductChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Название</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Цена</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProduct.price}
                onChange={handleNewProductChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">URL изображения</label>
              <input
                type="text"
                id="image"
                name="image"
                value={newProduct.image}
                onChange={handleNewProductChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">Добавить продукт</button>
          </form>
        </div>
      )}
      
      <div className="products-list">
        {products.map(product => (
          <div key={product._id} className="product-card">
            {editProduct && editProduct._id === product._id ? (
              <form onSubmit={handleEditSubmit} className="product-form">
                <h3>Редактирование продукта</h3>
                
                <div className="form-group">
                  <label htmlFor={`edit-firm-${product._id}`}>Производитель</label>
                  <input
                    type="text"
                    id={`edit-firm-${product._id}`}
                    name="firm"
                    value={editProduct.firm}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`edit-name-${product._id}`}>Название</label>
                  <input
                    type="text"
                    id={`edit-name-${product._id}`}
                    name="name"
                    value={editProduct.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`edit-description-${product._id}`}>Описание</label>
                  <textarea
                    id={`edit-description-${product._id}`}
                    name="description"
                    value={editProduct.description}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`edit-price-${product._id}`}>Цена</label>
                  <input
                    type="number"
                    id={`edit-price-${product._id}`}
                    name="price"
                    value={editProduct.price}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`edit-image-${product._id}`}>URL изображения</label>
                  <input
                    type="text"
                    id={`edit-image-${product._id}`}
                    name="image"
                    value={editProduct.image}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                
                <div className="edit-actions">
                  <button type="submit" className="save-btn">Сохранить</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditProduct(null)}>Отмена</button>
                </div>
              </form>
            ) : (
              <>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-firm">{product.firm}</p>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">{product.price} ₽</p>
                </div>
                <div className="product-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => setEditProduct(product)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product._id)}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement; 