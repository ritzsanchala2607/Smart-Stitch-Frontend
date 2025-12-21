import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../../hooks/usePageTitle';
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Users,
  X,
  Search
} from 'lucide-react';

const WorkerChat = () => {
  usePageTitle('Chat');
  const [selectedChat, setSelectedChat] = useState('owner');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({
    owner: [
      {
        id: 1,
        sender: 'owner',
        text: 'Hi Mike, please prioritize Order #ORD001 today.',
        time: '10:30 AM',
        status: 'seen',
        date: 'Today'
      },
      {
        id: 2,
        sender: 'worker',
        text: 'Sure, I will complete it by evening.',
        time: '10:35 AM',
        status: 'seen',
        date: 'Today'
      },
      {
        id: 3,
        sender: 'owner',
        text: 'Great! Also, the customer requested some changes to the collar design.',
        time: '10:40 AM',
        status: 'seen',
        date: 'Today'
      },
      {
        id: 4,
        sender: 'worker',
        text: 'Noted. I will make the adjustments.',
        time: '10:42 AM',
        status: 'delivered',
        date: 'Today'
      },
      {
        id: 5,
        sender: 'owner',
        text: 'Perfect. Let me know if you need any materials.',
        time: '10:45 AM',
        status: 'sent',
        date: 'Today'
      }
    ],
    group: [
      {
        id: 1,
        sender: 'owner',
        senderName: 'John Owner',
        text: 'Team meeting at 3 PM today. Please be on time.',
        time: '9:00 AM',
        status: 'seen',
        date: 'Today'
      },
      {
        id: 2,
        sender: 'worker',
        senderName: 'Sarah Stitcher',
        text: 'Will be there!',
        time: '9:05 AM',
        status: 'seen',
        date: 'Today'
      },
      {
        id: 3,
        sender: 'worker',
        senderName: 'Mike Tailor',
        text: 'Confirmed.',
        time: '9:06 AM',
        status: 'seen',
        date: 'Today'
      }
    ]
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // Simulate typing indicator
  useEffect(() => {
    if (selectedChat === 'owner') {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedChat, messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (message.trim() || attachedFile) {
      const newMessage = {
        id: messages[selectedChat].length + 1,
        sender: 'worker',
        text: message,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        date: 'Today',
        attachment: attachedFile
      };

      setMessages({
        ...messages,
        [selectedChat]: [...messages[selectedChat], newMessage]
      });
      setMessage('');
      setAttachedFile(null);

      // Simulate message status updates
      setTimeout(() => {
        updateMessageStatus(newMessage.id, 'delivered');
      }, 1000);
      setTimeout(() => {
        updateMessageStatus(newMessage.id, 'seen');
      }, 3000);
    }
  };

  // Update message status
  const updateMessageStatus = (messageId, status) => {
    setMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    }));
  };

  // Handle file attachment
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Emoji picker
  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '✅', '💯', '🙏'];

  const handleEmojiClick = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };

  // Chat contacts
  const chatContacts = [
    {
      id: 'owner',
      name: 'John Owner',
      role: 'Shop Owner',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Perfect. Let me know if you need any materials.',
      time: '10:45 AM',
      unread: 0,
      online: true
    },
    {
      id: 'group',
      name: 'All Workers Group',
      role: 'Group Chat',
      avatar: null,
      lastMessage: 'Confirmed.',
      time: '9:06 AM',
      unread: 2,
      online: false,
      isGroup: true
    }
  ];

  const currentChat = chatContacts.find(c => c.id === selectedChat);
  const currentMessages = messages[selectedChat] || [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar role="worker" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Chat List Sidebar */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Messages</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Chat with owner & team</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {chatContacts
                  .filter(contact =>
                    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((contact) => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => setSelectedChat(contact.id)}
                      className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                        selectedChat === contact.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {contact.isGroup ? (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <>
                              <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-12 h-12 rounded-full"
                              />
                              {contact.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {contact.name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{contact.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                            {contact.unread > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                {contact.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentChat?.isGroup ? (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={currentChat?.avatar}
                          alt={currentChat?.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {currentChat?.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{currentChat?.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {currentChat?.online ? 'Online' : currentChat?.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((msg, index) => {
                  const isWorker = msg.sender === 'worker';
                  const showDate = index === 0 || msg.date !== currentMessages[index - 1]?.date;

                  return (
                    <div key={msg.id}>
                      {/* Date Separator */}
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                            {msg.date}
                          </span>
                        </div>
                      )}

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isWorker ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-md ${isWorker ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar for group chat */}
                          {!isWorker && selectedChat === 'group' && (
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {msg.senderName?.charAt(0)}
                              </span>
                            </div>
                          )}

                          <div>
                            {/* Sender name for group chat */}
                            {!isWorker && selectedChat === 'group' && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2">{msg.senderName}</p>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isWorker
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                              }`}
                            >
                              {msg.attachment && (
                                <div className="mb-2">
                                  {msg.attachment.type.startsWith('image/') ? (
                                    <img
                                      src={msg.attachment.preview}
                                      alt="attachment"
                                      className="max-w-xs rounded-lg"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                      <Paperclip className="w-4 h-4" />
                                      <span className="text-sm">{msg.attachment.name}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <p className="text-sm">{msg.text}</p>
                            </div>

                            {/* Time and Status */}
                            <div className={`flex items-center gap-1 mt-1 ${isWorker ? 'justify-end' : ''}`}>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{msg.time}</span>
                              {isWorker && (
                                <span>
                                  {msg.status === 'sent' && <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
                                  {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
                                  {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-2"
                    >
                      <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Owner is typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Attached File Preview */}
              {attachedFile && (
                <div className="px-6 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      {attachedFile.type.startsWith('image/') ? (
                        <img src={attachedFile.preview} alt="preview" className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{attachedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-end gap-3">
                  {/* Attachment Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileAttach}
                    className="hidden"
                  />

                  {/* Emoji Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Emoji Picker */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50"
                        >
                          <div className="grid grid-cols-5 gap-2">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Message Input */}
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      rows="1"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !attachedFile}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerChat;
