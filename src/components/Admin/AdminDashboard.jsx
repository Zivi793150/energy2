import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import { motion } from 'framer-motion';

// Вспомогательные компоненты
const StatCard = ({ icon, title, value, color, linkTo, linkText }) => (
  <motion.div 
    className={`stat-card ${color}`}
    whileHover={{ y: -8, boxShadow: "0 20px 30px rgba(55, 255, 255, 0.25)" }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="stat-icon">{icon}</div>
    <h2>{title}</h2>
    <p className="stat-value">{value}</p>
    {linkTo && linkText && (
      <Link to={linkTo} className="stat-link">
        {linkText}
      </Link>
    )}
  </motion.div>
);

const TopProductItem = ({ product, index }) => (
  <motion.div 
    className="top-product-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <span className="top-product-rank">{index + 1}</span>
    <div className="top-product-info">
      <h4>{product.name}</h4>
      <p>{product.firm}</p>
    </div>
    <div className="top-product-rating">
      <span>★</span>
      <span>{product.ratingAvg ? product.ratingAvg.toFixed(1) : '0.0'}</span>
      <small>({product.ratingCount || 0})</small>
    </div>
  </motion.div>
);

const RecentProductItem = ({ product, index }) => {
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('ru-RU')}`;
  };

  return (
    <motion.div 
      className="recent-product-item"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="recent-product-info">
        <h4>{product.name}</h4>
        <p>{product.firm}</p>
      </div>
      <div className="recent-product-date">
        {formatDate(product.createdAt)}
      </div>
    </motion.div>
  );
};

const FlavorChart = ({ data }) => {
  // Получаем наименования для значений flavor
  const getFlavorName = (flavor) => {
    const flavorMap = {
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
    return flavor && flavorMap[flavor] ? flavorMap[flavor] : 'Не указан';
  };

  // Находим максимальное количество для масштабирования
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="flavor-chart">
      {data.map((item, index) => (
        <motion.div 
          key={item._id || index} 
          className="flavor-bar-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="flavor-label">{getFlavorName(item._id)}</div>
          <motion.div 
            className="flavor-bar"
            initial={{ width: 0 }}
            animate={{ width: `${(item.count / maxCount) * 100}%` }}
            transition={{ duration: 0.7, delay: 0.3 + index * 0.1 }}
          >
            <span className="flavor-count">{item.count}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

const UserActivityPie = ({ activityGroups, totalUsers }) => {
  const { onlyRatings, onlyFavorites, both, neither } = activityGroups;
  // Считаем проценты
  const bothPercent = Math.round((both / totalUsers) * 100) || 0;
  const onlyRatingsPercent = Math.round((onlyRatings / totalUsers) * 100) || 0;
  const onlyFavoritesPercent = Math.round((onlyFavorites / totalUsers) * 100) || 0;
  const neitherPercent = 100 - (bothPercent + onlyRatingsPercent + onlyFavoritesPercent);

  return (
    <div className="user-activity-pie">
      <div className="pie-container">
        <div className="pie-stats">
          <motion.div className="pie-stat-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="pie-dot ratings-dot"></div>
            <div className="pie-label">Только с оценками ({onlyRatings})</div>
            <div className="pie-value">{onlyRatingsPercent}%</div>
          </motion.div>
          <motion.div className="pie-stat-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="pie-dot favorites-dot"></div>
            <div className="pie-label">Только с избранным ({onlyFavorites})</div>
            <div className="pie-value">{onlyFavoritesPercent}%</div>
          </motion.div>
          <motion.div className="pie-stat-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <div className="pie-dot both-dot" style={{ background: 'linear-gradient(90deg, #37FFFF 50%, #FF6B6B 50%)' }}></div>
            <div className="pie-label">И то, и другое ({both})</div>
            <div className="pie-value">{bothPercent}%</div>
          </motion.div>
          <motion.div className="pie-stat-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <div className="pie-dot neither-dot" style={{ background: '#E9ECEF' }}></div>
            <div className="pie-label">Пассивные ({neither})</div>
            <div className="pie-value">{neitherPercent}%</div>
          </motion.div>
        </div>
        <div className="pie-chart">
          <motion.div 
            className="pie"
            style={{
              background: `conic-gradient(
                #37FFFF 0% ${onlyRatingsPercent}%,
                #FF6B6B ${onlyRatingsPercent}% ${onlyRatingsPercent + onlyFavoritesPercent}%,
                #A951FF ${onlyRatingsPercent + onlyFavoritesPercent}% ${onlyRatingsPercent + onlyFavoritesPercent + bothPercent}%,
                #E9ECEF ${onlyRatingsPercent + onlyFavoritesPercent + bothPercent}% 100%
              )`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    userStats: {
      newUsers: 0,
      adminUsers: 0,
      verifiedUsers: 0,
      withRatings: 0,
      withFavorites: 0,
      activityGroups: {
        onlyRatings: 0,
        onlyFavorites: 0,
        both: 0,
        neither: 0
      }
    },
    productStats: {
      topRated: [],
      recentlyAdded: [],
      byFlavor: [],
      averageRating: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Не авторизован');
        }

        console.log('Запрос на получение статистики:', `${config.apiUrl}/admin/dashboard`);
        const response = await axios.get(`${config.apiUrl}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Полученная статистика:', response.data);
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-loading">Загрузка статистики...</div>;
  }

  if (error) {
    return <div className="admin-error">Ошибка: {error}</div>;
  }

  // Иконки для карточек статистики
  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon-svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  const productIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon-svg">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const newUserIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon-svg">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const ratingIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon-svg">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  );

  return (
    <motion.div 
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Панель управления
      </motion.h1>
      
      <div className="dashboard-grid">
        {/* Основные карточки статистики */}
        <div className="main-stats">
          <StatCard 
            icon={userIcon}
            title="Пользователи"
            value={stats.usersCount}
            color="blue"
            linkTo="/admin/users"
            linkText="Управление пользователями"
          />
          
          <StatCard 
            icon={productIcon}
            title="Продукты"
            value={stats.productsCount}
            color="green"
            linkTo="/admin/products"
            linkText="Управление продуктами"
          />
          
          <StatCard 
            icon={newUserIcon}
            title="Новые пользователи"
            value={stats.userStats.newUsers}
            color="orange"
          />
          
          <StatCard 
            icon={ratingIcon}
            title="Средний рейтинг"
            value={stats.productStats.averageRating ? stats.productStats.averageRating.toFixed(1) : '0.0'}
            color="purple"
          />
          
          <StatCard 
            icon="🎁"
            title="Промокоды"
            value="Управлять"
            color="purple"
            linkTo="/admin/promos"
            linkText="Управление промокодами"
          />
        </div>
        
        {/* Панель с топовыми продуктами */}
        <div className="dashboard-panel top-rated-panel">
          <h3>Лучшие продукты</h3>
          <div className="top-products-list">
            {stats.productStats.topRated && stats.productStats.topRated.length > 0 ? (
              stats.productStats.topRated.map((product, index) => (
                <TopProductItem key={product._id} product={product} index={index} />
              ))
            ) : (
              <div className="no-data">Нет данных о продуктах</div>
            )}
          </div>
        </div>
        
        {/* Панель с недавними продуктами */}
        <div className="dashboard-panel recent-products-panel">
          <h3>Недавно добавленные</h3>
          <div className="recent-products-list">
            {stats.productStats.recentlyAdded && stats.productStats.recentlyAdded.length > 0 ? (
              stats.productStats.recentlyAdded.map((product, index) => (
                <RecentProductItem key={product._id} product={product} index={index} />
              ))
            ) : (
              <div className="no-data">Нет данных о продуктах</div>
            )}
          </div>
        </div>
        
        {/* Круговая диаграмма по активности пользователей */}
        <div className="dashboard-panel user-activity-panel">
          <h3>Активность пользователей</h3>
          <UserActivityPie 
            activityGroups={stats.userStats.activityGroups || {onlyRatings:0,onlyFavorites:0,both:0,neither:0}}
            totalUsers={stats.usersCount || 0}
          />
        </div>
        
        {/* Гистограмма по вкусам */}
        <div className="dashboard-panel flavor-panel">
          <h3>Распределение по вкусам</h3>
          {stats.productStats.byFlavor && stats.productStats.byFlavor.length > 0 ? (
            <FlavorChart data={stats.productStats.byFlavor} />
          ) : (
            <div className="no-data">Нет данных о вкусах</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard; 