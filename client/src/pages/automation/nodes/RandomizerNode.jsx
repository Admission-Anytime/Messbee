import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Dices, Shuffle, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function RandomizerNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  // Default is 50%, so it's always valid practically
  const isValid = data.splitPercentage !== undefined && data.splitPercentage !== null;
  const borderColor = isValid ? '#10b981' : '#ef4444';

  const splitPercentage = data.splitPercentage || 50;

  const handleSliderChange = (e) => {
    updateNodeData(id, { splitPercentage: Number(e.target.value) });
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
            <Dices size={16} color="#6b7280" />
            {data.label || 'Randomizer (A/B Test)'}
            {!isValid && <AlertTriangle size={16} color="#ef4444" style={{ marginLeft: '4px' }} title="Missing required data" />}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={(e) => { e.stopPropagation(); duplicateNode(id); }} style={iconBtnStyle} title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); removeNode(id); }} style={iconBtnStyleHoverRed} title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '12px', background: '#2E3440' }}>
          
          <div style={{ background: '#3B4252', borderRadius: '6px', padding: '12px', border: '1px solid #4C566A', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '600', color: '#D8DEE9' }}>
              <span>Path A ({splitPercentage}%)</span>
              <Shuffle size={14} color="#9ca3af" />
              <span>Path B ({100 - splitPercentage}%)</span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="99" 
              value={splitPercentage} 
              onChange={handleSliderChange}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {/* PATH A Handle */}
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#0ea5e9', `Path A (${splitPercentage}%)`)}></div>
              <Handle type="source" position={Position.Right} id="path_a" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />
            </div>
            {/* PATH B Handle */}
            <div style={{ position: 'relative' }}>
              <div style={branchStyle('#f59e0b', `Path B (${100 - splitPercentage}%)`)}></div>
              <Handle type="source" position={Position.Right} id="path_b" className="custom-handle" style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
const branchStyle = (color, text) => ({
  background: '#3B4252', padding: '8px', borderRadius: '6px', fontSize: '12px', 
  color: color, fontWeight: '600', border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center'
});

