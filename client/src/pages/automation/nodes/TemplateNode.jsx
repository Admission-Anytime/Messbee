import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, LayoutTemplate, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function TemplateNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.templateName;
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
            <LayoutTemplate size={16} color="#6b7280" />
            {data.label || 'Template Message'}
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
            
            <div style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Selected Template</div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                {data.templateName || 'No template selected'}
              </div>
              {data.templateLanguage && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Language: {data.templateLanguage}</div>
              )}
            </div>

            {data.variables && data.variables.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variable Mapping</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.variables.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div style={{ background: '#eef2ff', color: '#4f46e5', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', marginRight: '10px' }}>
                        {`{{${i+1}}}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#374151', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.value || 'Not set'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!data.variables || data.variables.length === 0) && (
              <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
                No variables required
              </div>
            )}

            {/* Template Interactive Buttons */}
            {(data.buttons && data.buttons.length > 0) && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Template Buttons</div>
                {data.buttons.map((btn, idx) => (
                  <div key={btn.id || idx} style={{ position: 'relative' }}>
                    <div style={{ 
                      background: 'white', 
                      padding: '8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      color: '#4f46e5', 
                      fontWeight: '600',
                      border: '1px solid #c7d2fe', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px'
                    }}>
                      {btn.type === 'url' ? '🔗' : '📞'} {btn.text || btn.title || 'Button'}
                    </div>
                    <Handle 
                      type="source" 
                      position={Position.Right} 
                      id={`btn-${idx}`}
                      className="custom-handle" 
                      style={{ right: '-18px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '2px solid #d1d5db', width: '12px', height: '12px' }} 
                    />
                  </div>
                ))}
              </div>
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
