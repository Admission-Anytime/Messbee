import React from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Play, Tag, Copy, Trash2, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function TriggerNode({ id, data, selected }) {
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  
  const isValid = data.triggerType === 'tag_added' ? !!data.keyword : !!data.text;
  const borderColor = isValid ? '#8b5cf6' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <div style={{ position: 'absolute', top: '-24px', left: '16px', display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6', fontSize: '11px', fontWeight: '600' }}>
        <Zap size={12} fill="currentColor" /> Trigger match
      </div>

      <div style={{
        background: '#3B4252',
        borderRadius: '8px',
        border: selected ? `1.5px solid ${borderColor}` : '1px solid #e5e7eb',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: selected ? (isValid ? '0 4px 12px rgba(139, 92, 246, 0.15)' : '0 4px 12px rgba(239, 68, 68, 0.15)') : '0 2px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4C566A' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#6b7280" />
            {data.label || 'Interactive'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
            <div style={{ background: '#f3e8ff', color: '#8b5cf6', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <Play size={10} fill="currentColor" /> START
            </div>
          </div>
        </div>

        <div style={{ padding: '12px', background: '#2E3440' }}>
          
          <div style={{ 
            background: '#3B4252', 
            borderRadius: '6px', 
            padding: '12px', 
            border: '1px solid #4C566A',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', marginBottom: '4px' }}>TYPE</div>
            <div style={{ border: '1px solid #4C566A', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#D8DEE9', marginBottom: '12px', background: '#2E3440', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {data.triggerType === 'tag_added' ? <><Tag size={12}/> Tag Added</> : 'Keyword equals'}
            </div>

            {data.triggerType === 'tag_added' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>Tag to listen for:</label>
                <input 
                  type="text" 
                  placeholder="e.g. VIP"
                  value={data.keyword || ''}
                  onChange={(e) => updateNodeData(id, { keyword: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #4C566A', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <>
                {data.mediaUrl && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '6px', background: `url(${data.mediaUrl}) center/cover`, marginBottom: '10px', border: '1px solid #4C566A' }} />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!['media_any', 'image_received', 'video_received', 'document_received', 'voice_received', 'location_received', 'contact_shared', 'reaction', 'api_webhook', 'crm_event', 'order_created', 'payment_success', 'schedule', 'recurring', 'manual_trigger', 'welcome_message', 'away_message', 'fallback'].includes(data.triggerType) && (
                    <div style={{ fontSize: '13px', color: data.keyword ? '#1f2937' : '#6b7280', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {data.keyword || 'No keyword set'}
                    </div>
                  )}

                  {data.footer && (
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {data.footer}
                    </div>
                  )}

                  {data.buttons && data.buttons.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      {data.buttons.map((btn, idx) => (
                        <div key={btn.id || idx} style={{ position: 'relative' }}>
                          <div style={{ 
                            padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                            color: '#D8DEE9', border: '1px solid #4C566A', background: '#3B4252'
                          }}>
                            {btn.title || 'Button Title'}
                          </div>
                          <Handle 
                            type="source" 
                            position={Position.Right} 
                            id={`btn-${btn.id || idx}`}
                            className="custom-handle" 
                            style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid #4C566A', background: '#2E3440', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
            Then, do the following
          </div>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="main-handle"
            className="custom-handle" 
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} 
          />
        </div>

      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
