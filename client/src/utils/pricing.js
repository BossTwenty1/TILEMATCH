export const getPricedTotals = (items = []) => {
  const paidItems = items.filter((item) => !item.is_freebie);
  const subtotal = paidItems.reduce((sum, item) => (
    sum + Number(item.original_line_total ?? Number(item.price || 0) * Number(item.quantity || 0))
  ), 0);
  const discountedSubtotal = paidItems.reduce((sum, item) => (
    sum + Number(item.line_total ?? Number(item.price || 0) * Number(item.quantity || 0))
  ), 0);
  const savings = items.reduce((sum, item) => sum + Number(item.promo_savings || 0), 0);
  const shippingFee = discountedSubtotal >= 2000 ? 0 : 200;
  const total = discountedSubtotal + shippingFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountedSubtotal: Math.round(discountedSubtotal * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    shippingFee,
    total: Math.round(total * 100) / 100,
    itemCount: paidItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  };
};
