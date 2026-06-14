const statusColors = {
  active: '#22c55e',
  low_stock: '#eab308',
  issue: '#ef4444',
  offline: '#94a3b8'
};

export function getStatusColor(status) {
  return statusColors[status] || statusColors.offline;
}

export function getStatusLabel(status) {
  const labels = {
    active: 'Active Selling',
    low_stock: 'Low Stock',
    issue: 'Cooling/Issue',
    offline: 'Offline'
  };
  return labels[status] || status;
}

export function getZoneColor(zone) {
  const colors = { hot: '#ef4444', normal: '#f59e0b', cold: '#3b82f6' };
  return colors[zone] || colors.normal;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}
