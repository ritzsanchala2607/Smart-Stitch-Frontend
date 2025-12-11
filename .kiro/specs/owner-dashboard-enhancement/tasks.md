# Implementation Plan: Owner Dashboard Enhancement

## Task List

- [x] 1. Set up SearchContext and utility functions
  - Create SearchContext.jsx for global search state management
  - Create validation.js utility for form validation functions
  - Create calculations.js utility for invoice calculations
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 5.5_

- [x] 1.1 Write property test for invoice calculations
  - **Property 12: Invoice calculations are accurate**
  - **Validates: Requirements 5.5**

- [x] 2. Update Sidebar with new navigation items
  - Add "New Order" menu item with route /owner/new-order
  - Add "Add Worker" menu item with route /owner/add-worker
  - Add "Add Customer" menu item with route /owner/add-customer
  - Add "Generate Invoice" menu item with route /owner/invoice
  - Add "Profile & Settings" menu item with route /owner/profile
  - Import new icons (Plus, UserPlus, FileText, Settings)
  - _Requirements: 9.2, 9.3, 9.5, 9.6, 9.7_

- [x] 3. Update Topbar with search functionality
  - Add search input field to Topbar component
  - Connect search input to SearchContext
  - Implement real-time search with debouncing (300ms)
  - Add search icon and clear button
  - _Requirements: 6.1_

- [x] 4. Create reusable card components
  - Create WorkerCard.jsx component with props for worker data and action callbacks
  - Create CustomerCard.jsx component with props for customer data and action callbacks
  - Implement hover animations and responsive layouts
  - Add action buttons (View Details, Edit, Delete for workers; View, Edit for customers)
  - _Requirements: 2.5, 2.6, 4.4, 4.5_

- [x] 4.1 Write property test for worker card rendering
  - **Property 3: Worker list renders as cards**
  - **Validates: Requirements 2.5**

- [x] 4.2 Write property test for worker card buttons
  - **Property 4: Worker cards contain required action buttons**
  - **Validates: Requirements 2.6**

- [x] 4.3 Write property test for customer card rendering
  - **Property 8: Customer list renders as cards**
  - **Validates: Requirements 4.4**

- [x] 4.4 Write property test for customer card display
  - **Property 9: Customer cards display information and actions**
  - **Validates: Requirements 4.5**

- [x] 5. Create AddCustomerModal component
  - Create modal component with form for quick customer creation
  - Add fields for name, mobile, and email
  - Implement form validation
  - Add close and save handlers
  - Style with Tailwind and Framer Motion animations
  - _Requirements: 1.3_

- [x] 6. Implement NewOrder page
  - Create NewOrder.jsx page component with Sidebar and Topbar layout
  - Add customer dropdown populated from dummy data
  - Add "Add New Customer" option that opens AddCustomerModal
  - Create measurement input sections (shirt, pant, custom)
  - Add order details fields (delivery date, advance payment, notes)
  - Implement order items section with add/remove functionality
  - Add item fields (name, quantity, price, fabric type)
  - Implement Save Order button with validation
  - Add success animation on save
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 6.1 Write property test for order save
  - **Property 1: Order save triggers state update and animation**
  - **Validates: Requirements 1.6**

- [x] 7. Implement AddWorker page
  - Create AddWorker.jsx page component with Sidebar and Topbar layout
  - Add form fields (name, mobile, skill dropdown, experience, salary)
  - Add profile photo upload UI component
  - Implement skill dropdown with options (Shirt, Pant, Both)
  - Add form validation
  - Implement Add Worker button with state update
  - Display worker list below form using WorkerCard components
  - Wire up View Details, Edit, and Delete button handlers
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 7.1 Write property test for worker addition
  - **Property 2: Worker addition updates state**
  - **Validates: Requirements 2.4**

- [x] 8. Implement WorkerDetails page
  - Create WorkerDetails.jsx page component with Sidebar and Topbar layout
  - Extract worker ID from route params
  - Display personal information section with worker data
  - Display assigned orders list from dummy data
  - Implement performance meter using progress bar
  - Add Edit Worker Information button
  - Implement edit modal or navigation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8.1 Write property test for assigned orders display
  - **Property 5: Worker details displays assigned orders**
  - **Validates: Requirements 3.2**

- [x] 8.2 Write property test for performance visualization
  - **Property 6: Performance metrics visualization**
  - **Validates: Requirements 3.3**

- [x] 9. Implement AddCustomer page
  - Create AddCustomer.jsx page component with Sidebar and Topbar layout
  - Add form fields (name, mobile, email)
  - Add optional measurement fields (shirt, pant, custom)
  - Add customer photo upload UI component
  - Implement form validation
  - Implement Create Customer button with state update
  - Display customer list below form using CustomerCard components
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9.1 Write property test for customer addition
  - **Property 7: Customer addition updates state**
  - **Validates: Requirements 4.3**

- [x] 10. Implement InvoicePage
  - Create InvoicePage.jsx page component with Sidebar and Topbar layout
  - Add owner information section (populated from dummy data)
  - Add customer dropdown selection
  - Implement order items table with add/remove functionality
  - Add item fields (description, quantity, unit price)
  - Implement calculation functions (subtotal, tax, grand total)
  - Display calculated totals
  - Add Download PDF button (UI only)
  - Style invoice for professional appearance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 10.1 Write property test for customer display in invoice
  - **Property 10: Invoice displays selected customer information**
  - **Validates: Requirements 5.3**

- [x] 10.2 Write property test for invoice items table
  - **Property 11: Invoice items render in table format**
  - **Validates: Requirements 5.4**

- [x] 11. Implement OwnerProfile page
  - Create OwnerProfile.jsx page component with Sidebar and Topbar layout
  - Add profile photo upload UI component
  - Add editable fields (name, email, mobile, shop name, address)
  - Implement form validation
  - Add Save Changes button with state update
  - Add dark mode toggle switch (UI only)
  - Display success message on save
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11.1 Write property test for profile save
  - **Property 17: Profile save updates state**
  - **Validates: Requirements 7.4**

- [x] 11.2 Write property test for dark mode toggle
  - **Property 18: Dark mode toggle reflects state**
  - **Validates: Requirements 7.5**

- [x] 12. Implement search filtering functionality
  - Implement filterOrders function in SearchContext
  - Implement filterCustomers function in SearchContext
  - Implement filterWorkers function in SearchContext
  - Add case-insensitive matching logic
  - Test search across multiple fields (id, name, email, phone, status)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [-] 12.1 Write property test for search filtering
  - **Property 13: Search filters displayed items**
  - **Validates: Requirements 6.1**

- [x] 12.2 Write property test for order search
  - **Property 14: Order search matches correctly**
  - **Validates: Requirements 6.2**

- [x] 12.3 Write property test for customer search
  - **Property 15: Customer search matches correctly**
  - **Validates: Requirements 6.3**

- [x] 12.4 Write property test for worker search
  - **Property 16: Worker search matches correctly**
  - **Validates: Requirements 6.4**

- [x] 13. Update AppRoutes with new routes
  - Add route for /owner/new-order → NewOrder component
  - Add route for /owner/add-worker → AddWorker component
  - Add route for /owner/worker/:id → WorkerDetails component
  - Add route for /owner/add-customer → AddCustomer component
  - Add route for /owner/invoice → InvoicePage component
  - Add route for /owner/profile → OwnerProfile component
  - Wrap all routes with ProtectedRoute and role="owner"
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 14. Update App.jsx with SearchProvider
  - Import SearchProvider from SearchContext
  - Wrap AppRoutes with SearchProvider
  - Ensure SearchProvider is inside AuthProvider
  - _Requirements: 6.5_

- [x] 15. Extend dummy data if needed
  - Review dummyData.js for completeness
  - Add additional sample data if required for testing
  - Ensure data covers edge cases (empty lists, various statuses)
  - _Requirements: All_

- [x] 16. Apply consistent styling and animations
  - Review all pages for consistent color scheme (orange, navy, white)
  - Add tailoring icons (scissors, thread, measurement tape) where appropriate
  - Implement smooth Framer Motion animations on all pages
  - Ensure responsive layouts work on mobile, tablet, and desktop
  - Test all transitions and hover effects
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Final testing and polish
  - Test all navigation flows
  - Verify form validations work correctly
  - Test search functionality across all entity types
  - Check responsive behavior on different screen sizes
  - Verify all animations are smooth
  - Test keyboard navigation and accessibility
  - Verify error handling and edge cases
  - _Requirements: All_
