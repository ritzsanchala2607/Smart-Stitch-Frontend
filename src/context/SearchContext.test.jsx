import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SearchProvider, useSearch } from './SearchContext';
import fc from 'fast-check';
import { orders, customers, workers } from '../data/dummyData';

// Wrapper component for testing
const wrapper = ({ children }) => <SearchProvider>{children}</SearchProvider>;

describe('SearchContext', () => {
  describe('Basic functionality', () => {
    test('provides initial search query as empty string', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      expect(result.current.searchQuery).toBe('');
    });

    test('updates search query when setSearchQuery is called', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('test query');
      });
      
      expect(result.current.searchQuery).toBe('test query');
    });

    test('throws error when useSearch is used outside SearchProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        renderHook(() => useSearch());
      }).toThrow('useSearch must be used within a SearchProvider');
      
      console.error = originalError;
    });
  });

  describe('Property 13: Search filters displayed items', () => {
    // Feature: owner-dashboard-enhancement, Property 13: Search filters displayed items
    test('filterOrders returns all orders when search query is empty', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered).toEqual(orders);
    });

    test('filterCustomers returns all customers when search query is empty', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered).toEqual(customers);
    });

    test('filterWorkers returns all workers when search query is empty', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered).toEqual(workers);
    });

    test('filterOrders returns subset when search query matches', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('ORD001');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThanOrEqual(orders.length);
      expect(filtered.every(order => order.id.toLowerCase().includes('ord001'))).toBe(true);
    });

    test('filterCustomers returns subset when search query matches', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('robert');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThanOrEqual(customers.length);
    });

    test('filterWorkers returns subset when search query matches', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('mike');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBeLessThanOrEqual(workers.length);
    });

    // Feature: owner-dashboard-enhancement, Property 13: Search filters displayed items
    test('property: for any search query, filtered results are a subset of original items', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 50 }),
          (query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filteredOrders = result.current.filterOrders(orders);
            const filteredCustomers = result.current.filterCustomers(customers);
            const filteredWorkers = result.current.filterWorkers(workers);
            
            // All filtered results should be subsets of original arrays
            expect(filteredOrders.length).toBeLessThanOrEqual(orders.length);
            expect(filteredCustomers.length).toBeLessThanOrEqual(customers.length);
            expect(filteredWorkers.length).toBeLessThanOrEqual(workers.length);
            
            // All filtered items should exist in original arrays
            filteredOrders.forEach(order => {
              expect(orders).toContainEqual(order);
            });
            filteredCustomers.forEach(customer => {
              expect(customers).toContainEqual(customer);
            });
            filteredWorkers.forEach(worker => {
              expect(workers).toContainEqual(worker);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Order search matches correctly', () => {
    test('filterOrders matches by order ID', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('ORD001');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(order => {
        expect(order.id.toLowerCase()).toContain('ord001');
      });
    });

    test('filterOrders matches by customer name', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('robert');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(order => {
        expect(order.customerName.toLowerCase()).toContain('robert');
      });
    });

    test('filterOrders matches by status', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('pending');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(order => {
        expect(order.status.toLowerCase()).toContain('pending');
      });
    });

    test('filterOrders matches by worker name', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('mike');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(order => {
        expect(order.workerName?.toLowerCase()).toContain('mike');
      });
    });

    test('filterOrders is case-insensitive', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('ROBERT');
      });
      
      const filtered = result.current.filterOrders(orders);
      expect(filtered.length).toBeGreaterThan(0);
    });

    // Feature: owner-dashboard-enhancement, Property 14: Order search matches correctly
    test('property: for any order and search query, filtered results match query correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...orders),
          fc.string({ maxLength: 30 }).map(s => s.trim()), // Trim to match filter behavior
          (order, query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterOrders([order]);
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery === '') {
              // Empty query should return all orders
              expect(filtered).toContainEqual(order);
            } else {
              // Check if order matches the query
              const shouldMatch = 
                order.id.toLowerCase().includes(lowerQuery) ||
                order.customerName.toLowerCase().includes(lowerQuery) ||
                order.status.toLowerCase().includes(lowerQuery) ||
                (order.workerName && order.workerName.toLowerCase().includes(lowerQuery));
              
              if (shouldMatch) {
                expect(filtered).toContainEqual(order);
              } else {
                expect(filtered).not.toContainEqual(order);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: owner-dashboard-enhancement, Property 14: Order search matches correctly
    test('property: all filtered orders match the search query', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 30 }),
          (query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterOrders(orders);
            const lowerQuery = query.toLowerCase().trim();
            
            if (lowerQuery === '') {
              // Empty query should return all orders
              expect(filtered.length).toBe(orders.length);
            } else {
              // All filtered orders should match the query
              filtered.forEach(order => {
                const matches = 
                  order.id.toLowerCase().includes(lowerQuery) ||
                  order.customerName.toLowerCase().includes(lowerQuery) ||
                  order.status.toLowerCase().includes(lowerQuery) ||
                  (order.workerName && order.workerName.toLowerCase().includes(lowerQuery));
                expect(matches).toBe(true);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Customer search matches correctly', () => {
    test('filterCustomers matches by customer ID', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('CUST001');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(customer => {
        expect(customer.id.toLowerCase()).toContain('cust001');
      });
    });

    test('filterCustomers matches by customer name', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('robert');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(customer => {
        expect(customer.name.toLowerCase()).toContain('robert');
      });
    });

    test('filterCustomers matches by email', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('email.com');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(customer => {
        expect(customer.email.toLowerCase()).toContain('email.com');
      });
    });

    test('filterCustomers matches by phone', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('1234567895');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(customer => {
        expect(customer.phone).toContain('1234567895');
      });
    });

    test('filterCustomers is case-insensitive', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('ROBERT');
      });
      
      const filtered = result.current.filterCustomers(customers);
      expect(filtered.length).toBeGreaterThan(0);
    });

    // Feature: owner-dashboard-enhancement, Property 15: Customer search matches correctly
    test('property: for any customer and search query, filtered results match query correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...customers),
          fc.string({ maxLength: 30 }).map(s => s.trim()), // Trim to match filter behavior
          (customer, query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterCustomers([customer]);
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery === '') {
              // Empty query should return all customers
              expect(filtered).toContainEqual(customer);
            } else {
              // Check if customer matches the query
              const shouldMatch = 
                customer.id.toLowerCase().includes(lowerQuery) ||
                customer.name.toLowerCase().includes(lowerQuery) ||
                customer.email.toLowerCase().includes(lowerQuery) ||
                customer.phone.toLowerCase().includes(lowerQuery);
              
              if (shouldMatch) {
                expect(filtered).toContainEqual(customer);
              } else {
                expect(filtered).not.toContainEqual(customer);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: owner-dashboard-enhancement, Property 15: Customer search matches correctly
    test('property: all filtered customers match the search query', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 30 }),
          (query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterCustomers(customers);
            const lowerQuery = query.toLowerCase().trim();
            
            if (lowerQuery === '') {
              // Empty query should return all customers
              expect(filtered.length).toBe(customers.length);
            } else {
              // All filtered customers should match the query
              filtered.forEach(customer => {
                const matches = 
                  customer.id.toLowerCase().includes(lowerQuery) ||
                  customer.name.toLowerCase().includes(lowerQuery) ||
                  customer.email.toLowerCase().includes(lowerQuery) ||
                  customer.phone.toLowerCase().includes(lowerQuery);
                expect(matches).toBe(true);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 16: Worker search matches correctly', () => {
    test('filterWorkers matches by worker ID', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('WORK001');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(worker => {
        expect(worker.id.toLowerCase()).toContain('work001');
      });
    });

    test('filterWorkers matches by worker name', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('mike');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(worker => {
        expect(worker.name.toLowerCase()).toContain('mike');
      });
    });

    test('filterWorkers matches by email', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('smartstitch.com');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(worker => {
        expect(worker.email.toLowerCase()).toContain('smartstitch.com');
      });
    });

    test('filterWorkers matches by phone', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('1234567891');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(worker => {
        expect(worker.phone).toContain('1234567891');
      });
    });

    test('filterWorkers matches by specialization', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('shirts');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(worker => {
        expect(worker.specialization.toLowerCase()).toContain('shirts');
      });
    });

    test('filterWorkers is case-insensitive', () => {
      const { result } = renderHook(() => useSearch(), { wrapper });
      
      act(() => {
        result.current.setSearchQuery('MIKE');
      });
      
      const filtered = result.current.filterWorkers(workers);
      expect(filtered.length).toBeGreaterThan(0);
    });

    // Feature: owner-dashboard-enhancement, Property 16: Worker search matches correctly
    test('property: for any worker and search query, filtered results match query correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...workers),
          fc.string({ maxLength: 30 }).map(s => s.trim()), // Trim to match filter behavior
          (worker, query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterWorkers([worker]);
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery === '') {
              // Empty query should return all workers
              expect(filtered).toContainEqual(worker);
            } else {
              // Check if worker matches the query
              const shouldMatch = 
                worker.id.toLowerCase().includes(lowerQuery) ||
                worker.name.toLowerCase().includes(lowerQuery) ||
                worker.email.toLowerCase().includes(lowerQuery) ||
                worker.phone.toLowerCase().includes(lowerQuery) ||
                worker.specialization.toLowerCase().includes(lowerQuery);
              
              if (shouldMatch) {
                expect(filtered).toContainEqual(worker);
              } else {
                expect(filtered).not.toContainEqual(worker);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: owner-dashboard-enhancement, Property 16: Worker search matches correctly
    test('property: all filtered workers match the search query', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 30 }),
          (query) => {
            const { result } = renderHook(() => useSearch(), { wrapper });
            
            act(() => {
              result.current.setSearchQuery(query);
            });
            
            const filtered = result.current.filterWorkers(workers);
            const lowerQuery = query.toLowerCase().trim();
            
            if (lowerQuery === '') {
              // Empty query should return all workers
              expect(filtered.length).toBe(workers.length);
            } else {
              // All filtered workers should match the query
              filtered.forEach(worker => {
                const matches = 
                  worker.id.toLowerCase().includes(lowerQuery) ||
                  worker.name.toLowerCase().includes(lowerQuery) ||
                  worker.email.toLowerCase().includes(lowerQuery) ||
                  worker.phone.toLowerCase().includes(lowerQuery) ||
                  worker.specialization.toLowerCase().includes(lowerQuery);
                expect(matches).toBe(true);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
