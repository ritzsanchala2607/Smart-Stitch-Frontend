// Invoice calculation utility functions

/**
 * Calculates subtotal from invoice items
 * @param {Array} items - Array of invoice items with quantity and price
 * @returns {number} - Subtotal amount
 */
export const calculateSubtotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price || item.unitPrice) || 0;
    return sum + (quantity * price);
  }, 0);
};

/**
 * Calculates tax amount based on subtotal and tax rate
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate as percentage (0-100)
 * @returns {number} - Tax amount
 */
export const calculateTax = (subtotal, taxRate) => {
  const sub = parseFloat(subtotal) || 0;
  const rate = parseFloat(taxRate) || 0;
  return sub * (rate / 100);
};

/**
 * Calculates grand total (subtotal + tax)
 * @param {number} subtotal - Subtotal amount
 * @param {number} tax - Tax amount
 * @returns {number} - Grand total amount
 */
export const calculateGrandTotal = (subtotal, tax) => {
  const sub = parseFloat(subtotal) || 0;
  const taxAmount = parseFloat(tax) || 0;
  return sub + taxAmount;
};

/**
 * Calculates all invoice totals at once
 * @param {Array} items - Array of invoice items
 * @param {number} taxRate - Tax rate as percentage (0-100)
 * @returns {Object} - Object containing subtotal, tax, and grandTotal
 */
export const calculateInvoiceTotals = (items, taxRate = 0) => {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const grandTotal = calculateGrandTotal(subtotal, tax);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};

/**
 * Calculates balance amount (total - paid)
 * @param {number} totalAmount - Total amount
 * @param {number} paidAmount - Amount already paid
 * @returns {number} - Balance amount
 */
export const calculateBalance = (totalAmount, paidAmount) => {
  const total = parseFloat(totalAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  return Math.max(0, total - paid);
};

/**
 * Calculates item total (quantity * price)
 * @param {number} quantity - Item quantity
 * @param {number} price - Item price
 * @returns {number} - Item total
 */
export const calculateItemTotal = (quantity, price) => {
  const qty = parseFloat(quantity) || 0;
  const prc = parseFloat(price) || 0;
  return qty * prc;
};

/**
 * Formats currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '$') => {
  const value = parseFloat(amount) || 0;
  return `${currency}${value.toFixed(2)}`;
};

/**
 * Calculates percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} - Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  const val = parseFloat(value) || 0;
  const tot = parseFloat(total) || 0;
  if (tot === 0) return 0;
  return (val / tot) * 100;
};
