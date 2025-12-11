// Comprehensive dummy data for Smart Tailoring Management System

export const owners = [
  {
    id: 'OWN001',
    name: 'John Owner',
    email: 'owner@smartstitch.com',
    phone: '+1234567890',
    shopName: 'Smart Stitch Tailors',
    address: '123 Fashion Street, NY 10001',
    role: 'owner'
  }
];

export const workers = [
  {
    id: 'WORK001',
    name: 'Mike Tailor',
    email: 'mike@smartstitch.com',
    phone: '+1234567891',
    specialization: 'Shirts & Formal Wear',
    joinDate: '2023-01-15',
    status: 'active',
    assignedOrders: 5,
    completedOrders: 145,
    rating: 4.8,
    performance: 92,
    salary: 3000,
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 'WORK002',
    name: 'Sarah Stitcher',
    email: 'sarah@smartstitch.com',
    phone: '+1234567892',
    specialization: 'Traditional & Ethnic Wear',
    joinDate: '2023-03-20',
    status: 'active',
    assignedOrders: 3,
    completedOrders: 98,
    rating: 4.6,
    performance: 88,
    salary: 2800,
    avatar: 'https://i.pravatar.cc/150?img=45'
  },
  {
    id: 'WORK003',
    name: 'David Designer',
    email: 'david@smartstitch.com',
    phone: '+1234567893',
    specialization: 'Wedding & Party Wear',
    joinDate: '2023-06-10',
    status: 'active',
    assignedOrders: 4,
    completedOrders: 67,
    rating: 4.9,
    performance: 95,
    salary: 3200,
    avatar: 'https://i.pravatar.cc/150?img=33'
  },
  {
    id: 'WORK004',
    name: 'Emma Expert',
    email: 'emma@smartstitch.com',
    phone: '+1234567894',
    specialization: 'Alterations & Repairs',
    joinDate: '2023-08-05',
    status: 'on-leave',
    assignedOrders: 0,
    completedOrders: 45,
    rating: 4.5,
    performance: 85,
    salary: 2500,
    avatar: 'https://i.pravatar.cc/150?img=23'
  }
];

export const customers = [
  {
    id: 'CUST001',
    name: 'Robert Johnson',
    email: 'robert@email.com',
    phone: '+1234567895',
    address: '456 Main St, NY 10002',
    joinDate: '2023-05-10',
    totalOrders: 12,
    totalSpent: 15000,
    measurements: {
      shirt: { chest: 40, waist: 34, shoulder: 17, length: 30 },
      pant: { waist: 34, length: 42, hip: 38 }
    },
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  {
    id: 'CUST002',
    name: 'Emily Davis',
    email: 'emily@email.com',
    phone: '+1234567896',
    address: '789 Oak Ave, NY 10003',
    joinDate: '2023-07-22',
    totalOrders: 8,
    totalSpent: 9500,
    measurements: {
      blouse: { bust: 36, waist: 30, length: 24 },
      saree: { blouse: 36, petticoat: 30 }
    },
    avatar: 'https://i.pravatar.cc/150?img=47'
  },
  {
    id: 'CUST003',
    name: 'Michael Brown',
    email: 'michael@email.com',
    phone: '+1234567897',
    address: '321 Pine Rd, NY 10004',
    joinDate: '2023-09-15',
    totalOrders: 5,
    totalSpent: 6200,
    measurements: {
      shirt: { chest: 42, waist: 36, shoulder: 18, length: 31 },
      pant: { waist: 36, length: 43, hip: 40 }
    },
    avatar: 'https://i.pravatar.cc/150?img=15'
  }
];

export const orders = [
  {
    id: 'ORD001',
    customerId: 'CUST001',
    customerName: 'Robert Johnson',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-25',
    status: 'stitching',
    priority: 'high',
    items: [
      {
        id: 'ITEM001',
        type: 'Formal Shirt',
        fabric: 'Premium Cotton',
        color: 'White',
        quantity: 2,
        price: 800
      },
      {
        id: 'ITEM002',
        type: 'Formal Pant',
        fabric: 'Wool Blend',
        color: 'Navy Blue',
        quantity: 1,
        price: 1200
      }
    ],
    assignedWorker: 'WORK001',
    workerName: 'Mike Tailor',
    totalAmount: 2800,
    paidAmount: 1500,
    balanceAmount: 1300,
    measurements: {
      shirt: { chest: 40, waist: 34, shoulder: 17, length: 30 },
      pant: { waist: 34, length: 42, hip: 38 }
    },
    notes: 'Customer prefers slim fit',
    timeline: [
      { status: 'ordered', date: '2024-01-15', time: '10:30 AM' },
      { status: 'cutting', date: '2024-01-16', time: '02:00 PM' },
      { status: 'stitching', date: '2024-01-18', time: '09:00 AM' }
    ]
  },
  {
    id: 'ORD002',
    customerId: 'CUST002',
    customerName: 'Emily Davis',
    orderDate: '2024-01-18',
    deliveryDate: '2024-01-28',
    status: 'cutting',
    priority: 'medium',
    items: [
      {
        id: 'ITEM003',
        type: 'Designer Blouse',
        fabric: 'Silk',
        color: 'Red',
        quantity: 1,
        price: 1500
      }
    ],
    assignedWorker: 'WORK002',
    workerName: 'Sarah Stitcher',
    totalAmount: 1500,
    paidAmount: 500,
    balanceAmount: 1000,
    measurements: {
      blouse: { bust: 36, waist: 30, length: 24 }
    },
    notes: 'Heavy embroidery work required',
    timeline: [
      { status: 'ordered', date: '2024-01-18', time: '11:00 AM' },
      { status: 'cutting', date: '2024-01-19', time: '03:00 PM' }
    ]
  },
  {
    id: 'ORD003',
    customerId: 'CUST003',
    customerName: 'Michael Brown',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-05',
    status: 'ready',
    priority: 'low',
    items: [
      {
        id: 'ITEM004',
        type: 'Wedding Sherwani',
        fabric: 'Brocade',
        color: 'Golden',
        quantity: 1,
        price: 5000
      }
    ],
    assignedWorker: 'WORK003',
    workerName: 'David Designer',
    totalAmount: 5000,
    paidAmount: 5000,
    balanceAmount: 0,
    measurements: {
      sherwani: { chest: 42, waist: 36, shoulder: 18, length: 42 }
    },
    notes: 'Premium quality, intricate work',
    timeline: [
      { status: 'ordered', date: '2024-01-20', time: '10:00 AM' },
      { status: 'cutting', date: '2024-01-21', time: '11:00 AM' },
      { status: 'stitching', date: '2024-01-23', time: '09:00 AM' },
      { status: 'fitting', date: '2024-01-28', time: '04:00 PM' },
      { status: 'ready', date: '2024-01-30', time: '02:00 PM' }
    ]
  }
];

export const inventory = [
  {
    id: 'INV001',
    name: 'Premium Cotton',
    category: 'Fabric',
    quantity: 150,
    unit: 'meters',
    minStock: 50,
    price: 300,
    supplier: 'Fabric World',
    lastRestocked: '2024-01-10'
  },
  {
    id: 'INV002',
    name: 'Silk Fabric',
    category: 'Fabric',
    quantity: 80,
    unit: 'meters',
    minStock: 30,
    price: 800,
    supplier: 'Silk Emporium',
    lastRestocked: '2024-01-12'
  },
  {
    id: 'INV003',
    name: 'Buttons - Pearl',
    category: 'Accessories',
    quantity: 500,
    unit: 'pieces',
    minStock: 200,
    price: 5,
    supplier: 'Button Mart',
    lastRestocked: '2024-01-08'
  },
  {
    id: 'INV004',
    name: 'Thread - Polyester',
    category: 'Thread',
    quantity: 25,
    unit: 'spools',
    minStock: 50,
    price: 50,
    supplier: 'Thread House',
    lastRestocked: '2023-12-28',
    lowStock: true
  },
  {
    id: 'INV005',
    name: 'Zippers - Metal',
    category: 'Accessories',
    quantity: 150,
    unit: 'pieces',
    minStock: 100,
    price: 15,
    supplier: 'Zipper World',
    lastRestocked: '2024-01-15'
  }
];

export const catalogue = [
  {
    id: 'CAT001',
    name: 'Classic Formal Shirt',
    category: 'Shirts',
    description: 'Premium cotton formal shirt with perfect fit',
    basePrice: 800,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
    fabrics: ['Cotton', 'Linen', 'Silk'],
    colors: ['White', 'Blue', 'Black', 'Grey'],
    popular: true
  },
  {
    id: 'CAT002',
    name: 'Designer Kurta',
    category: 'Ethnic Wear',
    description: 'Traditional kurta with modern design',
    basePrice: 1200,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
    fabrics: ['Cotton', 'Silk', 'Khadi'],
    colors: ['White', 'Cream', 'Blue', 'Green'],
    popular: true
  },
  {
    id: 'CAT003',
    name: 'Wedding Sherwani',
    category: 'Wedding Wear',
    description: 'Luxurious sherwani for special occasions',
    basePrice: 5000,
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400',
    fabrics: ['Brocade', 'Silk', 'Velvet'],
    colors: ['Golden', 'Maroon', 'Cream', 'Royal Blue'],
    popular: true
  },
  {
    id: 'CAT004',
    name: 'Formal Blazer',
    category: 'Blazers',
    description: 'Tailored blazer for professional look',
    basePrice: 3500,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    fabrics: ['Wool', 'Polyester Blend', 'Linen'],
    colors: ['Black', 'Navy', 'Grey', 'Brown'],
    popular: false
  }
];

export const reviews = [
  {
    id: 'REV001',
    customerId: 'CUST001',
    customerName: 'Robert Johnson',
    orderId: 'ORD001',
    rating: 5,
    comment: 'Excellent work! Perfect fit and great quality.',
    date: '2024-01-10',
    workerId: 'WORK001'
  },
  {
    id: 'REV002',
    customerId: 'CUST002',
    customerName: 'Emily Davis',
    orderId: 'ORD002',
    rating: 4,
    comment: 'Good service, but delivery was slightly delayed.',
    date: '2024-01-12',
    workerId: 'WORK002'
  },
  {
    id: 'REV003',
    customerId: 'CUST003',
    customerName: 'Michael Brown',
    orderId: 'ORD003',
    rating: 5,
    comment: 'Outstanding craftsmanship! Highly recommended.',
    date: '2024-01-15',
    workerId: 'WORK003'
  }
];

export const notifications = [
  {
    id: 'NOT001',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #ORD001 from Robert Johnson',
    date: '2024-01-15',
    read: false,
    priority: 'high'
  },
  {
    id: 'NOT002',
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Thread - Polyester is running low',
    date: '2024-01-16',
    read: false,
    priority: 'medium'
  },
  {
    id: 'NOT003',
    type: 'delivery',
    title: 'Order Ready for Delivery',
    message: 'Order #ORD003 is ready for pickup',
    date: '2024-01-17',
    read: true,
    priority: 'low'
  }
];

export const chatMessages = [
  {
    id: 'MSG001',
    senderId: 'OWN001',
    senderName: 'John Owner',
    receiverId: 'WORK001',
    receiverName: 'Mike Tailor',
    message: 'Please prioritize Order #ORD001',
    timestamp: '2024-01-15 10:30 AM',
    read: true
  },
  {
    id: 'MSG002',
    senderId: 'WORK001',
    senderName: 'Mike Tailor',
    receiverId: 'OWN001',
    receiverName: 'John Owner',
    message: 'Sure, I will complete it by tomorrow',
    timestamp: '2024-01-15 10:35 AM',
    read: true
  }
];

export const analytics = {
  daily: {
    orders: 5,
    revenue: 12000,
    completed: 3,
    pending: 2
  },
  weekly: {
    orders: [12, 15, 18, 14, 20, 17, 22],
    revenue: [15000, 18000, 22000, 17000, 25000, 21000, 28000],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  monthly: {
    totalOrders: 85,
    totalRevenue: 125000,
    completedOrders: 78,
    pendingOrders: 7,
    cancelledOrders: 0
  }
};

export const dashboardStats = {
  owner: {
    totalOrders: 85,
    activeOrders: 12,
    completedOrders: 73,
    totalRevenue: 125000,
    monthlyRevenue: 28000,
    totalCustomers: 45,
    activeWorkers: 3,
    lowStockItems: 2,
    pendingPayments: 15000,
    avgRating: 4.7
  },
  worker: {
    assignedTasks: 5,
    completedTasks: 145,
    pendingTasks: 3,
    inProgressTasks: 2,
    totalEarnings: 45000,
    monthlyEarnings: 3000,
    avgRating: 4.8,
    performance: 92
  },
  customer: {
    totalOrders: 12,
    activeOrders: 2,
    completedOrders: 10,
    totalSpent: 15000,
    savedMeasurements: 3,
    wishlistItems: 5,
    cartItems: 2
  }
};
