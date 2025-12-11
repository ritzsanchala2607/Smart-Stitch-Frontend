import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import WorkerCard from './WorkerCard';

// Generator for worker data
const workerGenerator = fc.record({
  id: fc.string({ minLength: 7, maxLength: 10 }).map(s => 'WORK' + s.slice(0, 3)),
  name: fc.string({ minLength: 3, maxLength: 30 })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim() || 'Worker Name'),
  avatar: fc.option(fc.webUrl(), { nil: null }),
  specialization: fc.constantFrom(
    'Shirts & Formal Wear',
    'Traditional & Ethnic Wear',
    'Wedding & Party Wear',
    'Alterations & Repairs'
  ),
  assignedOrders: fc.integer({ min: 0, max: 20 }),
  performance: fc.integer({ min: 0, max: 100 }),
  status: fc.constantFrom('active', 'on-leave', 'inactive'),
});

describe('WorkerCard Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 3: Worker list renders as cards
  // Validates: Requirements 2.5
  describe('Property 3: Worker list renders as cards', () => {
    test('renders all workers as cards for any worker list', () => {
      fc.assert(
        fc.property(
          fc.array(workerGenerator, { minLength: 0, maxLength: 20 }),
          (workers) => {
            const mockHandlers = {
              onViewDetails: jest.fn(),
              onEdit: jest.fn(),
              onDelete: jest.fn(),
            };

            const { container } = render(
              <div>
                {workers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    {...mockHandlers}
                  />
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[data-testid="worker-card"]');
            expect(cards.length).toBe(workers.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: owner-dashboard-enhancement, Property 4: Worker cards contain required action buttons
  // Validates: Requirements 2.6
  describe('Property 4: Worker cards contain required action buttons', () => {
    test('all worker cards contain View Details, Edit, and Delete buttons', () => {
      fc.assert(
        fc.property(
          workerGenerator,
          (worker) => {
            const mockHandlers = {
              onViewDetails: jest.fn(),
              onEdit: jest.fn(),
              onDelete: jest.fn(),
            };

            render(
              <WorkerCard
                worker={worker}
                {...mockHandlers}
              />
            );

            // Check for all three required buttons
            const viewDetailsButton = screen.getByTestId('view-details-button');
            const editButton = screen.getByTestId('edit-button');
            const deleteButton = screen.getByTestId('delete-button');

            expect(viewDetailsButton).toBeInTheDocument();
            expect(editButton).toBeInTheDocument();
            expect(deleteButton).toBeInTheDocument();

            // Verify button text content
            expect(viewDetailsButton).toHaveTextContent('View Details');
            expect(editButton).toHaveTextContent('Edit');
            expect(deleteButton).toHaveTextContent('Delete');

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
