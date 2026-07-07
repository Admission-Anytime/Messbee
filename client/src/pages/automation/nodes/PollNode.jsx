import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, ListChecks, CheckCircle2, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function PollNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.text && data.options && data.options.length > 0;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <Handle type="target" position={Position.Left} className="custom-handle" style={{ left: '-6px', top: '50%', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />

      <div style={{
        background: '#3B4252',
        borderRadius: '8px',
        border: selected ? `1.5px solid ${borderColor}` : '1px solid #e5e7eb',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: selected ? (isValid ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 4px 12px rgba(239, 68, 68, 0.15)') : '0 2px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4C566A' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListChecks size={16} color="#6b7280" />
            {data.label || 'Poll Message'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
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
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#ECEFF4', whiteSpace: 'pre-wrap', lineHeight: '1.4', marginBottom: '12px' }}>
              {data.text || 'Ask a question...'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.options && data.options.length > 0 ? (
                data.options.map((opt, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ 
                      background: '#2E3440', 
                      padding: '8px 10px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      color: '#D8DEE9', 
                      border: '1px solid #4C566A', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px' 
                    }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid #d1d5db', flexShrink: 0 }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.text || `Option ${idx + 1}`}</span>
                    </div>
                    <Handle 
                      type="source" 
                      position={Position.Right} 
                      id={`opt-${idx}`}
                      className="custom-handle" 
                      style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} 
                    />
                  </div>
                ))
              ) : (
                <div style={{ background: '#2E3440', padding: '10px', borderRadius: '6px', fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', border: '1px dashed #d1d5db', textAlign: 'center' }}>
                  Add options in the properties pane
                </div>
              )}
            </div>

            {data.allowMultipleAnswers && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', fontWeight: '500' }}>
                <CheckCircle2 size={14} /> Multiple answers allowed
              </div>
            )}
          </div>
        </div>

        {(!data.options || data.options.length === 0) && (
          <div style={{ padding: '12px', borderTop: '1px solid #4C566A', background: '#2E3440', position: 'relative' }}>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Next step
            </div>
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

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
