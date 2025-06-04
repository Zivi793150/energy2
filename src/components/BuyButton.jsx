import React from 'react';
import styled from 'styled-components';

const BuyButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick}>
        Купить
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  
  button {
    --blue: rgb(27, 238, 253);
    font-size: 15px;
    padding: 0.7em 2.7em;
    letter-spacing: 0.06em;
    position: relative;
    font-family: inherit;
    border-radius: 0.6em;
    overflow: hidden;
    transition: all 0.3s;
    line-height: 1.4em;
    border: 2px solid var(--blue);
    background: linear-gradient(to right, rgba(27, 227, 253, 0.1) 1%, transparent 40%,transparent 60% , rgba(27, 227, 253, 0.1) 100%);
    color: var(--blue);
    box-shadow: inset 0 0 10px rgba(27, 227, 253, 0.4), 0 0 9px 3px rgba(27, 253, 242, 0.1);
    cursor: pointer;
    font-weight: bold;
    min-width: 150px;
  }

  button:hover {
    color: rgb(130, 247, 255);
    box-shadow: inset 0 0 10px rgba(27, 253, 253, 0.6), 0 0 9px 3px rgba(27, 219, 253, 0.2);
    transform: translateY(-3px);
  }

  button:before {
    content: "";
    position: absolute;
    left: -4em;
    width: 4em;
    height: 100%;
    top: 0;
    transition: transform .4s ease-in-out;
    background: linear-gradient(to right, transparent 1%, rgba(27, 200, 253, 0.1) 40%,rgba(27, 227, 253, 0.1) 60% , transparent 100%);
  }

  button:hover:before {
    transform: translateX(15em);
  }
`;

export default BuyButton; 