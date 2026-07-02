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
      x: duplicate.position.x + 50,
      y: duplicate.position.y + 50
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
    const animatedEdges = edges ? edges.map(edge => ({ 
      ...edge, 
      animated: true,
      style: { ...edge.style, strokeWidth: 2, stroke: '#10b981' }
    })) : [];
    set({ nodes, edges: animatedEdges });
  }
}));

export default useCanvasStore;
