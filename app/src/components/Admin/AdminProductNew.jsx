import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import './AdminProducts.css';
import { motion } from 'framer-motion';

const AdminProductNew = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        firm: '',
        name: '',
        description: '',
        price: '',
        images: '',
        flavor: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const flavorOptions = [
        { value: 'classic', label: 'Классический' },
        { value: 'tropic', label: 'Тропический' },
        { value: 'berry', label: 'Ягодный' },
        { value: 'citrus', label: 'Цитрусовый' },
        { value: 'cola', label: 'Кола' },
        { value: 'original', label: 'Оригинальный' },
        { value: 'mixed', label: 'Микс' },
        { value: 'exotic', label: 'Экзотический' },
        { value: 'mint', label: 'Мятный' },
        { value: 'cherry', label: 'Вишневый' },
        { value: 'chocolate', label: 'Шоколадный' },
        { value: 'other', label: 'Другой' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'price') {
            // Конвертируем строку цены в число
            setProduct({ ...product, [name]: parseFloat(value) || 0 });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Не авторизован');
            }

            await axios.post(`${config.apiUrl}/admin/products`, product, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/admin/products');
        } catch (err) {
            console.error('Ошибка при создании продукта:', err);
            setError(err.response?.data?.message || err.message);
            setSaving(false);
        }
    };

    return (
        <motion.div className="admin-product-edit minimal-form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="admin-product-edit-header">
                <h1>Добавление нового продукта</h1>
                <button 
                    onClick={() => navigate('/admin/products')}
                    className="admin-button admin-button-secondary"
                    type="button"
                >
                    Вернуться к списку
                </button>
            </div>
            {error && <motion.div className="admin-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
            <motion.form onSubmit={handleSubmit} className="admin-form minimal-form-fields" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <motion.div className="admin-form-preview modern-preview" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="admin-product-preview-card modern-card">
                        <div className="admin-product-preview-image modern-image">
                            {product.images ? (
                                <img src={product.images} alt={product.name || 'Превью продукта'} />
                            ) : (
                                <div className="admin-product-preview-placeholder modern-placeholder">
                                    Предпросмотр изображения
                                </div>
                            )}
                        </div>
                        <div className="admin-product-preview-info">
                            <h3>{product.name || 'Название продукта'}</h3>
                            <p className="admin-product-preview-firm">{product.firm || 'Производитель'}</p>
                            <p className="admin-product-preview-price">
                                {product.price ? `${product.price} руб.` : 'Цена'}
                            </p>
                            {product.flavor && (
                                <p className="admin-product-preview-flavor">
                                    Вкус: {flavorOptions.find(f => f.value === product.flavor)?.label || 'Не указан'}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
                <div className="admin-form-fields minimal-fields">
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="firm">Производитель</label>
                        <input
                            type="text"
                            id="firm"
                            name="firm"
                            value={product.firm}
                            onChange={handleChange}
                            required
                            className="admin-input modern-input"
                            placeholder="Введите название производителя"
                            autoComplete="off"
                        />
                    </motion.div>
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="name">Название</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            required
                            className="admin-input modern-input"
                            placeholder="Введите название продукта"
                            autoComplete="off"
                        />
                    </motion.div>
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="description">Описание</label>
                        <textarea
                            id="description"
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            required
                            className="admin-textarea modern-input"
                            rows="5"
                            placeholder="Введите описание продукта"
                        />
                    </motion.div>
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="price">Цена (руб.)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="admin-input modern-input"
                            placeholder="0.00"
                        />
                    </motion.div>
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="images">URL изображения</label>
                        <input
                            type="text"
                            id="images"
                            name="images"
                            value={product.images}
                            onChange={handleChange}
                            required
                            className="admin-input modern-input"
                            placeholder="https://example.com/image.jpg"
                            autoComplete="off"
                        />
                    </motion.div>
                    <motion.div className="admin-form-group modern-group" whileFocus={{ scale: 1.03 }}>
                        <label htmlFor="flavor">Вкус</label>
                        <select
                            id="flavor"
                            name="flavor"
                            value={product.flavor}
                            onChange={handleChange}
                            className="admin-select modern-input"
                        >
                            <option value="">Выберите вкус</option>
                            {flavorOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                    <div className="admin-form-buttons minimal-buttons">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="admin-button admin-button-secondary modern-btn"
                            disabled={saving}
                        >
                            Отмена
                        </button>
                        <motion.button
                            type="submit"
                            className="admin-button admin-button-primary modern-btn"
                            disabled={saving}
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ boxShadow: '0 8px 24px #37ffff44' }}
                        >
                            {saving ? 'Создание...' : 'Создать продукт'}
                        </motion.button>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    );
};

export default AdminProductNew; 