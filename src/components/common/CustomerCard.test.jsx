import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import CustomerCard from './CustomerCard';

// Generator for customer data
const customerGenerator = fc.record({
  id: fc.string({ minLength: 7, maxLength: 10 }).map(s => 'CUST' + s.slice(0, 3)),
  name: fc.string({ minLength: 3, maxLength: 30 })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim() || 'Customer Name'),
  avatar: fc.option(fc.webUrl(), { nil: null }),
  email: fc.emailAddress(),
  phone: fc.integer({ min: 1000000000, max: 9999999999 }).map(n => '+' + n.toString()),
  totalOrders: fc.integer({ min: 0, max: 50 }),
  totalSpent: fc.integer({ min: 0, max: 50000 }),
});

describe('CustomerCard Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 8: Customer list renders as cards
  // Validates: Requirements 4.4
  describe('Property 8: Customer list renders as cards', () => {
    test('renders all customers as cards for any customer list', () => {
      fc.assert(
        fc.property(
          fc.array(customerGenerator, { minLength: 0, maxLength: 20 }),
          (customers) => {
            const mockHandlers = {
              onView: jest.fn(),
              onEdit: jest.fn(),
            };

            const { container } = render(
              <div>
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    {...mockHandlers}
                  />
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[data-testid="customer-card"]');
            expect(cards.length).toBe(customers.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: owner-dashboard-enhancement, Property 9: Customer cards display information and actions
  // Validates: Requirements 4.5
  describe('Property 9: Customer cards display information and actions', () => {
    test('all customer cards display customer information and action buttons', () => {
      fc.assert(
        fc.property(
          customerGenerator,
          (customer) => {
            const mockHandlers = {
              onView: jest.fn(),
              onEdit: jest.fn(),
            };

            render(
              <CustomerCard
                customer={customer}
                {...mockHandlers}
              />
            );

            // Check that customer information is displayed
            expect(screen.getByText(customer.name)).toBeInTheDocument();
            expect(screen.getByText(customer.email)).toBeInTheDocument();
            expect(screen.getByText(customer.phone)).toBeInTheDocument();
            
            // Check that stats are displayed
            expect(screen.getByText(customer.totalOrders.toString())).toBeInTheDocument();
            // Use a more flexible matcher for the total spent that handles locale formatting
            const totalSpentText = `$${customer.totalSpent.toLocaleString()}`;
            expect(screen.getByText(totalSpentText)).toBeInTheDocument();

            // Check for action buttons
            const viewButton = screen.getByTestId('view-button');
            const editButton = screen.getByTestId('edit-button');

            expect(viewButton).toBeInTheDocument();
            expect(editButton).toBeInTheDocument();

            // Verify button text content
            expect(viewButton).toHaveTextContent('View');
            expect(editButton).toHaveTextContent('Edit');

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
