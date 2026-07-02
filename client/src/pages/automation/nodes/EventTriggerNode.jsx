import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Webhook, Clock, Zap, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function EventTriggerNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.eventName;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const getIcon = () => {
    switch(data.triggerType) {
      case 'webhook':
      case 'crm': return <Webhook size={16} color="#6b7280" />;
      case 'schedule':
      case 'recurring': return <Clock size={16} color="#6b7280" />;
      default: return <Zap size={16} color="#6b7280" />;
    }
  };

  const getLabel = () => {
    switch(data.triggerType) {
      case 'webhook': return 'API Webhook';
      case 'crm': return 'CRM Event';
      case 'order_created': return 'Order Created';
      case 'payment_success': return 'Payment Success';
      case 'schedule': return 'Scheduled Date';
      case 'recurring': return 'Recurring Rule';
      case 'manual': return 'Manual Trigger';
      default: return 'Event Trigger';
    }
  };

  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
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
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.4', marginBottom: '12px' }}>
              {data.triggerType === 'webhook' && 'Listens for incoming POST requests to your secure webhook URL to trigger this flow.'}
              {data.triggerType === 'schedule' && 'Triggers the automation once at a specific scheduled date and time.'}
              {data.triggerType === 'recurring' && 'Triggers the automation repeatedly based on your recurring schedule rule.'}
              {data.triggerType === 'crm' && 'Triggers when a specific CRM event (like lead created or pipeline updated) occurs.'}
              {data.triggerType === 'manual' && 'Triggered manually by an agent from the dashboard.'}
              {(!data.triggerType || data.triggerType === 'incoming_message') && 'Listens for incoming WhatsApp messages matching specific keywords or criteria.'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '12px', height: '12px', background: '#34d399', borderRadius: '50%', opacity: '0.4', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', zIndex: 1 }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#059669' }}>
                {data.eventName ? `Listening for: ${data.eventName}` : 'Active and waiting for event...'}
              </span>
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
