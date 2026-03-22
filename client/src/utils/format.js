export function formatPrice(value) {
  if (!value && value !== 0) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPricePerM2(value) {
  if (!value && value !== 0) return '-';
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} €/m²`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatSurface(value) {
  if (!value && value !== 0) return '-';
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} m²`;
}

export function fiabiliteLabel(fiabilite) {
  const labels = {
    bonne: { label: 'Bonne fiabilité', class: 'badge-green' },
    moyenne: { label: 'Fiabilité moyenne', class: 'badge-yellow' },
    faible: { label: 'Faible fiabilité', class: 'badge-red' },
  };
  return labels[fiabilite] || { label: fiabilite, class: 'badge-yellow' };
}

export function typeLocalLabel(type) {
  const labels = {
    Appartement: 'Appartement',
    Maison: 'Maison',
    'Dépendance': 'Dépendance',
    "Local d'activité": "Local d'activité",
  };
  return labels[type] || type;
}
