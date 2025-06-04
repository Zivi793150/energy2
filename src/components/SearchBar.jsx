import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onFilterClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input 
          type="text" 
          name="text" 
          placeholder="Поиск товаров..." 
          className="input" 
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button className="filter-icon-button" onClick={onFilterClick} title="Фильтры">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#37FFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <rect x="1" y="10" width="6" height="4" rx="2"></rect>
            <rect x="9" y="6" width="6" height="4" rx="2"></rect>
            <rect x="17" y="14" width="6" height="4" rx="2"></rect>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SearchBar; 