import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Play, Bot, User, Phone, CheckCircle2 } from 'lucide-react';
import api from '../../context/axios';
import io from 'socket.io-client';

export default function SimulatorPanel({ automationId, channelId, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [socket, setSocket] = useState(null);
  const [simulatorPhone, setSimulatorPhone] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && channelId) {
      // Connect to Socket.IO
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true
      });
      
      newSocket.on('connect', () => {
        console.log('Simulator connected to socket');
      });

      // We listen to the channel's room to receive outbound messages aimed at SIMULATOR
      // But wait, the backend emits to channel._id.toString(). So we need to join that room if possible.
      // Alternatively, the backend already emits to it, and if our user is in that room or if we just listen globally.
      // Let's ensure the frontend receives it.
      newSocket.emit('join_chat', channelId);

      newSocket.on('simulator_message', (data) => {
        // data: { direction: 'OUTBOUND', payload: {...}, timestamp }
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: 'bot',
          text: renderPayload(data.payload),
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          raw: data.payload
        }]);
      });

      setSocket(newSocket);
      
      // Generate a unique simulator phone for this session
      const userId = localStorage.getItem('userId') || Math.floor(Math.random() * 1000);
      setSimulatorPhone(`SIMULATOR_${userId}`);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, channelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderPayload = (payload) => {
    if (payload.type === 'text') return payload.text.body;
    if (payload.type === 'interactive') {
      if (payload.interactive.type === 'button') {
        const title = payload.interactive.body.text;
        const buttons = payload.interactive.action.buttons.map(b => b.reply.title).join(' | ');
        return `${title}\n\n[Buttons: ${buttons}]`;
      }
      if (payload.interactive.type === 'list') {
        const title = payload.interactive.body.text;
        return `${title}\n\n[Menu List Options Provided]`;
      }
    }
    if (payload.type === 'template') {
      return `[Template Message: ${payload.template.name}]`;
    }
    return `[Media/Unsupported format: ${payload.type}]`;
  };

  const handleStartSimulation = async () => {
    if (!automationId || !channelId) return;
    setIsSimulating(true);
    setMessages([]);
    try {
      await api.post(`/automation/${automationId}/simulate/start`, { simulatorPhone });
      setMessages([{
        id: 'sys_1',
        sender: 'system',
        text: 'Simulation started. Waiting for bot...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Failed to start simulation', error);
      alert('Failed to start simulation. Please save the flow first.');
      setIsSimulating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isSimulating) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    const messageToSend = inputText;
    setInputText('');

    try {
      await api.post(`/automation/${automationId}/simulate/message`, {
        channelId,
        simulatorPhone,
        message: messageToSend
      });
    } catch (error) {
      console.error('Failed to send simulated message', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '380px',
      background: '#f0f2f5',
      borderLeft: '1px solid #d1d5db',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
      fontFamily: '"Inter", "Outfit", sans-serif'
    }}>
      {/* Header */}
      <div style={{ background: '#075E54', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'white', padding: '8px', borderRadius: '50%', color: '#075E54' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600' }}>Live Test Mode</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>Test your flow without API limits</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Warning/Start Area */}
      {!isSimulating ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <Phone size={48} color="#9CA3AF" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '8px' }}>Ready to test?</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
            Make sure you have <strong>Saved</strong> your flow before testing.<br/><br/>
            This simulator runs your actual flow logic but intercepts outbound messages so they aren't sent to Meta.
          </p>
          <button onClick={handleStartSimulation} style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
            <Play size={16} /> Start Simulation
          </button>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#efeae2' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : (msg.sender === 'system' ? 'center' : 'flex-start'), 
                maxWidth: msg.sender === 'system' ? '100%' : '80%'
              }}>
                {msg.sender === 'system' ? (
                  <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{ 
                    background: msg.sender === 'user' ? '#d9fdd3' : 'white', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    borderTopRightRadius: msg.sender === 'user' ? 0 : '8px',
                    borderTopLeftRadius: msg.sender === 'bot' ? 0 : '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '13.5px',
                    color: '#111827',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.4',
                    position: 'relative'
                  }}>
                    {msg.text}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>{msg.time}</span>
                      {msg.sender === 'user' && <CheckCircle2 size={12} color="#3B82F6" />}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', background: '#f0f2f5', display: 'flex', gap: '8px', borderTop: '1px solid #d1d5db' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '8px' }}>
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: 'none', outline: 'none', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              />
              <button type="submit" disabled={!inputText.trim()} style={{ background: inputText.trim() ? '#10B981' : '#D1D5DB', color: 'white', border: 'none', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                <Send size={18} style={{ marginLeft: '4px' }} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
