import { render, screen, waitFor } from '@testing-library/react';
import { workers, orders } from '../../data/dummyData';

// Use manual mock for react-router-dom
jest.mock('react-router-dom');

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
  },
}));

// Mock useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'OWN001', role: 'owner', name: 'Test Owner' },
    isAuthenticated: true,
  }),
}));

// Import component after mocks
import WorkerDetails from './WorkerDetails';

// Helper function to render component
const renderComponent = (workerId = 'WORK001') => {
  // Update the mock to return the specific worker ID
  const { __setMockParams } = require('react-router-dom');
  __setMockParams({ id: workerId });
  
  return render(<WorkerDetails />);
};

describe('WorkerDetails Component', () => {
  // Feature: owner-dashboard-enhancement, Property 5: Worker details displays assigned orders
  // **Validates: Requirements 3.2**
  describe('Property 5: Worker details displays assigned orders', () => {
    test('displays all assigned orders for workers with orders', async () => {
      // Test with WORK001 who has assigned orders
      const workerOrders = orders.filter(order => order.assignedWorker === 'WORK001');
      
      const { container } = renderComponent('WORK001');
      
      await waitFor(() => {
        const assignedOrdersSection = container.querySelector('[data-testid="assigned-orders-section"]');
        expect(assignedOrdersSection).toBeInTheDocument();
      });

      // Check that all orders are displayed
      const orderItems = container.querySelectorAll('[data-testid="assigned-order-item"]');
      expect(orderItems.length).toBe(workerOrders.length);

      // Verify each order is displayed
      workerOrders.forEach(order => {
        expect(screen.getByText(order.id)).toBeInTheDocument();
      });
    });

    test('displays empty state when worker has no assigned orders', async () => {
      // Test with WORK004 who has no assigned orders
      const { container } = renderComponent('WORK004');

      await waitFor(() => {
        const assignedOrdersSection = container.querySelector('[data-testid="assigned-orders-section"]');
        expect(assignedOrdersSection).toBeInTheDocument();

        // Check for empty state message
        expect(screen.getByText(/no orders currently assigned/i)).toBeInTheDocument();

        // Verify no order items are displayed
        const orderItems = container.querySelectorAll('[data-testid="assigned-order-item"]');
        expect(orderItems.length).toBe(0);
      });
    });

    test('property: for all workers, assigned orders count matches displayed orders', async () => {
      // Test all workers from dummy data
      for (const worker of workers) {
        const { container, unmount } = renderComponent(worker.id);
        
        await waitFor(() => {
          const assignedOrdersSection = container.querySelector('[data-testid="assigned-orders-section"]');
          expect(assignedOrdersSection).toBeInTheDocument();
        });

        // Count orders for this worker
        const workerOrders = orders.filter(order => order.assignedWorker === worker.id);
        const orderItems = container.querySelectorAll('[data-testid="assigned-order-item"]');
        
        // The number of displayed order items should match the number of assigned orders
        expect(orderItems.length).toBe(workerOrders.length);
        
        // Clean up before next iteration
        unmount();
      }
    });
  });

  // Feature: owner-dashboard-enhancement, Property 6: Performance metrics visualization
  // **Validates: Requirements 3.3**
  describe('Property 6: Performance metrics visualization', () => {
    test('displays performance meter with correct percentage for any worker', async () => {
      // Test with all workers from dummy data
      for (const worker of workers) {
        const { container, unmount } = renderComponent(worker.id);

        await waitFor(() => {
          const performanceMeter = container.querySelector('[data-testid="performance-meter"]');
          expect(performanceMeter).toBeInTheDocument();

          // Check that performance percentage is displayed
          const performanceTexts = screen.getAllByText(`${worker.performance}%`);
          expect(performanceTexts.length).toBeGreaterThan(0);

          // Verify performance meter section exists
          expect(screen.getByText(/performance metrics/i)).toBeInTheDocument();
          expect(screen.getByText(/overall performance/i)).toBeInTheDocument();
        });
        
        // Clean up before next iteration
        unmount();
      }
    });

    test('performance meter uses correct color based on performance value', async () => {
      // Test workers with different performance levels
      const testCases = [
        { id: 'WORK003', performance: 95, expectedColor: 'bg-green-500' }, // >= 90
        { id: 'WORK001', performance: 92, expectedColor: 'bg-green-500' }, // >= 90
        { id: 'WORK002', performance: 88, expectedColor: 'bg-orange-500' }, // >= 70
        { id: 'WORK004', performance: 85, expectedColor: 'bg-orange-500' }, // >= 70
      ];

      for (const testCase of testCases) {
        const { container, unmount } = renderComponent(testCase.id);

        await waitFor(() => {
          const performanceMeter = container.querySelector('[data-testid="performance-meter"]');
          expect(performanceMeter).toBeInTheDocument();

          // Find the progress bar with color
          const progressBars = container.querySelectorAll('.rounded-full');
          const coloredBar = Array.from(progressBars).find(bar => 
            bar.className.includes('bg-green-500') || 
            bar.className.includes('bg-orange-500') || 
            bar.className.includes('bg-red-500')
          );

          expect(coloredBar).toBeTruthy();
          expect(coloredBar.className).toContain(testCase.expectedColor);
        });
        
        // Clean up before next iteration
        unmount();
      }
    });

    test('property: performance meter displays value between 0 and 100 for all workers', async () => {
      for (const worker of workers) {
        const { container, unmount } = renderComponent(worker.id);

        await waitFor(() => {
          const performanceMeter = container.querySelector('[data-testid="performance-meter"]');
          expect(performanceMeter).toBeInTheDocument();

          // Verify performance is within valid range
          expect(worker.performance).toBeGreaterThanOrEqual(0);
          expect(worker.performance).toBeLessThanOrEqual(100);

          // Check that the worker's performance percentage is displayed
          const performanceTexts = screen.getAllByText(`${worker.performance}%`);
          expect(performanceTexts.length).toBeGreaterThan(0);
        });
        
        // Clean up before next iteration
        unmount();
      }
    });
  });
});
