import { useState, useEffect, useRef } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../socket.jsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CircularProgress from '@mui/material/CircularProgress';

function ChatArea() {
  const chatId = useSelector((state) => state.user.chatId);
  const userId = useSelector((state) => state.user.currentUser.id);
  const socket = useSocket();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  // States
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [memberChat, setMemberChat] = useState([]);
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Refs
  const fileref = useRef();
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Encryption functions
  const SECRET_KEY = 'your-secure-key';
  const encryptMessage = (message) =>
    CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // File upload handler
  const handleFile = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('chatId', chatId);
    try {
      console.log('Uploading file:', file);
      
      const response = await axios.post(
        `https://whisperia-backened-production.up.railway.app/chat/createAttachment`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      console.log('Response from server:', response.data.data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Send message handler
  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') {
      toast.error('Cannot send an empty message!', { autoClose: 2000 });
      return;
    }

    if (isChatbotEnabled) {
      try {
        const response = await axios.post(
          'https://whisperia-backened-production.up.railway.app/chat/chatbot',
          { message: inputMessage },
          { withCredentials: true }
        );
        const botReply = response.data.message;
        setMessages((prev) => [
          ...prev,
          {
            _id: uuidv4(),
            sender: { _id: 'chatbot', username: 'Chatbot' },
            content: botReply,
            createdAt: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Error sending message to chatbot:', error);
        toast.error('Failed to send message to chatbot.');
      }
    } else {
      if (!socket) {
        toast.error("Socket not connected!");
        return;
      }
      let encryptedMessage = encryptMessage(inputMessage);
      socket.emit('NEW_MESSAGE', {
        sender: userId,
        content: encryptedMessage,
        chatId,
        members: memberChat,
      });

      let msgObj={ sender: userId,
        content: encryptedMessage,
        chatId,
        members: memberChat,}
      console.log("go",msgObj);
      


      if (!socket) {
        toast.error("Socket not connected!");
        return;
      }
    }
    setInputMessage('');
  };

  // Socket event listeners for incoming messages
  useEffect(() => {
    const handleMessage = ({ newMessageForRealTime }) => {
      console.log('Received new message:', newMessageForRealTime);
      let decryptedMessage = decryptMessage(newMessageForRealTime.content);
      let newMessage = { ...newMessageForRealTime, content: decryptedMessage };
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    };

    const handleTyping = ({ chatId, username }) => {
      let id=chatId;
      console.log(id);
      
      toast.dismiss('typing-notification');
      toast.success(`${username} is typing...`, {
        style: { background: 'purple', color: 'white' },
        position: 'bottom-center',
        id: 'typing-notification',
        autoClose: 1000,
      });
    };

   if(socket){
    socket.on('NEW_MESSAGE', handleMessage);
    socket.on('START_TYPING_SHOW', handleTyping);
   }
   else{
    console.log("socket not");
    
   }

    return () => {
      socket.off('NEW_MESSAGE', handleMessage);
      socket.off('START_TYPING_SHOW', handleTyping);
    };
  }, [socket, chatId]);

  // Custom onScroll handler for the scrollable container
  const handleScroll = () => {
    let container = scrollContainerRef.current;
    if (!container) return;
    const totalScrollable = container.scrollHeight - container.clientHeight;
    const threshold = totalScrollable / 2;
    if (container.scrollTop < threshold && hasMore && !isFetching) {
      console.log('User scrolled past half the total distance, loading more messages');
      loadMoreMessages();
    }
  };

  // Increase the page count (which triggers fetching messages)
  const loadMoreMessages = () => {
    setPage((prev) => {
      const newPage = prev + 1;
      console.log('Incrementing page from', prev, 'to', newPage);
      return newPage;
    });
  };

  // Fetch messages (with pagination)
  const fetchMessages = async (currentPage) => {
    try {
      console.log(`API call triggered for page ${currentPage}`);
      setIsFetching(true);
      const res = await axios.get(
        `https://whisperia-backened-production.up.railway.app/chat/getmsg/${chatId}?page=${currentPage}&limit=40`,
        { withCredentials: true }
      );
      const membersRes = await axios.get(
        `https://whisperia-backened-production.up.railway.app/chat/getmemberfromchatId/${chatId}`,
        { withCredentials: true }
      );
      setMemberChat(membersRes.data.message[0].members);

      const decryptedMessages = res.data.message.map((msg) => ({
        ...msg,
        content: decryptMessage(msg.content),
      }));

      if (currentPage === 1) {
        // Reverse for initial load so the latest messages are at the bottom
        setMessages(decryptedMessages.reverse());
      } else {
        // Prepend older messages
        setMessages((prev) => [...decryptedMessages.reverse(), ...prev]);
      }

      // If fewer messages than the limit are returned, assume no more messages
      if (res.data.message.length < 40) {
        setHasMore(false);
        console.log('No more messages to load.');
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch messages when page or chatId changes
  useEffect(() => {
    console.log('Fetching messages for page', page, 'and chatId', chatId);
    fetchMessages(page);
  }, [page, chatId]);

  // Reset messages and page when chatId changes
  useEffect(() => {
    setPage(1);
    setMessages([]);
    setHasMore(true);
  }, [chatId]);

  // Toggle chatbot functionality
  const toggleChatbot = () => {
    setIsChatbotEnabled((prev) => !prev);
    toast.success(
      `Chatbot ${isChatbotEnabled ? 'disabled' : 'enabled'}`,
      { autoClose: 2000 }
    );
  };

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatId]);

  return (
    <div className="md:mt-10 mt-32">
      <button className="mt-2 ml-2" onClick={() => navigate('/friends')}>
        <ArrowBackIcon />
      </button>
      <div className="w-full h-full flex flex-col">
        {/* Chat messages container with a fixed height and custom scroll handler */}
        <div
          id="scrollableDiv"
          ref={scrollContainerRef}
          className="flex-grow p-4 overflow-y-auto custom-scrollbar"
          style={{ height: 'calc(100vh - 150px)', paddingBottom: '80px' }}
          onScroll={handleScroll}
        >
          {/* Show loader at the top while fetching messages */}
          {isFetching && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <CircularProgress size={20} />
            </div>
          )}
          {/* Render messages */}
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`w-full  flex ${
                  msg.sender._id.toString() === userId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="h-auto max-w-64 mx-4 mt-2 bg-purple-100 p-2 rounded-xl">
                  <div className="font-bold text-pink-500">{msg.sender.username}</div>
                  {msg.attachment?.length > 0 ? (
  msg.attachment.map((att) => {
    if (!att.url) {
      console.error("Attachment URL is missing:", att);
      return null; // Skip rendering this attachment
    }

    // Extract file extension from the URL
    const fileExtension = att.url.split('.').pop().toLowerCase();

    // Determine file type based on extension or MIME type
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer"><img src={att.url} alt="attachment" /></a>;
    } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
      return <audio key={att._id} controls src={att.url} />;
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExtension)) {
      return <video key={att._id} controls src={att.url} style={{ maxWidth: '100%' }} />;
    } else if (['pdf'].includes(fileExtension)) {
      return (
        <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer">
          View PDF
        </a>
      //   <iframe
      //   id={att._id}
      //   src={att.url}
      //   width="100%"
      //   height="600px"
      //   title="PDF Viewer"
      // ></iframe>
      );
    } else if (['txt'].includes(fileExtension)) {
      return (
        <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer">
          View TXT
        </a>
      );
    } else {
      return (
        <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer" download>
          Download file
        </a>
      );
    }
  })
) : (
  <div>{msg.content}</div>
)}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="text-purple-500 font-bold text-2xl">CHAT AREA</div>
              <div className="text-purple-700 font-bold text-xl">START CHATTING ....</div>
            </div>
          )}
          <div ref={messagesEndRef} />
          <div className='h-8 ' />
        </div>

        {/* Chat input area */}
        <div className="w-full flex justify-center items-center">
          <div className="flex items-center w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-purple-100 rounded-xl p-2 shadow-md border border-gray-300 fixed bottom-0 mb-4">
            <button onClick={toggleChatbot} className="p-2">
              <SmartToyIcon sx={{ color: isChatbotEnabled ? 'green' : 'gray' }} />
            </button>
            <input
              onChange={handleFile}
              type="file"
              ref={fileref}
              accept="image/*, audio/*, video/*, application/pdf, text/plain"
              className="w-10 h-6 hidden"
            />
            <button onClick={() => fileref.current.click()} className="p-2">
              <AttachFileIcon sx={{ color: 'gray' }} />
            </button>
            <input
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                socket.emit('START_TYPING', { chatId, userId });
              }}
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-200 transition duration-200"
              placeholder="Type your message here..."
            />
            <button onClick={sendMessage} className="p-2">
              <ArrowUpwardIcon sx={{ color: 'gray' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;
