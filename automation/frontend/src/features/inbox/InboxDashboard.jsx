import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { Search, MoreVertical, Phone, User, Clock, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export default function InboxDashboard({ currentChannelId }) {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Poll every 5s for new chats
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession._id);
      const interval = setInterval(() => fetchMessages(selectedSession._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/inbox/threads');
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await api.get(`/inbox/${contactId}/history`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedSession) return;

    const contactId = selectedSession._id;
    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await api.post(`/inbox/${contactId}/send`, { text: textToSend });
      setMessages(prev => [...prev, res.data]);
      
      // Update thread's last message preview locally for instant feedback
      setSessions(prev => prev.map(s => {
        if (s._id === contactId) {
          return {
            ...s,
            lastMessage: res.data
          };
        }
        return s;
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Make sure the channel is configured correctly.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSessions = sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    const phoneMatch = s.contact?.phone?.toLowerCase().includes(q);
    const nameMatch = s.contact?.name?.toLowerCase().includes(q);
    return phoneMatch || nameMatch;
  });

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Left Sidebar (Session List) */}
      <div style={{ width: '320px', background: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>Live Chats</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search phone or name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>No active chats found.</div>
          ) : (
            filteredSessions.map(session => (
              <div 
                key={session._id}
                onClick={() => setSelectedSession(session)}
                style={{ 
                  padding: '16px 24px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer',
                  background: selectedSession?._id === session._id ? '#F9FAFB' : 'white',
                  transition: 'background 0.2s', borderLeft: selectedSession?._id === session._id ? '3px solid #10B981' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {session.contact?.name || session.contact?.phone || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {session.lastMessage?.createdAt ? new Date(session.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                  {typeof session.lastMessage?.content === 'string' ? session.lastMessage.content : '[Media/Interactive]'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#9CA3AF' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: session.lastMessage?.direction === 'INBOUND' ? '#10B981' : '#3B82F6' }} />
                  {session.lastMessage?.direction === 'INBOUND' ? 'Inbound' : 'Outbound'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content Area (Chat History) */}
      <div style={{ flex: 1, background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div style={{ background: 'white', padding: '20px 32px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 2px 0' }}>
                    {selectedSession.contact?.name || selectedSession.contact?.phone || 'Unknown'}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Phone: <strong style={{ color: '#374151' }}>{selectedSession.contact?.phone}</strong>
                  </div>
                </div>
              </div>
              <button style={{ background: 'white', border: '1px solid #E5E7EB', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#6B7280' }}>
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(msg => (
                <div key={msg._id || msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.direction === 'OUTBOUND' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    background: msg.direction === 'OUTBOUND' ? '#10B981' : 'white',
                    color: msg.direction === 'OUTBOUND' ? 'white' : '#111827',
                    padding: '12px 16px', borderRadius: '12px',
                    border: msg.direction === 'INBOUND' ? '1px solid #E5E7EB' : 'none',
                    maxWidth: '60%', fontSize: '14px', lineHeight: '1.5',
                    borderBottomRightRadius: msg.direction === 'OUTBOUND' ? '2px' : '12px',
                    borderBottomLeftRadius: msg.direction === 'INBOUND' ? '2px' : '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {typeof msg.content === 'string' ? msg.content : (msg.content?.text || msg.content?.body || JSON.stringify(msg.content))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.direction === 'OUTBOUND' && <CheckCircle2 size={12} color="#10B981" />}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '24px 32px', background: 'white', borderTop: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Type a message to reply..." 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  style={{ flex: 1, padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', background: '#ffffff', outline: 'none' }}
                />
                <button 
                  type="submit"
                  disabled={!messageText.trim()}
                  style={{ 
                    background: messageText.trim() ? '#10B981' : '#E5E7EB', 
                    color: messageText.trim() ? 'white' : '#9CA3AF', 
                    border: 'none', padding: '14px 24px', borderRadius: '8px', 
                    fontSize: '14px', fontWeight: '600', cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  Send
                </button>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                <CheckCircle2 size={12} color="#10B981" /> Live Agent Mode Active
              </p>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
            <div style={{ background: '#F3F4F6', padding: '24px', borderRadius: '50%', marginBottom: '16px' }}>
              <MessageCircle size={48} color="#9CA3AF" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Select a chat</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Choose a session from the left to view the conversation history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
