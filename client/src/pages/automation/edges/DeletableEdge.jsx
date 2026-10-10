import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { X } from 'lucide-react';
import useCanvasStore from '../../../store/useCanvasStore';
import { showToast } from '../../../utils/showToast';

/**
 * DeletableEdge
 * Custom React Flow Edge that displays a sleek delete button on hover or when selected,
 * allowing users to remove individual connection wires without deleting the entire node.
 */
export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { setEdges, takeSnapshot } = useCanvasStore();

  // Guard against missing/uninitialized handle coordinates
  if (sourceX === undefined || sourceY === undefined || targetX === undefined || targetY === undefined) {
    return null;
  }

  // Calculate smoothstep path and midpoint coordinates for delete badge
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    takeSnapshot();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
    showToast.success('Connection removed', 'Connection line deleted successfully.');
  };

  const isHighlighted = selected || isHovered;
  const strokeColor = isHighlighted ? '#ef4444' : (style.stroke || '#10b981');
  const strokeWidth = isHighlighted ? 3 : (style.strokeWidth || 2);

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="deletable-edge-group"
        style={{ cursor: 'pointer' }}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: strokeColor,
            strokeWidth,
            transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
          }}
          interactionWidth={30}
        />
      </g>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isHighlighted ? 'all' : 'none',
            zIndex: isHighlighted ? 1000 : 10,
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={handleDelete}
            title="Delete connection wire (or press Delete / Backspace)"
            aria-label="Delete connection"
            style={{
              width: isHighlighted ? '22px' : '0px',
              height: isHighlighted ? '22px' : '0px',
              opacity: isHighlighted ? 1 : 0,
              pointerEvents: isHighlighted ? 'all' : 'none',
              transform: `scale(${isHighlighted ? 1 : 0.4})`,
              transition: 'opacity 0.18s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #ef4444',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3), 0 1px 3px rgba(0,0,0,0.1)',
              padding: 0,
              outline: 'none',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.15)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3), 0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <X size={12} strokeWidth={2.6} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
