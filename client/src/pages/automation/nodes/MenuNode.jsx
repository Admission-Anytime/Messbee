import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, AlignJustify, List, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function MenuNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.text && data.sections && data.sections.length > 0;
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
            <List size={16} color="#6b7280" />
            {data.label || 'Menu Message'}
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
              {data.header || 'Header2'}
            </div>

            <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.4', marginBottom: '4px' }}>
              {data.text || 'Body2'}
            </div>

            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              {data.footer || 'Footer 2'}
            </div>
          </div>

          {/* Menu Rows */}
          {data.sections && data.sections.length > 0 && data.sections.map((sec, secIdx) => (
            <div key={sec.id || secIdx}>
              {(sec.rows && sec.rows.length > 0) ? sec.rows.map((row, rowIdx) => (
                <div key={row.id || rowIdx} style={{ position: 'relative', marginBottom: '6px' }}>
                  <div style={{ 
                    padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                    color: '#374151', border: '1px solid #e5e7eb', background: 'white'
                  }}>
                    {row.title || 'Title'}
                  </div>
                  <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={`row-${row.id || rowIdx}`}
                    className="custom-handle" 
                    style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} 
                  />
                </div>
              )) : (
                <div style={{ padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', border: '1px dashed #e5e7eb', textAlign: 'center' }}>
                  No options added
                </div>
              )}
            </div>
          ))}

          {/* Apply here link */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '600' }}>
            <AlignJustify size={14} /> apply here
          </div>
        </div>

        {/* Next Step bottom area */}
        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', background: '#fafafa', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Next step
          </div>
          {/* Main Default Output Handle */}
          {(!data.sections || data.sections.length === 0 || data.sections.every(s => !s.rows || s.rows.length === 0)) && (
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
