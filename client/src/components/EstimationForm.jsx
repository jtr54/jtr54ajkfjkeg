import React, { useState } from 'react';
import axios from 'axios';
import AddressSearch from './AddressSearch';

const PROPERTY_TYPES = [
  { value: 'Appartement', label: 'Appartement', icon: '🏢' },
  { value: 'Maison', label: 'Maison', icon: '🏠' },
  { value: "Local d'activité", label: "Local d'activité", icon: '🏭' },
];

export default function EstimationForm({ onResult, onAddressSelect }) {
  const [address, setAddress] = useState(null);
  const [typeLocal, setTypeLocal] = useState('Appartement');
  const [surface, setSurface] = useState('');
  const [radius, setRadius] = useState('2000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleAddressSelect(feature) {
    setAddress(feature);
    if (onAddressSelect) onAddressSelect(feature);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!address) {
      setError('Veuillez sélectionner une adresse dans la liste.');
      return;
    }
    if (!surface || parseFloat(surface) <= 0) {
      setError('Veuillez saisir une surface valide.');
      return;
    }

    const [lon, lat] = address.geometry.coordinates;
    setLoading(true);

    try {
      const res = await axios.post('/api/dvf/estimate', {
        lat,
        lon,
        surface: parseFloat(surface),
        type_local: typeLocal,
        radius: parseInt(radius),
      });
      onResult({ ...res.data, address, typeLocal, surface: parseFloat(surface) });
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Adresse */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse du bien
        </label>
        <AddressSearch
          onSelect={handleAddressSelect}
          placeholder="Ex: 12 rue de la Paix, Paris"
        />
        {address && (
          <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {address.properties.label}
          </p>
        )}
      </div>

      {/* Type de bien */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Type de bien
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setTypeLocal(type.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                typeLocal === type.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xl mb-1">{type.icon}</div>
              <div>{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Surface */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Surface habitable (m²)
        </label>
        <div className="relative">
          <input
            type="number"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            placeholder="Ex: 65"
            min="1"
            max="10000"
            step="1"
            className="input-field pr-14"
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-gray-400 font-medium text-sm">
            m²
          </span>
        </div>
      </div>

      {/* Rayon de recherche */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rayon de recherche:{' '}
          <span className="text-blue-600">
            {parseInt(radius) >= 1000 ? `${parseInt(radius) / 1000} km` : `${radius} m`}
          </span>
        </label>
        <input
          type="range"
          min="500"
          max="5000"
          step="500"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>500 m</span>
          <span>5 km</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Calcul en cours...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Estimer la valeur
          </>
        )}
      </button>
    </form>
  );
}
