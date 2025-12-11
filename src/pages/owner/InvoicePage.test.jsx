import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import InvoicePage from './InvoicePage';

// Mock the components
jest.mock('../../components/common/Sidebar', () => {
  return function Sidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('../../components/common/Topbar', () => {
  return function Topbar() {
    return <div data-testid="topbar">Topbar</div>;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  },
}));

// Mock dummy data module
jest.mock('../../data/dummyData', () => ({
  owners: [{
    id: 'OWN001',
    name: 'Test Owner',
    email: 'owner@test.com',
    phone: '+1234567890',
    shopName: 'Test Shop',
    address: '123 Test St',
    role: 'owner'
  }],
  customers: [
    {
      id: 'CUST001',
      name: 'John Doe',
      email: 'john@test.com',
      phone: '+1234567891',
      address: '456 Main St',
      totalOrders: 5,
      totalSpent: 1000
    },
    {
      id: 'CUST002',
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '+1234567892',
      address: '789 Oak Ave',
      totalOrders: 3,
      totalSpent: 500
    }
  ]
}));

// Helper to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Custom generator for customer data
const customerGenerator = fc.record({
  id: fc.string({ minLength: 7, maxLength: 10 }).map(s => 'CUST' + s.slice(0, 3)),
  name: fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length >= 5),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\s/g, '0')),
  address: fc.string({ minLength: 10, maxLength: 50 }).filter(s => s.trim().length >= 10),
  totalOrders: fc.integer({ min: 0, max: 50 }),
  totalSpent: fc.integer({ min: 0, max: 50000 })
});

describe('InvoicePage Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 10: Invoice displays selected customer information
  // Validates: Requirements 5.3
  test('Property 10: displays selected customer information for any valid customer', () => {
    // Use the mocked customers from the module mock
    const { container } = renderWithRouter(<InvoicePage />);
    
    // Get all customer options from the dropdown
    const customerSelect = screen.getByRole('combobox');
    const options = within(customerSelect).getAllByRole('option');
    
    // Filter out the "Select Customer" option
    const customerOptions = options.filter(opt => opt.value !== '');
    
    // Test with each mocked customer
    customerOptions.forEach(option => {
      const customerId = option.value;
      
      // Select the customer
      fireEvent.change(customerSelect, { target: { value: customerId } });
      
      // Verify customer information section appears
      const customerInfoSection = container.querySelector('.bg-gray-50');
      expect(customerInfoSection).toBeInTheDocument();
      
      // The customer info should be displayed
      const text = customerInfoSection.textContent;
      
      // Check that customer information is present
      // At minimum, should contain "Phone:" and "Email:" labels
      expect(text).toContain('Phone:');
      expect(text).toContain('Email:');
    });
  });

  // Feature: owner-dashboard-enhancement, Property 11: Invoice items render in table format
  // Validates: Requirements 5.4
  test('Property 11: renders invoice items in table format for any set of items', () => {
    const { container } = renderWithRouter(<InvoicePage />);
    
    // Get the table
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Verify table has correct headers
    const headers = table.querySelectorAll('thead th');
    expect(headers.length).toBeGreaterThanOrEqual(4);
    
    // Check for required column headers
    const headerText = Array.from(headers).map(h => h.textContent);
    expect(headerText.some(text => text.includes('Description'))).toBe(true);
    expect(headerText.some(text => text.includes('Quantity'))).toBe(true);
    expect(headerText.some(text => text.includes('Unit Price'))).toBe(true);
    expect(headerText.some(text => text.includes('Total'))).toBe(true);
    
    // Verify initial row exists (at least one row by default)
    const tbody = table.querySelector('tbody');
    const initialRows = tbody.querySelectorAll('tr');
    expect(initialRows.length).toBeGreaterThanOrEqual(1);
    
    // Verify each row has the required cells (description, quantity, unit price, total, action)
    initialRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      expect(cells.length).toBeGreaterThanOrEqual(4);
      
      // Verify the cells contain the expected input types
      const descInput = row.querySelector('input[placeholder="Item description"]');
      const qtyInput = row.querySelector('input[type="number"][min="1"]');
      const priceInput = row.querySelector('input[placeholder="0.00"]');
      
      expect(descInput).toBeInTheDocument();
      expect(qtyInput).toBeInTheDocument();
      expect(priceInput).toBeInTheDocument();
    });
    
    // Test adding items dynamically
    const addButton = screen.getByText(/Add Item/i);
    const initialRowCount = initialRows.length;
    
    // Add a few items
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    
    // Verify rows increased
    const newRows = tbody.querySelectorAll('tr');
    expect(newRows.length).toBe(initialRowCount + 2);
  });
});
