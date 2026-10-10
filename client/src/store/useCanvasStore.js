import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

/**
 * Canvas Store
 * Zustand state manager specifically tailored for the React Flow canvas.
 */
const useCanvasStore = create((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  
  setNodes: (updater) => set((state) => ({ nodes: typeof updater === 'function' ? updater(state.nodes) : updater })),
  setEdges: (updater) => set((state) => ({ edges: typeof updater === 'function' ? updater(state.edges) : updater })),
  
  takeSnapshot: () => {
    const { nodes, edges } = get();
    set({
      past: [...get().past, {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      }].slice(-50),
      future: []
    });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      past: newPast,
      future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...get().future],
      nodes: previous.nodes,
      edges: previous.edges
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      past: [...get().past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: newFuture,
      nodes: next.nodes,
      edges: next.edges
    });
  },

  // Handlers required by React Flow to manage internal state events (drag, select, remove)
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  // Handler for connecting two nodes
  onConnect: (connection) => {
    get().takeSnapshot();
    const newEdge = { 
      ...connection, 
      animated: true,
      style: { strokeWidth: 2, stroke: '#10b981' }
    };
    set({
      edges: addEdge(newEdge, get().edges),
    });
  },
  
  // Adds a new node from the sidebar onto the canvas
  addNode: (node) => {
    get().takeSnapshot();
    set({
      nodes: [...get().nodes, node],
    });
  },

  // Duplicates an existing node
  duplicateNode: (nodeId) => {
    const nodes = get().nodes;
    const nodeToCopy = nodes.find(n => n.id === nodeId);
    if (!nodeToCopy) return;

    get().takeSnapshot();

    // Create a deep copy of the node, assign a new ID, and offset its position
    const newNodeId = `node_${Date.now()}`;
    const duplicate = JSON.parse(JSON.stringify(nodeToCopy));
    duplicate.id = newNodeId;
    duplicate.position = {
      x: (Number(duplicate.position?.x) || 0) + 50,
      y: (Number(duplicate.position?.y) || 0) + 50
    };
    duplicate.selected = true; // Select the newly duplicated node

    // Unselect all other nodes
    const updatedNodes = nodes.map(n => ({ ...n, selected: false }));

    set({
      nodes: [...updatedNodes, duplicate],
    });
  },

  // Removes an existing node and its associated edges
  removeNode: (nodeId) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
  },

  // Removes an existing edge/connection
  removeEdge: (edgeId) => {
    get().takeSnapshot();
    set({
      edges: get().edges.filter(e => e.id !== edgeId),
    });
  },

  /**
   * updateNodeData
   * Securely merges property updates from the right-side configuration pane 
   * into the target node's `data` object without mutating or breaking the graph structure.
   * 
   * @param {string} nodeId - The ID of the node to update
   * @param {object} newConfig - The new data to merge into the node's existing data
   */
  updateNodeData: (nodeId, newConfig) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Merge the existing data with the new incoming configuration
          return {
            ...node,
            data: {
              ...node.data,
              ...newConfig,
            },
          };
        }
        return node;
      }),
    });
  },

  // Set initial data (e.g., when loading an automation from the database)
  setFlowData: (nodes, edges) => {
    // Sanitize node positions to prevent ReactFlow NaN crash
    const sanitizedNodes = nodes ? nodes.map(node => {
      const sanitized = {
        ...node,
        position: {
          x: Number(node.position?.x) || 0,
          y: Number(node.position?.y) || 0
        }
      };
      
      // CRITICAL FIX: React Flow exports positionAbsolute, which might contain NaN from previous crashes.
      // If we don't delete it, React Flow prioritizes it over the sanitized position.
      delete sanitized.positionAbsolute;

      // If width or height are invalid, remove them so ReactFlow recalculates them via ResizeObserver
      if (node.width === null || isNaN(Number(node.width))) delete sanitized.width;
      if (node.height === null || isNaN(Number(node.height))) delete sanitized.height;
      if (node.measured) {
        if (node.measured.width === null || isNaN(Number(node.measured.width))) delete sanitized.measured;
        else if (node.measured.height === null || isNaN(Number(node.measured.height))) delete sanitized.measured;
      }
      return sanitized;
    }) : [];

    const animatedEdges = edges ? edges.filter(edge => {
      // Filter out edges where source or target nodes are missing
      const sourceNode = sanitizedNodes.find(n => n.id === edge.source);
      const targetNode = sanitizedNodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return false;
      // Filter out edges pointing to a TriggerNode (since they have no target handles)
      if (targetNode.type === 'triggerNode' || targetNode.type === 'eventTriggerNode') return false;
      return true;
    }).map(edge => {
      const sourceNode = sanitizedNodes.find(n => n.id === edge.source);
      const targetNode = sanitizedNodes.find(n => n.id === edge.target);

      // 1. Safe Source Handle - Preserve existing handle if set, otherwise supply valid default
      let safeSourceHandle = edge.sourceHandle;
      if (safeSourceHandle === 'null' || safeSourceHandle === 'undefined' || safeSourceHandle === null || safeSourceHandle === '') {
        safeSourceHandle = undefined;
      }
      if (!safeSourceHandle) {
        if (sourceNode?.type === 'conditionNode') safeSourceHandle = 'true';
        else if (sourceNode?.type === 'randomizerNode') safeSourceHandle = 'path_a';
        else if (['shopifyNode', 'apiNode', 'googleSheetsNode'].includes(sourceNode?.type)) safeSourceHandle = 'success';
        else if (sourceNode?.type === 'waitForEventNode') safeSourceHandle = 'event_happened';
        else safeSourceHandle = 'main-handle';
      }

      // If timeout handle is used but timeout is disabled, redirect to main-handle
      if (safeSourceHandle === 'timeout' && !sourceNode.data?.timeoutEnabled) {
        safeSourceHandle = 'main-handle';
      }

      // 2. Safe Target Handle
      let safeTargetHandle = edge.targetHandle;
      if (safeTargetHandle === 'null' || safeTargetHandle === 'undefined' || safeTargetHandle === null) {
        safeTargetHandle = undefined;
      }
      if (targetNode?.type === 'inputNode') {
        safeTargetHandle = 'target-handle';
      } else {
        safeTargetHandle = undefined; // MUST be undefined, not null. React Flow strictly compares undefined !== null.
      }

      return { 
        ...edge,
        type: edge.type || 'deletableEdge',
        sourceHandle: safeSourceHandle, 
        targetHandle: safeTargetHandle,
        animated: true,
        style: { ...edge.style, strokeWidth: 2, stroke: (edge.style?.stroke || '#10b981') }
      };
    }) : [];
    
    set({ nodes: sanitizedNodes, edges: animatedEdges });
  }
}));

export default useCanvasStore;
