import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Key, Tag, Receipt, CreditCard, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function CommerceNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.commerceType;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const getIcon = () => {
    switch(data.commerceType) {
      case 'otp': return <Key size={14} color="#6b7280" />;
      case 'coupon': return <Tag size={14} color="#6b7280" />;
      case 'invoice': return <Receipt size={14} color="#6b7280" />;
      case 'payment':
      default: return <CreditCard size={14} color="#6b7280" />;
    }
  };

  const getLabel = () => {
    switch(data.commerceType) {
      case 'otp': return 'OTP Message';
      case 'coupon': return 'Coupon Offer';
      case 'invoice': return 'Invoice';
      case 'payment':
      default: return 'Payment Link';
    }
  };

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
            {getIcon()}
            {data.label || getLabel()}
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
            {data.commerceType === 'payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Due</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                  {data.currency || 'USD'} {data.amount || '0.00'}
                </div>
                <div style={{ width: '100%', background: '#ecfdf5', color: '#059669', padding: '8px', borderRadius: '6px', textAlign: 'center', fontWeight: '600', marginTop: '4px', border: '1px solid #a7f3d0' }}>
                  Pay Now
                </div>
              </div>
            )}
            
            {data.commerceType === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', color: '#374151' }}>Your verification code is:</div>
                <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', padding: '12px', borderRadius: '6px', fontSize: '20px', fontWeight: '700', color: '#10b981', textAlign: 'center', letterSpacing: '8px' }}>
                  * * * * * *
                </div>
                <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '6px', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: '500' }}>Copy Code</div>
              </div>
            )}

            {data.commerceType === 'coupon' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                <div style={{ background: '#ecfdf5', border: '1px dashed #6ee7b7', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Special Offer</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#047857', letterSpacing: '2px' }}>
                    {data.couponCode || 'PROMO2026'}
                  </div>
                </div>
              </div>
            )}

            {data.commerceType === 'invoice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '50%', color: '#10b981' }}>
                    <Receipt size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>Invoice Attached</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>PDF Document • 1.2 MB</div>
                  </div>
                </div>
              </div>
            )}

            {data.text && (
              <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.4', borderTop: data.commerceType ? '1px solid #e5e7eb' : 'none', paddingTop: data.commerceType ? '12px' : '0' }}>
                {data.text}
              </div>
            )}
            {!data.text && !data.commerceType && (
              <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>Configure commerce details...</div>
            )}
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
