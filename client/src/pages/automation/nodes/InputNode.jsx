import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, HelpCircle, Variable, ShieldCheck, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function InputNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.variableName && (!!data.text || !!data.question);
  const borderColor = isValid ? '#10b981' : '#ef4444';
  
  return (
    <div style={{ position: 'relative', width: '280px', fontFamily: '"Inter", "Outfit", sans-serif' }}>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target-handle"
        className="custom-handle" 
        style={{ left: '-6px', top: '50%', background: '#3B4252', border: '2px solid #10B981', width: '12px', height: '12px' }} 
      />

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
            <HelpCircle size={16} color="#6b7280" />
            {data.label || 'Ask Question'}
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', color: data.text ? '#374151' : '#9ca3af', fontStyle: data.text ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
              {data.text || data.question || 'Write your question here...'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>Waiting for reply...</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <div style={{ background: '#3B4252', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C566A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expects</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> {data.validationType ? data.validationType.charAt(0).toUpperCase() + data.validationType.slice(1) : 'Text'}
              </div>
            </div>

            <div style={{ background: '#3B4252', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4C566A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saves to</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Variable size={14} /> {data.variableName || 'contact.custom_field'}
              </div>
            </div>

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

        {data.timeoutEnabled && (
          <div style={{ padding: '8px 12px', borderTop: '1px dashed #4C566A', background: '#2E3440', position: 'relative' }}>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontStyle: 'italic' }}>
              Timeout ({data.timeoutMinutes}m)
            </div>
            <Handle 
              type="source" 
              position={Position.Right} 
              id="timeout"
              className="custom-handle" 
              style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', background: '#3B4252', border: '2px solid #F59E0B', width: '12px', height: '12px' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'all 0.2s' };
const iconBtnStyleHoverRed = { ...iconBtnStyle };
