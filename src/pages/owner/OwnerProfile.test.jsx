import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import fc from 'fast-check';

// Use manual mock for react-router-dom
jest.mock('react-router-dom');

// Import OwnerProfile after mocking
import OwnerProfile from './OwnerProfile';

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

// Generator for valid profile form data
const validProfileFormGenerator = fc.record({
  name: fc.string({ minLength: 2, maxLength: 50 })
    .filter(s => /^[a-zA-Z\s]+$/.test(s.trim()) && s.trim().length >= 2)
    .map(s => s.trim()),
  email: fc.emailAddress(),
  mobile: fc.integer({ min: 1000000000, max: 999999999999 })
    .map(n => '+' + n.toString()),
  shopName: fc.string({ minLength: 2, maxLength: 100 })
    .filter(s => s.trim().length >= 2)
    .map(s => s.trim()),
  address: fc.string({ minLength: 10, maxLength: 200 })
    .filter(s => s.trim().length >= 10)
    .map(s => s.trim()),
});

describe('OwnerProfile Property-Based Tests', () => {
  // Feature: owner-dashboard-enhancement, Property 17: Profile save updates state
  // Validates: Requirements 7.4
  describe('Property 17: Profile save updates state', () => {
    test('for any valid profile data, saving changes updates the frontend state', () => {
      fc.assert(
        fc.property(
          validProfileFormGenerator,
          (profileData) => {
            render(<OwnerProfile />);

            // Fill in the form with new data
            const nameInput = screen.getByPlaceholderText('Enter your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const shopNameInput = screen.getByPlaceholderText('Enter shop name');
            const addressInput = screen.getByPlaceholderText('Enter complete shop address');

            fireEvent.change(nameInput, { target: { value: profileData.name } });
            fireEvent.change(emailInput, { target: { value: profileData.email } });
            fireEvent.change(mobileInput, { target: { value: profileData.mobile } });
            fireEvent.change(shopNameInput, { target: { value: profileData.shopName } });
            fireEvent.change(addressInput, { target: { value: profileData.address } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Verify state update: success message should appear
            const successMessage = screen.getByText(/profile updated successfully/i);
            expect(successMessage).toBeInTheDocument();

            // Verify the form still contains the updated values
            expect(nameInput.value).toBe(profileData.name);
            expect(emailInput.value).toBe(profileData.email);
            expect(mobileInput.value).toBe(profileData.mobile);
            expect(shopNameInput.value).toBe(profileData.shopName);
            expect(addressInput.value).toBe(profileData.address);

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('saving profile with valid data shows success message', () => {
      fc.assert(
        fc.property(
          validProfileFormGenerator,
          (profileData) => {
            render(<OwnerProfile />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const shopNameInput = screen.getByPlaceholderText('Enter shop name');
            const addressInput = screen.getByPlaceholderText('Enter complete shop address');

            fireEvent.change(nameInput, { target: { value: profileData.name } });
            fireEvent.change(emailInput, { target: { value: profileData.email } });
            fireEvent.change(mobileInput, { target: { value: profileData.mobile } });
            fireEvent.change(shopNameInput, { target: { value: profileData.shopName } });
            fireEvent.change(addressInput, { target: { value: profileData.address } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Verify success message appears
            const successMessage = screen.getByText(/profile updated successfully/i);
            expect(successMessage).toBeInTheDocument();

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('profile data persists in form after save', () => {
      fc.assert(
        fc.property(
          validProfileFormGenerator,
          (profileData) => {
            render(<OwnerProfile />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const shopNameInput = screen.getByPlaceholderText('Enter shop name');
            const addressInput = screen.getByPlaceholderText('Enter complete shop address');

            fireEvent.change(nameInput, { target: { value: profileData.name } });
            fireEvent.change(emailInput, { target: { value: profileData.email } });
            fireEvent.change(mobileInput, { target: { value: profileData.mobile } });
            fireEvent.change(shopNameInput, { target: { value: profileData.shopName } });
            fireEvent.change(addressInput, { target: { value: profileData.address } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Verify all fields still contain the saved data
            expect(nameInput.value).toBe(profileData.name);
            expect(emailInput.value).toBe(profileData.email);
            expect(mobileInput.value).toBe(profileData.mobile);
            expect(shopNameInput.value).toBe(profileData.shopName);
            expect(addressInput.value).toBe(profileData.address);

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('saving profile does not clear form fields', () => {
      fc.assert(
        fc.property(
          validProfileFormGenerator,
          (profileData) => {
            render(<OwnerProfile />);

            // Fill in the form
            const nameInput = screen.getByPlaceholderText('Enter your name');
            const emailInput = screen.getByPlaceholderText('your@email.com');
            const mobileInput = screen.getByPlaceholderText('+1234567890');
            const shopNameInput = screen.getByPlaceholderText('Enter shop name');
            const addressInput = screen.getByPlaceholderText('Enter complete shop address');

            fireEvent.change(nameInput, { target: { value: profileData.name } });
            fireEvent.change(emailInput, { target: { value: profileData.email } });
            fireEvent.change(mobileInput, { target: { value: profileData.mobile } });
            fireEvent.change(shopNameInput, { target: { value: profileData.shopName } });
            fireEvent.change(addressInput, { target: { value: profileData.address } });

            // Click Save Changes button
            const saveButton = screen.getByRole('button', { name: /save changes/i });
            fireEvent.click(saveButton);

            // Verify form fields are NOT cleared (profile editing should preserve data)
            expect(nameInput.value).not.toBe('');
            expect(emailInput.value).not.toBe('');
            expect(mobileInput.value).not.toBe('');
            expect(shopNameInput.value).not.toBe('');
            expect(addressInput.value).not.toBe('');

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: owner-dashboard-enhancement, Property 18: Dark mode toggle reflects state
  // Validates: Requirements 7.5
  describe('Property 18: Dark mode toggle reflects state', () => {
    test('for any dark mode state, the toggle switch reflects the current state visually', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (initialDarkMode) => {
            render(<OwnerProfile />);

            // Find the dark mode toggle button
            const toggleButton = screen.getByRole('button', { name: '' });
            
            // If we need to set initial state to match the test, toggle if necessary
            // The component starts with darkMode = false
            if (initialDarkMode) {
              fireEvent.click(toggleButton);
            }

            // Get the toggle switch element (the colored background)
            const toggleSwitch = toggleButton;
            
            // Verify the toggle reflects the current state
            if (initialDarkMode) {
              // When dark mode is on, the toggle should have orange background
              expect(toggleSwitch.className).toContain('bg-orange-500');
            } else {
              // When dark mode is off, the toggle should have gray background
              expect(toggleSwitch.className).toContain('bg-gray-300');
            }

            // Toggle the state
            fireEvent.click(toggleButton);

            // Verify the toggle reflects the new state
            if (initialDarkMode) {
              // After toggling from dark to light, should be gray
              expect(toggleSwitch.className).toContain('bg-gray-300');
            } else {
              // After toggling from light to dark, should be orange
              expect(toggleSwitch.className).toContain('bg-orange-500');
            }

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('toggling dark mode updates the visual state', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (toggleCount) => {
            render(<OwnerProfile />);

            // Find the dark mode toggle button
            const toggleButton = screen.getByRole('button', { name: '' });
            
            // Initial state should be light mode (gray)
            expect(toggleButton.className).toContain('bg-gray-300');

            // Toggle multiple times
            for (let i = 0; i < toggleCount; i++) {
              fireEvent.click(toggleButton);
              
              // After odd number of toggles, should be dark mode (orange)
              // After even number of toggles, should be light mode (gray)
              if ((i + 1) % 2 === 1) {
                expect(toggleButton.className).toContain('bg-orange-500');
              } else {
                expect(toggleButton.className).toContain('bg-gray-300');
              }
            }

            // Clean up after each property test iteration
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('dark mode toggle displays correct icon and text', () => {
      render(<OwnerProfile />);

      // Find the dark mode toggle button
      const toggleButton = screen.getByRole('button', { name: '' });
      
      // Initial state should show "Light theme enabled"
      expect(screen.getByText(/light theme enabled/i)).toBeInTheDocument();

      // Toggle to dark mode
      fireEvent.click(toggleButton);

      // Should now show "Dark theme enabled"
      expect(screen.getByText(/dark theme enabled/i)).toBeInTheDocument();

      // Toggle back to light mode
      fireEvent.click(toggleButton);

      // Should show "Light theme enabled" again
      expect(screen.getByText(/light theme enabled/i)).toBeInTheDocument();

      cleanup();
    });
  });
});
