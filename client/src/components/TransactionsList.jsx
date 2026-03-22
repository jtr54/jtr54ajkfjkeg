import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatPrice, formatDate, formatSurface, formatPricePerM2, typeLocalLabel } from '../utils/format';

function TypeBadge({ type }) {
  const colors = {
    Appartement: 'bg-blue-100 text-blue-800',
    Maison: 'bg-green-100 text-green-800',
    "Local d'activité": 'bg-purple-100 text-purple-800',
    Dépendance: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`badge text-xs ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {typeLocalLabel(type)}
    </span>
  );
}

export default function TransactionsList({ address, typeLocal }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    setPage(1);
    setTransactions([]);
    loadTransactions(1);
  }, [address, typeLocal]);

  async function loadTransactions(pageNum) {
    if (!address) return;
    const [lon, lat] = address.geometry.coordinates;
    setLoading(true);

    try {
      const dateMin = new Date();
      dateMin.setFullYear(dateMin.getFullYear() - 2);
      const params = {
        lat,
        lon,
        radius: 2000,
        date_min: dateMin.toISOString().split('T')[0],
        page: pageNum,
      };
      if (typeLocal) params.type_local = typeLocal;

      const res = await axios.get('/api/dvf/transactions', { params });
      const data = res.data;

      if (pageNum === 1) {
        setTransactions(data.results || []);
      } else {
        setTransactions(prev => [...prev, ...(data.results || [])]);
      }
      setCount(data.count || 0);
      setHasMore(!!data.next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTransactions(nextPage);
  }

  if (!address) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Transactions détaillées</h3>
        {count > 0 && (
          <span className="text-sm text-gray-500">{count} au total</span>
        )}
      </div>

      {loading && transactions.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {transactions.length === 0 && !loading && (
        <p className="text-gray-500 text-sm text-center py-6">
          Aucune transaction trouvée dans ce secteur pour les 2 dernières années.
        </p>
      )}

      <div className="space-y-3">
        {transactions.map((t, i) => {
          const surface = parseFloat(t.surface_reelle_bati || t.surface_terrain);
          const valeur = parseFloat(t.valeur_fonciere);
          const pricePerM2 = surface > 0 && valeur > 0 ? Math.round(valeur / surface) : null;

          return (
            <div
              key={t.id || i}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <TypeBadge type={t.type_local} />
                  <span className="text-xs text-gray-500">{formatDate(t.date_mutation)}</span>
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {t.adresse_numero} {t.adresse_nom_voie}, {t.code_postal} {t.nom_commune}
                </div>
                {surface > 0 && (
                  <div className="text-xs text-gray-500">
                    Surface: {formatSurface(surface)}
                    {pricePerM2 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        · {formatPricePerM2(pricePerM2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="font-bold text-gray-900">{formatPrice(valeur)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full mt-4 py-2.5 text-sm text-blue-600 font-medium border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Voir plus de transactions'}
        </button>
      )}
    </div>
  );
}
