import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, LayoutTemplate, AlertTriangle, Play, Zap, Link2, ExternalLink, Phone, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function TemplateNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const edges = useCanvasStore(state => state.edges || []);
  const hasIncoming = edges.some(e => e.target === id);
  const isValid = !!data.templateName;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  // Check which button handles already have an outgoing edge connected
  const getButtonHandleId = (btn, idx) => `btn-${btn.id || idx}`;
  const isButtonConnected = (btn, idx) => {
    const hId = getButtonHandleId(btn, idx);
    return edges.some(e => e.source === id && e.sourceHandle === hId);
  };

  const hasAnyButtonConnected = (data.buttons || []).some((btn, idx) => isButtonConnected(btn, idx));

  return (
    <div style={{ position: 'relative', width: '300px', fontFamily: '"Inter", "Outfit", sans-serif' }}>

      {/* Root indicator */}
      {!hasIncoming && (
        <div style={{
          position: 'absolute', top: '-28px', left: '16px',
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#1a2e1a', border: '1px solid #10b981',
          padding: '3px 10px', borderRadius: '100px',
          color: '#10b981', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em'
        }}>
          <Play size={9} fill="currentColor" /> CAMPAIGN TRIGGER TEMPLATE
        </div>
      )}

      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
        style={{ left: '-6px', top: '50%', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }}
      />

      <div style={{
        background: '#3B4252',
        borderRadius: '10px',
        border: selected ? `1.5px solid ${borderColor}` : '1px solid #4C566A',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: selected
          ? (isValid ? '0 4px 14px rgba(16,185,129,0.2)' : '0 4px 14px rgba(239,68,68,0.2)')
          : '0 2px 8px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Header */}
        <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4C566A' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={15} color="#10b981" />
            {data.label || 'Template Message'}
            {!isValid && <AlertTriangle size={14} color="#ef4444" title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {!hasIncoming && (
              <div style={{
                background: '#064e3b', color: '#10b981',
                padding: '2px 7px', borderRadius: '4px',
                fontSize: '9px', fontWeight: '800', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <Zap size={8} fill="currentColor" /> TRIGGER
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyle} title="Delete"><Trash2 size={13} /></button>
          </div>
        </div>

        {/* Campaign Root Trigger Banner */}
        {!hasIncoming && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '11px',
            color: '#34d399',
            lineHeight: '1.4'
          }}>
            <Zap size={12} color="#10b981" style={{ flexShrink: 0 }} />
            <span>
              <strong>Campaign Trigger:</strong> When customer taps any button below on WhatsApp, the connected step runs!
            </span>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '12px', background: '#2E3440' }}>

          {/* Template name badge */}
          <div style={{
            background: '#1e2530', border: '1px solid #3d4a5c',
            borderRadius: '8px', padding: '10px 12px', marginBottom: '10px'
          }}>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              WhatsApp Template
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#60a5fa', fontWeight: '700' }}>
              {data.templateName || '— Not selected —'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              {data.templateLanguage && (
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>🌐 {data.templateLanguage}</div>
              )}
              {data.headerType && ['image', 'video', 'document'].includes(data.headerType) && (
                <div style={{ fontSize: '10px', color: '#a78bfa', background: '#2e1065', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ImageIcon size={10} /> {data.headerType.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Limited Time Offer badge */}
          {data.isLimitedTimeOffer && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(90deg, #422006, #2e1065)',
              border: '1px solid #f59e0b',
              borderRadius: '8px', padding: '6px 10px', marginBottom: '10px',
              fontSize: '11px', color: '#fde68a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={12} color="#f59e0b" />
                <span style={{ fontWeight: '700' }}>
                  {data.customExpirationHours ? `${data.customExpirationHours}h Expiry` : '3-Day Offer'}
                </span>
              </div>
              {data.offerCode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10px', color: '#fbbf24' }}>
                  <Tag size={10} /> {data.offerCode}
                </div>
              )}
            </div>
          )}

          {/* Variable mapping */}
          {data.variables && data.variables.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Variable Mapping
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {data.variables.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    background: '#1e2530', padding: '5px 10px',
                    borderRadius: '6px', border: '1px solid #3d4a5c'
                  }}>
                    <div style={{
                      background: '#1e1b4b', color: '#818cf8',
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 6px', borderRadius: '4px', marginRight: '10px'
                    }}>
                      {`{{${i + 1}}}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#D8DEE9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.value || <span style={{ color: '#6B7280', fontStyle: 'italic' }}>not mapped</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons section */}
          {data.buttons && data.buttons.length > 0 && (
            <div style={{ borderTop: '1px solid #4C566A', paddingTop: '12px' }}>
              {/* Section header with tooltip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Zap size={10} color="#f59e0b" /> Reply Triggers
                </div>
                <div style={{
                  fontSize: '9px', color: '#6B7280',
                  background: '#1e2530', padding: '2px 7px', borderRadius: '100px',
                  border: '1px solid #3d4a5c'
                }}>
                  {hasAnyButtonConnected ? '→ Drag handle to connect' : '← Connect to next step'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.buttons.map((btn, idx) => {
                  const isUrl = btn.type === 'url';
                  const isPhone = btn.type === 'phone_number' || btn.type === 'phone';
                  const isQuickReply = !isUrl && !isPhone;
                  const buttonHandleId = getButtonHandleId(btn, idx);
                  const connected = isButtonConnected(btn, idx);

                  return (
                    <div key={btn.id || idx} style={{ position: 'relative', paddingRight: '24px' }}>
                      <div style={{
                        background: connected
                          ? 'linear-gradient(90deg, #064e3b, #065f46)'
                          : isQuickReply
                            ? 'linear-gradient(90deg, #312e81, #3730a3)'
                            : '#1e2530',
                        padding: '9px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        border: connected
                          ? '1px solid #10b981'
                          : isQuickReply
                            ? '1px solid #4f46e5'
                            : '1px dashed #4B5563',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        boxShadow: connected ? '0 0 8px rgba(16,185,129,0.15)' : 'none',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                          {/* Button type icon */}
                          <span style={{ fontSize: '13px' }}>
                            {isUrl ? <ExternalLink size={11} color="#60a5fa" /> : isPhone ? <Phone size={11} color="#34d399" /> : <Zap size={11} color={connected ? '#10b981' : '#818cf8'} fill="currentColor" />}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {btn.text || btn.title || `Button ${idx + 1}`}
                          </span>
                        </div>

                        {/* Connected / Trigger badge */}
                        {isQuickReply && (
                          <div style={{
                            flexShrink: 0,
                            background: connected ? '#10b981' : '#4f46e5',
                            color: 'white',
                            fontSize: '8px', fontWeight: '800',
                            padding: '2px 6px', borderRadius: '100px',
                            letterSpacing: '0.06em',
                            display: 'flex', alignItems: 'center', gap: '3px'
                          }}>
                            {connected
                              ? <><Link2 size={7} /> TRIGGER</>
                              : <><Zap size={7} /> REPLY</>
                            }
                          </div>
                        )}
                        {isUrl && (
                          <div style={{ flexShrink: 0, fontSize: '8px', color: '#60a5fa', fontWeight: '700' }}>URL</div>
                        )}
                        {isPhone && (
                          <div style={{ flexShrink: 0, fontSize: '8px', color: '#34d399', fontWeight: '700' }}>CALL</div>
                        )}
                      </div>

                      {/* Source handle on the right — always shown for quick reply buttons */}
                      {isQuickReply && (
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={buttonHandleId}
                          className="custom-handle"
                          style={{
                            right: '-6px', top: '50%', transform: 'translateY(-50%)',
                            background: connected ? '#10b981' : '#4f46e5',
                            border: `2px solid ${connected ? '#34d399' : '#818cf8'}`,
                            width: '12px', height: '12px',
                            boxShadow: connected ? '0 0 6px rgba(16,185,129,0.5)' : '0 0 6px rgba(79,70,229,0.4)'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hint below buttons */}
              {!hasAnyButtonConnected && (
                <div style={{
                  marginTop: '10px', padding: '8px 12px',
                  background: '#1e2530', borderRadius: '6px',
                  border: '1px dashed #3d4a5c',
                  fontSize: '10px', color: '#6B7280', lineHeight: '1.5',
                  display: 'flex', alignItems: 'flex-start', gap: '6px'
                }}>
                  <Zap size={10} color="#f59e0b" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: '#f59e0b' }}>Tip:</strong> Drag the <span style={{ color: '#818cf8' }}>● handle</span> on each button to the next node you want to trigger when user taps that button.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* No variables & no buttons placeholder */}
          {(!data.variables || data.variables.length === 0) && (!data.buttons || data.buttons.length === 0) && (
            <div style={{ fontSize: '11px', color: '#6B7280', fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
              No variables or buttons
            </div>
          )}
        </div>

        {/* Default "Next step" handle when no buttons */}
        {(!data.buttons || data.buttons.length === 0) && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #4C566A', background: '#2E3440', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Next step</div>
            <div style={{ fontSize: '10px', color: '#10b981' }}>→</div>
            <Handle
              type="source"
              position={Position.Right}
              id="main-handle"
              className="custom-handle"
              style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }}
            />
          </div>
        )}

      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: '#9ca3af', padding: '4px', borderRadius: '4px',
  display: 'flex', transition: 'color 0.2s'
};
