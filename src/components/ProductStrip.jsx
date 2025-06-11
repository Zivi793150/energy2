import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './ProductStrip.css';

// Мемоизированный компонент карточки продукта
const ProductCard = React.memo(({ product, isCenter }) => (
  <div className={`product-card ${isCenter ? 'center' : ''}`} style={{ zIndex: isCenter ? 2 : 1 }}>
    <Link to={`/product/${product._id || product.id}`} className="product-link">
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
    </Link>
  </div>
));

const ProductStrip = ({ products }) => {
  const [startIndex, setStartIndex] = useState(0);

  // Мемоизируем видимые продукты для предотвращения ненужных перерендеров
  const visibleProducts = useMemo(() => {
    if (!products.length) return [];
    const visible = [];
    for (let i = 0; i < 5; i++) {
      visible.push(products[(startIndex + i) % products.length]);
    }
    return visible;
  }, [products, startIndex]);

  // Оптимизируем обработчики событий с помощью useCallback
  const handlePrev = useCallback(() => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  const handleNext = useCallback(() => {
    setStartIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  // Мемоизируем SVG для предотвращения ненужных перерендеров
  const arrowSvg = useMemo(() => (
    <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
    </svg>
  ), []);

  return (
    <div className="product-strip-wrapper">
      <button className="arrow-button left" onClick={handlePrev}>
        <div className="button-box">
          <span className="button-elem">
            {arrowSvg}
          </span>
          <span className="button-elem">
            {arrowSvg}
          </span>
        </div>
      </button>
      <div className="product-strip">
        {visibleProducts.map((product, idx) => (
          <ProductCard
            key={product._id || product.id || idx}
            product={product}
            isCenter={idx === 2}
          />
        ))}
      </div>
      <button className="arrow-button right" onClick={handleNext}>
        <div className="button-box">
          <span className="button-elem">
            {arrowSvg}
          </span>
          <span className="button-elem">
            {arrowSvg}
          </span>
        </div>
      </button>
    </div>
  );
};

export default React.memo(ProductStrip);