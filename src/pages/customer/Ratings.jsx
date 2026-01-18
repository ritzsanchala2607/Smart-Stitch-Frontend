import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { Star, Send, CheckCircle, X, AlertCircle, Loader } from 'lucide-react';
import { customerAPI, ratingAPI } from '../../services/api';

const Ratings = () => {
  usePageTitle('Ratings & Reviews');

  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'workers'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Shop rating state - now per order
  const [shopRatings, setShopRatings] = useState({});

  // Worker ratings state - now per order and worker
  const [workerRatings, setWorkerRatings] = useState({});

  // Get token from localStorage
  const getToken = () => {
    // First try to get token directly
    let token = localStorage.getItem('token');
    if (token) return token;
    
    // Then try to get from user object
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.jwt || user.token;
        if (token) return token;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    return null;
  };

  // Fetch completed orders on mount
  useEffect(() => {
    fetchOrdersForRating();
  }, []);

  const fetchOrdersForRating = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      setErrorMessage('Please login to view ratings');
      setShowError(true);
      setLoading(false);
      return;
    }

    try {
      // Try the new endpoint first
      let response = await ratingAPI.getMyOrdersForRating(token);
      
      // If endpoint doesn't exist or returns 403/404, fallback to orders/status
      if (!response.success && (response.error.includes('403') || response.error.includes('404') || response.error.includes('Only customers'))) {
        // Fallback: Use existing orders endpoint
        response = await customerAPI.getMyOrders(token);
        
        if (response.success) {
          const orders = response.data || [];
          
          // Transform to match expected format
          const transformedOrders = orders.map(order => ({
            orderId: order.orderId || order.id,
            shopName: 'Smart Stitch', // Default shop name
            deadline: order.deadline,
            status: order.orderStatus || order.status,
            createdAt: order.createdAt,
            workers: []
          }));
          
          response = {
            success: true,
            data: transformedOrders
          };
        }
      }
      
      if (response.success) {
        const orders = response.data || [];
        console.log('📦 All orders received:', orders);
        console.log('📦 Order statuses:', orders.map(o => ({ id: o.orderId, status: o.status })));
        
        // Filter orders that can be rated (COMPLETED or DELIVERED - case insensitive)
        const completed = orders.filter(order => {
          const status = (order.status || '').toUpperCase();
          console.log(`Checking order ${order.orderId}: status="${status}"`);
          // Accept: COMPLETED, DELIVERED (any case)
          return status === 'COMPLETED' || status === 'DELIVERED';
        });
        
        console.log('✅ Filtered rateable orders:', completed);
        
        if (completed.length === 0) {
          console.warn('⚠️ No COMPLETED or DELIVERED orders found.');
          console.warn('Available order statuses:', orders.map(o => o.status));
        }
        
        setCompletedOrders(completed);
        
        // Initialize rating states for each order
        const shopRatingsInit = {};
        const workerRatingsInit = {};
        
        completed.forEach(order => {
          shopRatingsInit[order.orderId] = {
            rating: 0,
            hoverRating: 0,
            review: '',
            alreadyRated: false
          };
          
          // Initialize ratings for each worker in the order
          if (order.workers && Array.isArray(order.workers)) {
            order.workers.forEach(worker => {
              const key = `${order.orderId}-${worker.workerId}`;
              workerRatingsInit[key] = {
                rating: 0,
                hoverRating: 0,
                review: '',
                alreadyRated: worker.alreadyRated || false
              };
            });
          }
        });
        
        setShopRatings(shopRatingsInit);
        setWorkerRatings(workerRatingsInit);
        
        // Select first order by default
        if (completed.length > 0) {
          setSelectedOrder(completed[0]);
        }
      } else {
        setErrorMessage(response.error || 'Failed to fetch orders');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error fetching orders for rating:', error);
      setErrorMessage('Failed to fetch orders. Please try again.');
      setShowError(true);
    }
    
    setLoading(false);
  };

  // Handle shop rating
  const handleShopStarClick = (orderId, rating) => {
    setShopRatings(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], rating }
    }));
  };

  const handleShopStarHover = (orderId, rating) => {
    setShopRatings(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], hoverRating: rating }
    }));
  };

  // Handle worker rating
  const handleWorkerStarClick = (key, rating) => {
    setWorkerRatings(prev => ({
      ...prev,
      [key]: { ...prev[key], rating }
    }));
  };

  const handleWorkerStarHover = (key, rating) => {
    setWorkerRatings(prev => ({
      ...prev,
      [key]: { ...prev[key], hoverRating: rating }
    }));
  };

  // Submit shop rating
  const handleSubmitShopRating = async (orderId) => {
    const rating = shopRatings[orderId];
    
    if (!rating) {
      setErrorMessage('Please select a rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    if (rating.rating === 0 || !rating.rating) {
      setErrorMessage('Please select a rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const token = getToken();
    if (!token) {
      setErrorMessage('Please login to submit rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const ratingData = {
      orderId: orderId,
      rating: rating.rating,
      review: rating.review || ''
    };

    const response = await ratingAPI.rateShop(ratingData, token);

    if (response.success) {
      setSuccessMessage('Thank you for rating our shop!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Mark as already rated
      setShopRatings(prev => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          alreadyRated: true
        }
      }));

      // Refresh orders to get updated alreadyRated flags
      fetchOrdersForRating();
    } else {
      let errorMsg = response.error || 'Failed to submit rating';
      
      // Provide helpful message for common errors
      if (errorMsg.includes('Can only rate completed orders')) {
        errorMsg = 'This order cannot be rated yet. The backend currently only allows rating orders with "COMPLETED" status. Please ask the backend team to update the validation to also accept "DELIVERED" orders.';
      }
      
      setErrorMessage(errorMsg);
      setShowError(true);
      setTimeout(() => setShowError(false), 8000); // Longer timeout for detailed message
    }
  };

  // Submit worker rating
  const handleSubmitWorkerRating = async (orderId, workerId) => {
    const key = `${orderId}-${workerId}`;
    const rating = workerRatings[key];
    
    if (!rating || rating.rating === 0) {
      setErrorMessage('Please select a rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const token = getToken();
    if (!token) {
      setErrorMessage('Please login to submit rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const ratingData = {
      orderId: orderId,
      workerId: workerId,
      rating: rating.rating,
      review: rating.review || ''
    };

    const response = await ratingAPI.rateWorker(ratingData, token);

    if (response.success) {
      setSuccessMessage('Thank you for rating the worker!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Mark worker as already rated
      setWorkerRatings(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          alreadyRated: true
        }
      }));

      // Refresh orders to get updated alreadyRated flags
      fetchOrdersForRating();
    } else {
      setErrorMessage(response.error || 'Failed to submit rating');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  // Star component
  const StarRating = ({ rating, hoverRating, onStarClick, onStarHover, size = 'w-8 h-8' }) => {
    const handleClick = (e, star) => {
      e.preventDefault();
      e.stopPropagation();
      if (onStarClick) {
        onStarClick(star);
      }
    };

    const handleMouseEnter = (star) => {
      if (onStarHover) {
        onStarHover(star);
      }
    };

    const handleMouseLeave = () => {
      if (onStarHover) {
        onStarHover(0);
      }
    };

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => handleClick(e, star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className="transition-transform hover:scale-110 cursor-pointer focus:outline-none"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`${size} ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } pointer-events-none`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl p-6 max-w-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Rating Submitted!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {successMessage}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border-l-4 border-orange-500 rounded-lg shadow-2xl p-6 max-w-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Error
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {errorMessage}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowError(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ratings & Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Share your experience with us</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading orders...</span>
              </div>
            )}

            {/* No Orders State */}
            {!loading && completedOrders.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No Delivered Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You can rate the shop and workers after your orders are delivered.
                </p>
              </div>
            )}

            {/* Order Selector */}
            {!loading && completedOrders.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Order to Rate
                </label>
                <select
                  value={selectedOrder?.orderId || ''}
                  onChange={(e) => {
                    const order = completedOrders.find(o => o.orderId === parseInt(e.target.value));
                    setSelectedOrder(order);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  {completedOrders.map(order => (
                    <option key={order.orderId} value={order.orderId}>
                      Order #{order.orderId} - {order.shopName} ({order.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tabs */}
            {!loading && completedOrders.length > 0 && (
              <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`pb-3 px-4 font-medium transition-colors relative ${
                    activeTab === 'shop'
                      ? 'text-orange-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Rate Shop
                  {activeTab === 'shop' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('workers')}
                  className={`pb-3 px-4 font-medium transition-colors relative ${
                    activeTab === 'workers'
                      ? 'text-orange-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Rate Workers
                  {activeTab === 'workers' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
              </div>
            )}

            {/* Shop Rating Tab */}
            {activeTab === 'shop' && selectedOrder && !loading && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rate Our Shop</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Order #{selectedOrder.orderId} - {selectedOrder.shopName}
                </p>

                {/* Overall Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Overall Rating
                  </label>
                  <StarRating
                    rating={shopRatings[selectedOrder.orderId]?.rating || 0}
                    hoverRating={shopRatings[selectedOrder.orderId]?.hoverRating || 0}
                    onStarClick={(rating) => handleShopStarClick(selectedOrder.orderId, rating)}
                    onStarHover={(rating) => handleShopStarHover(selectedOrder.orderId, rating)}
                  />
                  {shopRatings[selectedOrder.orderId]?.rating > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {shopRatings[selectedOrder.orderId].rating === 5 && 'Excellent!'}
                      {shopRatings[selectedOrder.orderId].rating === 4 && 'Very Good!'}
                      {shopRatings[selectedOrder.orderId].rating === 3 && 'Good'}
                      {shopRatings[selectedOrder.orderId].rating === 2 && 'Fair'}
                      {shopRatings[selectedOrder.orderId].rating === 1 && 'Poor'}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Write a Review (Optional)
                  </label>
                  <textarea
                    value={shopRatings[selectedOrder.orderId]?.review || ''}
                    onChange={(e) => setShopRatings(prev => ({
                      ...prev,
                      [selectedOrder.orderId]: { ...prev[selectedOrder.orderId], review: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Share your experience with us..."
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => handleSubmitShopRating(selectedOrder.orderId)}
                  disabled={shopRatings[selectedOrder.orderId]?.alreadyRated}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    shopRatings[selectedOrder.orderId]?.alreadyRated
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  {shopRatings[selectedOrder.orderId]?.alreadyRated ? 'Already Rated' : 'Submit Rating'}
                </button>
              </motion.div>
            )}

            {/* Workers Rating Tab */}
            {activeTab === 'workers' && selectedOrder && !loading && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {selectedOrder.workers && selectedOrder.workers.length > 0 ? (
                  selectedOrder.workers.map((worker) => {
                    const key = `${selectedOrder.orderId}-${worker.workerId}`;
                    const isAlreadyRated = workerRatings[key]?.alreadyRated || false;
                    
                    return (
                      <div
                        key={key}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                      >
                        {/* Worker Info */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {worker.workerName?.charAt(0).toUpperCase() || 'W'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {worker.workerName || 'Worker'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {worker.taskType || 'Task'} - {worker.taskStatus || 'Status'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Order #{selectedOrder.orderId}
                            </p>
                            {isAlreadyRated && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Already rated
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Overall Rating */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Overall Rating
                          </label>
                          <StarRating
                            rating={workerRatings[key]?.rating || 0}
                            hoverRating={workerRatings[key]?.hoverRating || 0}
                            onStarClick={(rating) => !isAlreadyRated && handleWorkerStarClick(key, rating)}
                            onStarHover={(rating) => !isAlreadyRated && handleWorkerStarHover(key, rating)}
                            size="w-7 h-7"
                          />
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Write a Review (Optional)
                          </label>
                          <textarea
                            value={workerRatings[key]?.review || ''}
                            onChange={(e) =>
                              !isAlreadyRated && setWorkerRatings(prev => ({
                                ...prev,
                                [key]: { ...prev[key], review: e.target.value }
                              }))
                            }
                            disabled={isAlreadyRated}
                            className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                              isAlreadyRated ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            placeholder="Share your experience with this worker..."
                            rows="3"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={() => handleSubmitWorkerRating(selectedOrder.orderId, worker.workerId)}
                          disabled={isAlreadyRated}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                            isAlreadyRated
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          <Send className="w-5 h-5" />
                          {isAlreadyRated ? 'Already Rated' : 'Submit Rating'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      No Workers Assigned
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This order doesn't have any workers assigned yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Ratings;
