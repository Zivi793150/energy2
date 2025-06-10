import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import FavoriteCheckbox from './FavoriteCheckbox';
import styled from 'styled-components';

const Favorites = () => {
  const { favorites, toggleFavoriteItem } = useFavorites();
  const { isAuthenticated, user } = useAuth();

  console.log('Favorites.jsx: список избранных товаров:', favorites);

  const handleToggleFavorite = (productId) => {
    const product = favorites.find(p => (p._id === productId || p.id === productId));
    if (product) {
      toggleFavoriteItem(product);
    }
  };

  return (
    <FavoritesContainer>
      <h1 className="favorites-title">Избранные товары</h1>
      
      {!isAuthenticated && (
        <div className="auth-banner">
          <p>Вы просматриваете список избранных товаров в режиме гостя.</p>
          <p>Для сохранения избранных товаров между устройствами, пожалуйста, <Link to="/login" className="auth-link">войдите</Link> или <Link to="/register" className="auth-link">зарегистрируйтесь</Link>.</p>
        </div>
      )}
      
      {isAuthenticated && (
        <div className="user-banner">
          <p>Здравствуйте, {user?.email}! Это ваши избранные товары.</p>
        </div>
      )}
      
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>У вас нет избранных товаров</p>
          <Link to="/catalog" className="continue-shopping-btn">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(product => (
            <div key={product._id || product.id} className="favorite-item">
              <div className="favorite-checkbox">
                <FavoriteCheckbox 
                  productId={product._id || product.id} 
                  initialChecked={true}
                  onChange={handleToggleFavorite}
                />
              </div>
              <Link 
                to={`/product/${product._id || product.id}`}
                className="favorite-link"
              >
                <div className="favorite-image">
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
                  />
                </div>
                <div className="favorite-details">
                  <h3 className="favorite-name">{product.name}</h3>
                  <p className="favorite-price">{product.price} руб.</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </FavoritesContainer>
  );
};

const FavoritesContainer = styled.div`
  padding: 50px 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'WidockTrial', sans-serif;

  .favorites-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
    color: #1a1a1a;
    text-align: center;
  }
  
  .auth-banner, .user-banner {
    background-color: #f8fbff;
    border-radius: 12px;
    border-left: 4px solid #2ff3fa;
    padding: 15px 20px;
    margin-bottom: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .auth-banner p, .user-banner p {
    margin: 10px 0;
    color: #444;
  }
  
  .auth-link {
    color: #2ff3fa;
    font-weight: bold;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .auth-link:hover {
    text-decoration: underline;
  }

  .empty-favorites {
    text-align: center;
    padding: 50px 0;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .empty-favorites p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 20px;
  }

  .continue-shopping-btn {
    padding: 12px 25px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    background-color: #f8fbff;
    color: #333;
    border: 1.5px solid #b6d0ee;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s;
  }

  .continue-shopping-btn:hover {
    background-color: #e9f3ff;
    box-shadow: 0 0 15px rgba(47, 243, 250, 0.3);
    transform: translateY(-3px);
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
  }

  .favorite-item {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s;
    position: relative;
  }

  .favorite-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(47, 243, 250, 0.15);
  }

  .favorite-checkbox {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
  }

  .favorite-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .favorite-image {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8fbff;
    padding: 20px;
  }

  .favorite-image img {
    max-width: 100%;
    max-height: 160px;
    object-fit: contain;
  }

  .favorite-details {
    padding: 15px;
  }

  .favorite-name {
    font-size: 1.2rem;
    margin: 0 0 10px 0;
    color: #333;
  }

  .favorite-price {
    font-size: 1.1rem;
    font-weight: bold;
    color: #2ff3fa;
    margin: 0;
  }

  @media screen and (max-width: 768px) {
    .favorites-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
`;

export default Favorites; 