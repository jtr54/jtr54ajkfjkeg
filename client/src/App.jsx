import React, { useState } from 'react';
import EstimationForm from './components/EstimationForm';
import EstimationResult from './components/EstimationResult';
import TransactionsMap from './components/TransactionsMap';
import TransactionsList from './components/TransactionsList';

function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-lg">EstimDVF</span>
            <span className="hidden sm:inline text-gray-400 text-sm ml-2">· Estimation Immobilière</span>
          </div>
        </div>
        <a
          href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Source : DVF
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Estimez votre bien immobilier
        </h1>
        <p className="text-blue-200 text-lg">
          Basé sur les données officielles des transactions immobilières en France
          (Demandes de Valeurs Foncières — DVF)
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-blue-200">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Données officielles
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Gratuit
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mis à jour régulièrement
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [address, setAddress] = useState(null);
  const [typeLocal, setTypeLocal] = useState('Appartement');

  function handleResult(data) {
    setResult(data);
    setAddress(data.address);
    setTypeLocal(data.typeLocal);
    // Scroll vers les résultats
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleAddressSelect(feature) {
    setAddress(feature);
    if (!result) return;
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Votre bien
              </h2>
              <EstimationForm
                onResult={handleResult}
                onAddressSelect={handleAddressSelect}
              />
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-2 space-y-6" id="results">
            {!result && !address && (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🏘️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Lancez une estimation
                </h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  Saisissez l'adresse de votre bien et ses caractéristiques pour obtenir
                  une estimation basée sur les transactions réelles du marché.
                </p>
              </div>
            )}

            {result && <EstimationResult result={result} />}

            {address && (
              <>
                <TransactionsMap address={address} typeLocal={typeLocal} />
                <TransactionsList address={address} typeLocal={typeLocal} />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            Données issues des{' '}
            <a
              href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Demandes de Valeurs Foncières (DVF)
            </a>{' '}
            — Direction générale des finances publiques (DGFIP)
          </p>
          <p className="text-xs text-gray-300 mt-2">
            Les estimations fournies sont indicatives et ne constituent pas une expertise immobilière.
          </p>
        </div>
      </footer>
    </div>
  );
}
