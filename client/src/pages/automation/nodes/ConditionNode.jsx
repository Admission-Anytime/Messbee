import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Split, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function ConditionNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.variable && !!data.operator && !!data.value;
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
            <Split size={16} color="#6b7280" />
            {data.label || 'Condition'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '12px', background: '#fafafa' }}>
          <div style={{ background: 'white', borderRadius: '6px', padding: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>IF Variable: <strong style={{color:'#111827'}}>{data.variable || 'Select Variable'}</strong></div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Operator: <strong style={{color:'#111827'}}>{data.operator || 'equals'}</strong></div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Value: <strong style={{color:'#111827'}}>{data.value || '-'}</strong></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#22c55e')}>True</div>
              <Handle type="source" position={Position.Right} id="true" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #22c55e', width: '12px', height: '12px' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#ef4444')}>False</div>
              <Handle type="source" position={Position.Right} id="false" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #ef4444', width: '12px', height: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
const branchStyle = (color) => ({
  background: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px', 
  color: color, fontWeight: '600', border: `1px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
});
