import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, GalleryHorizontalEnd, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function CarouselNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = data.cards && data.cards.length > 0;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: '340px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <Handle type="target" position={Position.Left} className="custom-handle" style={{ left: '-6px', top: '50%', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />

      {/* Main Node Container */}
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

        {/* Header */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4C566A' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GalleryHorizontalEnd size={16} color="#6b7280" />
            {data.label || 'Carousel Message'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); duplicateNode(id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex' }}
              title="Duplicate"
              onMouseOver={(e) => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.background = '#f3f4f6'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Copy size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); removeNode(id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex' }}
              title="Delete"
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Body Section */}
        <div style={{ padding: '12px', overflowX: 'auto', display: 'flex', gap: '8px', background: '#2E3440' }}>
          {data.cards && data.cards.length > 0 ? (
            data.cards.map((card, idx) => (
              <div key={idx} style={{ 
                minWidth: '160px', 
                maxWidth: '160px',
                background: '#3B4252', 
                border: '1px solid #4C566A', 
                borderRadius: '6px', 
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  height: '90px', 
                  background: card.mediaUrl ? `url(${card.mediaUrl}) center/cover` : '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderBottom: '1px solid #4C566A'
                }}>
                  {!card.mediaUrl && <span style={{ fontSize: '11px', color: '#9ca3af' }}>No Image</span>}
                </div>
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#ECEFF4', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.title || 'Card Title'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.description || 'Description'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', padding: '16px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', border: '1px dashed #d1d5db', borderRadius: '6px', textAlign: 'center' }}>
              No cards added
            </div>
          )}
        </div>

        {/* Next Step bottom area */}
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

      </div>
    </div>
  );
}
