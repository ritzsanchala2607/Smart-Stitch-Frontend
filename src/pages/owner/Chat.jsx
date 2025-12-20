import { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Paperclip, Smile, MoreVertical, 
  Star, Archive, Trash2, Bell, BellOff, X, Image as ImageIcon
} from 'lucide-react';
import { workers } from '../../data/dummyData';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';

const Chat = () => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatFilter, setChatFilter] = useState('all'); // all, unread, starred
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Mock chat data with messages for each worker
  const [chats, setChats] = useState(() => {
    const initialChats = {};
    workers.forEach(worker => {
      initialChats[worker.id] = {
        messages: generateMockMessages(),
        unreadCount: Math.floor(Math.random() * 5),
        isStarred: Math.random() > 0.7,
        isMuted: false,
        isArchived: false,
        lastSeen: getRandomLastSeen()
      };
    });
    return initialChats;
  });

  // Generate mock messages for a worker
  function generateMockMessages() {
    const mockMessages = [
      { id: 1, sender: 'owner', text: 'Hi! How is the progress on Order #ORD001?', timestamp: '10:30 AM', status: 'read' },
      { id: 2, sender: 'worker', text: 'Hello! The order is going well. I\'m currently working on the stitching.', timestamp: '10:35 AM', status: 'read' },
      { id: 3, sender: 'owner', text: 'Great! When do you think it will be ready?', timestamp: '10:40 AM', status: 'read' },
      { id: 4, sender: 'worker', text: 'It should be ready by tomorrow evening.', timestamp: '10:45 AM', status: 'delivered' },
      { id: 5, sender: 'owner', text: 'Perfect! Please let me know if you need any materials.', timestamp: '10:50 AM', status: 'sent' }
    ];
    
    // Return different number of messages for different workers
    const messageCount = Math.floor(Math.random() * 5) + 1;
    return mockMessages.slice(0, messageCount);
  }

  function getRandomLastSeen() {
    const options = ['Online', '5 min ago', '1 hour ago', '2 hours ago', 'Yesterday'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Common emojis for quick access
  const commonEmojis = ['😊', '👍', '👌', '🙏', '💪', '✅', '❤️', '🎉', '🔥', '⭐'];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedWorker, chats]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Filter workers based on search and chat filter
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const chat = chats[worker.id];
    if (chatFilter === 'unread' && chat.unreadCount === 0) return false;
    if (chatFilter === 'starred' && !chat.isStarred) return false;
    if (chat.isArchived) return false;

    return true;
  });

  // Handle sending message
  const handleSendMessage = () => {
    if (!messageInput.trim() && !selectedImage) return;
    if (!selectedWorker) return;

    const newMessage = {
      id: Date.now(),
      sender: 'owner',
      text: messageInput,
      image: selectedImage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(prev => ({
      ...prev,
      [selectedWorker.id]: {
        ...prev[selectedWorker.id],
        messages: [...prev[selectedWorker.id].messages, newMessage]
      }
    }));

    setMessageInput('');
    setSelectedImage(null);
    
    // Simulate message status updates
    setTimeout(() => {
      setChats(prev => ({
        ...prev,
        [selectedWorker.id]: {
          ...prev[selectedWorker.id],
          messages: prev[selectedWorker.id].messages.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        }
      }));
    }, 1000);

    setTimeout(() => {
      setChats(prev => ({
        ...prev,
        [selectedWorker.id]: {
          ...prev[selectedWorker.id],
          messages: prev[selectedWorker.id].messages.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        }
      }));
    }, 2000);
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle star
  const toggleStar = () => {
    if (!selectedWorker) return;
    setChats(prev => ({
      ...prev,
      [selectedWorker.id]: {
        ...prev[selectedWorker.id],
        isStarred: !prev[selectedWorker.id].isStarred
      }
    }));
  };

  // Toggle mute
  const toggleMute = () => {
    if (!selectedWorker) return;
    setChats(prev => ({
      ...prev,
      [selectedWorker.id]: {
        ...prev[selectedWorker.id],
        isMuted: !prev[selectedWorker.id].isMuted
      }
    }));
  };

  // Archive chat
  const archiveChat = () => {
    if (!selectedWorker) return;
    setChats(prev => ({
      ...prev,
      [selectedWorker.id]: {
        ...prev[selectedWorker.id],
        isArchived: true
      }
    }));
    setSelectedWorker(null);
    setShowSettings(false);
  };

  // Delete chat
  const deleteChat = () => {
    if (!selectedWorker) return;
    if (window.confirm('Are you sure you want to delete this chat history?')) {
      setChats(prev => ({
        ...prev,
        [selectedWorker.id]: {
          ...prev[selectedWorker.id],
          messages: []
        }
      }));
      setShowSettings(false);
    }
  };

  // Mark as read when selecting a worker
  const handleWorkerSelect = (worker) => {
    setSelectedWorker(worker);
    setChats(prev => ({
      ...prev,
      [worker.id]: {
        ...prev[worker.id],
        unreadCount: 0
      }
    }));
  };

  const selectedChat = selectedWorker ? chats[selectedWorker.id] : null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Worker List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Internal Chat</h2>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Chat Filters */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setChatFilter('all')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chatFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChatFilter('unread')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chatFilter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setChatFilter('starred')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                chatFilter === 'starred'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Starred
            </button>
          </div>
        </div>

        {/* Worker List */}
        <div className="flex-1 overflow-y-auto">
          {filteredWorkers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No workers found</p>
            </div>
          ) : (
            filteredWorkers.map(worker => {
              const chat = chats[worker.id];
              const lastMessage = chat.messages[chat.messages.length - 1];
              const isOnline = chat.lastSeen === 'Online';

              return (
                <div
                  key={worker.id}
                  onClick={() => handleWorkerSelect(worker)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedWorker?.id === worker.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>

                    {/* Worker Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{worker.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">{lastMessage.timestamp}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{worker.specialization}</p>
                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage.sender === 'owner' ? 'You: ' : ''}
                          {lastMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Unread badge and starred icon */}
                    <div className="flex flex-col items-end gap-1">
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                      {chat.isStarred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {chat.isMuted && (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      {selectedWorker ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedWorker.avatar}
                    alt={selectedWorker.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedChat.lastSeen === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedWorker.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.lastSeen}</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleStar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={selectedChat.isStarred ? 'Unstar' : 'Star'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      selectedChat.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                    }`}
                  />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Settings Dropdown */}
                  {showSettings && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={toggleMute}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        {selectedChat.isMuted ? (
                          <>
                            <Bell className="w-4 h-4" />
                            Unmute Chat
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4" />
                            Mute Chat
                          </>
                        )}
                      </button>
                      <button
                        onClick={archiveChat}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive Chat
                      </button>
                      <button
                        onClick={deleteChat}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete History
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {selectedChat.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedChat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'owner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        message.sender === 'owner'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      } rounded-lg p-3 shadow-sm`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}
                      <p className="text-sm break-words">{message.text}</p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span
                          className={`text-xs ${
                            message.sender === 'owner' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {message.timestamp}
                        </span>
                        {message.sender === 'owner' && (
                          <span className="text-xs text-blue-100">
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="h-20 rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 relative">
              {/* Emoji Picker Button */}
              <div className="relative" ref={emojiPickerRef}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]">
                    <div className="grid grid-cols-5 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Attach Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Message Input Field */}
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && !selectedImage}
                className={`p-2 rounded-lg transition-all ${
                  messageInput.trim() || selectedImage
                    ? 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // No Worker Selected State
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a worker to start chatting</h3>
            <p className="text-sm">Choose a worker from the list to view and send messages</p>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
