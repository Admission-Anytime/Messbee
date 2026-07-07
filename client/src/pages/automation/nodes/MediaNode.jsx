import React from 'react';
import { Handle, Position } from 'reactflow';
import { Copy, Trash2, Image as ImageIcon, Video, FileText, Mic, ImagePlus, FileImage, AlertTriangle } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';

export default function MediaNode({ id, data, selected }) {
  const duplicateNode = useCanvasStore(state => state.duplicateNode);
  const removeNode = useCanvasStore(state => state.removeNode);
  const isValid = !!data.mediaUrl;
  const borderColor = isValid ? '#10b981' : '#ef4444';
  
  const getIcon = () => {
    switch(data.messageType) {
      case 'video': return <Video size={16} color="#6b7280" />;
      case 'audio':
      case 'voice': return <Mic size={16} color="#6b7280" />;
      case 'document': return <FileText size={16} color="#6b7280" />;
      case 'sticker': return <ImagePlus size={16} color="#6b7280" />;
      case 'gif': return <FileImage size={16} color="#6b7280" />;
      case 'image':
      default: return <ImageIcon size={16} color="#6b7280" />;
    }
  };

  const getLabel = () => {
    switch(data.messageType) {
      case 'video': return 'Video Message';
      case 'audio': return 'Audio Message';
      case 'voice': return 'Voice Note';
      case 'document': return 'Document';
      case 'sticker': return 'Sticker';
      case 'gif': return 'GIF';
      case 'image':
      default: return 'Image Message';
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
            borderRadius: '8px', 
            padding: '4px', 
            border: '1px solid #4C566A',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {/* Dynamic Rich Media Placeholder */}
            {(() => {
              if (['audio', 'voice'].includes(data.messageType)) {
                return (
                  <div style={{
                    width: '100%', padding: '12px', borderRadius: '6px',
                    background: '#2E3440', border: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'center', gap: '8px', color: '#ECEFF4'
                  }}>
                    <div style={{ background: '#3b82f6', padding: '6px', borderRadius: '50%' }}>
                      <Mic size={14} color="white" />
                    </div>
                    <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                      <div style={{ width: '30%', height: '100%', background: '#3b82f6', borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              } else if (['document', 'doc'].includes(data.messageType)) {
                return (
                  <div style={{
                    width: '100%', padding: '12px', borderRadius: '6px',
                    background: '#2E3440', border: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'center', gap: '10px', color: '#ECEFF4'
                  }}>
                    <div style={{ background: '#ef4444', padding: '8px', borderRadius: '6px' }}>
                      <FileText size={16} color="white" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {data.mediaUrl ? data.mediaUrl.split('/').pop() : 'Upload Document'}
                      </span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div style={{
                    width: '100%', height: '120px', borderRadius: '6px',
                    background: (data.mediaUrl && ['image', 'sticker', 'gif'].includes(data.messageType)) ? `url(${data.mediaUrl}) center/cover` : '#f3f4f6',
                    border: data.mediaUrl ? 'none' : '1px dashed #d1d5db',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#9CA3AF', position: 'relative', overflow: 'hidden'
                  }}>
                    {data.mediaUrl && data.messageType === 'video' && (
                      <video src={data.mediaUrl} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {data.mediaUrl && data.messageType === 'video' && (
                      <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', zIndex: 2 }}>
                        <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid white', marginLeft: '3px' }} />
                      </div>
                    )}
                    {!data.mediaUrl && (
                      <>
                        {getIcon()}
                        <span style={{ fontSize: '11px', fontWeight: '500' }}>
                          Upload {data.messageType === 'doc' ? 'Document' : data.messageType ? data.messageType.charAt(0).toUpperCase() + data.messageType.slice(1) : 'Media'}
                        </span>
                      </>
                    )}
                  </div>
                );
              }
            })()}
            
            {data.text && ['image', 'video', 'doc', 'document', 'gif'].includes(data.messageType) && (
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '12px', color: '#D8DEE9', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {data.text}
                </div>
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
