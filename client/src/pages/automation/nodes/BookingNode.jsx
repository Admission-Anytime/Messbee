import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Calendar, Clock, Variable, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

const iconBtnStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: '#9CA3AF',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const iconBtnStyleHoverRed = {
  ...iconBtnStyle,
  color: '#EF4444'
};

export default function BookingNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!(data.entityId || data.entityName || data.useDynamicEntity);
  const borderColor = isValid ? '#0ea5e9' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target-handle"
        className="custom-handle" 
        style={{ left: '-6px', top: '50%', background: '#3B4252', border: '2px solid #0EA5E9', width: '12px', height: '12px' }} 
      />

      <div style={{
        background: '#3B4252',
        borderRadius: '8px',
        border: selected ? `1.5px solid ${borderColor}` : '1px solid #e5e7eb',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: selected ? (isValid ? '0 4px 12px rgba(14, 165, 233, 0.25)' : '0 4px 12px rgba(239, 68, 68, 0.15)') : '0 2px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4C566A' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#0ea5e9" />
            {data.label || 'Real-time Slot Booking'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing Entity ID" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        {/* Body Preview */}
        <div style={{ padding: '12px', background: '#2E3440' }}>
          
          <div style={{ 
            background: '#3B4252', 
            borderRadius: '6px', 
            padding: '12px', 
            border: '1px solid #4C566A',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', color: data.text ? '#ECEFF4' : '#9ca3af', fontStyle: data.text ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {data.text || 'Please select an appointment slot from the available times below:'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #4C566A' }}>
              <span style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {data.menuButtonText || 'View Slots'}
              </span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>Live List</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.bookingMode === 'reschedule' && (
              <div style={{ background: '#0284C7', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '700', textAlign: 'center' }}>
                🔄 Reschedule Mode (Atomic Swap)
              </div>
            )}
            
            <div style={{ background: '#3B4252', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C566A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resource / Doctor</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: isValid ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isValid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {data.entityName || (data.entityId ? (data.entityId.length > 15 ? `${data.entityId.slice(0, 12)}...` : data.entityId) : (data.useDynamicEntity ? 'Dynamic (In Flow)' : 'Not configured'))}
              </div>
            </div>

            <div style={{ background: '#3B4252', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C566A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Ahead</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#ECEFF4' }}>
                {data.daysAhead || 3} days
              </div>
            </div>

            <div style={{ background: '#3B4252', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C566A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saves to</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Variable size={14} /> {data.saveVariableAs || 'booking_slot_id'}
              </div>
            </div>

          </div>
          
        </div>

        {/* Output Handle */}
        <div style={{ padding: '12px', borderTop: '1px solid #4C566A', background: '#2E3440', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
            Next step (Slot Confirmed)
          </div>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="main-handle"
            className="custom-handle" 
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #0EA5E9', width: '12px', height: '12px' }} 
          />
        </div>

        {/* Fallback Handle */}
        <div style={{ padding: '8px 12px', borderTop: '1px dashed #4C566A', background: '#2E3440', position: 'relative' }}>
          <div style={{ fontSize: '11px', color: '#EF4444' }}>
            Fallback (Max Retries)
          </div>
          <Handle 
            type="source" 
            position={Position.Right} 
            id="fallback"
            className="custom-handle" 
            style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #EF4444', width: '12px', height: '12px' }} 
          />
        </div>

      </div>

    </div>
  );
}
