import React from 'react';
import { formatPrice, formatPricePerM2, formatSurface, fiabiliteLabel, typeLocalLabel } from '../utils/format';

function StatItem({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
      <div className={`text-xl font-bold mb-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-xs font-medium ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
        {label}
      </div>
    </div>
  );
}

export default function EstimationResult({ result }) {
  const { estimation, stats, nb_transactions_zone, periode, address, typeLocal, surface } = result;

  if (!estimation) {
    return (
      <div className="card fade-in">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-gray-900 mb-2">Données insuffisantes</h3>
          <p className="text-gray-500 text-sm">
            Pas assez de transactions disponibles dans ce secteur pour établir une estimation fiable.
            Essayez d'élargir le rayon de recherche.
          </p>
        </div>
      </div>
    );
  }

  const fiabilite = fiabiliteLabel(estimation.fiabilite);
  const pct = estimation.valeur_estimee
    ? Math.round(((estimation.valeur_estimee - estimation.valeur_min) / estimation.valeur_estimee) * 100)
    : 15;

  return (
    <div className="space-y-4 fade-in">
      {/* Résultat principal */}
      <div className="card bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
        <div className="text-center">
          <p className="text-blue-200 text-sm font-medium mb-1">Valeur estimée</p>
          <div className="text-4xl font-bold mb-1">
            {formatPrice(estimation.valeur_estimee)}
          </div>
          <p className="text-blue-200 text-sm">
            Fourchette: {formatPrice(estimation.valeur_min)} – {formatPrice(estimation.valeur_max)}
          </p>

          {/* Barre de fourchette */}
          <div className="mt-4 bg-blue-500 rounded-full h-2 relative">
            <div
              className="absolute inset-y-0 bg-white rounded-full opacity-50"
              style={{ left: '15%', right: '15%' }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"
              style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>
        </div>
      </div>

      {/* Infos du bien */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Caractéristiques du bien</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Type" value={typeLocalLabel(typeLocal)} />
          <StatItem label="Surface" value={formatSurface(surface)} />
          <StatItem label="Prix au m²" value={formatPricePerM2(estimation.prix_m2_utilise)} highlight />
          <StatItem label="Transactions" value={`${estimation.nb_transactions} ventes`} />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Fiabilité de l'estimation</span>
          <span className={fiabilite.class}>{fiabilite.label}</span>
        </div>
      </div>

      {/* Statistiques du marché */}
      {stats && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">
            Marché local — {nb_transactions_zone} transactions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Prix médian</span>
              <span className="font-semibold text-gray-900">{formatPrice(stats.prix_median)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Prix moyen</span>
              <span className="font-semibold text-gray-900">{formatPrice(stats.prix_moyen)}</span>
            </div>
            {stats.prix_m2_median && (
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Prix médian / m²</span>
                <span className="font-semibold text-blue-600">{formatPricePerM2(stats.prix_m2_median)}</span>
              </div>
            )}
            {stats.prix_m2_moyen && (
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Prix moyen / m²</span>
                <span className="font-semibold text-gray-900">{formatPricePerM2(stats.prix_m2_moyen)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Fourchette de marché</span>
              <span className="font-semibold text-gray-900 text-sm">
                {formatPrice(stats.prix_min)} – {formatPrice(stats.prix_max)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Basé sur les transactions DVF de la période : {periode}
            </p>
          </div>
        </div>
      )}

      {/* Avertissement légal */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-700">
            Cette estimation est fournie à titre indicatif, basée sur les données DVF officielles.
            Elle ne constitue pas une expertise immobilière professionnelle.
            Pour une valeur exacte, consultez un agent immobilier ou un notaire.
          </p>
        </div>
      </div>
    </div>
  );
}
