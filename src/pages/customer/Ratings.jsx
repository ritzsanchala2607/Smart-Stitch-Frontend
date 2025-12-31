import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import { Star, Send, CheckCircle, X } from 'lucide-react';

const Ratings = () => {
  usePageTitle('Ratings & Reviews');

  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'workers'
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Shop rating state
  const [shopRating, setShopRating] = useState({
    rating: 0,
    hoverRating: 0,
    review: ''
  });

  // Worker ratings state (example workers - replace with API data)
  const [workers] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Tailor',
      avatar: 'https://i.pravatar.cc/150?img=12',
      ordersCompleted: 15
    },
    {
      id: 2,
      name: 'Amit Sharma',
      role: 'Tailor',
      avatar: 'https://i.pravatar.cc/150?img=13',
      ordersCompleted: 12
    },
    {
      id: 3,
      name: 'Priya Patel',
      role: 'Designer',
      avatar: 'https://i.pravatar.cc/150?img=45',
      ordersCompleted: 8
    }
  ]);

  const [workerRatings, setWorkerRatings] = useState(
    workers.reduce((acc, worker) => ({
      ...acc,
      [worker.id]: {
        rating: 0,
        hoverRating: 0,
        review: ''
      }
    }), {})
  );

  // Handle shop rating
  const handleShopStarClick = (rating) => {
    setShopRating(prev => ({ ...prev, rating }));
  };

  const handleShopStarHover = (rating) => {
    setShopRating(prev => ({ ...prev, hoverRating: rating }));
  };

  // Handle worker rating
  const handleWorkerStarClick = (workerId, rating) => {
    setWorkerRatings(prev => ({
      ...prev,
      [workerId]: { ...prev[workerId], rating }
    }));
  };

  const handleWorkerStarHover = (workerId, rating) => {
    setWorkerRatings(prev => ({
      ...prev,
      [workerId]: { ...prev[workerId], hoverRating: rating }
    }));
  };

  // Submit shop rating
  const handleSubmitShopRating = () => {
    if (shopRating.rating === 0) {
      alert('Please select a rating');
      return;
    }

    // TODO: Replace with actual API call
    console.log('Submitting shop rating:', shopRating);

    setSuccessMessage('Thank you for rating our shop!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setShopRating({
      rating: 0,
      hoverRating: 0,
      review: ''
    });
  };

  // Submit worker rating
  const handleSubmitWorkerRating = (workerId) => {
    const rating = workerRatings[workerId];
    if (rating.rating === 0) {
      alert('Please select a rating');
      return;
    }

    // TODO: Replace with actual API call
    console.log('Submitting worker rating:', { workerId, ...rating });

    setSuccessMessage('Thank you for rating the worker!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset worker rating
    setWorkerRatings(prev => ({
      ...prev,
      [workerId]: {
        rating: 0,
        hoverRating: 0,
        review: ''
      }
    }));
  };

  // Star component
  const StarRating = ({ rating, hoverRating, onStarClick, onStarHover, size = 'w-8 h-8' }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star)}
            onMouseEnter={() => onStarHover(star)}
            onMouseLeave={() => onStarHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`${size} ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
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
                  className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-lg shadow-2xl p-6 max-w-md"
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

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ratings & Reviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Share your experience with us</p>
            </div>

            {/* Tabs */}
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

            {/* Shop Rating Tab */}
            {activeTab === 'shop' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Rate Our Shop</h2>

                {/* Overall Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Overall Rating
                  </label>
                  <StarRating
                    rating={shopRating.rating}
                    hoverRating={shopRating.hoverRating}
                    onStarClick={handleShopStarClick}
                    onStarHover={handleShopStarHover}
                  />
                  {shopRating.rating > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {shopRating.rating === 5 && 'Excellent!'}
                      {shopRating.rating === 4 && 'Very Good!'}
                      {shopRating.rating === 3 && 'Good'}
                      {shopRating.rating === 2 && 'Fair'}
                      {shopRating.rating === 1 && 'Poor'}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Write a Review (Optional)
                  </label>
                  <textarea
                    value={shopRating.review}
                    onChange={(e) => setShopRating(prev => ({ ...prev, review: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Share your experience with us..."
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitShopRating}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Rating
                </button>
              </motion.div>
            )}

            {/* Workers Rating Tab */}
            {activeTab === 'workers' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                  >
                    {/* Worker Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {worker.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{worker.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {worker.ordersCompleted} orders completed
                        </p>
                      </div>
                    </div>

                    {/* Overall Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Overall Rating
                      </label>
                      <StarRating
                        rating={workerRatings[worker.id].rating}
                        hoverRating={workerRatings[worker.id].hoverRating}
                        onStarClick={(rating) => handleWorkerStarClick(worker.id, rating)}
                        onStarHover={(rating) => handleWorkerStarHover(worker.id, rating)}
                        size="w-7 h-7"
                      />
                    </div>

                    {/* Review Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Write a Review (Optional)
                      </label>
                      <textarea
                        value={workerRatings[worker.id].review}
                        onChange={(e) =>
                          setWorkerRatings(prev => ({
                            ...prev,
                            [worker.id]: { ...prev[worker.id], review: e.target.value }
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Share your experience with this worker..."
                        rows="3"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => handleSubmitWorkerRating(worker.id)}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Submit Rating
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Ratings;
