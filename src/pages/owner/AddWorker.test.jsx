import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import fc from 'fast-check';

// Use manual mock for react-router-dom
jest.mock('react-router-dom');

// Import AddWorker after mocking
import AddWorker from './AddWorker';

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

jest.mock('../../components/common/WorkerCard', () => {
  return function MockWorkerCard({ worker }) {
    return <div data-testid="worker-card">{worker.name}</div>;
  };
});

// Generator for valid worker form data
const validWorkerFormGenerator = fc.record({
  name: fc.string({ minLength: 2, maxLength: 50 })
    .filter(s => /^[a-zA-Z\s]+$/.test(s.trim()) && s.trim().length >= 2)
    .map(s => s.trim()),
  mobile: fc.integer({ min: 1000000000, max: 999999999999 })
    .map(n => '+' + n.toString()),
  skill: fc.constantFrom('Shirt', 'Pant', 'Both'),
  experience: fc.integer({ min: 0, max: 50 }).map(n => n.toString()),
  salary: fc.float({ min: 1, max: 10000, noNaN: true })
    .map(n => n.toFixed(2)),
});

describe('AddWorker Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 2: Worker addition updates state
  // Validates: Requirements 2.4
  describe('Property 2: Worker addition updates state', () => {
    test('for any valid worker data, adding the worker updates the frontend state', () => {
      fc.assert(
        fc.property(
          validWorkerFormGenerator,
          (workerData) => {
            const { container } = render(<AddWorker />);

            // Get initial worker count
            const initialCards = container.querySelectorAll('[data-testid="worker-card"]');
            const initialCount = initialCards.length;

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter worker name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const skillSelect = screen.getByRole('combobox');
            const experienceInput = screen.getByPlaceholderText('0');
            const salaryInput = screen.getByPlaceholderText('0.00');

            fireEvent.change(nameInput, { target: { value: workerData.name } });
            fireEvent.change(mobileInput, { target: { value: workerData.mobile } });
            fireEvent.change(skillSelect, { target: { value: workerData.skill } });
            fireEvent.change(experienceInput, { target: { value: workerData.experience } });
            fireEvent.change(salaryInput, { target: { value: workerData.salary } });

            // Click Add Worker button
            const addButton = screen.getByRole('button', { name: /add worker/i });
            fireEvent.click(addButton);

            // Verify state update: worker count should increase by 1
            const updatedCards = container.querySelectorAll('[data-testid="worker-card"]');
            expect(updatedCards.length).toBe(initialCount + 1);

            // Verify the new worker appears in the list
            const workerNames = Array.from(updatedCards).map(card => card.textContent);
            expect(workerNames).toContain(workerData.name);

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('adding a worker clears the form fields', () => {
      fc.assert(
        fc.property(
          validWorkerFormGenerator,
          (workerData) => {
            render(<AddWorker />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter worker name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const skillSelect = screen.getByRole('combobox');
            const experienceInput = screen.getByPlaceholderText('0');
            const salaryInput = screen.getByPlaceholderText('0.00');

            fireEvent.change(nameInput, { target: { value: workerData.name } });
            fireEvent.change(mobileInput, { target: { value: workerData.mobile } });
            fireEvent.change(skillSelect, { target: { value: workerData.skill } });
            fireEvent.change(experienceInput, { target: { value: workerData.experience } });
            fireEvent.change(salaryInput, { target: { value: workerData.salary } });

            // Click Add Worker button
            const addButton = screen.getByRole('button', { name: /add worker/i });
            fireEvent.click(addButton);

            // Verify form is cleared
            expect(nameInput.value).toBe('');
            expect(mobileInput.value).toBe('');
            expect(skillSelect.value).toBe('');
            expect(experienceInput.value).toBe('');
            expect(salaryInput.value).toBe('');

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('adding a worker shows success message', () => {
      fc.assert(
        fc.property(
          validWorkerFormGenerator,
          (workerData) => {
            render(<AddWorker />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter worker name');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const skillSelect = screen.getByRole('combobox');
            const experienceInput = screen.getByPlaceholderText('0');
            const salaryInput = screen.getByPlaceholderText('0.00');

            fireEvent.change(nameInput, { target: { value: workerData.name } });
            fireEvent.change(mobileInput, { target: { value: workerData.mobile } });
            fireEvent.change(skillSelect, { target: { value: workerData.skill } });
            fireEvent.change(experienceInput, { target: { value: workerData.experience } });
            fireEvent.change(salaryInput, { target: { value: workerData.salary } });

            // Click Add Worker button
            const addButton = screen.getByRole('button', { name: /add worker/i });
            fireEvent.click(addButton);

            // Verify success message appears
            const successMessage = screen.getByText(/worker added successfully/i);
            expect(successMessage).toBeInTheDocument();

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
