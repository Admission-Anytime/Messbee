import React from 'react';
import useCanvasStore from '../../store/useCanvasStore';
import { Smartphone, Image as ImageIcon, FileText, Video, Play, Mic } from 'lucide-react';

export default function MobilePreviewPane() {
  const { nodes } = useCanvasStore();
  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <div className="preview-pane" style={{
        borderLeft: '1px solid #E5E7EB',
        background: '#F9FAFB',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B7280',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <Smartphone size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
        <p>Select a node to preview</p>
      </div>
    );
  }

  const { type, data } = selectedNode;

  const renderMediaHeader = (headerType, mediaUrl) => {
    if (['image', 'sticker', 'gif'].includes(headerType)) {
      return (
        <div style={{ width: '100%', height: '140px', background: '#E5E7EB', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          {mediaUrl ? (
            <img src={mediaUrl} alt="Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={32} color="#9CA3AF" />
          )}
        </div>
      );
    } else if (headerType === 'video') {
      return (
        <div style={{ width: '100%', height: '140px', background: '#111827', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', position: 'relative' }}>
          {mediaUrl ? (
            <video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Video size={32} color="#4B5563" />
          )}
          <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px' }}>
            <Play size={24} color="white" fill="white" />
          </div>
        </div>
      );
    } else if (headerType === 'document' || headerType === 'doc') {
      return (
        <div style={{ width: '100%', padding: '12px', background: '#F3F4F6', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', background: '#EF4444', borderRadius: '6px' }}>
            <FileText size={20} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {mediaUrl ? mediaUrl.split('/').pop() : 'document.pdf'}
            </span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              {mediaUrl ? mediaUrl.split('.').pop().toUpperCase() : 'PDF'} • {data.mediaSize || '1.2 MB'}
            </span>
          </div>
        </div>
      );
    } else if (headerType === 'audio' || headerType === 'voice') {
      return (
        <div style={{ width: '220px', display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', marginBottom: '4px' }}>
          <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} color="white" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px' }}>
            <div style={{ position: 'relative', width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: '#3B82F6', borderRadius: '2px' }} />
              <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#3B82F6', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{data.mediaDuration || '0:00'}</span>
            </div>
          </div>
        </div>
      );
    } else if (headerType === 'text') {
      return (
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          {data.headline || 'Headline text'}
        </div>
      );
    }
    return null;
  };

  const renderButtons = (buttons) => {
    if (!buttons || buttons.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E5E7EB', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
        {buttons.map((btn, idx) => (
          <div key={idx} style={{ padding: '12px', background: 'white', textAlign: 'center', color: '#3B82F6', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
            {btn.title || btn.text || 'Button'}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="preview-pane" style={{
      borderLeft: '1px solid #E5E7EB',
      background: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px', background: 'white' }}>
        <div style={{ background: '#FCE7F3', color: '#DB2777', padding: '8px', borderRadius: '8px' }}>
          <Smartphone size={20} />
        </div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>Live Preview</h2>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F3F4F6' }}>
        {/* iPhone Mockup Frame */}
        <div style={{
          width: '300px',
          height: '600px',
          background: '#E5DDD5', // WhatsApp background color
          borderRadius: '40px',
          border: '8px solid #111827',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          {/* Dynamic Island / Notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#111827', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
          
          {/* WhatsApp Header Mock */}
          <div style={{ height: '70px', background: '#075E54', width: '100%', display: 'flex', alignItems: 'flex-end', padding: '12px 16px', color: 'white', fontSize: '16px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccc' }}></div>
              <span>{(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('user'));
                  return u?.tenantName || u?.businessName || 'MessBee Bot';
                } catch(e) {
                  return 'MessBee Bot';
                }
              })()}</span>
            </div>
          </div>

          {/* Chat Container */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* User Incoming Message (if trigger) */}
            {type === 'triggerNode' && (
              <div style={{ alignSelf: 'flex-end', background: '#DCF8C6', padding: '8px 12px', borderRadius: '8px 8px 0 8px', maxWidth: '85%', marginBottom: '16px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {data.keyword || 'hello'}
              </div>
            )}

            {/* Reaction Node Rendering */}
            {type === 'reactionNode' && (
              <div style={{ alignSelf: 'flex-end', position: 'relative', background: '#DCF8C6', padding: '8px 12px', borderRadius: '8px 8px 0 8px', maxWidth: '85%', marginBottom: '16px', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                User's message...
                <div style={{ position: 'absolute', bottom: '-10px', right: '16px', background: 'white', borderRadius: '12px', padding: '2px 4px', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', border: '1px solid white', zIndex: 10 }}>
                  {data.emoji || '👍'}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', textAlign: 'right', marginTop: '4px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {/* Location Node Rendering */}
            {type === 'utilityNode' && data.utilityType === 'location' && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '240px' }}>
                <div style={{ width: '100%', height: '120px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* Map Pin Mock */}
                  <div style={{ color: '#ef4444' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                </div>
                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {data.locationName || 'Location Name'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {data.locationAddress || 'Location Address'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'right', marginTop: '4px' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}

            {/* Outgoing Message Rendering */}
            {type !== 'triggerNode' && type !== 'reactionNode' && !(type === 'utilityNode' && data.utilityType === 'location') && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '8px 12px' }}>
                  {(data.messageType === 'interactive' || type === 'templateNode') && renderMediaHeader(data.headerType, data.mediaUrl)}
                  {type === 'mediaNode' && renderMediaHeader(data.messageType, data.mediaUrl)}
                  
                  {((type === 'mediaNode' && ['image', 'video', 'doc', 'document', 'gif'].includes(data.messageType) && data.text) || (type !== 'mediaNode')) && (
                    <div style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {data.text || (type === 'mediaNode' ? '' : 'Message text here...')}
                    </div>
                  )}

                  {data.footer && (
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      {data.footer}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'right', marginTop: '4px' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Interactive Buttons */}
                {(data.messageType === 'interactive' || type === 'templateNode') && renderButtons(data.buttons)}

                {/* Menu Buttons */}
                {(type === 'menuNode' || data.messageType === 'menu') && (
                  <div style={{ padding: '12px', borderTop: '1px solid #E5E7EB', textAlign: 'center', color: '#3B82F6', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
                    ☰ {data.menuButtonText || 'Menu'}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* WhatsApp Footer Mock */}
          <div style={{ height: '60px', background: '#F0F0F0', width: '100%', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <div style={{ flex: 1, height: '40px', background: 'white', borderRadius: '20px', padding: '0 16px', display: 'flex', alignItems: 'center', color: '#9CA3AF', fontSize: '14px' }}>
              Type a message
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
