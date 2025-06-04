import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const UserMenuButton = () => {
  const { favoritesCount } = useFavorites();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Добавляем отладочный вывод
  console.log('UserMenuButton: текущий пользователь:', user);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <StyledWrapper>
      <label className="popup">
        <input type="checkbox" />
        <div tabIndex={0} className="burger">
          <svg viewBox="0 0 24 24" fill="white" height={20} width={20} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2c2.757 0 5 2.243 5 5.001 0 2.756-2.243 5-5 5s-5-2.244-5-5c0-2.758 2.243-5.001 5-5.001zm0-2c-3.866 0-7 3.134-7 7.001 0 3.865 3.134 7 7 7s7-3.135 7-7c0-3.867-3.134-7.001-7-7.001zm6.369 13.353c-.497.498-1.057.931-1.658 1.302 2.872 1.874 4.378 5.083 4.972 7.346h-19.387c.572-2.29 2.058-5.503 4.973-7.358-.603-.374-1.162-.811-1.658-1.312-4.258 3.072-5.611 8.506-5.611 10.669h24c0-2.142-1.44-7.557-5.631-10.647z" />
          </svg>
        </div>
        <nav className="popup-window">
          <legend>Личный кабинет</legend>
          <ul>
            <li>
              <Link to="/favorites" className="menu-link">
                <button>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
                  </svg>
                  <span>Любимые</span>
                  {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
                </button>
              </Link>
            </li>
            {user ? (
              <>
                {console.log('Проверка роли админа:', user.role === 'admin', user)}
                {user.role === 'admin' && (
                  <li>
                    <Link to="/admin" className="menu-link">
                      <button>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 18.305c-.261-.586-.789-.991-1.871-1.241-2.293-.529-4.428-.993-3.393-2.945 3.145-5.942.833-9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 9.119 1.066 1.964-1.148 2.427-3.393 2.945-1.084.25-1.608.658-1.867 1.246-1.405-1.723-2.251-3.919-2.251-6.31 0-5.514 4.486-10 10-10s10 4.486 10 10c0 2.389-.845 4.583-2.247 6.305z" />
                        </svg>
                        <span>Админ-панель</span>
                      </button>
                    </Link>
                  </li>
                )}
            <li>
                  <button onClick={handleLogout}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.598 9h-1.055c1.482-4.638 5.83-8 10.957-8 6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5c-5.127 0-9.475-3.362-10.957-8h1.055c1.443 4.076 5.334 7 9.902 7 5.795 0 10.5-4.705 10.5-10.5s-4.705-10.5-10.5-10.5c-4.568 0-8.459 2.923-9.902 7zm12.228 3l-4.604-3.747.666-.753 6.112 5-6.101 5-.679-.737 4.608-3.763h-14.828v-1h14.826z" />
                    </svg>
                    <span>Выйти</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button onClick={handleLogin}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4v6.406l-3.753 3.741-6.463-6.462 3.7-3.685h6.516zm2-2h-12.388l1.497 1.5-4.171 4.167 9.291 9.291 4.161-4.193 1.61 1.623v-12.388zm-5 4c.552 0 1 .449 1 1s-.448 1-1 1-1-.449-1-1 .448-1 1-1zm0-1c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm6.708.292l-.708.708v3.097l2-2.065-1.292-1.74zm-12.675 9.294l-1.414 1.414h-2.619v2h-2v2h-2v-2.17l5.636-5.626-1.417-1.407-6.219 6.203v5h6v-2h2v-2h2l1.729-1.729-1.696-1.685z" />
                </svg>
                <span>Войти</span>
              </button>
            </li>
            <li>
                  <button onClick={handleRegister}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.598 9h-1.055c1.482-4.638 5.83-8 10.957-8 6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5c-5.127 0-9.475-3.362-10.957-8h1.055c1.443 4.076 5.334 7 9.902 7 5.795 0 10.5-4.705 10.5-10.5s-4.705-10.5-10.5-10.5c-4.568 0-8.459 2.923-9.902 7zm12.228 3l-4.604-3.747.666-.753 6.112 5-6.101 5-.679-.737 4.608-3.763h-14.828v-1h14.826z" />
                </svg>
                <span>Регистрация</span>
              </button>
            </li>
              </>
            )}
          </ul>
        </nav>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* The design is inspired from Galahhad*/

  .popup {
    --burger-line-width: 1.125em;
    --burger-line-height: 0.125em;
    --burger-offset: 0.625em;
    --burger-bg: #2ff3fa;
    --burger-color: #333;
    --burger-line-border-radius: 0.1875em;
    --burger-diameter: 2.5em;
    --burger-btn-border-radius: calc(var(--burger-diameter) / 2);
    --burger-line-transition: 0.3s;
    --burger-transition: all 0.1s ease-in-out;
    --burger-hover-scale: 1.1;
    --burger-active-scale: 0.95;
    --burger-enable-outline-color: var(--burger-bg);
    --burger-enable-outline-width: 0.125em;
    --burger-enable-outline-offset: var(--burger-enable-outline-width);
    /* nav */
    --nav-padding-x: 0.25em;
    --nav-padding-y: 0.625em;
    --nav-border-radius: 0.375em;
    --nav-border-color: #b6d0ee;
    --nav-border-width: 0.0625em;
    --nav-shadow-color: rgba(47, 243, 250, 0.3);
    --nav-shadow-width: 0 1px 5px;
    --nav-bg: #f8fbff;
    --nav-font-family: "WidockTrial", sans-serif;
    --nav-default-scale: 0.8;
    --nav-active-scale: 1;
    --nav-position-left: unset;
    --nav-position-right: 0;
    /* title */
    --nav-title-size: 0.875em;
    --nav-title-color: #333;
    --nav-title-padding-x: 1rem;
    --nav-title-padding-y: 0.25em;
    /* nav button */
    --nav-button-padding-x: 1rem;
    --nav-button-padding-y: 0.375em;
    --nav-button-border-radius: 0.375em;
    --nav-button-font-size: 16px;
    --nav-button-hover-bg: #2ff3fa;
    --nav-button-hover-text-color: #1a1a1a;
    --nav-button-distance: 0.875em;
    /* underline */
    --underline-border-width: 0.0625em;
    --underline-border-color: #b6d0ee;
    --underline-margin-y: 0.3125em;
  }

  /* popup settings 👆 */

  .popup {
    display: inline-block;
    text-rendering: optimizeLegibility;
    position: relative;
  }

  .popup input {
    display: none;
  }

  .burger {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    background: var(--burger-bg);
    width: var(--burger-diameter);
    height: var(--burger-diameter);
    border-radius: var(--burger-btn-border-radius);
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: var(--burger-transition);
    outline: var(--burger-enable-outline-width) solid transparent;
    outline-offset: 0;
    box-shadow: 0 0 15px rgba(47, 243, 250, 0.1);
  }

  .popup-window {
    transform: scale(var(--nav-default-scale));
    visibility: hidden;
    opacity: 0;
    position: absolute;
    padding: var(--nav-padding-y) var(--nav-padding-x);
    background: var(--nav-bg);
    font-family: var(--nav-font-family);
    color: var(--nav-text-color);
    border-radius: var(--nav-border-radius);
    box-shadow: var(--nav-shadow-width) var(--nav-shadow-color);
    border: var(--nav-border-width) solid var(--nav-border-color);
    top: calc(
      var(--burger-diameter) + var(--burger-enable-outline-width) +
        var(--burger-enable-outline-offset)
    );
    left: var(--nav-position-left);
    right: var(--nav-position-right);
    transition: var(--burger-transition);
    margin-top: 10px;
    z-index: 1000;
    min-width: 200px;
  }

  .popup-window legend {
    padding: var(--nav-title-padding-y) var(--nav-title-padding-x);
    margin: 0;
    color: var(--nav-title-color);
    font-size: var(--nav-title-size);
    font-weight: bold;
  }

  .popup-window ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .popup-window ul button {
    outline: none;
    width: 100%;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    color: var(--burger-color);
    font-size: var(--nav-button-font-size);
    padding: var(--nav-button-padding-y) var(--nav-button-padding-x);
    white-space: nowrap;
    border-radius: var(--nav-button-border-radius);
    cursor: pointer;
    column-gap: var(--nav-button-distance);
    transition: all 0.3s;
    position: relative;
  }

  .menu-link {
    text-decoration: none;
    color: inherit;
    display: block;
    width: 100%;
  }

  .popup-window ul li svg {
    color: #2ff3fa;
  }

  .popup-window hr {
    margin: var(--underline-margin-y) 0;
    border: none;
    border-bottom: var(--underline-border-width) solid
      var(--underline-border-color);
  }

  /* actions */

  .popup-window ul button:hover,
  .popup-window ul button:focus-visible,
  .popup-window ul button:hover svg,
  .popup-window ul button:focus-visible svg {
    color: var(--nav-button-hover-text-color);
    background: var(--nav-button-hover-bg);
  }

  .burger:hover {
    transform: scale(var(--burger-hover-scale));
    box-shadow: 0 0 15px rgba(47, 243, 250, 0.5);
  }

  .burger:active {
    transform: scale(var(--burger-active-scale));
  }

  .burger:focus:not(:hover) {
    outline-color: var(--burger-enable-outline-color);
    outline-offset: var(--burger-enable-outline-offset);
  }

  .popup input:checked + .burger span:nth-child(1) {
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  .popup input:checked + .burger span:nth-child(2) {
    bottom: 50%;
    transform: translateY(50%) rotate(-45deg);
  }

  .popup input:checked + .burger span:nth-child(3) {
    transform: translateX(
      calc(var(--burger-diameter) * -1 - var(--burger-line-width))
    );
  }

  .popup input:checked ~ nav {
    transform: scale(var(--nav-active-scale));
    visibility: visible;
    opacity: 1;
  }

  .favorites-count {
    position: absolute;
    right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #2ff3fa;
    color: #333;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    font-weight: bold;
  }
`;

export default UserMenuButton; 