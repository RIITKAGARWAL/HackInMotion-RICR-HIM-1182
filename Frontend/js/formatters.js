// Utility helpers for formatting currency and analytics data

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

export function getHealthBadgeClass(score) {
  if (score >= 80) return 'badge-success';
  if (score >= 50) return 'badge-warning';
  return 'badge-danger';
}