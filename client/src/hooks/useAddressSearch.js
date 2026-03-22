import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export function useAddressSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  const search = useCallback((value) => {
    setQuery(value);
    setSelected(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('/api/geocode/search', { params: { q: value, limit: 6 } });
        setSuggestions(res.data.features || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const selectAddress = useCallback((feature) => {
    setSelected(feature);
    setQuery(feature.properties.label);
    setSuggestions([]);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setSelected(null);
  }, []);

  return { query, suggestions, isLoading, selected, search, selectAddress, clear };
}
