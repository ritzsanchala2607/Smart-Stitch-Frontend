import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Ruler,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();

  // Mock cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 'CART001',
      name: 'Classic Formal Shirt',
      category: 'Shirts',
      fabric: 'Cotton',
      color: 'White',
      size: 'M',
      price: 800,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      measurements: { chest: 40, waist: 34, shoulder: 17, length: 30 }
    },
    {
      id: 'CART002',
      name: 'Designer Kurta',
      category: 'Kurta',
      fabric: 'Silk',
      color: 'Cream',
      size: 'L',
      price: 1700,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
      measurements: { chest: 42, shoulder: 18, length: 42 }
    },
    {
      id: 'CART003',
      name: 'Formal Pants',
      category: 'Pants',
      fabric: 'Wool',
      color: 'Navy',
      size: 'Custom',
      price: 1000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
      measurements: { waist: 34, length: 42, hip: 38 }
    }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Mock coupons
  const availableCoupons = [
    { code: 'SAVE10', discount: 10, type: 'percentage', minAmount: 1000 },
    { code: 'FLAT500', discount: 500, type: 'fixed', minAmount: 3000 },
    { code: 'FIRST20', discount: 20, type: 'percentage', minAmount: 0 }
  ];

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = subtotal > 2000 ? 0 : 100;
  const taxRate = 0.18; // 18% GST
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount) / 100;
    } else {
      discount = appliedCoupon.discount;
    }
  }
  
  const taxableAmount = subtotal - discount;
  const taxes = taxableAmount * taxRate;
  const total = taxableAmount + taxes + deliveryCharge;

  // Update quantity
  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Remove item
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Apply coupon
  const applyCoupon = () => {
    setCouponError('');
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }
    
    if (subtotal < coupon.minAmount) {
      setCouponError(`Minimum order amount ₹${coupon.minAmount} required`);
      return;
    }
    
    setAppliedCoupon(coupon);
    setCouponCode('');
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
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
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
                  <p className="text-gray-600 dark:text-gray-400">{cartItems.length} items in your cart</p>
                </div>
              </div>
            </div>

            {cartItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                      <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Fabric:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{item.fabric}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Color:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{item.color}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Size:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{item.size}</span>
                            </div>
                          </div>

                          {/* Measurements */}
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Measurements</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {Object.entries(item.measurements).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                                  <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{value}"</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                              <span className="w-8 text-center font-semibold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">₹{item.price} × {item.quantity}</p>
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>

                    {/* Coupon Section */}
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Apply Coupon</span>
                      </div>
                      
                      {!appliedCoupon ? (
                        <>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                              onClick={applyCoupon}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && (
                            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {couponError}
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            Available: SAVE10, FLAT500, FIRST20
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span className="font-medium">-₹{discount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Delivery Charge</span>
                        <span className="font-medium">
                          {deliveryCharge === 0 ? (
                            <span className="text-green-600 dark:text-green-400">FREE</span>
                          ) : (
                            `₹${deliveryCharge}`
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>GST (18%)</span>
                        <span className="font-medium">₹{taxes.toFixed(0)}</span>
                      </div>
                      
                      {subtotal < 2000 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                          Add ₹{(2000 - subtotal).toLocaleString()} more for free delivery
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Amount</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{total.toFixed(0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Proceed to Payment */}
                    <button
                      onClick={() => navigate('/customer/payment')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                    >
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => navigate('/customer/catalogue')}
                      className="w-full mt-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Add items from our catalogue to get started</p>
                <button
                  onClick={() => navigate('/customer/catalogue')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Browse Catalogue
                </button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Cart;
