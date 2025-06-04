import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CatalogFilterPanel.css';

const CatalogFilterPanel = ({
  open, onClose, brands, selectedBrands, onBrandChange,
  flavors, selectedFlavors, onFlavorChange,
  priceFrom, priceTo, onPriceFromChange, onPriceToChange,
  sort, onSortChange, onReset, onApply
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="filter-panel-modern"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="filter-panel-header">
            <span>Фильтры</span>
            <button className="close-filter" onClick={onClose}>×</button>
          </div>
          <div className="filter-section">
            <div className="filter-label">Бренд</div>
            {brands.map(brand => (
              <label key={brand} className="filter-checkbox-modern">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandChange(brand)}
                />
                {brand}
              </label>
            ))}
          </div>
          <div className="filter-section">
            <div className="filter-label">Вкус</div>
            {flavors.map(option => (
              <label key={option.value} className="filter-checkbox-modern">
                <input
                  type="checkbox"
                  checked={selectedFlavors.includes(option.value)}
                  onChange={() => onFlavorChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <div className="filter-section">
            <div className="filter-label">Цена</div>
            <div className="filter-price-row">
              <input type="number" min="0" placeholder="от" value={priceFrom} onChange={e => onPriceFromChange(e.target.value)} className="filter-price-input-modern" />
              <span className="filter-price-sep">–</span>
              <input type="number" min="0" placeholder="до" value={priceTo} onChange={e => onPriceToChange(e.target.value)} className="filter-price-input-modern" />
            </div>
          </div>
          <div className="filter-section">
            <div className="filter-label">Сортировка</div>
            <select
              className="filter-sort-modern"
              value={sort}
              onChange={e => onSortChange(e.target.value)}
            >
              <option value="">Без сортировки</option>
              <option value="rating-desc">По рейтингу (сначала лучшие)</option>
              <option value="rating-asc">По рейтингу (сначала худшие)</option>
              <option value="price-asc">По цене (сначала дешёвые)</option>
              <option value="price-desc">По цене (сначала дорогие)</option>
            </select>
          </div>
          <div className="filter-panel-actions">
            <button className="filter-reset-modern" onClick={onReset}>Сбросить</button>
            <button className="filter-apply-modern" onClick={onApply}>Показать</button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CatalogFilterPanel; 