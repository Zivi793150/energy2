import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import FavoriteCheckbox from './FavoriteCheckbox';
import { isInFavorites } from '../utils/favoritesUtils';
import { useFavorites } from '../context/FavoritesContext';

const SimilarProducts = ({ products, title = 'Похожие по вкусу' }) => {
  const { toggleFavoriteItem } = useFavorites();
  const scrollContainerRef = useRef(null);

  const handleToggleFavorite = (productId) => {
    const product = products.find(p => (p._id === productId || p.id === productId));
    if (product) {
      toggleFavoriteItem(product);
    }
  };

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 300; // Количество пикселей для прокрутки
    
    // Рассчитываем новую позицию прокрутки
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    // Плавно прокручиваем к новой позиции
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <SimilarProductsWrapper>
      <h2 className="similar-title">{title}</h2>
      <div className="similar-products-scroll-container">
        <button 
          className="scroll-button left" 
          onClick={() => handleScroll('left')}
          aria-label="Прокрутить влево"
        >
          <div className="button-box">
            <span className="button-elem">
              <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
              </svg>
            </span>
            <span className="button-elem">
              <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
              </svg>
            </span>
          </div>
        </button>
        
        <div className="similar-products-container" ref={scrollContainerRef}>
          {products.map(product => (
            <div key={product._id || product.id} className="similar-product-card">
              <div className="favorite-checkbox-wrapper">
                <FavoriteCheckbox
                  productId={product._id || product.id}
                  initialChecked={isInFavorites(product._id || product.id)}
                  onChange={handleToggleFavorite}
                />
              </div>
              <Link to={`/product/${product._id || product.id}`} className="similar-product-link">
                <div className="similar-product-image">
                  <img src={encodeURI(`/images/${product.image}`)} alt={product.name} loading="lazy" />
                </div>
                <div className="similar-product-info">
                  <h3 className="similar-product-name">{product.name}</h3>
                  <span className="similar-product-price">{product.price} руб.</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <button 
          className="scroll-button right" 
          onClick={() => handleScroll('right')}
          aria-label="Прокрутить вправо"
        >
          <div className="button-box">
            <span className="button-elem">
              <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
              </svg>
            </span>
            <span className="button-elem">
              <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </SimilarProductsWrapper>
  );
};

const SimilarProductsWrapper = styled.div`
  margin-top: 60px;
  padding: 30px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  .similar-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
    color: #1a1a1a;
    text-align: center;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: linear-gradient(90deg, #2ff3fa, #00c3ff);
      border-radius: 3px;
    }
  }

  .similar-products-scroll-container {
    display: flex;
    align-items: center;
    position: relative;
    margin: 0 -15px;
  }

  .similar-products-container {
    display: flex;
    overflow-x: hidden;
    gap: 20px;
    padding: 10px 5px 20px 5px;
    margin: 0 10px;
    flex: 1;
    
    /* Smooth scrolling */
    scroll-behavior: smooth;
  }

  .scroll-button {
    display: block;
    position: relative;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    margin: 0 10px;
    overflow: hidden;
    outline: none;
    background-color: transparent;
    cursor: pointer;
    border: 0;
    z-index: 10;
  }

  .scroll-button:before,
  .scroll-button:after {
    content: "";
    position: absolute;
    border-radius: 50%;
    inset: 7px;
  }

  .scroll-button:before {
    border: 4px solid #f0eeef;
    transition: opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
      transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
  }

  .scroll-button:after {
    border: 4px solid #2ff3fa;
    transform: scale(1.3);
    transition: opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
      transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
  }

  .scroll-button:hover:before,
  .scroll-button:focus:before {
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
      transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .scroll-button:hover:after,
  .scroll-button:focus:after {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(55, 255, 255, 0.5);
    transition: opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
      transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms,
      box-shadow 0.5s;
  }

  .button-box {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
  }

  .button-elem {
    display: block;
    width: 20px;
    height: 20px;
    margin: 17px 18px 0 18px;
    fill: #2ff3fa;
  }

  .scroll-button.left .button-elem {
    transform: rotate(180deg);
  }

  .scroll-button.right .button-elem {
    transform: none;
  }

  .scroll-button:hover .button-box,
  .scroll-button:focus .button-box {
    transition: 0.4s;
    transform: translateX(-56px);
  }

  .similar-product-card {
    flex: 0 0 220px;
    min-width: 220px;
    background-color: #f8fbff;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .similar-product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(47, 243, 250, 0.15);
  }

  .favorite-checkbox-wrapper {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 5;
  }

  .similar-product-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .similar-product-image {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background-color: white;
  }

  .similar-product-image img {
    max-width: 100%;
    max-height: 150px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .similar-product-card:hover .similar-product-image img {
    transform: scale(1.1);
  }

  .similar-product-info {
    padding: 15px;
    text-align: center;
  }

  .similar-product-name {
    font-size: 1rem;
    margin: 0 0 10px 0;
    color: #333;
    line-height: 1.3;
    height: 2.6em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .similar-product-price {
    font-size: 1.1rem;
    font-weight: bold;
    color: #2ff3fa;
    display: block;
  }

  @media (max-width: 768px) {
    padding: 20px 10px;
    
    .similar-product-card {
      flex: 0 0 180px;
      min-width: 180px;
    }
    
    .similar-product-image {
      height: 150px;
    }
    
    .scroll-button {
      width: 40px;
      height: 40px;
      margin: 0 5px;
    }
    
    .button-elem {
      width: 16px;
      height: 16px;
      margin: 12px 12px 0 12px;
    }
    
    .scroll-button:hover .button-box,
    .scroll-button:focus .button-box {
      transform: translateX(-40px);
    }
  }
`;

export default SimilarProducts; 