import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth(); // Используем контекст авторизации вместо прямого доступа к localStorage
  
  // Проверяем, имеет ли пользователь права администратора
  if (!isAuthenticated || !user || user.role !== 'admin') {
    console.log('Нет доступа к админ-панели:', {
      isAuthenticated,
      user,
      role: user?.role
    });
    return <Navigate to="/login" replace />;
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Админ-панель</h2>
          <p className="admin-email">{user.email}</p>
        </div>
        
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            className={`admin-nav-item ${isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line"></i>
            Статистика
          </Link>
          
          <Link 
            to="/admin/products" 
            className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <i className="fas fa-box"></i>
            Управление продуктами
          </Link>
          
          <Link 
            to="/admin/users" 
            className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <i className="fas fa-users"></i>
            Управление пользователями
          </Link>
          
          <Link 
            to="/admin/promos" 
            className={`admin-nav-item ${isActive('/admin/promos') ? 'active' : ''}`}
          >
            <i className="fas fa-gift"></i>
            Управление промокодами
          </Link>
          
          <Link 
            to="/" 
            className="admin-nav-item"
          >
            <i className="fas fa-home"></i>
            Вернуться на сайт
          </Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 