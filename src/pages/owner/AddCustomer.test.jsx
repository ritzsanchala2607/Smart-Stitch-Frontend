import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import fc from 'fast-check';

// Use manual mock for react-router-dom
jest.mock('react-router-dom');

// Import AddCustomer after mocking
import AddCustomer from './AddCustomer';

// Mock the child components to simplify testing
jest.mock('../../components/common/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('../../components/common/Topbar', () => {
  return function MockTopbar() {
    return <div data-testid="topbar">Topbar</div>;
  };
});

jest.mock('../../components/common/CustomerCard', () => {
  return function MockCustomerCard({ customer }) {
    return <div data-testid="customer-card">{customer.name}</div>;
  };
});

// Generator for valid customer form data
const validCustomerFormGenerator = fc.record({
  name: fc.string({ minLength: 2, maxLength: 50 })
    .filter(s => /^[a-zA-Z\s]+$/.test(s.trim()) && s.trim().length >= 2)
    .map(s => s.trim()),
  mobile: fc.integer({ min: 1000000000, max: 999999999999 })
    .map(n => '+' + n.toString()),
  email: fc.emailAddress(),
});

describe('AddCustomer Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 7: Customer addition updates state
  // Validates: Requirements 4.3
  describe('Property 7: Customer addition updates state', () => {
    test('for any valid customer data, creating the customer updates the frontend state', () => {
      fc.assert(
        fc.property(
          validCustomerFormGenerator,
          (customerData) => {
            const { container } = render(<AddCustomer />);

            // Get initial customer count
            const initialCards = container.querySelectorAll('[data-testid="customer-card"]');
            const initialCount = initialCards.length;

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter customer name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const emailInput = screen.getByPlaceholderText('customer@email.com');

            fireEvent.change(nameInput, { target: { value: customerData.name } });
            fireEvent.change(mobileInput, { target: { value: customerData.mobile } });
            fireEvent.change(emailInput, { target: { value: customerData.email } });

            // Click Create Customer button
            const createButton = screen.getByRole('button', { name: /create customer/i });
            fireEvent.click(createButton);

            // Verify state update: customer count should increase by 1
            const updatedCards = container.querySelectorAll('[data-testid="customer-card"]');
            expect(updatedCards.length).toBe(initialCount + 1);

            // Verify the new customer appears in the list
            const customerNames = Array.from(updatedCards).map(card => card.textContent);
            expect(customerNames).toContain(customerData.name);

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('creating a customer clears the form fields', () => {
      fc.assert(
        fc.property(
          validCustomerFormGenerator,
          (customerData) => {
            render(<AddCustomer />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter customer name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const emailInput = screen.getByPlaceholderText('customer@email.com');

            fireEvent.change(nameInput, { target: { value: customerData.name } });
            fireEvent.change(mobileInput, { target: { value: customerData.mobile } });
            fireEvent.change(emailInput, { target: { value: customerData.email } });

            // Click Create Customer button
            const createButton = screen.getByRole('button', { name: /create customer/i });
            fireEvent.click(createButton);

            // Verify form is cleared
            expect(nameInput.value).toBe('');
            expect(mobileInput.value).toBe('');
            expect(emailInput.value).toBe('');

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('creating a customer shows success message', () => {
      fc.assert(
        fc.property(
          validCustomerFormGenerator,
          (customerData) => {
            render(<AddCustomer />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter customer name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const emailInput = screen.getByPlaceholderText('customer@email.com');

            fireEvent.change(nameInput, { target: { value: customerData.name } });
            fireEvent.change(mobileInput, { target: { value: customerData.mobile } });
            fireEvent.change(emailInput, { target: { value: customerData.email } });

            // Click Create Customer button
            const createButton = screen.getByRole('button', { name: /create customer/i });
            fireEvent.click(createButton);

            // Verify success message appears
            const successMessage = screen.getByText(/customer added successfully/i);
            expect(successMessage).toBeInTheDocument();

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('customer data includes all required fields in state', () => {
      fc.assert(
        fc.property(
          validCustomerFormGenerator,
          (customerData) => {
            const { container } = render(<AddCustomer />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter customer name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const emailInput = screen.getByPlaceholderText('customer@email.com');

            fireEvent.change(nameInput, { target: { value: customerData.name } });
            fireEvent.change(mobileInput, { target: { value: customerData.mobile } });
            fireEvent.change(emailInput, { target: { value: customerData.email } });

            // Click Create Customer button
            const createButton = screen.getByRole('button', { name: /create customer/i });
            fireEvent.click(createButton);

            // Verify the customer appears with the correct name
            const customerCards = container.querySelectorAll('[data-testid="customer-card"]');
            const lastCard = customerCards[customerCards.length - 1];
            expect(lastCard.textContent).toBe(customerData.name);

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
