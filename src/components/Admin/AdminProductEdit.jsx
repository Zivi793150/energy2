import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import './AdminProducts.css';
import { motion } from 'framer-motion';

const AdminProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        firm: '',
        name: '',
        description: '',
        price: '',
        images: '',
        flavor: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Не авторизован');
                }
                const response = await axios.get(`${config.apiUrl}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProduct(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        if (id) {
            fetchProduct();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price') {
            setProduct({ ...product, [name]: parseFloat(value) || 0 });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Не авторизован');
            }
            await axios.put(`${config.apiUrl}/admin/products/${id}`, product, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            setSaving(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-loading">Загрузка данных продукта...</div>;
    }

    return (
        <motion.div className="admin-product-edit minimal" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="admin-product-edit-header">
                <h1>Редактирование продукта</h1>
                <button 
                    onClick={() => navigate('/admin/products')}
                    className="admin-button admin-button-secondary minimal"
                >
                    Вернуться к списку
                </button>
            </div>
            {error && <motion.div className="admin-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
            {success && <motion.div className="admin-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Изменения сохранены!</motion.div>}
            <form onSubmit={handleSubmit} className="admin-form minimal">
                <div className="admin-form-preview minimal">
                    <motion.div className="admin-product-preview-card minimal" initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                        <div className="admin-product-preview-image minimal">
                            {product.images ? (
                                <img src={product.images} alt={product.name || 'Превью продукта'} />
                            ) : (
                                <div className="admin-product-preview-placeholder minimal">
                                    Предпросмотр изображения
                                </div>
                            )}
                        </div>
                        <div className="admin-product-preview-info minimal">
                            <h3>{product.name || 'Название продукта'}</h3>
                            <p className="admin-product-preview-firm minimal">{product.firm || 'Производитель'}</p>
                            <p className="admin-product-preview-price minimal">
                                {product.price ? `${product.price} руб.` : 'Цена'}
                            </p>
                            {product.flavor && (
                                <p className="admin-product-preview-flavor minimal">
                                    Вкус: {flavorOptions.find(f => f.value === product.flavor)?.label || 'Не указан'}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
                <div className="admin-form-fields minimal">
                    <div className="admin-form-group minimal">
                        <label htmlFor="firm">Производитель</label>
                        <input
                            type="text"
                            id="firm"
                            name="firm"
                            value={product.firm}
                            onChange={handleChange}
                            required
                            className="admin-input minimal"
                            placeholder="Введите название производителя"
                        />
                    </div>
                    <div className="admin-form-group minimal">
                        <label htmlFor="name">Название</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            required
                            className="admin-input minimal"
                            placeholder="Введите название продукта"
                        />
                    </div>
                    <div className="admin-form-group minimal">
                        <label htmlFor="description">Описание</label>
                        <textarea
                            id="description"
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            required
                            className="admin-textarea minimal"
                            rows="5"
                            placeholder="Введите описание продукта"
                        />
                    </div>
                    <div className="admin-form-group minimal">
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
                            className="admin-input minimal"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="admin-form-group minimal">
                        <label htmlFor="images">URL изображения</label>
                        <input
                            type="text"
                            id="images"
                            name="images"
                            value={product.images}
                            onChange={handleChange}
                            required
                            className="admin-input minimal"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    <div className="admin-form-group minimal">
                        <label htmlFor="flavor">Вкус</label>
                        <select
                            id="flavor"
                            name="flavor"
                            value={product.flavor}
                            onChange={handleChange}
                            className="admin-select minimal"
                        >
                            <option value="">Выберите вкус</option>
                            {flavorOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-form-buttons minimal">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="admin-button admin-button-secondary minimal"
                            disabled={saving}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="admin-button admin-button-primary minimal"
                            disabled={saving}
                        >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default AdminProductEdit; 