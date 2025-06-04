import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartButton = () => {
  const { cartCount } = useCart();
  
  return (
    <StyledWrapper>
      <Link to="/cart" className="cart-link">
        <div tabIndex={0} className="cart-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" height={20} width={20}>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
      </Link>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cart-link {
    text-decoration: none;
  }

  .cart-button {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    background: #2ff3fa;
    width: 2.5em;
    height: 2.5em;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.1s ease-in-out;
    outline: 0.125em solid transparent;
    outline-offset: 0;
    box-shadow: 0 0 15px rgba(47, 243, 250, 0.1);
  }

  .cart-button:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(47, 243, 250, 0.5);
  }

  .cart-button:active {
    transform: scale(0.95);
  }

  .cart-button:focus:not(:hover) {
    outline-color: #2ff3fa;
    outline-offset: 0.125em;
  }

  .cart-count {
    position: absolute;
    top: -6px;
    right: -6px;
    background-color: #333;
    color: white;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-family: "WidockTrial", sans-serif;
    box-shadow: 0 0 5px rgba(47, 243, 250, 0.3);
  }
`;

export default CartButton; 