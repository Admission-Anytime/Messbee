import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Hourglass, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function WaitForEventNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const isValid = !!data.eventType || true; // Has defaults so always basically valid, but can show validation if needed
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const waitHours = data.waitHours || 24;

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
            <Hourglass size={16} color="#6b7280" />
            {data.label || 'Wait for Event'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '12px', background: '#2E3440' }}>
          
          <div style={{ background: '#3B4252', borderRadius: '6px', padding: '12px', border: '1px solid #4C566A', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#D8DEE9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Event to Wait For
              </label>
              <select 
                value={data.eventType || 'any_message'} 
                onChange={(e) => updateNodeData(id, { eventType: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#3B4252', border: '1px solid #d1d5db', borderRadius: '6px', color: '#ECEFF4', fontSize: '13px', outline: 'none' }}
              >
                <option value="any_message">Any incoming message</option>
                <option value="tag_added">Specific Tag is Added</option>
                <option value="link_clicked">Link is Clicked</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#D8DEE9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Timeout (Hours)
              </label>
              <input 
                type="number" 
                min="1" 
                max="720" 
                value={waitHours} 
                onChange={(e) => updateNodeData(id, { waitHours: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 10px', background: '#3B4252', border: '1px solid #d1d5db', borderRadius: '6px', color: '#ECEFF4', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {/* EVENT HAPPENED Handle */}
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#10b981', 'Event Happened', <CheckCircle2 size={14} color="#10b981"/>)}></div>
              <Handle type="source" position={Position.Right} id="event_happened" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />
            </div>
            {/* TIMEOUT Handle */}
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#f59e0b', 'Timeout Reached', <Clock size={14} color="#f59e0b"/>)}></div>
              <Handle type="source" position={Position.Right} id="timeout" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
const branchStyle = (color, text, icon) => ({
  background: '#3B4252', padding: '8px', borderRadius: '6px', fontSize: '12px', 
  color: '#D8DEE9', fontWeight: '600', border: `1px solid #e5e7eb`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
});
