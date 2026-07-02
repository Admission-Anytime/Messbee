import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Copy, Trash2, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function MessageNode({ id, data, selected }) {
  const isInteractive = data.messageType === 'interactive';
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.text;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <Handle type="target" position={Position.Left} className="custom-handle" style={{ left: '-6px', top: '50%', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} />

      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: selected ? `1.5px solid ${borderColor}` : '1px solid #e5e7eb',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: selected ? (isValid ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 4px 12px rgba(239, 68, 68, 0.15)') : '0 2px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} color="#6b7280" />
            {data.label || (isInteractive ? 'Interactive' : 'Text Message')}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '12px', background: '#fafafa' }}>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '6px', 
            padding: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {data.header && (
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                {data.header}
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {data.text || 'Body'}
            </div>

            {data.footer && (
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                {data.footer}
              </div>
            )}

            {isInteractive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                {(data.buttons && data.buttons.length > 0) ? (
                  data.buttons.map((btn, idx) => (
                    <div key={btn.id || idx} style={{ position: 'relative' }}>
                      <div style={{ 
                        padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                        color: '#374151', border: '1px solid #e5e7eb', background: 'white'
                      }}>
                        {btn.title || 'Button Title'}
                      </div>
                      <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={`btn-${btn.id || idx}`}
                        className="custom-handle" 
                        style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} 
                      />
                    </div>
                  ))
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', background: '#fafafa', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Next step
          </div>
          {!isInteractive && (
            <Handle 
              type="source" 
              position={Position.Right} 
              id="main-handle"
              className="custom-handle" 
              style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} 
            />
          )}
        </div>

      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
