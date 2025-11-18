import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordModal from './ForgotPasswordModal';

describe('ForgotPasswordModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Modal Open/Close Behavior', () => {
    test('should not render when isOpen is false', () => {
      render(<ForgotPasswordModal isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByText('Reset Your Password')).not.toBeInTheDocument();
    });

    test('should render when isOpen is true', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    });

    test('should close modal when X button is clicked', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should close modal when backdrop is clicked', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const backdrop = screen.getByText('Reset Your Password').closest('div').parentElement.parentElement;
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('should not close modal when clicking inside modal content', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const modalContent = screen.getByText('Reset Your Password').closest('div');
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    test('should show error when email is empty', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    test('should show error when email format is invalid', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      });
    });

    test('should show error when new password is empty', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('New password is required')).toBeInTheDocument();
      });
    });

    test('should show error when password is less than 8 characters', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    test('should show error when confirm password is empty', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    test('should show error when passwords do not match', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    test('should clear error when user corrects input', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      // Trigger error
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Correct input
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Paste Prevention', () => {
    test('should prevent paste in confirm password field', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      
      // Simulate paste event with clipboardData
      const pasteEvent = {
        clipboardData: {
          getData: () => 'pastedPassword123'
        },
        preventDefault: jest.fn()
      };
      
      fireEvent.paste(confirmPasswordInput, pasteEvent);
      
      await waitFor(() => {
        expect(screen.getByText('Please type your password instead of pasting')).toBeInTheDocument();
      });
      
      // Verify the input value remains empty (paste was prevented)
      expect(confirmPasswordInput.value).toBe('');
      
      jest.useRealTimers();
    });

    test('should clear paste error message after 3 seconds', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      
      // Simulate paste event
      const pasteEvent = {
        clipboardData: {
          getData: () => 'pastedPassword123'
        },
        preventDefault: jest.fn()
      };
      
      fireEvent.paste(confirmPasswordInput, pasteEvent);
      
      await waitFor(() => {
        expect(screen.getByText('Please type your password instead of pasting')).toBeInTheDocument();
      });
      
      // Fast-forward time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Please type your password instead of pasting')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    test('should allow typing in confirm password field', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      expect(confirmPasswordInput.value).toBe('password123');
    });

    test('should allow paste in new password field', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      
      // Simulate paste event
      const pasteEvent = {
        clipboardData: {
          getData: () => 'pastedPassword123'
        },
        preventDefault: jest.fn()
      };
      
      fireEvent.paste(passwordInput, pasteEvent);
      
      // Should not show error message
      expect(screen.queryByText('Please type your password instead of pasting')).not.toBeInTheDocument();
      // preventDefault should not be called for new password field
      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    test('should toggle new password visibility', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      
      // Find the toggle button within the new password field's parent
      const passwordContainer = passwordInput.parentElement;
      const newPasswordToggle = passwordContainer.querySelector('button');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.click(newPasswordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
      fireEvent.click(newPasswordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle confirm password visibility', () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      
      // Find the toggle button within the confirm password field's parent
      const confirmPasswordContainer = confirmPasswordInput.parentElement;
      const confirmPasswordToggle = confirmPasswordContainer.querySelector('button');
      
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      fireEvent.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      fireEvent.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission and Loading State', () => {
    test('should show loading state during submission', async () => {
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument();
      });
    });

    test('should submit form with valid data', async () => {
      jest.useFakeTimers();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      // Fast-forward time
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Password reset submitted:', {
          email: 'test@example.com',
          newPassword: 'password123'
        });
      });
      
      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Success Modal', () => {
    test('should display success modal after successful submission', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    test('should show user email in success modal', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('user@example.com')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    test('should close both modals when Back to Login is clicked', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
      });
      
      const backToLoginButton = screen.getByRole('button', { name: /back to login/i });
      fireEvent.click(backToLoginButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    test('should reset form data after closing success modal', async () => {
      jest.useFakeTimers();
      render(<ForgotPasswordModal isOpen={true} onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Re-enter new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await act(async () => {
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful!')).toBeInTheDocument();
      });
      
      const backToLoginButton = screen.getByRole('button', { name: /back to login/i });
      fireEvent.click(backToLoginButton);
      
      // Verify form is reset by checking if inputs are empty
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(confirmPasswordInput.value).toBe('');
      
      jest.useRealTimers();
    });
  });
});
