import React, { useCallback, useEffect, useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, MarkerType, useReactFlow, ReactFlowProvider, getOutgoers } from 'reactflow';
import { Undo, Redo, ZoomIn, ZoomOut, Maximize, FilePlus2, Zap, LayoutTemplate, MessageSquare, Image as ImageIcon, GitBranch, Clock, Globe } from 'lucide-react';
import useCanvasStore from '../../store/useCanvasStore';
import MessageNode from './nodes/MessageNode';
import TriggerNode from './nodes/TriggerNode';
import MenuNode from './nodes/MenuNode';
import InputNode from './nodes/InputNode';
import MediaNode from './nodes/MediaNode';
import CarouselNode from './nodes/CarouselNode';
import CatalogNode from './nodes/CatalogNode';
import PollNode from './nodes/PollNode';
import CommerceNode from './nodes/CommerceNode';
import UtilityNode from './nodes/UtilityNode';
import EventTriggerNode from './nodes/EventTriggerNode';
import TemplateNode from './nodes/TemplateNode';
import ReactionNode from './nodes/ReactionNode';
import ConditionNode from './nodes/ConditionNode';
import ApiNode from './nodes/ApiNode';
import DelayNode from './nodes/DelayNode';
import AiNode from './nodes/AiNode';
import ActionNode from './nodes/ActionNode';
import RandomizerNode from './nodes/RandomizerNode';
import ShopifyNode from './nodes/ShopifyNode';
import WaitForEventNode from './nodes/WaitForEventNode';
import AddNextStepModal from '../../components/Modol/automation/AddNextStepModal';

function FlowCanvasInner({ onNodesChange: notifyNodesChange, onAddTrigger, onStartWithTemplate }) {
  const nodeTypes = useMemo(() => ({
    messageNode: MessageNode,
    triggerNode: TriggerNode,
    menuNode: MenuNode,
    inputNode: InputNode,
    mediaNode: MediaNode,
    carouselNode: CarouselNode,
    catalogNode: CatalogNode,
    pollNode: PollNode,
    commerceNode: CommerceNode,
    utilityNode: UtilityNode,
    eventTriggerNode: EventTriggerNode,
    templateNode: TemplateNode,
    reactionNode: ReactionNode,
    conditionNode: ConditionNode,
    apiNode: ApiNode,
    delayNode: DelayNode,
    aiNode: AiNode,
    actionNode: ActionNode,
    randomizerNode: RandomizerNode,
    shopifyNode: ShopifyNode,
    waitForEventNode: WaitForEventNode
  }), []);

  const { nodes, edges, setNodes, setEdges, selectNode, undo, redo, past, future, takeSnapshot } = useCanvasStore();
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  useEffect(() => {
    if (notifyNodesChange) {
      notifyNodesChange(nodes);
    }
  }, [nodes, notifyNodesChange]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect = useCallback(
    (connection) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      let edgeColor = '#10b981'; // Green default

      if (sourceNode && sourceNode.data.buttons) {
        const btnIndex = sourceNode.data.buttons.findIndex((b, idx) => `btn-${b.id || idx}` === connection.sourceHandle);
        if (btnIndex === 0) edgeColor = '#3b82f6'; // Blue
        else if (btnIndex === 1) edgeColor = '#22c55e'; // Green
        else if (btnIndex === 2) edgeColor = '#ef4444'; // Red
        else if (btnIndex > 2) edgeColor = '#8b5cf6'; // Purple for any additional
      }

      const customEdge = {
        ...connection,
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: edgeColor,
        },
      };

      setEdges((eds) => addEdge(customEdge, eds));
    },
    [nodes, setEdges]
  );

  const handleAddNode = (stepItem) => {
    const newNodeId = `node_${Date.now()}`;
    let type = 'messageNode';
    let messageType = 'text';
    let dataPayload = {};

    if (stepItem.id === 'interactive_msg' || stepItem.id === 'button_msg') {
      messageType = 'interactive';
    } else if (stepItem.id === 'menu_msg' || stepItem.id === 'list_msg') {
      type = 'menuNode';
      messageType = 'menu';
      dataPayload = { menuButtonText: 'View Menu', sections: [{ id: `sec_${Date.now()}`, title: 'Options', rows: [] }] };
    } else if (stepItem.id && stepItem.id.startsWith('ask_')) {
      type = 'inputNode';
      messageType = 'input';
      dataPayload = { validationType: stepItem.id.replace('ask_', ''), variableName: `contact.${stepItem.id.replace('ask_', '')}` };
    } else if (['image_msg', 'video_msg', 'audio_msg', 'doc_msg', 'sticker_msg', 'gif_msg', 'voice_msg'].includes(stepItem.id)) {
      type = 'mediaNode';
      messageType = stepItem.id.replace('_msg', '');
    } else if (stepItem.id === 'carousel_msg') {
      type = 'carouselNode';
      dataPayload = { cards: [] };
    } else if (stepItem.id === 'single_product' || stepItem.id === 'multi_product' || stepItem.id === 'catalog') {
      type = 'catalogNode';
      dataPayload = { catalogType: stepItem.id };
    } else if (stepItem.id === 'poll_msg') {
      type = 'pollNode';
      dataPayload = { options: [], allowMultipleAnswers: false };
    } else if (['otp_msg', 'coupon_msg', 'invoice_msg', 'payment_msg'].includes(stepItem.id)) {
      type = 'commerceNode';
      dataPayload = { commerceType: stepItem.id.replace('_msg', '') };
    } else if (['location_msg', 'contact_msg', 'calendar_msg'].includes(stepItem.id)) {
      type = 'utilityNode';
      dataPayload = { utilityType: stepItem.id.replace('_msg', '') };
    } else if (stepItem.id === 'template') {
      type = 'templateNode';
      dataPayload = { templateName: '', templateLanguage: '', variables: [] };
    } else if (stepItem.id === 'reaction_msg') {
      type = 'reactionNode';
      dataPayload = { emoji: '' };
    } else if (stepItem.id === 'if_else') {
      type = 'conditionNode';
      dataPayload = { variable: '', operator: 'equals', value: '' };
    } else if (stepItem.id === 'api_call') {
      type = 'apiNode';
      dataPayload = { method: 'POST', url: '', headers: '', body: '' };
    } else if (stepItem.id === 'delay') {
      type = 'delayNode';
      dataPayload = { delayAmount: '1', delayUnit: 'Minutes' };
    } else if (stepItem.id === 'call_chatgpt' || stepItem.id === 'garvik_ai') {
      type = 'aiNode';
      dataPayload = { systemPrompt: '', saveVariable: '' };
    } else if (['opt_in', 'opt_out', 'update_contact', 'assign_team', 'unassign_team', 'round_robin_assign'].includes(stepItem.id)) {
      type = 'actionNode';
      dataPayload = { actionType: stepItem.id };
    } else if (stepItem.id === 'randomizer') {
      type = 'randomizerNode';
      dataPayload = { splitPercentage: 50 };
    } else if (stepItem.id === 'shopify') {
      type = 'shopifyNode';
      dataPayload = { shopifyAction: 'get_customer', shopifyStoreUrl: '' };
    } else if (stepItem.id === 'wait_event') {
      type = 'waitForEventNode';
      dataPayload = { eventType: 'any_message', waitHours: 24 };
    }

    const newNode = {
      id: newNodeId,
      type: type,
      position: { x: 250, y: nodes.length * 150 + 100 },
      data: {
        label: stepItem.label,
        messageType: messageType,
        text: `Configure your ${stepItem.label} step here.`,
        ...dataPayload
      },
      selected: true
    };
    
    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    setIsAddNodeModalOpen(false);
  };

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;

    const checkCycle = (currentNode, targetNodeId, visited = new Set()) => {
      if (visited.has(currentNode.id)) return false;
      visited.add(currentNode.id);
      if (currentNode.id === targetNodeId) return true;
      const outgoers = getOutgoers(currentNode, nodes, edges);
      return outgoers.some(n => checkCycle(n, targetNodeId, visited));
    };

    const targetNode = nodes.find(n => n.id === connection.target);
    const sourceNode = nodes.find(n => n.id === connection.source);
    
    if (checkCycle(targetNode, sourceNode.id)) {
      alert("Cyclic connections (infinite loops) are not allowed.");
      return false;
    }
    return true;
  }, [nodes, edges]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ffffff' }}>
      
      {/* Inject CSS */}
      <style>{`
        .react-flow__handle { transition: all 0.2s !important; }
        .react-flow__handle:hover { transform: scale(1.3) !important; background: #3b82f6 !important; border-color: #3b82f6 !important; }
        .ctrl-btn:hover { background: #f3f4f6 !important; color: #111827 !important; }
        .ctrl-btn { transition: all 0.15s !important; }
      `}</style>

      {/* Dotted Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Floating Tag */}
      <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        BOT CANVAS
      </div>

      {nodes.length === 0 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          
          <button 
            onClick={() => onAddTrigger ? onAddTrigger() : setIsAddNodeModalOpen(true)}
            style={{ 
              background: 'white', 
              color: '#4b5563', 
              border: '1px solid #e5e7eb', 
              padding: '10px 32px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              width: '240px',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
          >
            <Zap size={14} /> Add trigger
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '200px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          <button 
            onClick={onStartWithTemplate}
            style={{ 
              background: 'white', 
              color: '#4b5563', 
              border: '1px solid #e5e7eb', 
              padding: '10px 32px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              width: '240px',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
          >
            <LayoutTemplate size={14} /> Start with template
          </button>

        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        onNodeDragStart={() => takeSnapshot()}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2, stroke: '#3b82f6' },
        }}
      >
        <Background color="transparent" />
      </ReactFlow>

      {/* Dynamic React Flow MiniMap */}
      <MiniMap 
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          width: '120px',
          height: '80px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          margin: 0
        }}
        nodeColor={(node) => {
          if (node.type === 'triggerNode') return '#8b5cf6';
          return '#10b981';
        }}
      />

      {/* Bottom Toolbar Pill */}
      {/* Custom Bottom Pill Toolbar */}
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'white', border: '1px solid #e5e7eb', borderRadius: '100px', padding: '6px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <button 
          onClick={() => setIsAddNodeModalOpen(true)}
          style={{ background: 'white', color: '#111827', border: '1px solid #e5e7eb', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid currentColor', opacity: 0.5 }} /> Add new node
        </button>

        <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />

        <button 
          onClick={undo}
          disabled={past.length === 0}
          className="ctrl-btn" 
          style={{ ...pillIconBtn, opacity: past.length === 0 ? 0.4 : 1, cursor: past.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Undo size={14} />
        </button>
        <button 
          onClick={redo}
          disabled={future.length === 0}
          className="ctrl-btn" 
          style={{ ...pillIconBtn, opacity: future.length === 0 ? 0.4 : 1, cursor: future.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Redo size={14} />
        </button>
        
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />

        <button className="ctrl-btn" style={pillIconBtn} onClick={() => zoomIn()}><ZoomIn size={14} /></button>
        <button className="ctrl-btn" style={pillIconBtn} onClick={() => zoomOut()}><ZoomOut size={14} /></button>
        <button className="ctrl-btn" style={{ ...pillIconBtn, padding: '4px 8px', fontSize: '12px', fontWeight: '600' }} onClick={() => fitView({ duration: 800 })}>100%</button>
        <button className="ctrl-btn" style={pillIconBtn} onClick={() => fitView({ duration: 800 })}><Maximize size={14} /></button>

      </div>

      {/* Bottom branding */}
      <div style={{ position: 'absolute', bottom: '8px', right: '16px', fontSize: '9px', color: '#64748B', fontWeight: '700', zIndex: 5, textAlign: 'right', letterSpacing: '0.05em' }}>
        PROUDLY POWERED BY <span style={{ color: '#10B981' }}>MESSBEE</span><br/>
        <span style={{ color: '#94A3B8', fontWeight: '500' }}>Dynamic Engine</span>
      </div>

      {isAddNodeModalOpen && (
        <AddNextStepModal 
          onClose={() => setIsAddNodeModalOpen(false)} 
          onSelectStep={handleAddNode} 
        />
      )}
    </div>
  );
}

const pillIconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%'
};

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
