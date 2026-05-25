let schemaReady;

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const ensurePromotionSchema = async (db) => {
  if (!schemaReady) {
    schemaReady = db.execute(`
      CREATE TABLE IF NOT EXISTS product_promotions (
        product_id INT NOT NULL PRIMARY KEY,
        promo_type ENUM('none', 'volume', 'freebie') NOT NULL DEFAULT 'none',
        min_quantity INT NULL,
        discount_percent DECIMAL(5,2) NULL,
        freebie_product_id INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_promo_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_promo_freebie FOREIGN KEY (freebie_product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `).catch((err) => {
      schemaReady = undefined;
      throw err;
    });
  }
  await schemaReady;
};

const promotionSelect = `
  COALESCE(pp.promo_type, 'none') AS promo_type,
  pp.min_quantity AS promo_min_quantity,
  pp.discount_percent AS promo_discount_percent,
  pp.freebie_product_id,
  fp.name AS freebie_name,
  fp.category AS freebie_category,
  fp.image_url AS freebie_image_url,
  fp.price AS freebie_price,
  COALESCE(fi.stock_qty, 0) AS freebie_stock_qty
`;

const promotionJoins = `
  LEFT JOIN product_promotions pp ON p.id = pp.product_id
  LEFT JOIN products fp ON pp.freebie_product_id = fp.id
  LEFT JOIN inventory fi ON fp.id = fi.product_id
`;

const sanitizePromotion = (body = {}) => {
  const promoType = body.promoType || body.promo_type || 'none';

  if (!['none', 'volume', 'freebie'].includes(promoType)) {
    return { error: 'Invalid promotion type.' };
  }

  if (promoType === 'volume') {
    const minQuantity = Number(body.promoMinQuantity || body.promo_min_quantity);
    const discountPercent = Number(body.promoDiscountPercent || body.promo_discount_percent);

    if (!Number.isInteger(minQuantity) || minQuantity < 1) {
      return { error: 'Volume discount minimum quantity must be at least 1.' };
    }
    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent >= 100) {
      return { error: 'Volume discount percentage must be between 1 and 99.' };
    }

    return {
      promoType,
      minQuantity,
      discountPercent,
      freebieProductId: null
    };
  }

  if (promoType === 'freebie') {
    const freebieProductId = Number(body.promoFreebieProductId || body.freebie_product_id);
    if (!Number.isInteger(freebieProductId) || freebieProductId < 1) {
      return { error: 'Select a low-stock freebie product.' };
    }

    return {
      promoType,
      minQuantity: null,
      discountPercent: null,
      freebieProductId
    };
  }

  return {
    promoType: 'none',
    minQuantity: null,
    discountPercent: null,
    freebieProductId: null
  };
};

const savePromotion = async (db, productId, promotion) => {
  await ensurePromotionSchema(db);

  await db.execute(
    `INSERT INTO product_promotions (product_id, promo_type, min_quantity, discount_percent, freebie_product_id)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       promo_type = VALUES(promo_type),
       min_quantity = VALUES(min_quantity),
       discount_percent = VALUES(discount_percent),
       freebie_product_id = VALUES(freebie_product_id)`,
    [productId, promotion.promoType, promotion.minQuantity, promotion.discountPercent, promotion.freebieProductId]
  );
};

const buildCartPricing = (items) => {
  const displayItems = [];
  let subtotal = 0;
  let discountedSubtotal = 0;
  let savings = 0;
  let itemCount = 0;

  for (const rawItem of items) {
    const item = {
      ...rawItem,
      quantity: Number(rawItem.quantity),
      price: Number(rawItem.price)
    };
    const originalLineTotal = roundMoney(item.price * item.quantity);
    let effectivePrice = item.price;
    let lineTotal = originalLineTotal;
    let promoSavings = 0;
    let promoApplied = false;
    let promoMessage = '';
    let promoRemainingQty = 0;

    if (item.promo_type === 'volume' && item.promo_min_quantity && item.promo_discount_percent) {
      const minQuantity = Number(item.promo_min_quantity);
      const discountPercent = Number(item.promo_discount_percent);

      if (item.quantity >= minQuantity) {
        effectivePrice = roundMoney(item.price * (1 - discountPercent / 100));
        lineTotal = roundMoney(effectivePrice * item.quantity);
        promoSavings = roundMoney(originalLineTotal - lineTotal);
        promoApplied = true;
        promoMessage = `${discountPercent}% bulk savings applied`;
      } else {
        promoRemainingQty = minQuantity - item.quantity;
        promoMessage = `Add ${promoRemainingQty} more piece${promoRemainingQty === 1 ? '' : 's'} to save ${discountPercent}%`;
      }
    }

    const pricedItem = {
      ...item,
      effective_price: effectivePrice,
      original_line_total: originalLineTotal,
      line_total: lineTotal,
      promo_savings: promoSavings,
      promo_applied: promoApplied,
      promo_message: promoMessage,
      promo_remaining_qty: promoRemainingQty,
      is_freebie: false,
      locked: false
    };

    displayItems.push(pricedItem);
    subtotal += originalLineTotal;
    discountedSubtotal += lineTotal;
    savings += promoSavings;
    itemCount += item.quantity;

    if (item.promo_type === 'freebie' && item.freebie_product_id && Number(item.freebie_stock_qty) > 0) {
      const freebiePrice = Number(item.freebie_price || 0);
      displayItems.push({
        id: `freebie-${item.product_id}-${item.freebie_product_id}`,
        product_id: Number(item.freebie_product_id),
        parent_product_id: item.product_id,
        parent_product_name: item.name,
        quantity: 1,
        name: item.freebie_name,
        price: freebiePrice,
        effective_price: 0,
        image_url: item.freebie_image_url,
        category: item.freebie_category || item.category,
        stock_qty: Number(item.freebie_stock_qty),
        original_line_total: roundMoney(freebiePrice),
        line_total: 0,
        promo_savings: 0,
        promo_applied: true,
        promo_message: `Free bonus with ${item.name}`,
        is_freebie: true,
        locked: true
      });
    }
  }

  subtotal = roundMoney(subtotal);
  discountedSubtotal = roundMoney(discountedSubtotal);
  const shippingFee = discountedSubtotal >= 2000 ? 0 : 200;
  const tax = 0;
  const total = roundMoney(discountedSubtotal + shippingFee);

  return {
    items: displayItems,
    itemCount,
    subtotal,
    discountedSubtotal,
    shippingFee,
    tax,
    total,
    savings: roundMoney(savings)
  };
};

module.exports = {
  buildCartPricing,
  ensurePromotionSchema,
  promotionJoins,
  promotionSelect,
  roundMoney,
  sanitizePromotion,
  savePromotion
};
