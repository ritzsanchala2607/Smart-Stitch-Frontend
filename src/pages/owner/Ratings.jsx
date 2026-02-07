import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Star, TrendingUp, Users, Award, Filter, Search,
  Eye, MessageSquare, CheckCircle, AlertCircle, Tag,
  ThumbsUp, Calendar, User, Briefcase, PieChart, Loader
} from 'lucide-react';
import { reviews, workers } from '../../data/dummyData';
import { ratingAPI, workerAPI } from '../../services/api';

const Ratings = () => {
  usePageTitle('Ratings & Feedback');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, feedback, workers, complaints
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shopRatings, setShopRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [workerRatings, setWorkerRatings] = useState([]);
  const [avgWorkerRating, setAvgWorkerRating] = useState(0);

  // Get token from localStorage
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (token) return token;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.jwt || user.token;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    return null;
  };

  // Decode JWT to get shopId
  const getShopIdFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decodedPayload = atob(payload);
      const payloadObj = JSON.parse(decodedPayload);
      
      console.log('Decoded JWT payload:', payloadObj);
      
      // Extract shopId from payload
      const shopId = payloadObj.shopId;
      console.log('Extracted shopId from JWT:', shopId);
      
      return shopId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Fetch shop ratings on mount
  useEffect(() => {
    fetchShopRatings();
    fetchWorkerRatings();
  }, []);

  const fetchShopRatings = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    // Get shopId from JWT token
    const shopId = getShopIdFromToken();
    
    if (!shopId) {
      console.error('No shopId found in JWT token');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching ratings for shopId:', shopId);
      
      // Fetch rating summary
      const summaryResponse = await ratingAPI.getShopRatingSummary(shopId, token);
      console.log('Summary response:', summaryResponse);
      if (summaryResponse.success) {
        const summaryData = summaryResponse.data;
        setRatingSummary({
          averageRating: summaryData.averageRating || 0,
          totalRatings: summaryData.totalRatings || 0
        });
      }

      // Fetch individual ratings
      const ratingsResponse = await ratingAPI.getShopRatings(shopId, token);
      console.log('Ratings response:', ratingsResponse);
      if (ratingsResponse.success) {
        const ratings = ratingsResponse.data || [];
        console.log('Shop ratings fetched:', ratings);
        setShopRatings(ratings);
      }
    } catch (error) {
      console.error('Error fetching shop ratings:', error);
    }
    
    setLoading(false);
  };

  const fetchWorkerRatings = async () => {
    const token = getToken();
    
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      // Fetch all workers for the shop
      const workersResponse = await workerAPI.getWorkers(token);
      console.log('Workers API response:', workersResponse);
      
      if (workersResponse.success) {
        // Handle different response structures
        let workers = workersResponse.data;
        
        // If data is an object with a data property, extract it
        if (workers && typeof workers === 'object' && !Array.isArray(workers)) {
          if (workers.data && Array.isArray(workers.data)) {
            workers = workers.data;
          } else {
            console.error('Workers data is not an array:', workers);
            workers = [];
          }
        }
        
        // Ensure workers is an array
        if (!Array.isArray(workers)) {
          console.error('Workers is not an array:', workers);
          workers = [];
        }
        
        console.log('Workers array:', workers);
        
        if (workers.length === 0) {
          console.log('No workers found');
          setAvgWorkerRating(0);
          return;
        }
        
        // Fetch rating summary for each worker
        const workerRatingsPromises = workers.map(async (worker) => {
          const summaryResponse = await ratingAPI.getWorkerRatingSummary(worker.workerId, token);
          
          if (summaryResponse.success) {
            return {
              workerId: worker.workerId,
              workerName: worker.name,
              averageRating: summaryResponse.data.averageRating || 0,
              totalRatings: summaryResponse.data.totalRatings || 0
            };
          }
          
          return {
            workerId: worker.workerId,
            workerName: worker.name,
            averageRating: 0,
            totalRatings: 0
          };
        });
        
        const ratingsData = await Promise.all(workerRatingsPromises);
        console.log('Worker ratings data:', ratingsData);
        setWorkerRatings(ratingsData);
        
        // Calculate average worker rating across all workers
        const workersWithRatings = ratingsData.filter(w => w.totalRatings > 0);
        if (workersWithRatings.length > 0) {
          const totalAvg = workersWithRatings.reduce((sum, w) => sum + w.averageRating, 0);
          const overallAvg = totalAvg / workersWithRatings.length;
          setAvgWorkerRating(overallAvg);
          console.log('Overall worker average rating:', overallAvg);
        } else {
          setAvgWorkerRating(0);
        }
      }
    } catch (error) {
      console.error('Error fetching worker ratings:', error);
      setAvgWorkerRating(0);
    }
  };

  // Extended mock data for ratings
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 'FB001',
      customerId: 'CUST001',
      customerName: 'Robert Johnson',
      customerAvatar: null,
      orderId: 'ORD001',
      workerId: 'WORK001',
      workerName: 'Mike Tailor',
      shopRating: 5,
      workerRating: 5,
      skillRating: 5,
      deliveryRating: 4,
      qualityRating: 5,
      behaviorRating: 5,
      comment: 'Excellent work! Perfect fit and great quality. Very satisfied with the service.',
      date: '2024-01-10',
      status: 'pending', // pending, reviewed, important
      hasImage: false,
      reply: null
    },
    {
      id: 'FB002',
      customerId: 'CUST002',
      customerName: 'Emily Davis',
      customerAvatar: null,
      orderId: 'ORD002',
      workerId: 'WORK002',
      workerName: 'Sarah Stitcher',
      shopRating: 4,
      workerRating: 4,
      skillRating: 5,
      deliveryRating: 3,
      qualityRating: 4,
      behaviorRating: 5,
      comment: 'Good service, but delivery was slightly delayed. Overall satisfied.',
      date: '2024-01-12',
      status: 'reviewed',
      hasImage: true,
      reply: 'Thank you for your feedback! We apologize for the delay and will improve.'
    },
    {
      id: 'FB003',
      customerId: 'CUST003',
      customerName: 'Michael Brown',
      customerAvatar: null,
      orderId: 'ORD003',
      workerId: 'WORK003',
      workerName: 'David Designer',
      shopRating: 5,
      workerRating: 5,
      skillRating: 5,
      deliveryRating: 5,
      qualityRating: 5,
      behaviorRating: 5,
      comment: 'Outstanding craftsmanship! Highly recommended. Will definitely come back.',
      date: '2024-01-15',
      status: 'important',
      hasImage: false,
      reply: 'Thank you so much! We look forward to serving you again.'
    },
    {
      id: 'FB004',
      customerId: 'CUST001',
      customerName: 'Robert Johnson',
      customerAvatar: null,
      orderId: 'ORD005',
      workerId: 'WORK003',
      workerName: 'David Designer',
      shopRating: 3,
      workerRating: 3,
      skillRating: 4,
      deliveryRating: 2,
      qualityRating: 3,
      behaviorRating: 4,
      comment: 'Quality was okay but took longer than expected. Could be better.',
      date: '2024-01-18',
      status: 'pending',
      hasImage: false,
      reply: null
    }
  ]);

  // Complaints data
  const [complaints, setComplaints] = useState([
    {
      id: 'COMP001',
      customerId: 'CUST002',
      customerName: 'Emily Davis',
      orderId: 'ORD002',
      subject: 'Delayed Delivery',
      description: 'My order was delivered 3 days late without prior notice.',
      date: '2024-01-12',
      status: 'resolved',
      priority: 'medium',
      response: 'We sincerely apologize for the delay. We have improved our process.'
    },
    {
      id: 'COMP002',
      customerId: 'CUST004',
      customerName: 'New Customer',
      orderId: 'ORD006',
      subject: 'Measurement Issue',
      description: 'The measurements taken were not accurate, causing fitting issues.',
      date: '2024-01-20',
      status: 'in-review',
      priority: 'high',
      response: null
    },
    {
      id: 'COMP003',
      customerId: 'CUST001',
      customerName: 'Robert Johnson',
      orderId: 'ORD004',
      subject: 'Fabric Quality',
      description: 'The fabric quality was not as promised.',
      date: '2024-01-22',
      status: 'pending',
      priority: 'high',
      response: null
    }
  ]);

  // Calculate statistics from API data
  const totalRatings = ratingSummary.totalRatings;
  const avgShopRating = ratingSummary.averageRating.toFixed(1);

  // Rating distribution from API data
  const ratingDistribution = {
    5: shopRatings.filter(r => r.rating === 5).length,
    4: shopRatings.filter(r => r.rating === 4).length,
    3: shopRatings.filter(r => r.rating === 3).length,
    2: shopRatings.filter(r => r.rating === 2).length,
    1: shopRatings.filter(r => r.rating === 1).length
  };

  // Filter feedback
  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = 
      feedback.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.workerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = filterRating === 'all' || feedback.shopRating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  // Handle actions
  const handleMarkReviewed = (id) => {
    setFeedbackList(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'reviewed' } : f
    ));
  };

  const handleMarkImportant = (id) => {
    setFeedbackList(prev => prev.map(f => 
      f.id === id ? { ...f, status: f.status === 'important' ? 'reviewed' : 'important' } : f
    ));
  };

  const handleViewDetails = (feedback) => {
    setSelectedReview(feedback);
    setShowDetailsModal(true);
  };

  const handleUpdateComplaintStatus = (id, newStatus) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ratings & Feedback</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage customer reviews and ratings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'feedback'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                All Feedback
              </button>
              <button
                onClick={() => setActiveTab('workers')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'workers'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Worker Ratings
              </button>
              <button
                onClick={() => setActiveTab('complaints')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'complaints'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Complaints
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Ratings"
                    value={totalRatings}
                    icon={Star}
                    color="bg-yellow-500"
                  />
                  <StatCard
                    title="Shop Rating"
                    value={avgShopRating}
                    icon={Award}
                    color="bg-blue-500"
                    suffix="/5"
                  />
                  <StatCard
                    title="Worker Rating"
                    value={avgWorkerRating > 0 ? avgWorkerRating.toFixed(1) : '0'}
                    icon={Users}
                    color="bg-green-500"
                    suffix="/5"
                  />
                </div>

                {/* Rating Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-500" />
                    Rating Distribution
                  </h2>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = ratingDistribution[rating];
                      const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-20">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-yellow-500 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Feedback */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Shop Ratings</h2>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading ratings...</span>
                    </div>
                  ) : shopRatings.length > 0 ? (
                    <div className="space-y-4">
                      {shopRatings.slice(0, 5).map(rating => (
                        <div key={rating.ratingId} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {rating.customerName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{rating.customerName || 'Customer'}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Order: #{rating.orderId}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < rating.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.review && (
                              <p className="text-gray-700 dark:text-gray-300 text-sm">{rating.review}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {rating.createdAt && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">No shop ratings yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Ratings will appear here once customers rate your shop
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by customer, order, or worker..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                </div>

                {/* Feedback List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Order</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Worker</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Rating</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredFeedback.map(feedback => (
                          <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {feedback.customerAvatar ? (
                                  <img
                                    src={feedback.customerAvatar}
                                    alt={feedback.customerName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <span className="font-medium text-gray-900 dark:text-gray-100">{feedback.customerName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{feedback.orderId}</td>
                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{feedback.workerName}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{feedback.shopRating}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{feedback.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                feedback.status === 'important' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                feedback.status === 'reviewed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}>
                                {feedback.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(feedback)}
                                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </button>
                                <button
                                  onClick={() => handleMarkReviewed(feedback.id)}
                                  className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Mark as Reviewed"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </button>
                                <button
                                  onClick={() => handleMarkImportant(feedback.id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Mark as Important"
                                >
                                  <Tag className={`w-4 h-4 ${
                                    feedback.status === 'important' ? 'text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400' : 'text-gray-400 dark:text-gray-500'
                                  }`} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Worker Ratings Tab */}
            {activeTab === 'workers' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading worker ratings...</span>
                  </div>
                ) : workerRatings.length > 0 ? (
                  <>
                    {/* Top 5 Workers */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" />
                        Top 5 Workers by Rating
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {workerRatings
                          .filter(w => w.totalRatings > 0)
                          .sort((a, b) => b.averageRating - a.averageRating)
                          .slice(0, 5)
                          .map((worker, index) => (
                          <div key={worker.workerId} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="relative inline-block mb-3">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
                                {worker.workerName?.charAt(0).toUpperCase() || 'W'}
                              </div>
                              {index === 0 && (
                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                  1
                                </div>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{worker.workerName}</h3>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{worker.averageRating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{worker.totalRatings} reviews</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* All Workers List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Worker Performance</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Worker</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Avg Rating</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Total Reviews</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {workerRatings
                              .sort((a, b) => b.averageRating - a.averageRating)
                              .map(worker => (
                              <tr key={worker.workerId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {worker.workerName?.charAt(0).toUpperCase() || 'W'}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{worker.workerName}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                      {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{worker.totalRatings}</td>
                                <td className="px-6 py-4">
                                  {worker.totalRatings > 0 ? (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      worker.averageRating >= 4.5 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                      worker.averageRating >= 3.5 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                      worker.averageRating >= 2.5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                      {worker.averageRating >= 4.5 ? 'Excellent' :
                                       worker.averageRating >= 3.5 ? 'Good' :
                                       worker.averageRating >= 2.5 ? 'Average' :
                                       'Needs Improvement'}
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                      No Ratings Yet
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Low Performance Warning */}
                    {workerRatings.filter(w => w.totalRatings > 0 && w.averageRating < 3.5).length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Low Performance Alert</h3>
                            <p className="text-red-700 dark:text-red-400 text-sm mb-3">
                              The following workers have ratings below 3.5 and may need additional training or support:
                            </p>
                            <ul className="space-y-1">
                              {workerRatings.filter(w => w.totalRatings > 0 && w.averageRating < 3.5).map(worker => (
                                <li key={worker.workerId} className="text-red-700 dark:text-red-400 text-sm">
                                  • {worker.workerName} - {worker.averageRating.toFixed(1)} stars ({worker.totalRatings} reviews)
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      No Workers Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add workers to your shop to see their ratings here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div className="space-y-6">
                {/* Complaints Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {complaints.filter(c => c.status === 'pending').length}
                        </p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-orange-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">In Review</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {complaints.filter(c => c.status === 'in-review').length}
                        </p>
                      </div>
                      <MessageSquare className="w-12 h-12 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Resolved</p>
                        <p className="text-3xl font-bold text-green-600">
                          {complaints.filter(c => c.status === 'resolved').length}
                        </p>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Complaints List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Complaints</h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {complaints.map(complaint => (
                      <div key={complaint.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              complaint.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                              complaint.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                              <AlertCircle className={`w-5 h-5 ${
                                complaint.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                complaint.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{complaint.subject}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {complaint.customerName} • Order: {complaint.orderId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              complaint.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              complaint.status === 'in-review' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            }`}>
                              {complaint.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              complaint.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              complaint.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {complaint.priority} priority
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3 ml-11">{complaint.description}</p>
                        
                        {complaint.response && (
                          <div className="ml-11 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Response:</p>
                            <p className="text-sm text-blue-800 dark:text-blue-400">{complaint.response}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-4 ml-11">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {complaint.date}
                          </span>
                          
                          {complaint.status !== 'resolved' && (
                            <div className="flex gap-2">
                              {complaint.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateComplaintStatus(complaint.id, 'in-review')}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  Start Review
                                </button>
                              )}
                              {complaint.status === 'in-review' && (
                                <button
                                  onClick={() => handleUpdateComplaintStatus(complaint.id, 'resolved')}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Review Details Modal */}
      {showDetailsModal && selectedReview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Review Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                {selectedReview.customerAvatar ? (
                  <img
                    src={selectedReview.customerAvatar}
                    alt={selectedReview.customerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedReview.customerName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Order: {selectedReview.orderId}</p>
                  <p className="text-sm text-gray-500">{selectedReview.date}</p>
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Shop Rating</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedReview.shopRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg text-gray-900 dark:text-gray-100">{selectedReview.shopRating}</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Worker Rating</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedReview.workerRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg text-gray-900 dark:text-gray-100">{selectedReview.workerRating}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Detailed Ratings</h4>
                <RatingBar label="Skill" value={selectedReview.skillRating} />
                <RatingBar label="Delivery Time" value={selectedReview.deliveryRating} />
                <RatingBar label="Quality" value={selectedReview.qualityRating} />
                <RatingBar label="Behavior" value={selectedReview.behaviorRating} />
              </div>

              {/* Worker Info */}
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned Worker</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedReview.workerName}</p>
              </div>

              {/* Comment */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer Comment</h4>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">{selectedReview.comment}</p>
              </div>

              {/* Reply */}
              {selectedReview.reply && (
                <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">Your Reply:</p>
                  <p className="text-green-800 dark:text-green-400">{selectedReview.reply}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleMarkImportant(selectedReview.id);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Mark as Important
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
        {value}{suffix}
      </p>
    </motion.div>
  );
};

// Rating Bar Component
const RatingBar = ({ label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-32">{label}</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-yellow-500 h-full rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-8">{value}/5</span>
    </div>
  );
};

export default Ratings;
