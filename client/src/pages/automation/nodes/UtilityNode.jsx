import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, MapPin, Contact, Calendar as CalendarIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function UtilityNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  
  const isValid = data.utilityType === 'location' ? !!data.locationName : 
                 (data.utilityType === 'contact' ? !!data.contactName : 
                 (data.utilityType === 'calendar' ? !!data.eventName : true));
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const getIcon = () => {
    switch(data.utilityType) {
      case 'location': return <MapPin size={16} color="#6b7280" />;
      case 'contact': return <Contact size={16} color="#6b7280" />;
      case 'calendar': return <CalendarIcon size={16} color="#6b7280" />;
      default: return <MapPin size={16} color="#6b7280" />;
    }
  };

  const getLabel = () => {
    switch(data.utilityType) {
      case 'location': return 'Location Pin';
      case 'contact': return 'Contact Card';
      case 'calendar': return 'Calendar Invite';
      default: return 'Utility Message';
    }
  };

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
            {getIcon()}
            {data.label || getLabel()}
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
            {data.utilityType === 'location' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  height: '100px', 
                  borderRadius: '6px', 
                  background: 'linear-gradient(rgba(243, 244, 246, 0.5), rgba(243, 244, 246, 0.8)), url("https://www.transparenttextures.com/patterns/cartographer.png")', 
                  border: '1px solid #4C566A', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <MapPin size={28} color="#ef4444" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }} />
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#9CA3AF', border: '1px solid #4C566A' }}>Live Map</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#ECEFF4' }}>{data.locationName || 'Location Name'}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{data.locationAddress || 'Address details...'}</div>
                </div>
              </div>
            )}

            {data.utilityType === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white', boxShadow: '0 2px 6px rgba(59,130,246,0.2)' }}>
                    {data.contactName ? data.contactName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ECEFF4' }}>{data.contactName || 'John Doe'}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{data.contactPhone || '+1 234 567 8900'}</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #4C566A', paddingTop: '10px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>Message</div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>Save Contact</div>
                </div>
              </div>
            )}

            {data.utilityType === 'calendar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#2E3440', padding: '10px', borderRadius: '6px', border: '1px solid #4C566A' }}>
                  <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '6px', color: '#4f46e5', textAlign: 'center', minWidth: '40px', border: '1px solid #c7d2fe' }}>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' }}>Oct</div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>24</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ECEFF4' }}>{data.eventName || 'Event Title'}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{data.eventTime || '10:00 AM - 11:00 AM'}</div>
                  </div>
                </div>
              </div>
            )}

            {data.text && (
              <div style={{ fontSize: '12px', color: '#D8DEE9', whiteSpace: 'pre-wrap', lineHeight: '1.4', borderTop: '1px solid #4C566A', paddingTop: '10px', marginTop: '10px' }}>
                {data.text}
              </div>
            )}
          </div>
        </div>

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

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
