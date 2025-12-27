import { useState } from 'react';
import Layout from '../../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ruler,
  Star,
  TrendingUp,
  Heart,
  Sparkles,
  Gift,
  Award,
  Clock,
  CheckCircle,
  Eye,
  Scissors,
  Image as ImageIcon,
  Bookmark,
  Palette,
  AlertCircle,
  Bell,
  MessageSquare,
  HelpCircle,
  FileText,
  Plus,
  Wallet,
  Calendar,
  Activity,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  // Mock customer data
  const customerData = {
    name: 'Robert Johnson',
    loyaltyPoints: 1250,
    tier: 'Gold',
    totalOrders: 12,
    activeOrders: 2,
    completedOrders: 10,
    pendingDelivery: 1,
    totalSpent: 15000,
    savedMeasurements: 3,
    paymentDue: 1300,
    lastPayment: 2800
  };

  // Recent orders
  const recentOrders = [
    { id: 'ORD001', garment: 'Formal Shirt', status: 'stitching', amount: 1600, delivery: '2024-01-25' },
    { id: 'ORD002', garment: 'Designer Kurta', status: 'cutting', amount: 1700, delivery: '2024-01-28' },
    { id: 'ORD003', garment: 'Wedding Sherwani', status: 'ready', amount: 5000, delivery: '2024-01-20' },
    { id: 'ORD004', garment: 'Formal Pants', status: 'delivered', amount: 1000, delivery: '2024-01-15' }
  ];

  // Notifications
  const notifications = [
    { id: 1, type: 'progress', message: 'Your order ORD001 stitching has started', time: '2 hours ago', read: false },
    { id: 2, type: 'delivery', message: 'Order ORD003 is ready for pickup', time: '5 hours ago', read: false },
    { id: 3, type: 'catalogue', message: 'New premium fabrics added in catalogue', time: '1 day ago', read: true },
    { id: 4, type: 'invoice', message: 'Invoice available for ORD004', time: '2 days ago', read: true }
  ];

  // Recommended items
  const recommendedItems = [
    { id: 'REC001', name: 'Premium Shirt', price: 800, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', popular: true },
    { id: 'REC002', name: 'Formal Pants', price: 1000, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', popular: true },
    { id: 'REC003', name: 'Designer Kurta', price: 1200, image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', popular: false },
    { id: 'REC004', name: 'Wedding Suit', price: 5000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', popular: true }
  ];

  // Measurements preview
  const measurementsPreview = {
    chest: 40,
    sleeve: 24,
    waist: 32,
    shoulder: 17
  };

  // Order trend data (last 6 months)
  const orderTrendData = [
    { month: 'Aug', orders: 2 },
    { month: 'Sep', orders: 1 },
    { month: 'Oct', orders: 3 },
    { month: 'Nov', orders: 2 },
    { month: 'Dec', orders: 3 },
    { month: 'Jan', orders: 1 }
  ];

  // Spending data
  const spendingData = [
    { month: 'Aug', amount: 2500 },
    { month: 'Sep', amount: 1200 },
    { month: 'Oct', amount: 4500 },
    { month: 'Nov', amount: 2800 },
    { month: 'Dec', amount: 3200 },
    { month: 'Jan', amount: 1700 }
  ];

  // Category distribution
  const categoryData = [
    { category: 'Shirts', count: 5, color: '#3b82f6' },
    { category: 'Pants', count: 3, color: '#10b981' },
    { category: 'Suits', count: 2, color: '#f59e0b' },
    { category: 'Kurta', count: 2, color: '#8b5cf6' }
  ];

  // Today's activity
  const todayActivity = [
    'Your shirt order progressed to Cutting stage',
    'Pant delivery expected in 2 days',
    'New catalogue items added'
  ];

  // Saved Fabrics Collection
  const [savedFabrics, setSavedFabrics] = useState([
    {
      id: 'FAB001',
      name: 'Premium Cotton',
      type: 'Cotton',
      color: 'White',
      image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400',
      price: 300,
      saved: true
    },
    {
      id: 'FAB002',
      name: 'Silk Blend',
      type: 'Silk',
      color: 'Cream',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400',
      price: 800,
      saved: true
    },
    {
      id: 'FAB003',
      name: 'Wool Fabric',
      type: 'Wool',
      color: 'Navy',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
      price: 600,
      saved: true
    }
  ]);

  // Style Inspirations Gallery
  const styleInspirations = [
    {
      id: 'STY001',
      title: 'Classic Formal Look',
      category: 'Formal',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
      likes: 245,
      trending: true
    },
    {
      id: 'STY002',
      title: 'Traditional Wedding',
      category: 'Wedding',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400',
      likes: 389,
      trending: true
    },
    {
      id: 'STY003',
      title: 'Casual Chic',
      category: 'Casual',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      likes: 156,
      trending: false
    },
    {
      id: 'STY004',
      title: 'Ethnic Elegance',
      category: 'Ethnic',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
      likes: 298,
      trending: true
    }
  ];

  // Active orders with progress
  const activeOrders = [
    {
      id: 'ORD001',
      item: 'Classic Formal Shirt',
      status: 'stitching',
      progress: 60,
      deliveryDate: '2024-01-25',
      stages: [
        { name: 'Ordered', completed: true },
        { name: 'Cutting', completed: true },
        { name: 'Stitching', completed: false },
        { name: 'Fitting', completed: false },
        { name: 'Ready', completed: false }
      ]
    },
    {
      id: 'ORD002',
      item: 'Designer Kurta',
      status: 'cutting',
      progress: 30,
      deliveryDate: '2024-01-28',
      stages: [
        { name: 'Ordered', completed: true },
        { name: 'Cutting', completed: false },
        { name: 'Stitching', completed: false },
        { name: 'Fitting', completed: false },
        { name: 'Ready', completed: false }
      ]
    }
  ];

  // Loyalty rewards
  const loyaltyRewards = [
    { points: 500, reward: '10% Off Next Order', unlocked: true },
    { points: 1000, reward: 'Free Alteration', unlocked: true },
    { points: 1500, reward: 'Premium Fabric Upgrade', unlocked: false },
    { points: 2000, reward: 'Free Custom Design', unlocked: false }
  ];

  const [selectedStyle, setSelectedStyle] = useState(null);

  // Toggle fabric save
  const toggleFabricSave = (fabricId) => {
    setSavedFabrics(savedFabrics.map(f => 
      f.id === fabricId ? { ...f, saved: !f.saved } : f
    ));
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      'Bronze': 'bg-orange-100 text-orange-700',
      'Silver': 'bg-gray-100 text-gray-700',
      'Gold': 'bg-yellow-100 text-yellow-700',
      'Platinum': 'bg-purple-100 text-purple-700'
    };
    return colors[tier] || colors['Bronze'];
  };

  return (
    <Layout role="customer">
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-4 sm:space-y-6"
        >
            {/* Header with Loyalty Points */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {customerData.name}!</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Here's your tailoring journey</p>
                </div>
              </div>
              
              {/* Loyalty Points Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 cursor-pointer w-full sm:w-auto border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loyalty Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{customerData.loyaltyPoints}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(customerData.tier)}`}>
                      {customerData.tier} Member
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Summary Cards - 5 cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard
                title="Total Orders"
                value={customerData.totalOrders}
                icon={Package}
                color="bg-blue-500"
                onClick={() => navigate('/customer/orders')}
              />
              <StatCard
                title="Active Orders"
                value={customerData.activeOrders}
                icon={Clock}
                color="bg-orange-500"
                onClick={() => navigate('/customer/orders')}
              />
              <StatCard
                title="Pending Delivery"
                value={customerData.pendingDelivery}
                icon={TrendingUp}
                color="bg-purple-500"
                onClick={() => navigate('/customer/orders')}
              />
              <StatCard
                title="Delivered"
                value={customerData.completedOrders}
                icon={CheckCircle}
                color="bg-green-500"
                onClick={() => navigate('/customer/orders')}
              />
              <StatCard
                title="Payment Due"
                value={`₹${customerData.paymentDue.toLocaleString()}`}
                icon={AlertCircle}
                color="bg-red-500"
                onClick={() => navigate('/customer/payment')}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - 2/3 */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Order Progress with Visual Animation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Active Orders Progress</h2>
                    <button
                      onClick={() => navigate('/customer/orders')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-6">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.item}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{order.deliveryDate}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{order.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${order.progress}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                            />
                          </div>
                        </div>

                        {/* Stage Timeline */}
                        <div className="flex items-center justify-between">
                          {order.stages.map((stage, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                  stage.completed
                                    ? 'bg-green-500 dark:bg-green-600'
                                    : idx === order.stages.findIndex(s => !s.completed)
                                    ? 'bg-blue-500 dark:bg-blue-600 animate-pulse'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                {stage.completed ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <Clock className="w-4 h-4 text-white" />
                                )}
                              </motion.div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{stage.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Style Inspirations Gallery */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Style Inspirations</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {styleInspirations.map((style) => (
                      <motion.div
                        key={style.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedStyle(style)}
                        className="relative rounded-lg overflow-hidden cursor-pointer group"
                      >
                        <div className="aspect-square">
                          <img
                            src={style.image}
                            alt={style.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white text-sm">{style.title}</p>
                              <p className="text-xs text-gray-300">{style.category}</p>
                            </div>
                            {style.trending && (
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Hot
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-white text-xs">
                            <Heart className="w-3 h-3" />
                            {style.likes} likes
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Saved Fabrics Collection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Saved Fabrics</h2>
                    </div>
                    <button
                      onClick={() => navigate('/customer/catalogue')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Browse More
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {savedFabrics.map((fabric) => (
                      <motion.div
                        key={fabric.id}
                        whileHover={{ scale: 1.05 }}
                        className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      >
                        <div className="aspect-square">
                          <img
                            src={fabric.image}
                            alt={fabric.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => toggleFabricSave(fabric.id)}
                          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              fabric.saved ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                            }`}
                          />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <p className="text-white text-sm font-semibold">{fabric.name}</p>
                          <p className="text-gray-300 text-xs">₹{fabric.price}/meter</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Orders Table */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Garment Type</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Amount Paid</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Delivery Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.garment}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                order.status === 'ready' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                order.status === 'stitching' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">₹{order.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.delivery}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => navigate('/customer/orders')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Recommended Items */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recommended for You</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {recommendedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => navigate('/customer/catalogue')}
                      >
                        <div className="aspect-square">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        {item.popular && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="p-3 bg-white dark:bg-gray-800">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.name}</p>
                          <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">₹{item.price.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Visual Charts */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Order Trend Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Order Trend (Last 6 Months)</h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                      {orderTrendData.map((data, idx) => {
                        const maxOrders = Math.max(...orderTrendData.map(d => d.orders));
                        const height = (data.orders / maxOrders) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{data.orders}</span>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: idx * 0.1 }}
                              className="w-full bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{data.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Spending Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Spending Trend</h3>
                    <div className="h-48 flex items-end">
                      <svg className="w-full h-full">
                        {spendingData.map((data, idx) => {
                          const maxAmount = Math.max(...spendingData.map(d => d.amount));
                          const x = (idx / (spendingData.length - 1)) * 100;
                          const y = 100 - (data.amount / maxAmount) * 100;
                          return idx < spendingData.length - 1 ? (
                            <line
                              key={idx}
                              x1={`${x}%`}
                              y1={`${y}%`}
                              x2={`${((idx + 1) / (spendingData.length - 1)) * 100}%`}
                              y2={`${100 - (spendingData[idx + 1].amount / maxAmount) * 100}%`}
                              stroke="#10b981"
                              strokeWidth="3"
                            />
                          ) : null;
                        })}
                        {spendingData.map((data, idx) => {
                          const maxAmount = Math.max(...spendingData.map(d => d.amount));
                          const x = (idx / (spendingData.length - 1)) * 100;
                          const y = 100 - (data.amount / maxAmount) * 100;
                          return (
                            <circle
                              key={idx}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="4"
                              fill="#10b981"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="flex justify-between mt-2">
                      {spendingData.map((data, idx) => (
                        <span key={idx} className="text-xs text-gray-600 dark:text-gray-400">{data.month}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Category Distribution Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Order Category Distribution</h3>
                  <div className="flex items-center gap-8">
                    <div className="w-48 h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {(() => {
                          let currentAngle = 0;
                          const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);
                          return categoryData.map((cat, idx) => {
                            const percentage = (cat.count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            currentAngle += angle;
                            
                            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                            const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                            
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={idx}
                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={cat.color}
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      {categoryData.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Today's Activity Highlights */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Today's Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {todayActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column - 1/3 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Upcoming Delivery Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Upcoming Deliveries</h2>
                  </div>
                  <div className="space-y-3">
                    {activeOrders.slice(0, 2).map((order) => (
                      <div key={order.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{order.item}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Order ID: {order.id}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Expected:</span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.deliveryDate}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full capitalize">
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Notifications Center */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                    </div>
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border ${
                          notif.read ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-gray-100">{notif.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Measurement Quick Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Measurements</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {Object.entries(measurementsPreview).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{key}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}"</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/customer/measurements')}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View All Measurements →
                  </button>
                </motion.div>

                {/* Wallet / Payment Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment Summary</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">₹{customerData.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Payment</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">₹{customerData.lastPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">₹{customerData.paymentDue.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Loyalty Rewards */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Loyalty Rewards</h2>
                  </div>

                  <div className="space-y-3">
                    {loyaltyRewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          reward.unlocked
                            ? 'bg-gray-100 dark:bg-gray-700 border-2 border-green-500 dark:border-green-400'
                            : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{reward.points} pts</span>
                          {reward.unlocked && (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{reward.reward}</p>
                        {!reward.unlocked && (
                          <div className="mt-2">
                            <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600 dark:bg-purple-400"
                                style={{
                                  width: `${Math.min((customerData.loyaltyPoints / reward.points) * 100, 100)}%`
                                }}
                              />
                            </div>
                            <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                              {reward.points - customerData.loyaltyPoints} pts to unlock
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Interaction Box */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Need Help?</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('/customer/support')}
                      className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Chat</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/support')}
                      className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Support</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/support')}
                      className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Ticket</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/support')}
                      className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Contact</span>
                    </button>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/customer/catalogue')}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Place New Order</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/measurements')}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Ruler className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Add Measurements</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/orders')}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">View Invoices</span>
                    </button>
                    <button
                      onClick={() => navigate('/customer/catalogue')}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Scissors className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Browse Catalogue</span>
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    <ActivityItem
                      icon={Package}
                      text="Order ORD001 moved to stitching"
                      time="2 hours ago"
                      color="text-blue-600 dark:text-blue-400"
                    />
                    <ActivityItem
                      icon={Star}
                      text="Earned 50 loyalty points"
                      time="1 day ago"
                      color="text-yellow-600 dark:text-yellow-400"
                    />
                    <ActivityItem
                      icon={CheckCircle}
                      text="Order ORD003 completed"
                      time="3 days ago"
                      color="text-green-600 dark:text-green-400"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
        </motion.div>
      </div>

      {/* Style Detail Modal */}
      <AnimatePresence>
        {selectedStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStyle(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
            >
              <div className="relative h-96">
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedStyle(null)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedStyle.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedStyle.category}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedStyle.likes} likes</span>
                  </div>
                  {selectedStyle.trending && (
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-semibold rounded-full flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Trending
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedStyle(null);
                    navigate('/customer/catalogue');
                  }}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Order Similar Style
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, onClick }) => {
  // Extract color name from the color class (e.g., "bg-blue-500" -> "blue")
  const colorName = color.match(/bg-(\w+)-/)?.[1] || 'blue';
  const iconColorClass = `text-${colorName}-600 dark:text-${colorName}-400`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 lg:p-6 cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColorClass}`} />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{title}</p>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">{value}</p>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ icon: Icon, text, time, color }) => {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-gray-100">{text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
