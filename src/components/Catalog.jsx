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

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toggleFavoriteItem, favorites, refreshFavorites } = useFavorites();
    const [showFilters, setShowFilters] = useState(false);
    const [brands, setBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedFlavors, setSelectedFlavors] = useState([]);
    const [priceFrom, setPriceFrom] = useState('');
    const [priceTo, setPriceTo] = useState('');
    const [sort, setSort] = useState('');

    console.log('Catalog: Текущий список избранных товаров:', favorites);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Извлекаем массив продуктов из ответа API
                const productsList = data.products || [];
                console.log('Загруженные продукты с вкусами:', productsList.map(p => ({ id: p._id, name: p.name, flavor: p.flavor })));
                setProducts(productsList);
                setFilteredProducts(productsList);
                // Собираем уникальные бренды
                const uniqueBrands = Array.from(new Set(productsList.map(p => p.firm).filter(Boolean)));
                setBrands(uniqueBrands);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Добавляем useEffect для обновления состояния при изменении favorites
    useEffect(() => {
        console.log('Catalog useEffect: favorites обновлены, запускаем перефильтрацию/сортировку:', favorites);
        let filtered = [...products];
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.firm));
        }
        if (selectedFlavors.length > 0) {
            filtered = filtered.filter(p => selectedFlavors.includes(p.flavor));
        }
        if (priceFrom) {
            filtered = filtered.filter(p => Number(p.price) >= Number(priceFrom));
        }
        if (priceTo) {
            filtered = filtered.filter(p => Number(p.price) <= Number(priceTo));
        }
        if (sort === 'rating-desc') {
            filtered = filtered.slice().sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
        } else if (sort === 'rating-asc') {
            filtered = filtered.slice().sort((a, b) => (a.ratingAvg || 0) - (b.ratingAvg || 0));
        } else if (sort === 'price-asc') {
            filtered = filtered.slice().sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sort === 'price-desc') {
            filtered = filtered.slice().sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        setFilteredProducts(filtered);
    }, [products, selectedBrands, selectedFlavors, priceFrom, priceTo, sort, favorites]);

    // Добавляем этот useEffect для обновления избранного при монтировании компонента
    useEffect(() => {
        console.log('Catalog: Компонент смонтирован, обновляем избранное');
        refreshFavorites();
    }, []);

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
                    <div>Загрузка...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="no-results">Товары не найдены</div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product._id || product.id} className="card">
                            <div className="favorite-checkbox">
                                {console.log(`Catalog: Рендеринг FavoriteCheckbox для ${product.name} (ID: ${product._id || product.id}), initialChecked: ${isInFavorites(product._id || product.id, favorites)}`)}
                                <FavoriteCheckbox 
                                    productId={product._id || product.id} 
                                    initialChecked={isInFavorites(product._id || product.id, favorites)}
                                    onChange={handleToggleFavorite}
                                />
                            </div>
                            <Link 
                                to={`/product/${product._id || product.id}`} 
                                className="product-link"
                                onClick={() => console.log("Переход к продукту с ID:", product._id || product.id)}
                            >
                                <div className="card2">
                                    <div className="card-image">
                                        <img 
                                            src={(() => {
                                                if (!product.image) return '';
                                                if (typeof product.image === 'string') {
                                                    const fileName = product.image.split('\\').pop();
                                                    return `/images/${encodeURIComponent(fileName)}`;
                                                }
                                                return '';
                                            })()} 
                                            alt={product.name} 
                                            className="product-image" 
                                        />
                                    </div>
                                    <div className="card-info">
                                        <span className="card-name">{product.name}</span>
                                        <span className="card-price">{product.price} руб.</span>
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