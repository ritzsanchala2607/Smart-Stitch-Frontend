import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Support = () => {
  usePageTitle('Support');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [tickets, setTickets] = useState([
    {
      id: 'TKT001',
      type: 'Order Issue',
      message: 'My order is delayed',
      status: 'open',
      date: '2024-01-20',
      response: null
    },
    {
      id: 'TKT002',
      type: 'Quality Issue',
      message: 'Stitching quality not as expected',
      status: 'resolved',
      date: '2024-01-15',
      response: 'We apologize for the inconvenience. Please bring the item for re-stitching.'
    }
  ]);

  // Chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'owner', message: 'Hello! How can I help you today?', time: '10:00 AM' },
    { id: 2, sender: 'customer', message: 'I want to know about my order status', time: '10:02 AM' },
    { id: 3, sender: 'owner', message: 'Sure! Please provide your order ID', time: '10:03 AM' },
    { id: 4, sender: 'customer', message: 'ORD001', time: '10:04 AM' },
    { id: 5, sender: 'owner', message: 'Your order is currently in stitching phase. Expected delivery: Jan 25', time: '10:05 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // FAQs
  const [expandedFaq, setExpandedFaq] = useState(null);
  const faqs = [
    {
      question: 'How long does it take to complete an order?',
      answer: 'Typically, orders are completed within 7-14 days depending on the complexity and current workload. Rush orders can be accommodated with additional charges.'
    },
    {
      question: 'Can I modify my measurements after placing an order?',
      answer: 'Yes, measurements can be modified within 24 hours of placing the order. After that, modifications may incur additional charges.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer full refunds if the order hasn\'t been started. Once work begins, we can offer alterations or store credit instead of refunds.'
    },
    {
      question: 'Do you provide home delivery?',
      answer: 'Yes, we provide free home delivery for orders above ₹2000. For orders below that, a nominal delivery charge of ₹100 applies.'
    },
    {
      question: 'Can I track my order status?',
      answer: 'Yes! You can track your order status in real-time from the "My Orders" page. You\'ll see updates for each stage: Pending, Cutting, Stitching, Fitting, and Ready.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery. All online payments are secure and encrypted.'
    }
  ];

  // Handle ticket submission
  const handleSubmitTicket = () => {
    if (!issueType || !message) return;

    const newTicket = {
      id: 'TKT' + (tickets.length + 1).toString().padStart(3, '0'),
      type: issueType,
      message: message,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      response: null
    };

    setTickets([newTicket, ...tickets]);
    setIssueType('');
    setMessage('');
    setUploadedImage(null);
    alert('Ticket submitted successfully!');
  };

  // Handle chat message send
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: chatMessages.length + 1,
      sender: 'customer',
      message: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');

    // Simulate owner typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const ownerResponse = {
        id: chatMessages.length + 2,
        sender: 'owner',
        message: 'Thank you for your message. We\'ll get back to you shortly.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, ownerResponse]);
    }, 2000);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
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
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Support Center</h1>
                <p className="text-gray-600 dark:text-gray-400">Get help with your orders and queries</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'tickets'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Raise Ticket
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Chat with Shop
                </button>
                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'faqs'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  FAQs
                </button>
              </div>
            </div>

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Raise Ticket Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Raise a Ticket</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Type</label>
                      <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select issue type</option>
                        <option value="Order Issue">Order Issue</option>
                        <option value="Quality Issue">Quality Issue</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Measurement Issue">Measurement Issue</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Describe your issue in detail..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                          <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadedImage && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitTicket}
                      disabled={!issueType || !message}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>

                {/* My Tickets */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">My Tickets</h2>
                  
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{ticket.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.type}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'open'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : ticket.status === 'resolved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {ticket.status === 'open' ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Open
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Resolved
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ticket.message}</p>
                        {ticket.response && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">Response:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.response}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{ticket.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Smart Stitch Support</p>
                        <p className="text-xs text-green-600 dark:text-green-400">● Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${
                          msg.sender === 'customer' ? 'order-2' : 'order-1'
                        }`}>
                          <div className={`px-4 py-2 rounded-lg ${
                            msg.sender === 'customer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className={`text-xs text-gray-500 dark:text-gray-500 mt-1 ${
                            msg.sender === 'customer' ? 'text-right' : 'text-left'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
                  
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-left">{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Call Us</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+91 1234567890</p>
                    </div>
                  </button>

                  <button className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">WhatsApp</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Chat with us</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Support;
