import fc from 'fast-check';
import {
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
  calculateInvoiceTotals,
  calculateBalance,
  calculateItemTotal
} from './calculations';

// Feature: owner-dashboard-enhancement, Property 12: Invoice calculations are accurate
// Validates: Requirements 5.5
describe('Invoice Calculations Property-Based Tests', () => {
  test('calculates invoice totals correctly for any valid invoice items and tax rate', () => {
    fc.assert(
      fc.property(
        // Generate array of invoice items with quantity and price
        fc.array(
          fc.record({
            quantity: fc.integer({ min: 1, max: 100 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        // Generate tax rate between 0 and 50%
        fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true, noDefaultInfinity: true }),
        (items, taxRate) => {
          // Calculate using our functions
          const result = calculateInvoiceTotals(items, taxRate);
          
          // Verify the mathematical relationship holds
          // The function rounds each value to 2 decimal places
          // So we verify the relationship with the rounded values
          const calculatedSubtotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
          );
          const calculatedTax = calculatedSubtotal * (taxRate / 100);
          
          // Verify subtotal is correct (within floating point precision)
          expect(result.subtotal).toBeCloseTo(calculatedSubtotal, 2);
          
          // Verify tax is calculated from subtotal
          expect(result.tax).toBeCloseTo(calculatedTax, 2);
          
          // Verify grand total is close to subtotal + tax
          // Due to rounding at each step, we allow small differences
          expect(result.grandTotal).toBeCloseTo(calculatedSubtotal + calculatedTax, 1);
          
          // Verify all values are non-negative
          expect(result.subtotal).toBeGreaterThanOrEqual(0);
          expect(result.tax).toBeGreaterThanOrEqual(0);
          expect(result.grandTotal).toBeGreaterThanOrEqual(0);
          
          // Verify grand total is at least as large as subtotal
          expect(result.grandTotal).toBeGreaterThanOrEqual(result.subtotal - 0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('subtotal calculation is accurate for any valid items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            quantity: fc.integer({ min: 1, max: 100 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (items) => {
          const expected = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
          );
          const result = calculateSubtotal(items);
          
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('tax calculation is accurate for any valid subtotal and tax rate', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true, noDefaultInfinity: true }),
        (subtotal, taxRate) => {
          const expected = subtotal * (taxRate / 100);
          const result = calculateTax(subtotal, taxRate);
          
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('grand total equals subtotal plus tax for any valid values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true, noDefaultInfinity: true }),
        (subtotal, tax) => {
          const result = calculateGrandTotal(subtotal, tax);
          const expected = subtotal + tax;
          
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toBeGreaterThanOrEqual(subtotal);
          expect(result).toBeGreaterThanOrEqual(tax);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('balance calculation is accurate for any valid amounts', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true, noDefaultInfinity: true }),
        (totalAmount, paidAmount) => {
          const result = calculateBalance(totalAmount, paidAmount);
          const expected = Math.max(0, totalAmount - paidAmount);
          
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('item total calculation is accurate for any valid quantity and price', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
        (quantity, price) => {
          const result = calculateItemTotal(quantity, price);
          const expected = quantity * price;
          
          expect(result).toBeCloseTo(expected, 2);
          expect(result).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('handles empty items array correctly', () => {
    const result = calculateInvoiceTotals([], 10);
    
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  test('handles zero tax rate correctly', () => {
    const items = [
      { quantity: 2, price: 100 },
      { quantity: 1, price: 50 }
    ];
    
    const result = calculateInvoiceTotals(items, 0);
    
    expect(result.subtotal).toBe(250);
    expect(result.tax).toBe(0);
    expect(result.grandTotal).toBe(250);
  });

  test('handles items with unitPrice property (alternative naming)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            quantity: fc.integer({ min: 1, max: 100 }),
            unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true, noDefaultInfinity: true }),
        (items, taxRate) => {
          const expectedSubtotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0
          );
          
          const result = calculateInvoiceTotals(items, taxRate);
          
          expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Unit tests for edge cases
describe('Invoice Calculations Unit Tests', () => {
  describe('calculateSubtotal', () => {
    test('returns 0 for empty array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    test('returns 0 for null input', () => {
      expect(calculateSubtotal(null)).toBe(0);
    });

    test('calculates correctly for single item', () => {
      const items = [{ quantity: 2, price: 50 }];
      expect(calculateSubtotal(items)).toBe(100);
    });

    test('calculates correctly for multiple items', () => {
      const items = [
        { quantity: 2, price: 50 },
        { quantity: 1, price: 100 },
        { quantity: 3, price: 25 }
      ];
      expect(calculateSubtotal(items)).toBe(275);
    });
  });

  describe('calculateTax', () => {
    test('returns 0 for 0 subtotal', () => {
      expect(calculateTax(0, 10)).toBe(0);
    });

    test('returns 0 for 0 tax rate', () => {
      expect(calculateTax(100, 0)).toBe(0);
    });

    test('calculates 10% tax correctly', () => {
      expect(calculateTax(100, 10)).toBe(10);
    });

    test('calculates 18% tax correctly', () => {
      expect(calculateTax(1000, 18)).toBe(180);
    });
  });

  describe('calculateGrandTotal', () => {
    test('returns subtotal when tax is 0', () => {
      expect(calculateGrandTotal(100, 0)).toBe(100);
    });

    test('adds subtotal and tax correctly', () => {
      expect(calculateGrandTotal(100, 18)).toBe(118);
    });
  });

  describe('calculateBalance', () => {
    test('returns 0 when paid equals total', () => {
      expect(calculateBalance(100, 100)).toBe(0);
    });

    test('returns 0 when paid exceeds total', () => {
      expect(calculateBalance(100, 150)).toBe(0);
    });

    test('calculates balance correctly', () => {
      expect(calculateBalance(100, 30)).toBe(70);
    });
  });

  describe('calculateItemTotal', () => {
    test('multiplies quantity and price correctly', () => {
      expect(calculateItemTotal(5, 20)).toBe(100);
    });

    test('handles decimal prices', () => {
      expect(calculateItemTotal(3, 15.50)).toBe(46.5);
    });
  });
});
