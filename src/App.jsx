import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Добавлен Link
import Main from './components/Main';
import Catalog from './components/Catalog';
import ProductPage from './components/ProductPage';
import Cart from './components/Cart';
import Favorites from './components/Favorites';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import UserMenuButton from './components/UserMenuButton';
import CartButton from './components/CartButton';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import ViewCode from './components/Auth/ViewCode'; // Импортируем новый компонент для просмотра кода
import ChatBot from './components/ChatBot/ChatBot'; // Импортируем компонент чат-бота
import AboutUs from './components/about/AboutUs';

// Импортируем компоненты для админ-панели
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
// Импортируем новые компоненты управления продуктами
import AdminProductList from './components/Admin/AdminProductList';
import AdminProductEdit from './components/Admin/AdminProductEdit';
import AdminProductNew from './components/Admin/AdminProductNew';
// Импортируем компоненты управления промокодами
import PromoManagement from './components/Admin/PromoManagement';
import PromoForm from './components/Admin/PromoForm';

import './App.css';

const navItems = [
    { id: 'home', label: 'Главная', path: '/' },
    { id: 'catalog', label: 'Каталог', path: '/catalog' },
    { id: 'about', label: 'О нас', path: '/about' },
];

// Отдельный компонент для хедера, чтобы использовать хук useCart
function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Make the threshold higher for a more subtle effect that happens after scrolling a bit more
      const isScrolled = window.scrollY > 80;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
        
        // Apply the class to the App container too
        const appElement = document.querySelector('.App');
        if (appElement) {
          if (isScrolled) {
            appElement.classList.add('scrolled');
          } else {
            appElement.classList.remove('scrolled');
          }
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-left">
        <div className="logo-container">
          <img src="/images/logo.png" alt="Логотип магазина" className="logo" />
          <h1>THE ENERGY LAB</h1>
        </div>
      </div>
      <div className="header-right">
        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.id} to={item.path} className="button" data-text={item.label}>
              <span className="actual-text">&nbsp;{item.label}&nbsp;</span>
              <span aria-hidden="true" className="hover-text">&nbsp;{item.label}&nbsp;</span>
            </Link>
          ))}
          <div className="icons-container">
            <div className="icon-link">
              <CartButton />
            </div>
            <div className="icon-link">
              <UserMenuButton />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
    <CartProvider>
      <FavoritesProvider>
        <Router>
          <div className="App">
            <Header />

            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/view-code" element={<ViewCode />} />
              
              {/* Маршруты для админ-панели */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                {/* Маршруты для управления продуктами */}
                <Route path="products" element={<AdminProductList />} />
                <Route path="products/new" element={<AdminProductNew />} />
                <Route path="products/edit/:id" element={<AdminProductEdit />} />
                {/* Маршруты для управления промокодами */}
                <Route path="promos" element={<PromoManagement />} />
                <Route path="promos/new" element={<PromoForm />} />
                <Route path="promos/edit/:id" element={<PromoForm />} />
              </Route>
            </Routes>
            
            {/* Добавляем компонент чат-бота */}
            <ChatBot />
          </div>
        </Router>
      </FavoritesProvider>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;