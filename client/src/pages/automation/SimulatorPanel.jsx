import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Play, Bot, User, Phone, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../../context/axios';
import io from 'socket.io-client';
import { showToast } from '../../utils/showToast';
import { getBackendBaseUrl } from '../../utils/urlHelper';

export default function SimulatorPanel({ automationId, channelId, isOpen, onClose, onSave }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [socket, setSocket] = useState(null);
  const [simulatorPhone, setSimulatorPhone] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && channelId) {
      // Connect to Socket.IO — strip /api suffix since Socket.IO runs at the root
      const socketUrl = import.meta.env.VITE_SOCKET_URL || getBackendBaseUrl();
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('Simulator connected to socket:', newSocket.id);
        newSocket.emit('join_chat', channelId.toString());
        if (automationId) {
          newSocket.emit('join_chat', `automation_${automationId}`);
        }
      });

      newSocket.on('simulator_message', (data) => {
        // data: { msgId, direction: 'OUTBOUND', payload: {...}, timestamp }
        console.log('Received simulator message:', data.payload?.type, data);
        const incomingId = data.msgId || `msg_${Date.now()}`;
        setMessages(prev => {
          if (data.msgId && prev.some(m => m.msgId === data.msgId)) {
            return prev;
          }
          return [...prev, {
            id: incomingId,
            msgId: data.msgId,
            sender: 'bot',
            text: '',
            time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            raw: data.payload
          }];
        });
      });

      setSocket(newSocket);
      
      // Use authenticated user ID from localStorage 'user' object or persistent identifier
      let userId = 'user';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?._id || storedUser?.id) {
          userId = storedUser._id || storedUser.id;
        }
      } catch (e) {}
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
    if (payload.type === 'text') return payload.text?.body || '';
    
    if (payload.type === 'interactive') {
      if (payload.interactive?.type === 'button') {
        const title = payload.interactive.body?.text || '';
        const buttons = payload.interactive.action?.buttons || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>{title}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              {buttons.map((b, i) => {
                const bTitle = b.reply?.title || b.title || b.text || `Option ${i + 1}`;
                const bId = b.reply?.id || b.id || bTitle;
                return (
                  <div 
                    key={i} 
                    onClick={() => sendSimulatedReply(bTitle, { buttonId: bId, buttonTitle: bTitle, buttonText: bTitle, buttonIdx: i })}
                    style={{ padding: '8px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid #bae6fd' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#bae6fd'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#e0f2fe'}
                  >
                    ⚡ {bTitle}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      if (payload.interactive.type === 'list') {
        const title = payload.interactive.body?.text || '';
        const sections = payload.interactive.action?.sections || [];
        const buttonText = payload.interactive.action?.button || 'Menu';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>{title}</span>
            <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textAlign: 'center', fontWeight: '500', textTransform: 'uppercase' }}>
                🔘 {buttonText}
              </div>
              {sections.map((sec, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#334155' }}>{sec.title}</strong>
                  <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '13px', color: '#475569', listStyleType: 'none' }}>
                    {(sec.rows || []).map((r, j) => (
                      <li 
                        key={j} 
                        onClick={() => sendSimulatedReply(r.title, { listId: r.id || r.postbackId || `row_${j}`, listTitle: r.title, rowId: r.id || r.postbackId || `row_${j}`, rowIdx: j })}
                        style={{ padding: '4px 0', cursor: 'pointer' }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <b style={{ color: '#0369a1' }}>{r.title}</b>
                        {r.description && <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>{r.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (payload.interactive.type === 'poll') {
        const title = payload.interactive.body?.text || 'Poll';
        const options = payload.interactive.action?.options || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>📊 {title}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {options.map((opt, i) => (
                <div 
                  key={i} 
                  onClick={() => sendSimulatedReply(opt.option_name, { isButtonTap: true, optId: opt.id || opt.option_name, optIdx: i, optText: opt.option_name, buttonText: opt.option_name })}
                  style={{ padding: '8px 12px', background: '#f0fdf4', color: '#166534', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#dcfce7'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f0fdf4'}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #22c55e', display: 'inline-block' }}></span>
                  {opt.option_name}
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (payload.interactive.type === 'carousel') {
        const title = payload.interactive.body?.text || '';
        const cards = payload.interactive.action?.cards || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {title && <span style={{ fontWeight: '500' }}>{title}</span>}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {cards.map((c, i) => (
                <div key={i} style={{ minWidth: '150px', maxWidth: '150px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {c.header?.image?.link && (
                    <img src={c.header.image.link} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{c.body?.text || `Card ${i + 1}`}</div>
                    {(c.action?.buttons || []).map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => sendSimulatedReply(btn.reply?.title || 'Select', { isButtonTap: true, buttonId: btn.reply?.id || `btn_${bIdx}`, buttonTitle: btn.reply?.title || 'Select', buttonText: btn.reply?.title || 'Select', buttonIdx: bIdx })}
                        style={{ width: '100%', padding: '6px', background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                      >
                        {btn.reply?.title || 'Select'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      if (payload.interactive.type === 'order_details') {
        const params = payload.interactive.action?.parameters || {};
        const amount = params.total_amount?.value ? (params.total_amount.value / 100).toFixed(2) : '0.00';
        const currency = params.currency || 'INR';
        const item = params.order?.items?.[0]?.name || 'Order Item';
        return (
          <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>💳 Payment Request</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item}</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>{currency} {amount}</div>
            <button 
              onClick={() => sendSimulatedReply('Payment Completed')}
              style={{ width: '100%', padding: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              ✓ Pay Now (Simulate Success)
            </button>
          </div>
        );
      }
      if (payload.interactive.type === 'product' || payload.interactive.type === 'product_list' || payload.interactive.type === 'catalog_message') {
        const text = payload.interactive.body?.text || 'Explore Products';
        return (
          <div style={{ padding: '10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase' }}>🛍️ Catalog Message</div>
            <div style={{ fontSize: '13px', color: '#78350f' }}>{text}</div>
            <button 
              onClick={() => sendSimulatedReply('Viewed Product')}
              style={{ width: '100%', padding: '6px', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
            >
              View Catalog / Products
            </button>
          </div>
        );
      }
    }

    if (['image', 'video', 'audio', 'document', 'sticker'].includes(payload.type)) {
      const mediaObj = payload[payload.type] || {};
      const link = mediaObj.link;
      const caption = mediaObj.caption;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {payload.type === 'image' && (
            <img src={link} alt="" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', objectFit: 'cover' }} />
          )}
          {payload.type === 'video' && (
            <video src={link} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px' }} />
          )}
          {payload.type === 'audio' && (
            <audio src={link} controls style={{ width: '100%' }} />
          )}
          {payload.type === 'document' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
              <span style={{ fontSize: '20px' }}>📄</span>
              <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'underline' }}>
                Download Document
              </a>
            </div>
          )}
          {payload.type === 'sticker' && (
            <img src={link} alt="sticker" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          )}
          {caption && <span style={{ fontSize: '13px', color: '#1e293b' }}>{caption}</span>}
        </div>
      );
    }

    if (payload.type === 'location') {
      const loc = payload.location || {};
      return (
        <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>📍 {loc.name || 'Shared Location'}</div>
          {loc.address && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{loc.address}</div>}
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Lat: {loc.latitude}, Lng: {loc.longitude}</div>
        </div>
      );
    }

    if (payload.type === 'contacts') {
      const c = payload.contacts?.[0] || {};
      return (
        <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>👤 {c.name?.formatted_name || 'Contact'}</div>
          <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>📞 {c.phones?.[0]?.phone || ''}</div>
        </div>
      );
    }

    if (payload.type === 'reaction') {
      return (
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Reacted with: <span style={{ fontSize: '18px' }}>{payload.reaction?.emoji || '👍'}</span>
        </div>
      );
    }

    if (payload.type === 'template') {
      let templateText = payload._sim_template_text || '';
      if (templateText && templateText.includes('{{')) {
        let userName = 'Aayush Kumar';
        try {
          const u = JSON.parse(localStorage.getItem('user'));
          userName = u?.name || u?.tenantName || 'Aayush Kumar';
        } catch (_) {}

        const bodyComp = payload.template?.components?.find(c => String(c.type).toLowerCase() === 'body');
        if (bodyComp?.parameters && Array.isArray(bodyComp.parameters)) {
          bodyComp.parameters.forEach((param, idx) => {
            let val = param.text || param.value || '';
            if (!val || val.trim() === '' || val.includes('contact.name') || val.includes('name')) {
              val = userName;
            }
            templateText = templateText.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val);
          });
        }
        templateText = templateText.replace(/\{\{1\}\}/g, userName);
        templateText = templateText.replace(/\{\{2\}\}/g, 'Special Offer');
        templateText = templateText.replace(/\{\{(\d+)\}\}/g, '');
      }
      const templateImage = payload._sim_template_image;
      return (
        <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #fde68a', color: '#92400e', fontSize: '13px' }}>
          <strong>📋 Template Message: {payload.template.name}</strong>
          {templateImage && (
            <div style={{ marginTop: '8px', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
              {templateImage.startsWith('http') ? (
                <img src={templateImage} alt="Template Image" style={{ width: '100%', height: 'auto', display: 'block' }} />
              ) : (
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.05)', textAlign: 'center', color: '#92400e', fontWeight: '500', fontSize: '12px' }}>
                  🖼️ [Media attached in template]
                </div>
              )}
            </div>
          )}
          {templateText && (
            <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '4px', color: '#451a03', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {templateText}
            </div>
          )}
          {payload._sim_template_buttons && payload._sim_template_buttons.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {payload._sim_template_buttons.map((b, i) => {
                const btnTitle = b.text || b.title || `Button ${i + 1}`;
                const isUrl = b.type === 'URL' || b.type === 'url';
                const isPhone = b.type === 'PHONE_NUMBER' || b.type === 'phone';
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (!isUrl && !isPhone) {
                        sendSimulatedReply(b.payload || btnTitle, { isButtonTap: true, buttonText: btnTitle, buttonPayload: b.payload || btnTitle });
                      }
                    }}
                    style={{
                      padding: '7px 12px',
                      background: isUrl || isPhone ? '#f1f5f9' : '#e0e7ff',
                      color: isUrl || isPhone ? '#475569' : '#4338ca',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: isUrl || isPhone ? 'default' : 'pointer',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isUrl ? '🔗' : isPhone ? '📞' : '⚡'} {btnTitle}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return `[${payload.type || 'Message'}]`;
  };

  const handleStartSimulation = async () => {
    if (!automationId) return;
    if (!channelId) {
      showToast.warning("Channel Required", "Please assign a WhatsApp Channel to this flow before starting the simulation.");
      return;
    }
    setIsSimulating(true);
    if (onSave) {
      await onSave();
    }

    setMessages([{
      id: 'sys_1',
      sender: 'system',
      text: 'Simulation started. Waiting for bot...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    try {
      await api.post(`/automation/${automationId}/simulate/start`, { simulatorPhone });
    } catch (error) {
      console.error('Failed to start simulation', error);
      showToast.error('Simulation Failed', 'Please save the flow first.');
      setIsSimulating(false);
    }
  };

  const sendSimulatedReply = async (text, context = {}) => {
    if (!text.trim() || !isSimulating) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);

    try {
      await api.post(`/automation/${automationId}/simulate/message`, {
        channelId,
        simulatorPhone,
        message: text,
        messageContext: {
          isButtonTap: context.isButtonTap !== undefined ? context.isButtonTap : false,
          ...context
        }
      });
    } catch (error) {
      console.error('Failed to send simulated message', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isSimulating) return;
    const messageToSend = inputText;
    setInputText('');
    await sendSimulatedReply(messageToSend, { isButtonTap: false });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSimulating && (
            <button 
              onClick={handleStartSimulation} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
              title="Restart Simulation"
            >
              <RotateCcw size={14} /> Restart
            </button>
          )}
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
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
                    {msg.sender === 'bot' && msg.raw ? renderPayload(msg.raw) : msg.text}
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
