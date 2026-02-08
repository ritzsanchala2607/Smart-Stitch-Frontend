import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Scissors,
  Search,
  Filter,
  ShoppingCart,
  Star,
  TrendingUp,
  Sparkles,
  X,
  Check,
  Clock,
  Ruler,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';

const Catalogue = () => {
  usePageTitle('Catalogue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Extended catalogue data
  const catalogueItems = [
    {
      id: 'CAT001',
      name: 'Classic Formal Shirt',
      category: 'Shirts',
      description: 'Premium cotton formal shirt with perfect fit. Ideal for office wear and formal occasions.',
      basePrice: 800,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      fabrics: ['Cotton', 'Linen', 'Silk', 'Polyester Blend'],
      colors: ['White', 'Blue', 'Black', 'Grey', 'Light Blue'],
      popular: true,
      trending: true,
      newArrival: false,
      deliveryDays: 7,
      rating: 4.8,
      reviews: 124
    },
    {
      id: 'CAT002',
      name: 'Designer Kurta',
      category: 'Kurta',
      description: 'Traditional kurta with modern design. Perfect for festivals and special occasions.',
      basePrice: 1200,
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
      fabrics: ['Cotton', 'Silk', 'Khadi', 'Linen'],
      colors: ['White', 'Cream', 'Blue', 'Green', 'Maroon'],
      popular: true,
      trending: false,
      newArrival: true,
      deliveryDays: 10,
      rating: 4.6,
      reviews: 89
    },
    {
      id: 'CAT003',
      name: 'Wedding Sherwani',
      category: 'Suits',
      description: 'Luxurious sherwani for special occasions. Intricate embroidery and premium fabric.',
      basePrice: 5000,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400',
      fabrics: ['Brocade', 'Silk', 'Velvet', 'Jacquard'],
      colors: ['Golden', 'Maroon', 'Cream', 'Royal Blue', 'Ivory'],
      popular: true,
      trending: true,
      newArrival: false,
      deliveryDays: 21,
      rating: 4.9,
      reviews: 156
    },
    {
      id: 'CAT004',
      name: 'Formal Blazer',
      category: 'Suits',
      description: 'Tailored blazer for professional look. Perfect fit guaranteed.',
      basePrice: 3500,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
      fabrics: ['Wool', 'Polyester Blend', 'Linen', 'Cotton'],
      colors: ['Black', 'Navy', 'Grey', 'Brown', 'Charcoal'],
      popular: false,
      trending: false,
      newArrival: false,
      deliveryDays: 14,
      rating: 4.5,
      reviews: 67
    },
    {
      id: 'CAT005',
      name: 'Casual Denim Shirt',
      category: 'Shirts',
      description: 'Comfortable casual shirt for everyday wear. Durable and stylish.',
      basePrice: 600,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      fabrics: ['Denim', 'Cotton', 'Chambray'],
      colors: ['Blue', 'Black', 'Grey', 'Light Blue'],
      popular: true,
      trending: false,
      newArrival: true,
      deliveryDays: 5,
      rating: 4.4,
      reviews: 92
    },
    {
      id: 'CAT006',
      name: 'Formal Pants',
      category: 'Pants',
      description: 'Classic formal pants with perfect fit. Comfortable for all-day wear.',
      basePrice: 1000,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
      fabrics: ['Wool', 'Cotton', 'Polyester Blend', 'Linen'],
      colors: ['Black', 'Navy', 'Grey', 'Khaki', 'Brown'],
      popular: true,
      trending: false,
      newArrival: false,
      deliveryDays: 7,
      rating: 4.7,
      reviews: 143
    },
    {
      id: 'CAT007',
      name: 'Designer Blouse',
      category: 'Blouse',
      description: 'Elegant blouse with intricate design. Perfect for sarees and lehengas.',
      basePrice: 1500,
      image: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=400',
      fabrics: ['Silk', 'Satin', 'Velvet', 'Brocade'],
      colors: ['Red', 'Gold', 'Green', 'Blue', 'Pink'],
      popular: true,
      trending: true,
      newArrival: true,
      deliveryDays: 12,
      rating: 4.8,
      reviews: 78
    },
    {
      id: 'CAT008',
      name: 'Kids Party Wear',
      category: 'Kids Wear',
      description: 'Adorable party wear for kids. Comfortable and stylish.',
      basePrice: 800,
      image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
      fabrics: ['Cotton', 'Silk', 'Satin'],
      colors: ['Red', 'Blue', 'Pink', 'White', 'Yellow'],
      popular: false,
      trending: false,
      newArrival: true,
      deliveryDays: 10,
      rating: 4.6,
      reviews: 45
    },
    {
      id: 'CAT009',
      name: 'Traditional Dhoti Kurta',
      category: 'Kurta',
      description: 'Traditional dhoti kurta set. Perfect for religious ceremonies.',
      basePrice: 1800,
      image: 'https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?w=400',
      fabrics: ['Cotton', 'Silk', 'Khadi'],
      colors: ['White', 'Cream', 'Gold'],
      popular: false,
      trending: false,
      newArrival: false,
      deliveryDays: 14,
      rating: 4.5,
      reviews: 34
    },
    {
      id: 'CAT010',
      name: 'Business Suit',
      category: 'Suits',
      description: 'Complete business suit with jacket and pants. Professional and elegant.',
      basePrice: 6500,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
      fabrics: ['Wool', 'Polyester Blend', 'Linen'],
      colors: ['Navy', 'Charcoal', 'Black', 'Grey'],
      popular: true,
      trending: true,
      newArrival: false,
      deliveryDays: 21,
      rating: 4.9,
      reviews: 201
    }
  ];

  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFabric, setSelectedFabric] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedColor, setSelectedColor] = useState('all');
  const [showTrending, setShowTrending] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabricDetail, setSelectedFabricDetail] = useState('');
  const [selectedColorDetail, setSelectedColorDetail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [wishlist, setWishlist] = useState([]);

  // Categories
  const categories = ['all', 'Shirts', 'Pants', 'Suits', 'Kurta', 'Blouse', 'Kids Wear'];
  
  // Get unique fabrics and colors
  const allFabrics = ['all', ...new Set(catalogueItems.flatMap(item => item.fabrics))];
  const allColors = ['all', ...new Set(catalogueItems.flatMap(item => item.colors))];

  // Filter items
  const filteredItems = catalogueItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesFabric = selectedFabric === 'all' || item.fabrics.includes(selectedFabric);
    const matchesPrice = item.basePrice >= priceRange[0] && item.basePrice <= priceRange[1];
    const matchesColor = selectedColor === 'all' || item.colors.includes(selectedColor);
    const matchesTrending = !showTrending || item.trending;
    const matchesNewArrival = !showNewArrivals || item.newArrival;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesFabric && matchesPrice && matchesColor && 
           matchesTrending && matchesNewArrival && matchesSearch;
  });

  // Handle add to cart
  const handleAddToCart = () => {
    setSuccessMessage(`${selectedItem.name} added to cart!`);
    setSelectedItem(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle wishlist toggle
  const toggleWishlist = (itemId) => {
    if (wishlist.includes(itemId)) {
      setWishlist(wishlist.filter(id => id !== itemId));
    } else {
      setWishlist([...wishlist, itemId]);
    }
  };

  // Calculate final price
  const calculatePrice = () => {
    if (!selectedItem) return 0;
    let price = selectedItem.basePrice;
    
    // Fabric price adjustment
    if (selectedFabricDetail === 'Silk' || selectedFabricDetail === 'Velvet') price += 500;
    if (selectedFabricDetail === 'Brocade' || selectedFabricDetail === 'Jacquard') price += 800;
    
    return price * quantity;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="customer" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Catalogue</h1>
                  <p className="text-gray-600 dark:text-gray-400">Browse our collection of designs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredItems.length} items found
                </span>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400 font-medium">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for designs..."
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Fabric Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fabric Type</label>
                      <select
                        value={selectedFabric}
                        onChange={(e) => setSelectedFabric(e.target.value)}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      >
                        {allFabrics.map(fabric => (
                          <option key={fabric} value={fabric}>
                            {fabric === 'all' ? 'All Fabrics' : fabric}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      >
                        {allColors.map(color => (
                          <option key={color} value={color}>
                            {color === 'all' ? 'All Colors' : color}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>

                    {/* Special Filters */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Special</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showTrending}
                            onChange={(e) => setShowTrending(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                          />
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Trending</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showNewArrivals}
                            onChange={(e) => setShowNewArrivals(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                          />
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">New Arrivals</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
                >
                  {/* Item Image */}
                  <div className="relative h-64 overflow-hidden group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {item.trending && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                      {item.newArrival && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          <Sparkles className="w-3 h-3" />
                          New
                        </span>
                      )}
                      {item.popular && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          <Star className="w-3 h-3" />
                          Popular
                        </span>
                      )}
                    </div>
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.rating}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({item.reviews})</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                    {/* Fabric Preview */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Fabrics:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.fabrics.slice(0, 3).map((fabric, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                            {fabric}
                          </span>
                        ))}
                        {item.fabrics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded">
                            +{item.fabrics.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Delivery */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Starting from</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{item.basePrice.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {item.deliveryDays} days
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setSelectedFabricDetail(item.fabrics[0]);
                          setSelectedColorDetail(item.colors[0]);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuccessMessage(`${item.name} added to cart!`);
                          setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <Scissors className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Items Found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedItem.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.category}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Image */}
                  <div>
                    <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {selectedItem.trending && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </span>
                        )}
                        {selectedItem.newArrival && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                            <Sparkles className="w-3 h-3" />
                            New Arrival
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedItem.rating}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">({selectedItem.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        Delivery in {selectedItem.deliveryDays} days
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedItem.description}</p>
                    </div>
                  </div>

                  {/* Right Column - Options */}
                  <div className="space-y-6">
                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Select Size
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['S', 'M', 'L', 'XL'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              selectedSize === size
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <button
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Ruler className="w-4 h-4" />
                        Need custom measurements?
                      </button>
                    </div>

                    {/* Fabric Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Select Fabric
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedItem.fabrics.map((fabric) => (
                          <button
                            key={fabric}
                            onClick={() => setSelectedFabricDetail(fabric)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                              selectedFabricDetail === fabric
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {fabric}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Select Color
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColorDetail(color)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                              selectedColorDetail === color
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <IndianRupee className="w-5 h-5" />
                        Price Breakdown
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">₹{selectedItem.basePrice.toLocaleString()}</span>
                        </div>
                        {(selectedFabricDetail === 'Silk' || selectedFabricDetail === 'Velvet') && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Premium Fabric:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">+₹500</span>
                          </div>
                        )}
                        {(selectedFabricDetail === 'Brocade' || selectedFabricDetail === 'Jacquard') && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Luxury Fabric:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">+₹800</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">×{quantity}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-300 dark:border-gray-700 flex justify-between">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{calculatePrice().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Measurement Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Measurements Required</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            We'll need your measurements to ensure perfect fit. You can provide them during checkout or use saved measurements.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart - ₹{calculatePrice().toLocaleString()}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Catalogue;
