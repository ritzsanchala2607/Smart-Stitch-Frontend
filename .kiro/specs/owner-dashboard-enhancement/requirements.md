# Requirements Document

## Introduction

This document specifies the requirements for enhancing the Smart Stitch Owner Dashboard with comprehensive frontend functionality. The system shall provide a complete tailoring management interface for shop owners, including order management, worker management, customer management, invoice generation, search capabilities, and profile settings. This is a frontend-only implementation using React.js, JSX, TailwindCSS, and React Router with dummy data and no backend integration.

## Glossary

- **Owner Dashboard**: The main interface for shop owners to manage their tailoring business
- **Smart Stitch**: The tailoring management system application
- **Order**: A customer request for tailoring services with associated items, measurements, and delivery details
- **Worker**: An employee who performs tailoring tasks (stitching, alterations, etc.)
- **Customer**: A client who places orders for tailoring services
- **Invoice**: A document detailing order items, costs, taxes, and payment information
- **Measurement**: Body dimensions required for tailoring garments (chest, waist, length, etc.)
- **Dummy Data**: Static JSON data used for frontend demonstration without backend connectivity
- **Search Context**: A React Context for managing global search state across components
- **Worker Card**: A reusable component displaying worker information with action buttons
- **Customer Card**: A reusable component displaying customer information with action buttons
- **Modal**: A dialog overlay for displaying forms or information without page navigation
- **Frontend Filtering**: Client-side data filtering based on search queries without server requests

## Requirements

### Requirement 1

**User Story:** As a shop owner, I want to create new orders through a dedicated page, so that I can capture all order details including customer information, measurements, items, and delivery dates.

#### Acceptance Criteria

1. WHEN the owner clicks "New Order" in the sidebar THEN the system SHALL navigate to a full-page order creation form
2. WHEN the order form loads THEN the system SHALL display a customer dropdown populated with dummy customer data
3. WHEN the owner selects "Add New Customer" option THEN the system SHALL open a modal or redirect to customer creation
4. WHEN the owner enters order details THEN the system SHALL provide input fields for delivery date, advance payment, and notes
5. WHEN the owner adds order items THEN the system SHALL provide fields for item name, quantity, price, and fabric type
6. WHEN the owner saves an order THEN the system SHALL display a success animation and update the UI state
7. WHEN measurement fields are displayed THEN the system SHALL provide separate sections for shirt measurements, pant measurements, and custom measurements

### Requirement 2

**User Story:** As a shop owner, I want to add and manage workers through a dedicated page, so that I can maintain my team information and track their skills and performance.

#### Acceptance Criteria

1. WHEN the owner navigates to Add Worker page THEN the system SHALL display a form with fields for name, mobile, skill, experience, salary, and profile photo
2. WHEN the owner selects worker skill THEN the system SHALL provide options for Shirt, Pant, or Both
3. WHEN the owner uploads a profile photo THEN the system SHALL display a file upload UI component
4. WHEN the owner clicks Add Worker button THEN the system SHALL update the frontend state with the new worker data
5. WHEN workers are added THEN the system SHALL display a list of workers below the form using Worker Card components
6. WHEN a Worker Card is displayed THEN the system SHALL include View Details, Edit, and Delete buttons
7. WHEN the owner clicks View Details THEN the system SHALL navigate to the worker details page

### Requirement 3

**User Story:** As a shop owner, I want to view detailed worker information, so that I can monitor their assigned orders, performance, and personal details.

#### Acceptance Criteria

1. WHEN the owner navigates to Worker Details page THEN the system SHALL display personal information section with worker data
2. WHEN the Worker Details page loads THEN the system SHALL display a list of assigned orders from dummy data
3. WHEN performance metrics are shown THEN the system SHALL display a performance meter using a progress bar or mock chart
4. WHEN the owner wants to edit worker information THEN the system SHALL provide an Edit Worker Information button
5. WHEN the Edit button is clicked THEN the system SHALL open a modal or navigate to an edit form

### Requirement 4

**User Story:** As a shop owner, I want to add and manage customers through a dedicated page, so that I can maintain customer profiles with contact information and measurements.

#### Acceptance Criteria

1. WHEN the owner navigates to Add Customer page THEN the system SHALL display a form with fields for name, mobile, email, and optional measurement fields
2. WHEN the owner uploads a customer photo THEN the system SHALL display a file upload UI component
3. WHEN the owner clicks Create Customer button THEN the system SHALL update the frontend state with the new customer data
4. WHEN customers are added THEN the system SHALL display a customer list below the form using Customer Card components
5. WHEN a Customer Card is displayed THEN the system SHALL show customer information with action buttons

### Requirement 5

**User Story:** As a shop owner, I want to generate invoices for orders, so that I can provide professional billing documents to customers.

#### Acceptance Criteria

1. WHEN the owner navigates to Invoice page THEN the system SHALL display an invoice generator interface
2. WHEN the invoice form loads THEN the system SHALL populate owner information from dummy data
3. WHEN the owner selects a customer THEN the system SHALL display customer information in the invoice
4. WHEN order items are added THEN the system SHALL display them in a table format with quantities and prices
5. WHEN calculations are performed THEN the system SHALL compute tax, subtotal, and grand total in the frontend
6. WHEN the owner clicks Download PDF THEN the system SHALL display a UI-only button without backend functionality

### Requirement 6

**User Story:** As a shop owner, I want to search across orders, customers, and workers, so that I can quickly find specific information without manual browsing.

#### Acceptance Criteria

1. WHEN the owner enters text in the search bar THEN the system SHALL filter displayed items based on the search query
2. WHEN filtering orders THEN the system SHALL match search text against order properties using frontend logic
3. WHEN filtering customers THEN the system SHALL match search text against customer properties using frontend logic
4. WHEN filtering workers THEN the system SHALL match search text against worker properties using frontend logic
5. WHEN search state changes THEN the system SHALL use Search Context to manage state globally across components
6. WHEN search is performed THEN the system SHALL execute filtering entirely in the frontend without backend requests

### Requirement 7

**User Story:** As a shop owner, I want to manage my profile and shop settings, so that I can update my personal information and customize the application appearance.

#### Acceptance Criteria

1. WHEN the owner clicks Settings or Profile in the sidebar THEN the system SHALL navigate to the owner profile page
2. WHEN the profile page loads THEN the system SHALL display editable fields for name, email, mobile, shop name, and address
3. WHEN the owner uploads a photo THEN the system SHALL display a photo upload UI component
4. WHEN the owner clicks Save Changes THEN the system SHALL update the frontend state without backend calls
5. WHEN the owner toggles light or dark mode THEN the system SHALL display a UI-only toggle switch

### Requirement 8

**User Story:** As a shop owner, I want a professional and modern interface with tailoring-themed design, so that the application reflects the nature of my business and provides an excellent user experience.

#### Acceptance Criteria

1. WHEN any page is displayed THEN the system SHALL use orange and navy as primary colors with clean white backgrounds
2. WHEN icons are shown THEN the system SHALL use tailoring-related icons including scissors, thread, and measurement tape
3. WHEN UI transitions occur THEN the system SHALL display smooth animations using Framer Motion
4. WHEN the application is viewed on different devices THEN the system SHALL provide a responsive layout that adapts to screen sizes
5. WHEN navigation occurs THEN the system SHALL use React Router with defined paths for all dashboard sections

### Requirement 9

**User Story:** As a shop owner, I want all pages to follow consistent routing patterns, so that I can navigate predictably throughout the application.

#### Acceptance Criteria

1. WHEN routes are configured THEN the system SHALL define /dashboard path for the main dashboard
2. WHEN routes are configured THEN the system SHALL define /dashboard/new-order path for order creation
3. WHEN routes are configured THEN the system SHALL define /dashboard/add-worker path for worker creation
4. WHEN routes are configured THEN the system SHALL define /dashboard/worker/:id path for worker details
5. WHEN routes are configured THEN the system SHALL define /dashboard/add-customer path for customer creation
6. WHEN routes are configured THEN the system SHALL define /dashboard/invoice path for invoice generation
7. WHEN routes are configured THEN the system SHALL define /dashboard/profile path for owner profile settings
