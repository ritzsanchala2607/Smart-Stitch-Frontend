import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on search query
  const filterOrders = useCallback((orders) => {
    if (!searchQuery.trim()) {
      return orders;
    }

    const query = searchQuery.toLowerCase();
    return orders.filter(order => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        (order.workerName && order.workerName.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  // Filter customers based on search query
  const filterCustomers = useCallback((customers) => {
    if (!searchQuery.trim()) {
      return customers;
    }

    const query = searchQuery.toLowerCase();
    return customers.filter(customer => {
      return (
        customer.id.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Filter workers based on search query
  const filterWorkers = useCallback((workers) => {
    if (!searchQuery.trim()) {
      return workers;
    }

    const query = searchQuery.toLowerCase();
    return workers.filter(worker => {
      return (
        worker.id.toLowerCase().includes(query) ||
        worker.name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query) ||
        worker.phone.toLowerCase().includes(query) ||
        worker.specialization.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const value = {
    searchQuery,
    setSearchQuery,
    filterOrders,
    filterCustomers,
    filterWorkers
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired
};
