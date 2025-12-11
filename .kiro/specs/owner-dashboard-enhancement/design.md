# Design Document: Owner Dashboard Enhancement

## Overview

The Owner Dashboard Enhancement extends the Smart Stitch tailoring management system with comprehensive frontend functionality for shop owners. This design implements seven new pages (New Order, Add Worker, Worker Details, Add Customer, Invoice Generation, Owner Profile) plus global search functionality, all built as a single-page application using React.js with client-side routing and state management.

The architecture follows React best practices with component composition, Context API for global state, and a consistent layout pattern using Sidebar and Topbar components. All functionality is frontend-only, using dummy data from a centralized data module, with no backend API integration. The design emphasizes user experience through smooth animations, responsive layouts, and a professional tailoring-themed aesthetic.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application Layer                   │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Context Providers                        │  │  │
│  │  │  - AuthContext (existing)                        │  │  │
│  │  │  - SearchContext (new)                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         React Router                             │  │  │
│  │  │  - Route definitions                             │  │  │
│  │  │  - Protected routes                              │  │  │
│  │  │  - Navigation handling                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Page Components                          │  │  │
│  │  │  - NewOrder.jsx                                  │  │  │
│  │  │  - AddWorker.jsx                                 │  │  │
│  │  │  - WorkerDetails.jsx                             │  │  │
│  │  │  - AddCustomer.jsx                               │  │  │
│  │  │  - InvoicePage.jsx                               │  │  │
│  │  │  - OwnerProfile.jsx                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Shared Components                        │  │  │
│  │  │  - Sidebar (existing)                            │  │  │
│  │  │  - Topbar (existing)                             │  │  │
│  │  │  - WorkerCard (new)                              │  │  │
│  │  │  - CustomerCard (new)                            │  │  │
│  │  │  - AddCustomerModal (new)                        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Data Layer                               │  │  │
│  │  │  - dummyData.js (existing)                       │  │  │
│  │  │  - Component local state (useState)              │  │  │
│  │  │  - Context state (useContext)                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── BrowserRouter
│   └── AuthProvider
│       └── SearchProvider (new)
│           └── AppRoutes
│               ├── /owner/new-order → NewOrder
│               │   ├── Sidebar
│               │   ├── Topbar
│               │   └── AddCustomerModal
│               ├── /owner/add-worker → AddWorker
│               │   ├── Sidebar
│               │   ├── Topbar
│               │   └── WorkerCard[]
│               ├── /owner/worker/:id → WorkerDetails
│               │   ├── Sidebar
│               │   └── Topbar
│               ├── /owner/add-customer → AddCustomer
│               │   ├── Sidebar
│               │   ├── Topbar
│               │   └── CustomerCard[]
│               ├── /owner/invoice → InvoicePage
│               │   ├── Sidebar
│               │   └── Topbar
│               └── /owner/profile → OwnerProfile
│                   ├── Sidebar
│                   └── Topbar
```

### State Management Strategy

**Local Component State (useState)**
- Form inputs and validation
- UI toggles (modals, dropdowns)
- Temporary data before submission
- Animation states

**Context State (useContext)**
- SearchContext: Global search query and filtered results
- AuthContext: User authentication (existing)

**Data Flow**
1. Dummy data imported from centralized module
2. Component initializes with dummy data
3. User interactions update local state
4. State changes trigger UI re-renders
5. No persistence (frontend-only)

## Components and Interfaces

### New Components

#### 1. NewOrder.jsx (Page Component)

**Purpose:** Full-page form for creating new tailoring orders

**Props:** None (uses router navigation)

**State:**
```javascript
{
  selectedCustomer: string | null,
  deliveryDate: string,
  advancePayment: number,
  notes: string,
  orderItems: Array<{
    id: string,
    name: string,
    quantity: number,
    price: number,
    fabricType: string
  }>,
  measurements: {
    shirt: { chest: number, waist: number, shoulder: number, length: number },
    pant: { waist: number, length: number, hip: number },
    custom: string
  },
  showCustomerModal: boolean,
  showSuccessAnimation: boolean
}
```

**Key Methods:**
- `handleCustomerSelect(customerId)`: Updates selected customer
- `handleAddItem()`: Adds new item to order
- `handleRemoveItem(itemId)`: Removes item from order
- `handleSaveOrder()`: Validates and saves order, shows success animation
- `handleAddNewCustomer()`: Opens customer creation modal

**Layout:**
- Sidebar (left)
- Topbar (top)
- Main content area with form sections

#### 2. AddWorker.jsx (Page Component)

**Purpose:** Page for adding workers and displaying worker list

**Props:** None

**State:**
```javascript
{
  workerForm: {
    name: string,
    mobile: string,
    skill: 'Shirt' | 'Pant' | 'Both',
    experience: number,
    salary: number,
    profilePhoto: File | null
  },
  workers: Array<Worker>,
  errors: Object<string, string>
}
```

**Key Methods:**
- `handleInputChange(field, value)`: Updates form field
- `handlePhotoUpload(file)`: Handles profile photo selection
- `handleAddWorker()`: Validates and adds worker to list
- `handleViewDetails(workerId)`: Navigates to worker details
- `handleEdit(workerId)`: Opens edit modal
- `handleDelete(workerId)`: Removes worker from list

#### 3. WorkerCard.jsx (Reusable Component)

**Purpose:** Display worker information with action buttons

**Props:**
```javascript
{
  worker: {
    id: string,
    name: string,
    avatar: string,
    specialization: string,
    assignedOrders: number,
    performance: number,
    status: string
  },
  onViewDetails: (id) => void,
  onEdit: (id) => void,
  onDelete: (id) => void
}
```

**UI Elements:**
- Worker avatar
- Name and specialization
- Performance meter
- Action buttons (View, Edit, Delete)

#### 4. WorkerDetails.jsx (Page Component)

**Purpose:** Display comprehensive worker information

**Props:** None (uses router params for workerId)

**State:**
```javascript
{
  worker: Worker | null,
  assignedOrders: Array<Order>,
  showEditModal: boolean
}
```

**Sections:**
- Personal Information card
- Assigned Orders list
- Performance Meter (progress bar or chart)
- Edit button

#### 5. AddCustomer.jsx (Page Component)

**Purpose:** Page for adding customers and displaying customer list

**Props:** None

**State:**
```javascript
{
  customerForm: {
    name: string,
    mobile: string,
    email: string,
    measurements: {
      shirt: Object,
      pant: Object,
      custom: string
    },
    photo: File | null
  },
  customers: Array<Customer>,
  errors: Object<string, string>
}
```

**Key Methods:**
- `handleInputChange(field, value)`: Updates form field
- `handlePhotoUpload(file)`: Handles photo selection
- `handleAddCustomer()`: Validates and adds customer
- `handleMeasurementChange(type, field, value)`: Updates measurements

#### 6. CustomerCard.jsx (Reusable Component)

**Purpose:** Display customer information

**Props:**
```javascript
{
  customer: {
    id: string,
    name: string,
    avatar: string,
    email: string,
    phone: string,
    totalOrders: number,
    totalSpent: number
  },
  onView: (id) => void,
  onEdit: (id) => void
}
```

#### 7. InvoicePage.jsx (Page Component)

**Purpose:** Generate and display invoices

**Props:** None

**State:**
```javascript
{
  selectedCustomer: string | null,
  orderItems: Array<{
    name: string,
    quantity: number,
    price: number
  }>,
  taxRate: number,
  subtotal: number,
  tax: number,
  grandTotal: number
}
```

**Computed Values:**
- `subtotal = sum(items.quantity * items.price)`
- `tax = subtotal * taxRate`
- `grandTotal = subtotal + tax`

**Key Methods:**
- `handleCustomerSelect(customerId)`: Loads customer data
- `handleAddItem()`: Adds invoice line item
- `calculateTotals()`: Computes financial totals
- `handleDownloadPDF()`: UI-only button (no actual PDF generation)

#### 8. OwnerProfile.jsx (Page Component)

**Purpose:** Owner profile and settings management

**Props:** None

**State:**
```javascript
{
  profile: {
    name: string,
    email: string,
    mobile: string,
    shopName: string,
    address: string,
    photo: File | null
  },
  darkMode: boolean,
  showSuccessMessage: boolean
}
```

**Key Methods:**
- `handleInputChange(field, value)`: Updates profile field
- `handlePhotoUpload(file)`: Handles photo upload
- `handleSaveChanges()`: Updates profile state
- `handleToggleDarkMode()`: Toggles dark mode (UI only)

#### 9. AddCustomerModal.jsx (Modal Component)

**Purpose:** Modal for quick customer creation from New Order page

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSave: (customer) => void
}
```

**State:**
```javascript
{
  name: string,
  mobile: string,
  email: string,
  errors: Object<string, string>
}
```

#### 10. SearchContext.jsx (Context Provider)

**Purpose:** Global search state management

**Context Value:**
```javascript
{
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  filterOrders: (orders: Array) => Array,
  filterCustomers: (customers: Array) => Array,
  filterWorkers: (workers: Array) => Array
}
```

**Filter Logic:**
- Case-insensitive string matching
- Searches across multiple fields (name, id, email, phone)
- Returns filtered array

### Modified Components

#### Sidebar.jsx

**New Menu Items:**
```javascript
{ icon: Plus, label: 'New Order', path: '/owner/new-order' },
{ icon: UserPlus, label: 'Add Worker', path: '/owner/add-worker' },
{ icon: UserPlus, label: 'Add Customer', path: '/owner/add-customer' },
{ icon: FileText, label: 'Generate Invoice', path: '/owner/invoice' },
{ icon: Settings, label: 'Profile & Settings', path: '/owner/profile' }
```

#### Topbar.jsx

**New Feature:**
- Search bar component integrated
- Connected to SearchContext
- Real-time filtering as user types

#### AppRoutes.jsx

**New Routes:**
```javascript
<Route path="/owner/new-order" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
<Route path="/owner/add-worker" element={<ProtectedRoute><AddWorker /></ProtectedRoute>} />
<Route path="/owner/worker/:id" element={<ProtectedRoute><WorkerDetails /></ProtectedRoute>} />
<Route path="/owner/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
<Route path="/owner/invoice" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
<Route path="/owner/profile" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />
```

## Data Models

### Order Model
```javascript
{
  id: string,                    // e.g., "ORD001"
  customerId: string,
  customerName: string,
  orderDate: string,             // ISO date string
  deliveryDate: string,          // ISO date string
  status: 'pending' | 'cutting' | 'stitching' | 'fitting' | 'ready',
  priority: 'low' | 'medium' | 'high',
  items: Array<OrderItem>,
  assignedWorker: string | null,
  workerName: string | null,
  totalAmount: number,
  paidAmount: number,
  balanceAmount: number,
  measurements: Measurements,
  notes: string,
  timeline: Array<TimelineEvent>
}
```

### OrderItem Model
```javascript
{
  id: string,
  type: string,                  // e.g., "Formal Shirt"
  fabric: string,                // e.g., "Premium Cotton"
  color: string,
  quantity: number,
  price: number
}
```

### Worker Model
```javascript
{
  id: string,                    // e.g., "WORK001"
  name: string,
  email: string,
  phone: string,
  specialization: string,        // e.g., "Shirts & Formal Wear"
  joinDate: string,
  status: 'active' | 'on-leave' | 'inactive',
  assignedOrders: number,
  completedOrders: number,
  rating: number,                // 0-5
  performance: number,           // 0-100 percentage
  salary: number,
  avatar: string                 // URL or data URI
}
```

### Customer Model
```javascript
{
  id: string,                    // e.g., "CUST001"
  name: string,
  email: string,
  phone: string,
  address: string,
  joinDate: string,
  totalOrders: number,
  totalSpent: number,
  measurements: Measurements,
  avatar: string
}
```

### Measurements Model
```javascript
{
  shirt?: {
    chest: number,
    waist: number,
    shoulder: number,
    length: number
  },
  pant?: {
    waist: number,
    length: number,
    hip: number
  },
  blouse?: {
    bust: number,
    waist: number,
    length: number
  },
  custom?: string                // Free-form text for special measurements
}
```

### Invoice Model
```javascript
{
  id: string,
  invoiceNumber: string,
  date: string,
  owner: {
    name: string,
    shopName: string,
    address: string,
    phone: string,
    email: string
  },
  customer: {
    name: string,
    address: string,
    phone: string,
    email: string
  },
  items: Array<{
    description: string,
    quantity: number,
    unitPrice: number,
    total: number
  }>,
  subtotal: number,
  taxRate: number,
  tax: number,
  grandTotal: number,
  notes: string
}
```

### OwnerProfile Model
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  shopName: string,
  address: string,
  photo: string,
  preferences: {
    darkMode: boolean,
    notifications: boolean,
    language: string
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Order save triggers state update and animation
*For any* valid order data (with customer, items, and delivery date), when the owner saves the order, the system should update the UI state and display a success animation.
**Validates: Requirements 1.6**

### Property 2: Worker addition updates state
*For any* valid worker data (with name, mobile, skill, experience, and salary), when the owner adds the worker, the system should update the frontend state to include the new worker.
**Validates: Requirements 2.4**

### Property 3: Worker list renders as cards
*For any* list of workers in the application state, the system should render each worker as a Worker Card component below the form.
**Validates: Requirements 2.5**

### Property 4: Worker cards contain required action buttons
*For any* Worker Card displayed, the card should include View Details, Edit, and Delete buttons.
**Validates: Requirements 2.6**

### Property 5: Worker details displays assigned orders
*For any* worker with assigned orders, when the Worker Details page loads, the system should display the list of those assigned orders.
**Validates: Requirements 3.2**

### Property 6: Performance metrics visualization
*For any* worker with a performance value, when performance metrics are shown, the system should display the value using a performance meter (progress bar or chart).
**Validates: Requirements 3.3**

### Property 7: Customer addition updates state
*For any* valid customer data (with name, mobile, and email), when the owner creates the customer, the system should update the frontend state to include the new customer.
**Validates: Requirements 4.3**

### Property 8: Customer list renders as cards
*For any* list of customers in the application state, the system should render each customer as a Customer Card component below the form.
**Validates: Requirements 4.4**

### Property 9: Customer cards display information and actions
*For any* Customer Card displayed, the card should show customer information (name, contact details) and include action buttons.
**Validates: Requirements 4.5**

### Property 10: Invoice displays selected customer information
*For any* customer selected in the invoice form, the system should display that customer's information (name, address, contact) in the invoice.
**Validates: Requirements 5.3**

### Property 11: Invoice items render in table format
*For any* set of order items added to an invoice, the system should display them in a table format showing quantities and prices.
**Validates: Requirements 5.4**

### Property 12: Invoice calculations are accurate
*For any* set of invoice items and tax rate, when calculations are performed, the system should correctly compute subtotal (sum of item totals), tax (subtotal × tax rate), and grand total (subtotal + tax).
**Validates: Requirements 5.5**

### Property 13: Search filters displayed items
*For any* search query entered in the search bar, the system should filter the currently displayed items (orders, customers, or workers) to show only matching results.
**Validates: Requirements 6.1**

### Property 14: Order search matches correctly
*For any* order and search query, when filtering orders, the system should match the query against order properties (id, customer name, status) using case-insensitive comparison.
**Validates: Requirements 6.2**

### Property 15: Customer search matches correctly
*For any* customer and search query, when filtering customers, the system should match the query against customer properties (name, email, phone) using case-insensitive comparison.
**Validates: Requirements 6.3**

### Property 16: Worker search matches correctly
*For any* worker and search query, when filtering workers, the system should match the query against worker properties (name, specialization, email) using case-insensitive comparison.
**Validates: Requirements 6.4**

### Property 17: Profile save updates state
*For any* valid profile data (with name, email, mobile, shop name, and address), when the owner saves changes, the system should update the frontend state with the new profile information.
**Validates: Requirements 7.4**

### Property 18: Dark mode toggle reflects state
*For any* dark mode toggle state (on or off), the UI should reflect the current state visually in the toggle switch.
**Validates: Requirements 7.5**

## Error Handling

### Form Validation

**Order Form Validation:**
- Customer selection: Required field
- Delivery date: Must be a future date
- Order items: At least one item required
- Item quantity: Must be positive integer
- Item price: Must be positive number
- Advance payment: Must be non-negative and ≤ total amount

**Worker Form Validation:**
- Name: Required, 2-50 characters
- Mobile: Required, valid phone format (10-15 digits)
- Skill: Required, must be one of: Shirt, Pant, Both
- Experience: Required, non-negative integer
- Salary: Required, positive number
- Profile photo: Optional, must be image file (jpg, png, gif) if provided

**Customer Form Validation:**
- Name: Required, 2-50 characters
- Mobile: Required, valid phone format
- Email: Required, valid email format
- Measurements: Optional, but if provided, must be positive numbers
- Photo: Optional, must be image file if provided

**Invoice Form Validation:**
- Customer: Required selection
- Items: At least one item required
- Item description: Required for each item
- Quantity: Positive integer for each item
- Unit price: Positive number for each item
- Tax rate: Non-negative percentage (0-100)

**Profile Form Validation:**
- Name: Required, 2-50 characters
- Email: Required, valid email format
- Mobile: Required, valid phone format
- Shop name: Required, 2-100 characters
- Address: Required, 10-200 characters

### Error Display Strategy

**Inline Validation:**
- Display error messages below form fields
- Red border on invalid fields
- Error icon next to field label
- Real-time validation on blur or change

**Toast Notifications:**
- Success messages for completed actions
- Error messages for failed operations
- Auto-dismiss after 3-5 seconds
- Positioned at top-right of screen

**Modal Errors:**
- Critical errors displayed in modal dialogs
- Require user acknowledgment
- Provide clear action steps

### Edge Cases

**Empty States:**
- No customers: Display "No customers yet" message with "Add Customer" button
- No workers: Display "No workers yet" message with "Add Worker" button
- No orders: Display "No orders yet" message with "Create Order" button
- No search results: Display "No results found" message with clear filters option

**File Upload:**
- File too large (>5MB): Display error message
- Invalid file type: Display error message with accepted formats
- Upload failure: Display retry option

**Navigation:**
- Invalid worker ID in URL: Redirect to workers list with error message
- Unauthorized access: Redirect to login (handled by existing auth)

**Data Integrity:**
- Duplicate customer phone/email: Warn user but allow creation (frontend only)
- Negative calculations: Prevent negative values in forms
- Missing required data: Disable submit button until valid

## Testing Strategy

### Unit Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage. Unit tests verify specific examples and integration points, while property-based tests verify universal properties across all inputs.

**Unit Test Framework:** Jest with React Testing Library

**Unit Test Coverage:**

1. **Component Rendering Tests**
   - Verify each page component renders without crashing
   - Check that required UI elements are present
   - Test conditional rendering (modals, error messages)

2. **Form Interaction Tests**
   - Test form input changes update state
   - Verify form submission with valid data
   - Test form validation with invalid data
   - Check error message display

3. **Navigation Tests**
   - Verify sidebar links navigate to correct routes
   - Test back button functionality
   - Check protected route behavior

4. **Modal Tests**
   - Test modal open/close functionality
   - Verify modal form submission
   - Check modal backdrop click behavior

5. **Search Tests**
   - Test search input updates context
   - Verify search results update on query change
   - Check empty search results display

**Example Unit Tests:**

```javascript
// NewOrder.jsx
describe('NewOrder Component', () => {
  test('renders order form with all required fields', () => {
    render(<NewOrder />);
    expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/advance payment/i)).toBeInTheDocument();
  });

  test('opens customer modal when Add New Customer is clicked', () => {
    render(<NewOrder />);
    fireEvent.click(screen.getByText(/add new customer/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('displays error when saving order without customer', () => {
    render(<NewOrder />);
    fireEvent.click(screen.getByText(/save order/i));
    expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
  });
});

// WorkerCard.jsx
describe('WorkerCard Component', () => {
  const mockWorker = {
    id: 'WORK001',
    name: 'Test Worker',
    avatar: 'test.jpg',
    specialization: 'Shirts',
    assignedOrders: 5,
    performance: 85
  };

  test('renders worker information correctly', () => {
    render(<WorkerCard worker={mockWorker} />);
    expect(screen.getByText('Test Worker')).toBeInTheDocument();
    expect(screen.getByText('Shirts')).toBeInTheDocument();
  });

  test('calls onViewDetails when View Details button is clicked', () => {
    const handleView = jest.fn();
    render(<WorkerCard worker={mockWorker} onViewDetails={handleView} />);
    fireEvent.click(screen.getByText(/view details/i));
    expect(handleView).toHaveBeenCalledWith('WORK001');
  });
});
```

### Property-Based Testing Approach

**Property-Based Testing Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each property test tagged with comment referencing design document property
- Tag format: `// Feature: owner-dashboard-enhancement, Property {number}: {property_text}`

**Property Test Coverage:**

1. **State Update Properties (Properties 1, 2, 7, 17)**
   - Generate random valid data
   - Verify state updates correctly
   - Check UI reflects new state

2. **Rendering Properties (Properties 3, 8, 11)**
   - Generate random lists of entities
   - Verify all items render
   - Check rendering consistency

3. **Calculation Properties (Property 12)**
   - Generate random invoice items and tax rates
   - Verify mathematical accuracy
   - Check edge cases (zero items, zero tax)

4. **Search Properties (Properties 13, 14, 15, 16)**
   - Generate random data sets and queries
   - Verify filtering accuracy
   - Check case-insensitivity
   - Test partial matches

**Example Property-Based Tests:**

```javascript
import fc from 'fast-check';

// Feature: owner-dashboard-enhancement, Property 12: Invoice calculations are accurate
describe('Invoice Calculations Property', () => {
  test('calculates totals correctly for any valid invoice items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            quantity: fc.integer({ min: 1, max: 100 }),
            price: fc.float({ min: 0.01, max: 10000, noNaN: true })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.float({ min: 0, max: 0.5, noNaN: true }), // tax rate 0-50%
        (items, taxRate) => {
          const subtotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
          );
          const tax = subtotal * taxRate;
          const grandTotal = subtotal + tax;
          
          const result = calculateInvoiceTotals(items, taxRate);
          
          expect(result.subtotal).toBeCloseTo(subtotal, 2);
          expect(result.tax).toBeCloseTo(tax, 2);
          expect(result.grandTotal).toBeCloseTo(grandTotal, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: owner-dashboard-enhancement, Property 14: Order search matches correctly
describe('Order Search Property', () => {
  test('filters orders correctly for any search query', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 10 }),
            customerName: fc.string({ minLength: 3, maxLength: 30 }),
            status: fc.constantFrom('pending', 'stitching', 'ready')
          }),
          { minLength: 0, maxLength: 50 }
        ),
        fc.string({ maxLength: 20 }),
        (orders, query) => {
          const filtered = filterOrders(orders, query);
          const lowerQuery = query.toLowerCase();
          
          // All filtered results should match the query
          filtered.forEach(order => {
            const matches = 
              order.id.toLowerCase().includes(lowerQuery) ||
              order.customerName.toLowerCase().includes(lowerQuery) ||
              order.status.toLowerCase().includes(lowerQuery);
            expect(matches).toBe(true);
          });
          
          // All matching orders should be in filtered results
          orders.forEach(order => {
            const shouldMatch = 
              order.id.toLowerCase().includes(lowerQuery) ||
              order.customerName.toLowerCase().includes(lowerQuery) ||
              order.status.toLowerCase().includes(lowerQuery);
            if (shouldMatch) {
              expect(filtered).toContainEqual(order);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: owner-dashboard-enhancement, Property 3: Worker list renders as cards
describe('Worker List Rendering Property', () => {
  test('renders all workers as cards for any worker list', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 10 }),
            name: fc.string({ minLength: 3, maxLength: 30 }),
            specialization: fc.string({ minLength: 5, maxLength: 30 }),
            performance: fc.integer({ min: 0, max: 100 })
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (workers) => {
          const { container } = render(<WorkerList workers={workers} />);
          const cards = container.querySelectorAll('[data-testid="worker-card"]');
          expect(cards.length).toBe(workers.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Integration Test Scenarios:**

1. **Complete Order Creation Flow**
   - Navigate to New Order page
   - Select customer
   - Add measurements
   - Add order items
   - Save order
   - Verify success message
   - Verify order appears in orders list

2. **Worker Management Flow**
   - Navigate to Add Worker page
   - Fill worker form
   - Add worker
   - View worker in list
   - Click View Details
   - Verify worker details page

3. **Search Flow**
   - Enter search query
   - Verify filtered results
   - Clear search
   - Verify all items return

4. **Invoice Generation Flow**
   - Navigate to Invoice page
   - Select customer
   - Add items
   - Verify calculations
   - Check invoice preview

### Test Data Generators

**Custom Generators for Property Tests:**

```javascript
// generators.js
import fc from 'fast-check';

export const workerGenerator = fc.record({
  id: fc.string({ minLength: 7, maxLength: 7 }).map(s => 'WORK' + s.slice(0, 3)),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s),
  specialization: fc.constantFrom('Shirts & Formal Wear', 'Traditional Wear', 'Alterations'),
  status: fc.constantFrom('active', 'on-leave', 'inactive'),
  assignedOrders: fc.integer({ min: 0, max: 20 }),
  performance: fc.integer({ min: 0, max: 100 }),
  salary: fc.integer({ min: 2000, max: 5000 })
});

export const customerGenerator = fc.record({
  id: fc.string({ minLength: 7, maxLength: 7 }).map(s => 'CUST' + s.slice(0, 3)),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s),
  totalOrders: fc.integer({ min: 0, max: 50 }),
  totalSpent: fc.integer({ min: 0, max: 50000 })
});

export const orderItemGenerator = fc.record({
  id: fc.uuid(),
  name: fc.constantFrom('Formal Shirt', 'Casual Shirt', 'Pant', 'Blazer', 'Kurta'),
  quantity: fc.integer({ min: 1, max: 10 }),
  price: fc.float({ min: 500, max: 5000, noNaN: true }),
  fabricType: fc.constantFrom('Cotton', 'Silk', 'Linen', 'Wool', 'Polyester')
});
```

## Implementation Notes

### Technology Stack

- **React:** 18.2.0
- **React Router:** 7.10.1
- **Framer Motion:** 10.16.4 (animations)
- **Lucide React:** 0.263.1 (icons)
- **Tailwind CSS:** (via PostCSS)
- **Testing:** Jest + React Testing Library + fast-check

### File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Sidebar.jsx (modified)
│   │   ├── Topbar.jsx (modified)
│   │   └── PlaceholderPage.jsx (existing)
│   ├── owner/
│   │   ├── WorkerCard.jsx (new)
│   │   ├── CustomerCard.jsx (new)
│   │   └── AddCustomerModal.jsx (new)
│   ├── Login.jsx (existing)
│   └── Signup.jsx (existing)
├── pages/
│   └── owner/
│       ├── Dashboard.jsx (existing)
│       ├── NewOrder.jsx (new)
│       ├── AddWorker.jsx (new)
│       ├── WorkerDetails.jsx (new)
│       ├── AddCustomer.jsx (new)
│       ├── InvoicePage.jsx (new)
│       └── OwnerProfile.jsx (new)
├── context/
│   ├── AuthContext.jsx (existing)
│   └── SearchContext.jsx (new)
├── data/
│   └── dummyData.js (existing, may extend)
├── routes/
│   └── AppRoutes.jsx (modified)
├── utils/
│   ├── validation.js (new)
│   └── calculations.js (new)
└── App.jsx (modified)
```

### Styling Guidelines

**Color Palette:**
```css
--primary-orange: #FF6B35
--primary-navy: #004E89
--secondary-navy: #003366
--accent-teal: #1A936F
--background-light: #F7F9FC
--background-white: #FFFFFF
--success-green: #27AE60
--warning-yellow: #F39C12
--error-red: #E74C3C
--text-dark: #1F2937
--text-medium: #6B7280
--text-light: #9CA3AF
```

**Tailwind Classes:**
- Primary buttons: `bg-orange-500 hover:bg-orange-600 text-white`
- Secondary buttons: `bg-navy-500 hover:bg-navy-600 text-white`
- Cards: `bg-white rounded-lg shadow-md p-6`
- Form inputs: `border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500`
- Error text: `text-red-600 text-sm mt-1`

**Animation Patterns:**
```javascript
// Page entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Card hover
whileHover={{ scale: 1.02, y: -5 }}

// Button press
whileTap={{ scale: 0.95 }}

// Success animation
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 200 }}
```

### Performance Considerations

**Optimization Strategies:**
- Use React.memo for card components to prevent unnecessary re-renders
- Implement debouncing for search input (300ms delay)
- Lazy load images with loading="lazy" attribute
- Use CSS transforms for animations (GPU-accelerated)
- Limit list rendering with pagination or virtual scrolling for large datasets

**Code Splitting:**
```javascript
// Lazy load pages
const NewOrder = lazy(() => import('./pages/owner/NewOrder'));
const AddWorker = lazy(() => import('./pages/owner/AddWorker'));
// ... etc
```

### Accessibility

**ARIA Labels:**
- All form inputs have associated labels
- Buttons have descriptive aria-labels
- Modals have aria-modal="true" and role="dialog"
- Search has aria-live="polite" for results

**Keyboard Navigation:**
- All interactive elements accessible via Tab
- Modal closes on Escape key
- Form submission on Enter key
- Dropdown navigation with arrow keys

**Screen Reader Support:**
- Semantic HTML elements (nav, main, section, article)
- Alt text for all images
- Status messages announced via aria-live regions

### Browser Compatibility

**Target Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Polyfills:**
- None required (React handles compatibility)

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { /* sm */ }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { /* md, lg */ }

/* Desktop */
@media (min-width: 1025px) { /* xl, 2xl */ }
```

**Responsive Patterns:**
- Sidebar collapses to hamburger menu on mobile
- Grid layouts stack vertically on mobile
- Tables convert to card layout on mobile
- Form fields stack vertically on mobile

## Security Considerations

### Frontend Security

**Input Sanitization:**
- Escape HTML in user inputs to prevent XSS
- Validate all form inputs before state updates
- Use React's built-in XSS protection (JSX escaping)

**Data Validation:**
- Client-side validation for all forms
- Type checking with PropTypes
- Boundary checks for numeric inputs

**Authentication:**
- Protected routes using existing AuthContext
- Role-based access control
- Redirect unauthorized users

**File Upload Security:**
- Validate file types (whitelist: jpg, png, gif)
- Limit file sizes (max 5MB)
- Display file preview before upload
- No actual file upload (frontend only)

### Privacy

**Data Handling:**
- All data stored in component state (temporary)
- No data persistence (frontend only)
- No external API calls
- No tracking or analytics

## Future Enhancements

### Backend Integration Preparation

**API Interface Design:**
```javascript
// Future API service structure
class OrderService {
  async createOrder(orderData) {
    // POST /api/orders
  }
  
  async getOrders(filters) {
    // GET /api/orders?...
  }
  
  async updateOrder(orderId, updates) {
    // PUT /api/orders/:id
  }
}
```

**State Management Migration:**
- Consider Redux or Zustand for complex state
- Implement optimistic updates
- Add loading states
- Handle API errors

### Advanced Features

**Potential Additions:**
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Export functionality (PDF, Excel)
- Bulk operations (bulk delete, bulk assign)
- Advanced search filters
- Sorting and pagination
- Drag-and-drop file upload
- Image cropping for photos
- Print-friendly invoice layout
- Email invoice functionality
- SMS notifications
- Calendar integration for delivery dates
- Kanban board for order tracking
- Worker performance charts
- Revenue analytics
- Inventory integration

### Scalability Considerations

**For Large Datasets:**
- Implement virtual scrolling for long lists
- Add pagination for tables
- Use infinite scroll for feeds
- Implement data caching
- Add search result limits

**For Multiple Users:**
- Add real-time sync
- Implement conflict resolution
- Add user activity logs
- Implement role permissions

## Conclusion

This design provides a comprehensive blueprint for implementing the Owner Dashboard Enhancement feature. The architecture follows React best practices with clear separation of concerns, reusable components, and a consistent user experience. The testing strategy ensures correctness through both unit tests and property-based tests, with particular emphasis on critical functionality like invoice calculations and search filtering.

The frontend-only implementation allows for rapid development and testing without backend dependencies, while the design is structured to facilitate future backend integration. All components follow the established patterns in the existing codebase, ensuring consistency and maintainability.
