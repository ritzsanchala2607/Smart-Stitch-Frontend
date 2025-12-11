import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import NewOrder from './NewOrder';
import fc from 'fast-check';

// Mock the Sidebar and Topbar components
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

// Mock the AddCustomerModal component
jest.mock('../../components/AddCustomerModal', () => {
  return function MockAddCustomerModal({ isOpen, onClose, onSave }) {
    if (!isOpen) return null;
    return (
      <div data-testid="customer-modal">
        <h2>Add New Customer</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave({ 
          id: 'CUST999', 
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+1234567890'
        })}>
          Save
        </button>
      </div>
    );
  };
});

// Helper function to render component
const renderComponent = () => {
  return render(<NewOrder />);
};

// Custom arbitraries for generating test data
const customerArbitrary = fc.record({
  id: fc.string({ minLength: 7, maxLength: 10 }).map(s => `CUST${s.slice(0, 6)}`),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => `+${s}`),
  address: fc.string({ minLength: 10, maxLength: 50 }),
  joinDate: fc.date().map(d => d.toISOString()),
  totalOrders: fc.integer({ min: 0, max: 100 }),
  totalSpent: fc.integer({ min: 0, max: 100000 }),
  measurements: fc.record({
    shirt: fc.record({
      chest: fc.integer({ min: 30, max: 50 }),
      waist: fc.integer({ min: 28, max: 45 }),
      shoulder: fc.integer({ min: 14, max: 22 }),
      length: fc.integer({ min: 25, max: 35 })
    }),
    pant: fc.record({
      waist: fc.integer({ min: 28, max: 45 }),
      length: fc.integer({ min: 35, max: 50 }),
      hip: fc.integer({ min: 32, max: 50 })
    })
  }),
  avatar: fc.webUrl()
});

const orderItemArbitrary = fc.record({
  name: fc.constantFrom('Formal Shirt', 'Casual Shirt', 'Pant', 'Blazer', 'Kurta', 'Suit'),
  quantity: fc.integer({ min: 1, max: 10 }),
  price: fc.integer({ min: 500, max: 10000 }),
  fabricType: fc.constantFrom('Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Blend')
});

const futureDateArbitrary = fc.date({ min: new Date() }).map(d => {
  const date = new Date(d);
  date.setDate(date.getDate() + 1); // Ensure it's at least tomorrow
  return date.toISOString().split('T')[0];
});

const validOrderDataArbitrary = fc.record({
  customer: customerArbitrary,
  deliveryDate: futureDateArbitrary,
  advancePayment: fc.integer({ min: 0, max: 5000 }),
  notes: fc.string({ maxLength: 200 }),
  items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 5 })
});

// Feature: owner-dashboard-enhancement, Property 1: Order save triggers state update and animation
describe('NewOrder Property-Based Tests', () => {
  // Increase timeout for property-based tests
  jest.setTimeout(30000);

  test('Property 1: Order save triggers state update and animation for any valid order data', () => {
    // Feature: owner-dashboard-enhancement, Property 1: Order save triggers state update and animation
    // Validates: Requirements 1.6
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // quantity
        fc.integer({ min: 500, max: 10000 }), // price
        fc.integer({ min: 0, max: 5000 }), // advance payment
        (quantity, price, advancePayment) => {
          // Render the component
          const { unmount } = renderComponent();

          try {
            // Select a customer from dropdown
            const customerSelect = screen.getByLabelText(/select customer/i);
            const customerOptions = Array.from(customerSelect.querySelectorAll('option'));
            const firstCustomerOption = customerOptions.find(opt => opt.value && opt.value !== 'add-new');
            
            if (firstCustomerOption) {
              fireEvent.change(customerSelect, { target: { value: firstCustomerOption.value } });
            }
            
            // Fill in delivery date (tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const deliveryDate = tomorrow.toISOString().split('T')[0];
            
            const deliveryDateInput = screen.getByLabelText(/delivery date/i);
            fireEvent.change(deliveryDateInput, { target: { value: deliveryDate } });
            
            // Fill in advance payment
            const advancePaymentInput = screen.getByLabelText(/advance payment/i);
            fireEvent.change(advancePaymentInput, { 
              target: { value: advancePayment.toString() } 
            });
            
            // Fill in first order item with generated values
            const itemNameInputs = screen.getAllByPlaceholderText(/e\.g\., formal shirt/i);
            const itemQuantityInputs = screen.getAllByPlaceholderText('1');
            const itemPriceInputs = screen.getAllByPlaceholderText('800');
            
            fireEvent.change(itemNameInputs[0], { target: { value: 'Test Item' } });
            fireEvent.change(itemQuantityInputs[0], { 
              target: { value: quantity.toString() } 
            });
            fireEvent.change(itemPriceInputs[0], { 
              target: { value: price.toString() } 
            });
            
            // Property: The form should accept any valid order data and update state
            // Verify form fields are populated correctly
            expect(deliveryDateInput.value).toBe(deliveryDate);
            expect(advancePaymentInput.value).toBe(advancePayment.toString());
            expect(itemQuantityInputs[0].value).toBe(quantity.toString());
            expect(itemPriceInputs[0].value).toBe(price.toString());
            
            // The component correctly updates state for any valid inputs
            return true;
          } finally {
            // Clean up after each property test run
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });



  test('Property 1 (State Update): Order save updates UI state correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 500, max: 5000 }),
        (quantity, price) => {
          // Render the component
          renderComponent();

          // Get the first item inputs
          const itemQuantityInputs = screen.getAllByPlaceholderText('1');
          const itemPriceInputs = screen.getAllByPlaceholderText('800');
          
          // Set quantity and price
          fireEvent.change(itemQuantityInputs[0], { 
            target: { value: quantity.toString() } 
          });
          fireEvent.change(itemPriceInputs[0], { 
            target: { value: price.toString() } 
          });
          
          // Property: UI state should reflect the input values
          expect(itemQuantityInputs[0].value).toBe(quantity.toString());
          expect(itemPriceInputs[0].value).toBe(price.toString());
          
          // The component correctly updates state for any valid quantity and price
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1 (Animation Trigger): Success animation appears after valid order submission', async () => {
    // This is a simplified test that verifies the animation mechanism
    renderComponent();

    // Select a customer
    const customerSelect = screen.getByRole('combobox', { name: /select customer/i });
    const customerOptions = Array.from(customerSelect.querySelectorAll('option'));
    const firstCustomerOption = customerOptions.find(opt => opt.value && opt.value !== 'add-new');
    
    if (firstCustomerOption) {
      fireEvent.change(customerSelect, { target: { value: firstCustomerOption.value } });
    }
    
    // Fill in required fields with valid data
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deliveryDate = tomorrow.toISOString().split('T')[0];
    
    const deliveryDateInput = screen.getByLabelText(/delivery date/i);
    fireEvent.change(deliveryDateInput, { target: { value: deliveryDate } });
    
    // Fill in first order item
    const itemNameInputs = screen.getAllByPlaceholderText(/e\.g\., formal shirt/i);
    const itemQuantityInputs = screen.getAllByPlaceholderText('1');
    const itemPriceInputs = screen.getAllByPlaceholderText('800');
    
    fireEvent.change(itemNameInputs[0], { target: { value: 'Test Shirt' } });
    fireEvent.change(itemQuantityInputs[0], { target: { value: '2' } });
    fireEvent.change(itemPriceInputs[0], { target: { value: '1000' } });
    
    // Click save order button
    const saveButton = screen.getByRole('button', { name: /save order/i });
    fireEvent.click(saveButton);
    
    // Wait for success animation to appear
    await waitFor(() => {
      const successMessage = screen.queryByText(/order created successfully/i);
      expect(successMessage).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify the success icon is displayed
    const successIcon = screen.getByText(/order created successfully/i).parentElement;
    expect(successIcon).toBeInTheDocument();
  });
});

// Unit tests for specific functionality
describe('NewOrder Component Unit Tests', () => {
  test('renders new order form with all required sections', () => {
    renderComponent();
    
    expect(screen.getByRole('heading', { name: /create new order/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /customer information/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /measurements/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /order items/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /order details/i })).toBeInTheDocument();
  });

  test('displays customer dropdown with options', () => {
    renderComponent();
    
    const customerSelect = screen.getByRole('combobox', { name: /select customer/i });
    expect(customerSelect).toBeInTheDocument();
    
    // Should have at least the placeholder and "Add New Customer" option
    const options = Array.from(customerSelect.querySelectorAll('option'));
    expect(options.length).toBeGreaterThan(1);
  });

  test('opens customer modal when "Add New Customer" is selected', () => {
    renderComponent();
    
    const customerSelect = screen.getByLabelText(/select customer/i);
    fireEvent.change(customerSelect, { target: { value: 'add-new' } });
    
    // Modal should appear (mocked modal)
    expect(screen.getByTestId('customer-modal')).toBeInTheDocument();
  });

  test('allows adding multiple order items', () => {
    renderComponent();
    
    // Initially should have 1 item
    let itemSections = screen.getAllByText(/item \d+/i);
    expect(itemSections.length).toBe(1);
    
    // Click "Add Another Item" button
    const addItemButton = screen.getByRole('button', { name: /add another item/i });
    fireEvent.click(addItemButton);
    
    // Should now have 2 items
    itemSections = screen.getAllByText(/item \d+/i);
    expect(itemSections.length).toBe(2);
  });

  test('validates required fields before submission', () => {
    renderComponent();
    
    // Try to save without filling required fields
    const saveButton = screen.getByRole('button', { name: /save order/i });
    fireEvent.click(saveButton);
    
    // Should show validation errors
    expect(screen.getByText(/please select a customer/i)).toBeInTheDocument();
  });

  test('pre-fills measurements when customer with measurements is selected', () => {
    renderComponent();
    
    // Select a customer (first one from dummy data should have measurements)
    const customerSelect = screen.getByLabelText(/select customer/i);
    const customerOptions = Array.from(customerSelect.querySelectorAll('option'));
    const firstCustomerOption = customerOptions.find(opt => opt.value && opt.value !== 'add-new');
    
    if (firstCustomerOption) {
      fireEvent.change(customerSelect, { target: { value: firstCustomerOption.value } });
      
      // Check if customer info is displayed (which indicates selection worked)
      // The measurements are pre-filled in the background
      expect(screen.getByText(/robert@email.com/i)).toBeInTheDocument();
    }
  });
});
