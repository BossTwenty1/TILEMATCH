export const formatPHP = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

export const generateGCashRef = () =>
  Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getStockBadge = (stockQty, threshold = 10) => {
  if (stockQty === 0) return { label: 'Out of Stock', className: 'badge-error' };
  if (stockQty < threshold) return { label: 'Low Stock', className: 'badge-warning' };
  return { label: 'In Stock', className: 'badge-success' };
};

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export const getStatusIndex = (status) => ORDER_STATUSES.indexOf(status);
