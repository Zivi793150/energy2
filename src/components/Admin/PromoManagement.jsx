import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PromoManagement.css';
import axios from 'axios';
import { API_URL } from '../../config';
import { formatDate } from '../../utils/dateUtils';

const PromoManagement = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'expired'

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/promos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPromos(response.data.promos);
      } else {
        setError(response.data.message || 'Не удалось загрузить промокоды');
      }
    } catch (err) {
      console.error('Ошибка при загрузке промокодов:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке промокодов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот промокод?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/promos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Обновляем список промокодов после удаления
        setPromos(promos.filter(promo => promo._id !== id));
      } else {
        setError(response.data.message || 'Не удалось удалить промокод');
      }
    } catch (err) {
      console.error('Ошибка при удалении промокода:', err);
      setError(err.response?.data?.message || 'Ошибка при удалении промокода');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/promos/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Обновляем статус в локальном состоянии
        setPromos(promos.map(promo => 
          promo._id === id ? { ...promo, isActive: !currentStatus } : promo
        ));
      } else {
        setError(response.data.message || 'Не удалось изменить статус промокода');
      }
    } catch (err) {
      console.error('Ошибка при изменении статуса промокода:', err);
      setError(err.response?.data?.message || 'Ошибка при изменении статуса промокода');
    }
  };

  // Функция сортировки
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Форматирование типа промокода для отображения
  const formatPromoType = (type) => {
    const types = {
      'PERCENTAGE': 'Скидка %',
      'FIXED': 'Фиксированная скидка',
      'FREE_DELIVERY': 'Бесплатная доставка',
      'BUY_ONE_GET_ONE': '2 по цене 1',
      'FREE_ITEM': 'Товар в подарок',
      'CASHBACK': 'Кэшбэк'
    };
    return types[type] || type;
  };

  // Фильтрация по поиску и активности
  const filteredPromos = promos.filter(promo => {
    // Фильтр по поиску
    const searchMatch = promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по активности
    let activeMatch = true;
    const now = new Date();
    
    if (filterActive === 'active') {
      activeMatch = promo.isActive && promo.isValid && 
        new Date(promo.validUntil) > now &&
        (promo.usageLimit === null || promo.usageCount < promo.usageLimit);
    } else if (filterActive === 'expired') {
      activeMatch = !promo.isActive || !promo.isValid || 
        new Date(promo.validUntil) <= now ||
        (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit);
    }
    
    return searchMatch && activeMatch;
  });

  // Сортировка
  const sortedPromos = [...filteredPromos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromos = sortedPromos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPromos.length / itemsPerPage);

  // Функция для создания массива номеров страниц для пагинации
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="promo-management">
      <div className="promo-header">
        <h2>Управление промокодами</h2>
        <Link to="/admin/promos/new" className="new-promo-btn">
          Создать промокод
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Поиск по коду или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <button 
            className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            Все
          </button>
          <button 
            className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            Активные
          </button>
          <button 
            className={`filter-btn ${filterActive === 'expired' ? 'active' : ''}`}
            onClick={() => setFilterActive('expired')}
          >
            Истекшие
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-animation"></div>
          <p>Загрузка промокодов...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredPromos.length === 0 ? (
        <div className="no-promos">Промокоды не найдены</div>
      ) : (
        <>
          <div className="promos-table-container">
            <table className="promos-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('code')}>
                    Код
                    {sortConfig.key === 'code' && (
                      <span className={`sort-indicator ${sortConfig.direction}`}></span>
                    )}
                  </th>
                  <th onClick={() => requestSort('description')}>
                    Описание
                    {sortConfig.key === 'description' && (
                      <span className={`sort-indicator ${sortConfig.direction}`}></span>
                    )}
                  </th>
                  <th onClick={() => requestSort('type')}>
                    Тип
                    {sortConfig.key === 'type' && (
                      <span className={`sort-indicator ${sortConfig.direction}`}></span>
                    )}
                  </th>
                  <th onClick={() => requestSort('validUntil')}>
                    Действует до
                    {sortConfig.key === 'validUntil' && (
                      <span className={`sort-indicator ${sortConfig.direction}`}></span>
                    )}
                  </th>
                  <th onClick={() => requestSort('usageCount')}>
                    Использований
                    {sortConfig.key === 'usageCount' && (
                      <span className={`sort-indicator ${sortConfig.direction}`}></span>
                    )}
                  </th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {currentPromos.map(promo => (
                  <tr key={promo._id} className={!promo.isValid ? 'expired-promo' : ''}>
                    <td className="promo-code">{promo.code}</td>
                    <td>{promo.description}</td>
                    <td>{formatPromoType(promo.type)}</td>
                    <td>{formatDate(promo.validUntil)}</td>
                    <td>
                      {promo.usageCount}
                      {promo.usageLimit && <span> / {promo.usageLimit}</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${promo.isValid ? 'active' : 'expired'}`}>
                        {promo.isValid ? 'Активен' : 'Истек'}
                      </span>
                    </td>
                    <td className="actions">
                      <Link to={`/admin/promos/edit/${promo._id}`} className="edit-btn">
                        Изменить
                      </Link>
                      <button
                        className={`toggle-btn ${promo.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(promo._id, promo.isActive)}
                      >
                        {promo.isActive ? 'Отключить' : 'Включить'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(promo._id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                &laquo;
              </button>
              
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromoManagement; 