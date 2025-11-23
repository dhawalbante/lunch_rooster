// import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('https://lunch-rooster.onrender.com/api/chat/messages');
      setMessages(response.data);
      scrollToBottom();
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    try {
      await api.post('https://lunch-rooster.onrender.com/api/chat/messages', { message: inputMessage });
      setInputMessage('');
      fetchMessages();
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h2>Group Chat</h2>
      {error && <div className="error">{error}</div>}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg._id} className="chat-message">
            <div className="chat-message-header">
              <span className="chat-username">{msg.username}</span>
              <span className="chat-timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="chat-message-body">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          rows="2"
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
