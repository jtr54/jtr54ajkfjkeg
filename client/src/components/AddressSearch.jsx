import React, { useRef, useEffect } from 'react';
import { useAddressSearch } from '../hooks/useAddressSearch';

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function AddressSearch({ onSelect, placeholder = "Saisissez une adresse..." }) {
  const { query, suggestions, isLoading, selected, search, selectAddress } = useAddressSearch();
  const containerRef = useRef(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(suggestions.length > 0);
  }, [suggestions]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(feature) {
    selectAddress(feature);
    setOpen(false);
    if (onSelect) onSelect(feature);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input-field pl-12 pr-10"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((feature, i) => (
            <div
              key={feature.properties.id || i}
              className="autocomplete-item"
              onMouseDown={() => handleSelect(feature)}
            >
              <div className="flex items-start">
                <LocationIcon />
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {feature.properties.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {feature.properties.postcode} {feature.properties.city}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
