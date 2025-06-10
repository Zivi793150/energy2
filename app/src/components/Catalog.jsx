import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Catalog.css';
import FavoriteCheckbox from './FavoriteCheckbox';
import { useFavorites } from '../context/FavoritesContext';
import { isInFavorites } from '../utils/favoritesUtils';
import SearchBar from './SearchBar';
import { motion, AnimatePresence } from 'framer-motion';
import CatalogFilterPanel from './CatalogFilterPanel';
import flavorOptions from './flavorOptions';
import './CatalogFilterPanel.css';
import { productService } from '../api/services';

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toggleFavoriteItem } = useFavorites();
    const [showFilters, setShowFilters] = useState(false);
    const [brands, setBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedFlavors, setSelectedFlavors] = useState([]);
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [sort, setSort] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {
                    page: 1,
                    limit: 100,
                    sort: sort || '-createdAt'
                };

                // Добавляем параметры только если они не пустые
                if (selectedBrands.length > 0) {
                    params.firm = selectedBrands.join(',');
                }
                if (selectedFlavors.length > 0) {
                    params.flavor = selectedFlavors.join(',');
                }
                if (priceFrom) {
                    params.minPrice = priceFrom;
                }
                if (priceTo) {
                    params.maxPrice = priceTo;
                }

                console.log('Request params:', params); // Для отладки
                
                const response = await productService.getProducts(params);
                const productsList = response.products || [];
                setProducts(productsList);
                setFilteredProducts(productsList);
                
                // Собираем уникальные бренды
                const uniqueBrands = Array.from(new Set(productsList.map(p => p.firm).filter(Boolean)));
                setBrands(uniqueBrands);
            } catch (error) {
                console.error('Ошибка при загрузке продуктов:', error);
                setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [sort, selectedBrands, selectedFlavors, priceFrom, priceTo]);

    const handleToggleFavorite = (productId) => {
        const product = products.find(p => (p._id === productId || p.id === productId));
        if (product) {
            toggleFavoriteItem(product);
        }
    };

    const handleSearch = (query) => {
        if (!query.trim()) {
            setFilteredProducts(products);
            return;
        }
        const searchTerms = query.toLowerCase().trim().split(' ');
        const filtered = products.filter(product => {
            const productName = product.name.toLowerCase();
            const productDescription = product.description ? product.description.toLowerCase() : '';
            return searchTerms.some(term => 
                productName.includes(term) || productDescription.includes(term)
            );
        });
        setFilteredProducts(filtered);
    };

    const handleBrandChange = (brand) => {
        setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    };

    const handleFlavorChange = (flavor) => {
        setSelectedFlavors(prev => prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]);
    };

    const handleResetFilters = () => {
        setSelectedBrands([]);
        setSelectedFlavors([]);
        setPriceFrom('');
        setPriceTo('');
        setSort('');
    };

    if (error) {
        return (
            <div className="catalog-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="product-catalog">
            <SearchBar 
                onSearch={handleSearch}
                onFilterClick={() => setShowFilters(true)}
            />
            <CatalogFilterPanel
                open={showFilters}
                onClose={() => setShowFilters(false)}
                brands={brands}
                selectedBrands={selectedBrands}
                onBrandChange={handleBrandChange}
                flavors={flavorOptions}
                selectedFlavors={selectedFlavors}
                onFlavorChange={handleFlavorChange}
                priceFrom={priceFrom}
                priceTo={priceTo}
                onPriceFromChange={setPriceFrom}
                onPriceToChange={setPriceTo}
                sort={sort}
                onSortChange={setSort}
                onReset={handleResetFilters}
                onApply={() => setShowFilters(false)}
            />
            <div className="product-grid">
                {loading ? (
                    <div className="catalog-loading">
                        <div className="loading-spinner"></div>
                        <p>Загрузка товаров...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="catalog-empty">
                        <p>Товары не найдены</p>
                        <button 
                            onClick={handleResetFilters}
                            className="reset-filters-button"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product._id} className="card">
                            <div className="favorite-checkbox">
                                <FavoriteCheckbox 
                                    productId={product._id} 
                                    initialChecked={isInFavorites(product._id)}
                                    onChange={handleToggleFavorite}
                                />
                            </div>
                            <Link 
                                to={`/product/${product._id}`} 
                                className="product-link"
                            >
                                <div className="card2">
                                    <div className="card-image">
                                        <img 
                                            src={product.images[0]} 
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/placeholder.png';
                                            }}
                                        />
                                    </div>
                                    <div className="card-info">
                                        <span className="card-name">{product.name}</span>
                                        <span className="card-price">{product.price} ₽</span>
                                        {product.ratingAvg && (
                                            <div className="rating">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span 
                                                        key={i} 
                                                        className={`star ${i < Math.round(product.ratingAvg) ? 'filled' : ''}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                                <span className="rating-count">
                                                    ({product.ratingCount || 0})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Catalog;