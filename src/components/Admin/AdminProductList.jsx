import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import './AdminProducts.css';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Не авторизован');
                }

                const response = await axios.get(`${config.apiUrl}/admin/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Загружено продуктов:', response.data.length);
                setProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке продуктов:', err);
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.apiUrl}/admin/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Обновляем список продуктов после удаления
            setProducts(products.filter(product => product._id !== id));
        } catch (err) {
            console.error('Ошибка при удалении продукта:', err);
            alert(`Ошибка: ${err.response?.data?.message || err.message}`);
        }
    };

    // Функция для преобразования значения вкуса в читаемый текст
    const getFlavorDisplayName = (flavor) => {
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
    };

    if (loading) {
        return <div className="admin-loading">Загрузка продуктов...</div>;
    }

    if (error) {
        return <div className="admin-error">Ошибка: {error}</div>;
    }

    return (
        <div className="admin-products">
            <div className="admin-products-header">
                <h1>Управление продуктами</h1>
                <Link to="/admin/products/new" className="admin-button admin-button-add">
                    <span className="plus-icon">+</span> Добавить продукт
                </Link>
            </div>

            <div className="admin-product-grid">
                <AnimatePresence>
                {products.length === 0 ? (
                    <motion.div className="no-products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        Продукты не найдены
                    </motion.div>
                ) : (
                    products.map((product, idx) => (
                        <motion.div
                            key={product._id}
                            className="admin-product-card minimal"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.97 }}
                            transition={{ duration: 0.35, delay: idx * 0.06 }}
                        >
                            <div className="admin-product-image minimal">
                                <img src={product.images} alt={product.name} />
                            </div>
                            <div className="admin-product-info minimal">
                                <h3 className="admin-product-name minimal">{product.name}</h3>
                                <div className="admin-product-details minimal">
                                    <span className="admin-product-firm minimal">{product.firm}</span>
                                    <span className="admin-product-price minimal">{product.price} руб.</span>
                                    {product.flavor && (
                                        <span className="admin-product-flavor minimal">
                                            {getFlavorDisplayName(product.flavor)}
                                        </span>
                                    )}
                                </div>
                                <div className="admin-product-rating minimal">
                                    <span>★ {product.ratingAvg?.toFixed(1) || '0.0'}</span>
                                    <span className="admin-product-rating-count">({product.ratingCount || 0})</span>
                                </div>
                            </div>
                            <div className="admin-product-actions minimal">
                                <Link 
                                    to={`/admin/products/edit/${product._id}`} 
                                    className="admin-button admin-button-edit minimal"
                                >
                                    Редактировать
                                </Link>
                                <button 
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="admin-button admin-button-delete minimal"
                                >
                                    Удалить
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminProductList; 