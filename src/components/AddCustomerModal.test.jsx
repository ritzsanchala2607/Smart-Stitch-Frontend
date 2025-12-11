import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCustomerModal from './AddCustomerModal';

describe('AddCustomerModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    expect(screen.getByText('Add New Customer')).toBeInTheDocument();
    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(
      <AddCustomerModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const saveButton = screen.getByText('Save Customer');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be between 2 and 50 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('displays validation error for invalid email', async () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/customer name/i);
    const mobileInput = screen.getByLabelText(/mobile number/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(mobileInput, { target: { value: '1234567890' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const saveButton = screen.getByText('Save Customer');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('calls onSave with customer data when form is valid', async () => {
    jest.useFakeTimers();
    
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/customer name/i);
    const mobileInput = screen.getByLabelText(/mobile number/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(mobileInput, { target: { value: '1234567890' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    const saveButton = screen.getByText('Save Customer');
    fireEvent.click(saveButton);
    
    // Fast-forward time to complete the setTimeout
    await waitFor(() => {
      jest.advanceTimersByTime(500);
    });
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          mobile: '1234567890',
          email: 'john@example.com'
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onClose when X button is clicked', () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clears errors when user starts typing', async () => {
    render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    // Trigger validation errors
    const saveButton = screen.getByText('Save Customer');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be between 2 and 50 characters/i)).toBeInTheDocument();
    });
    
    // Start typing in name field
    const nameInput = screen.getByLabelText(/customer name/i);
    fireEvent.change(nameInput, { target: { value: 'J' } });
    
    // Error should be cleared
    expect(screen.queryByText(/name must be between 2 and 50 characters/i)).not.toBeInTheDocument();
  });

  test('resets form data when modal closes', async () => {
    const { rerender } = render(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    const nameInput = screen.getByLabelText(/customer name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    // Close modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Reopen modal
    rerender(
      <AddCustomerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
      />
    );
    
    // Form should be reset
    const nameInputAfterReopen = screen.getByLabelText(/customer name/i);
    expect(nameInputAfterReopen.value).toBe('');
  });
});
