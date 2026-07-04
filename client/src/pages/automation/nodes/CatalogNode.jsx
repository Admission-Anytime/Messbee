import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, ShoppingBag, ShoppingCart, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function CatalogNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  
  // Basic validation just checking if catalogId or productIds isn't empty if required, but let's just make it always valid for now unless catalogId is explicitly tracked.
  // Assuming a real app might track data.catalogId
  const isValid = data.catalogId !== ''; 
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const isMultiProduct = data.catalogType === 'multi_product' || data.catalogType === 'catalog';

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
            {isMultiProduct ? <ShoppingCart size={16} color="#6b7280" /> : <ShoppingBag size={16} color="#6b7280" />}
            {data.label || (isMultiProduct ? 'Multi-Product' : 'Single Product')}
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
            <div style={{ fontSize: '12px', color: data.text ? '#374151' : '#9ca3af', fontStyle: data.text ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.4', marginBottom: '12px' }}>
              {data.text || 'Check out our amazing products!'}
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ height: '80px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e5e7eb' }}>
                {isMultiProduct ? <ShoppingCart size={24} color="#9ca3af" /> : <ShoppingBag size={24} color="#9ca3af" />}
              </div>
              <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{isMultiProduct ? 'Multiple Products' : 'Product Name'}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>$99.00</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#3b82f6', background: 'white' }}>
                View Items
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', background: '#fafafa', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            Next step
          </div>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="main-handle"
            className="custom-handle" 
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} 
          />
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
