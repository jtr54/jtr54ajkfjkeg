import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import axios from 'axios';
import { formatPrice, formatDate, formatSurface, formatPricePerM2 } from '../utils/format';
import L from 'leaflet';

// Fix pour les icônes Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function priceColor(pricePerM2) {
  if (!pricePerM2) return '#94a3b8';
  if (pricePerM2 < 2000) return '#22c55e';
  if (pricePerM2 < 4000) return '#84cc16';
  if (pricePerM2 < 6000) return '#eab308';
  if (pricePerM2 < 9000) return '#f97316';
  return '#ef4444';
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function TransactionsMap({ address, typeLocal }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const center = address
    ? [address.geometry.coordinates[1], address.geometry.coordinates[0]]
    : [48.8566, 2.3522];

  useEffect(() => {
    if (!address) return;

    const [lon, lat] = address.geometry.coordinates;

    async function fetchTransactions() {
      setLoading(true);
      setError('');
      try {
        const dateMin = new Date();
        dateMin.setFullYear(dateMin.getFullYear() - 2);
        const params = {
          lat,
          lon,
          radius: 2000,
          date_min: dateMin.toISOString().split('T')[0],
        };
        if (typeLocal) params.type_local = typeLocal;

        const res = await axios.get('/api/dvf/transactions', { params });
        setTransactions(res.data.results || []);
      } catch (e) {
        setError('Impossible de charger les transactions');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [address, typeLocal]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Transactions récentes (2 ans)</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {!loading && (
            <span className="text-sm text-gray-500">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { label: '< 2k €/m²', color: '#22c55e' },
          { label: '2–4k', color: '#84cc16' },
          { label: '4–6k', color: '#eab308' },
          { label: '6–9k', color: '#f97316' },
          { label: '> 9k', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="map-container">
        <MapContainer center={center} zoom={14} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} />

          {/* Marqueur adresse recherchée */}
          {address && <Marker position={center} />}

          {/* Transactions */}
          {transactions.map((t, i) => {
            if (!t.latitude || !t.longitude) return null;
            const surface = parseFloat(t.surface_reelle_bati || t.surface_terrain);
            const valeur = parseFloat(t.valeur_fonciere);
            const pricePerM2 = surface > 0 && valeur > 0 ? valeur / surface : null;

            return (
              <CircleMarker
                key={t.id || i}
                center={[parseFloat(t.latitude), parseFloat(t.longitude)]}
                radius={7}
                fillColor={priceColor(pricePerM2)}
                fillOpacity={0.8}
                color="white"
                weight={1.5}
              >
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <div className="font-semibold text-gray-900 mb-2">
                      {t.type_local || 'Bien immobilier'}
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Prix :</span>
                        <span className="font-medium text-gray-900">{formatPrice(valeur)}</span>
                      </div>
                      {surface > 0 && (
                        <div className="flex justify-between">
                          <span>Surface :</span>
                          <span className="font-medium">{formatSurface(surface)}</span>
                        </div>
                      )}
                      {pricePerM2 && (
                        <div className="flex justify-between">
                          <span>Prix/m² :</span>
                          <span className="font-medium text-blue-600">{formatPricePerM2(Math.round(pricePerM2))}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Date :</span>
                        <span className="font-medium">{formatDate(t.date_mutation)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">
        Source : Demandes de Valeurs Foncières (DVF) – données.gouv.fr
      </p>
    </div>
  );
}
