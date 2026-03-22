# EstimDVF — Estimation Immobilière

Site d'estimation immobilière basé sur les données officielles DVF (Demandes de Valeurs Foncières).

## Fonctionnalités

- **Estimation de valeur** : Calcul automatique basé sur les transactions immobilières comparables
- **Recherche d'adresse** : Autocomplétion via l'API Adresse (api-adresse.data.gouv.fr)
- **Carte interactive** : Visualisation des transactions récentes avec code couleur par prix au m²
- **Statistiques locales** : Prix médian, moyen, fourchette de marché
- **Liste des transactions** : Détail des ventes récentes dans le secteur

## Architecture

```
├── server/          # API Node.js/Express
│   └── src/
│       ├── routes/  # Routes API (dvf, geocode)
│       └── services/# Logique métier (calcul statistiques, estimation)
│
└── client/          # Application React/Vite
    └── src/
        ├── components/ # Composants React
        ├── hooks/      # Hooks personnalisés
        └── utils/      # Utilitaires (formatage)
```

## APIs utilisées

- **DVF Etalab** : `https://api.dvf.etalab.gouv.fr` — Données de transactions immobilières
- **API Adresse** : `https://api-adresse.data.gouv.fr` — Géocodage d'adresses françaises

## Installation

```bash
# Installer toutes les dépendances
npm run install:all

# Démarrer en développement (serveur + client)
npm run dev
```

Le serveur démarre sur le port `3001` et le client sur le port `5173`.

## Variables d'environnement

```
PORT=3001          # Port du serveur (optionnel)
CLIENT_URL=http://localhost:5173  # URL du client pour CORS (optionnel)
```

## Source des données

Données issues des [Demandes de Valeurs Foncières (DVF)](https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/) — Direction générale des finances publiques (DGFIP).

Les estimations sont fournies à titre indicatif et ne constituent pas une expertise immobilière professionnelle.
