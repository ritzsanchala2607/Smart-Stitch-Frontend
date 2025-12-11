# Smart Tailoring Management System - Project Structure

## 📁 Complete Folder Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx (✅ Already exists - will be updated)
│   │   ├── Signup.jsx (✅ Already exists - will be updated)
│   │   └── ForgotPasswordModal.jsx (✅ Already exists)
│   │
│   ├── common/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Chart.jsx
│   │   ├── Badge.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Loader.jsx
│   │   └── AnimatedBackground.jsx
│   │
│   ├── owner/
│   │   ├── Dashboard.jsx
│   │   ├── WorkerManagement.jsx
│   │   ├── CustomerManagement.jsx
│   │   ├── OrderManagement.jsx
│   │   ├── BillingReports.jsx
│   │   ├── InventoryManagement.jsx
│   │   ├── RatingsFeedback.jsx
│   │   └── InternalChat.jsx
│   │
│   ├── worker/
│   │   ├── Dashboard.jsx
│   │   ├── TaskManagement.jsx
│   │   ├── WorkProgress.jsx
│   │   ├── Statistics.jsx
│   │   └── Chat.jsx
│   │
│   └── customer/
│       ├── Dashboard.jsx
│       ├── MeasurementProfile.jsx
│       ├── OrderTracking.jsx
│       ├── Catalogue.jsx
│       ├── Cart.jsx
│       ├── Payment.jsx
│       └── Support.jsx
│
├── pages/
│   ├── OwnerDashboard.jsx
│   ├── WorkerDashboard.jsx
│   └── CustomerDashboard.jsx
│
├── data/
│   ├── dummyData.js
│   ├── ownerData.js
│   ├── workerData.js
│   └── customerData.js
│
├── context/
│   └── AuthContext.jsx
│
├── utils/
│   ├── helpers.js
│   └── constants.js
│
├── routes/
│   └── AppRoutes.jsx
│
├── App.jsx
├── index.jsx
└── index.css
```

## 🎨 Design System

### Color Palette
```css
Primary: #FF6B35 (Orange)
Secondary: #004E89 (Navy Blue)
Accent: #1A936F (Teal)
Background: #F7F9FC (Light Grey)
Text: #2C3E50 (Dark Grey)
Success: #27AE60
Warning: #F39C12
Error: #E74C3C
```

### Icons (Lucide React)
- Scissors (cutting)
- Ruler (measurement)
- Package (orders)
- Users (customers/workers)
- TrendingUp (analytics)
- Calendar (scheduling)
- DollarSign (billing)
- MessageSquare (chat)
- Star (ratings)
- ShoppingCart (catalogue)

## 🔐 User Roles & Routes

### Owner Routes
- `/owner/dashboard`
- `/owner/workers`
- `/owner/customers`
- `/owner/orders`
- `/owner/billing`
- `/owner/inventory`
- `/owner/ratings`
- `/owner/chat`

### Worker Routes
- `/worker/dashboard`
- `/worker/tasks`
- `/worker/progress`
- `/worker/statistics`
- `/worker/chat`

### Customer Routes
- `/customer/dashboard`
- `/customer/measurements`
- `/customer/orders`
- `/customer/catalogue`
- `/customer/cart`
- `/customer/payment`
- `/customer/support`

## 📦 Features Implementation Status

### Phase 1: Core Setup ✅
- Project structure
- Routing
- Authentication context
- Dummy data
- Common components

### Phase 2: Owner Dashboard 🔄
- Analytics dashboard
- Worker management
- Customer management
- Order management
- Billing & reports
- Inventory
- Ratings & feedback
- Internal chat

### Phase 3: Worker Dashboard 🔄
- Task list
- Work progress tracker
- Statistics
- Chat with owner

### Phase 4: Customer Dashboard 🔄
- Measurement profiles
- Order tracking
- Catalogue browsing
- Cart & payment
- Support system

## 🚀 Getting Started

1. All dependencies already installed
2. Run `npm start` to start development server
3. Login with dummy credentials:
   - Owner: owner@smartstitch.com / password123
   - Worker: worker@smartstitch.com / password123
   - Customer: customer@smartstitch.com / password123

## 📝 Notes

- All data is static/dummy for now
- No backend integration
- Paste prevention enabled on all password fields
- Fully responsive design
- Smooth animations with Framer Motion
- Tailwind CSS for styling
