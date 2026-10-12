import React, { useState } from 'react';
import { 
  ArrowRight, Zap, Lightbulb, CheckCircle2, Variable, BookOpen, 
  ExternalLink, Sparkles, AlertTriangle, Clock, HelpCircle, Split, 
  MessageSquare, Menu, LayoutTemplate, MousePointerClick, Webhook, 
  UserPlus, Tag, ShoppingBag, ShieldAlert, ChevronRight, Layers, Link as LinkIcon, Plus
} from 'lucide-react';
import { NODE_GUIDES } from './NodeGuideModal';

export const NODE_RECOMMENDATIONS = {
  triggerNode: {
    recommended: [
      { type: 'templateNode', label: 'Template Message', desc: 'Send approved initial broadcast or greeting', handleSuggest: 'main-handle', icon: <LayoutTemplate size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'messageNode', label: 'Text Message', desc: 'Send immediate welcome or informational text', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'menuNode', label: 'Menu / Buttons', desc: 'Offer 2–10 clickable options for instant navigation', handleSuggest: 'main-handle', icon: <Menu size={14} />, color: '#6366f1', bg: '#e0e7ff' },
      { type: 'conditionNode', label: 'If / Else Logic', desc: 'Branch based on business hours or customer tags', handleSuggest: 'main-handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' }
    ],
    hint: 'Triggered automatically when a customer sends a matching keyword, taps a Click-to-WhatsApp ad, or scans your QR code.'
  },

  eventTriggerNode: {
    recommended: [
      { type: 'messageNode', label: 'Confirmation Message', desc: 'Send alert, order update, or receipt', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'conditionNode', label: 'Filter Event', desc: 'Check event status before continuing workflow', handleSuggest: 'main-handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' },
      { type: 'actionNode', label: 'CRM Action', desc: 'Assign lead or update tags in CRM', handleSuggest: 'main-handle', icon: <Tag size={14} />, color: '#10b981', bg: '#d1fae5' }
    ],
    hint: 'Starts automatically when an external webhook is received, CRM tag is added, or a scheduled timer expires.'
  },

  messageNode: {
    recommended: [
      { type: 'inputNode', label: 'Ask a Question', desc: 'Pause and collect user input (name, email, etc.)', handleSuggest: 'main-handle', icon: <HelpCircle size={14} />, color: '#3b82f6', bg: '#eff6ff' },
      { type: 'menuNode', label: 'Interactive Menu', desc: 'Provide a list picker or quick reply buttons', handleSuggest: 'main-handle', icon: <Menu size={14} />, color: '#6366f1', bg: '#e0e7ff' },
      { type: 'conditionNode', label: 'If / Else Logic', desc: 'Branch flow based on saved variables or tags', handleSuggest: 'main-handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' },
      { type: 'delayNode', label: 'Add Delay', desc: 'Wait 1–15 minutes before sending the next follow-up', handleSuggest: 'main-handle', icon: <Clock size={14} />, color: '#3b82f6', bg: '#eff6ff' }
    ],
    hint: 'Standard text messages proceed immediately after delivery. Interactive button messages wait until the customer taps a button.'
  },

  templateNode: {
    recommended: [
      { type: 'menuNode', label: 'Interactive Options', desc: 'Show menu when customer responds to broadcast', handleSuggest: 'btn-0, btn-1', icon: <Menu size={14} />, color: '#6366f1', bg: '#e0e7ff' },
      { type: 'messageNode', label: 'Follow-up Details', desc: 'Send tailored content on specific button tap', handleSuggest: 'btn-0, btn-1', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'actionNode', label: 'Tag Contact', desc: 'Tag customer based on chosen template button', handleSuggest: 'btn-0, btn-1', icon: <Tag size={14} />, color: '#10b981', bg: '#d1fae5' }
    ],
    hint: 'Each Quick Reply button on the template has its own output handle. Connect each button to a dedicated response flow.'
  },

  menuNode: {
    recommended: [
      { type: 'messageNode', label: 'Message per Choice', desc: 'Send specific answer for each selected menu row', handleSuggest: 'row-0, row-1, etc.', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'conditionNode', label: 'If / Else Routing', desc: 'Check eligibility or route dynamically by choice', handleSuggest: 'row-0 / main-handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' },
      { type: 'actionNode', label: 'Add CRM Tag', desc: 'Save user interest directly into CRM profile', handleSuggest: 'row-0, row-1, etc.', icon: <Tag size={14} />, color: '#10b981', bg: '#d1fae5' },
      { type: 'apiNode', label: 'API Webhook', desc: 'Post the selected menu choice to your external backend', handleSuggest: 'row-0, row-1, etc.', icon: <Webhook size={14} />, color: '#3b82f6', bg: '#eff6ff' }
    ],
    hint: 'Customer opens the list on WhatsApp and taps an item. The flow branches along that specific row’s handle.'
  },

  inputNode: {
    recommended: [
      { type: 'conditionNode', label: 'If / Else Logic', desc: 'Inspect the captured answer before continuing', handleSuggest: 'main-handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' },
      { type: 'messageNode', label: 'Acknowledgment Message', desc: 'Thank customer and confirm recorded answer', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'apiNode', label: 'Send to API / CRM', desc: 'Push saved variable to Google Sheet or CRM', handleSuggest: 'main-handle', icon: <Webhook size={14} />, color: '#3b82f6', bg: '#eff6ff' },
      { type: 'actionNode', label: 'Update Custom Field', desc: 'Sync customer answer into contact profile fields', handleSuggest: 'main-handle', icon: <Tag size={14} />, color: '#10b981', bg: '#d1fae5' }
    ],
    hint: 'Customer sends a reply message on WhatsApp. When validation succeeds, the engine saves the variable and proceeds.'
  },

  conditionNode: {
    recommended: [
      { type: 'messageNode', label: 'Branch Specific Messages', desc: 'Connect True and False to different messages', handleSuggest: 'True & False handles', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'actionNode', label: 'Assign / Tag', desc: 'Tag VIP contacts or assign to specific team member', handleSuggest: 'True Path', icon: <Tag size={14} />, color: '#10b981', bg: '#d1fae5' },
      { type: 'human_handoff', label: 'Human Handoff', desc: 'Escalate to live agent when high priority is met', handleSuggest: 'True Path', icon: <UserPlus size={14} />, color: '#6366f1', bg: '#e0e7ff' }
    ],
    hint: 'Always connect both True (Green) and False (Red) output handles to ensure no customer is left hanging.'
  },

  actionNode: {
    recommended: [
      { type: 'messageNode', label: 'Next Message', desc: 'Continue conversation after CRM operation completes', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'delayNode', label: 'Delay Timer', desc: 'Pause before sending next automated communication', handleSuggest: 'main-handle', icon: <Clock size={14} />, color: '#3b82f6', bg: '#eff6ff' }
    ],
    hint: 'Executes silently in the background, then immediately proceeds along the next step handle.'
  },

  apiNode: {
    recommended: [
      { type: 'messageNode', label: 'Display API Response', desc: 'Show dynamic data like order status or booking ID', handleSuggest: 'Success handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'conditionNode', label: 'Check Status / Data', desc: 'Split flow based on API response payload or code', handleSuggest: 'Success handle', icon: <Split size={14} />, color: '#f59e0b', bg: '#fef3c7' },
      { type: 'messageNode', label: 'Fallback Error Message', desc: 'Send apology or retry message if API times out', handleSuggest: 'Failure handle', icon: <MessageSquare size={14} />, color: '#ef4444', bg: '#fee2e2' }
    ],
    hint: 'Routes along Success on HTTP 200–299 responses. Connect Failure to a friendly fallback message.'
  },

  delayNode: {
    recommended: [
      { type: 'messageNode', label: 'Follow-up Message', desc: 'Re-engage customer after the waiting period', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'templateNode', label: 'Template Message', desc: 'Send re-engagement template if delay > 24 hours', handleSuggest: 'main-handle', icon: <LayoutTemplate size={14} />, color: '#059669', bg: '#ecfdf5' }
    ],
    hint: 'Engine automatically awakens the customer session after the configured delay duration expires.'
  },

  aiNode: {
    recommended: [
      { type: 'inputNode', label: 'Ask Follow-up Question', desc: 'Gather more specific details from customer', handleSuggest: 'main-handle', icon: <HelpCircle size={14} />, color: '#3b82f6', bg: '#eff6ff' },
      { type: 'human_handoff', label: 'Escalate to Live Agent', desc: 'Transfer when AI cannot resolve inquiry', handleSuggest: 'main-handle', icon: <UserPlus size={14} />, color: '#6366f1', bg: '#e0e7ff' }
    ],
    hint: 'OpenAI GPT-4 generates and sends an AI reply to the customer, then continues along the output handle.'
  },

  mediaNode: {
    recommended: [
      { type: 'messageNode', label: 'Follow-up Message', desc: 'Send description, pricing, or catalog details', handleSuggest: 'main-handle', icon: <MessageSquare size={14} />, color: '#059669', bg: '#ecfdf5' },
      { type: 'menuNode', label: 'Call to Action Menu', desc: 'Offer purchase or inquiry options for the sent media', handleSuggest: 'main-handle', icon: <Menu size={14} />, color: '#6366f1', bg: '#e0e7ff' }
    ],
    hint: 'Proceeds immediately to the next step right after the image, video, audio, or document is delivered.'
  }
};

/**
 * NextStepRecommendationCard
 * Fully responsive, modern, professional English recommendation guide inside Configuration Tab
 * Now with 1-Click Auto-Add & Connect capability directly onto the canvas!
 */
export function NextStepRecommendationCard({ 
  type, 
  localData, 
  edges = [],
  selectedNodeId,
  onAutoAddNextStep,
  onOpenFullGuide 
}) {
  const guide = NODE_GUIDES[type] || NODE_GUIDES.messageNode;
  const recData = NODE_RECOMMENDATIONS[type] || NODE_RECOMMENDATIONS.messageNode;
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute active handles for this node
  let activeHandles = guide.nextStepHandles || [];
  if (type === 'messageNode' && localData?.messageType === 'interactive' && Array.isArray(localData?.buttons) && localData.buttons.length > 0) {
    activeHandles = [
      ...localData.buttons.map((btn, idx) => ({
        handle: `btn-${btn.id || idx}`,
        title: `Button: "${btn.title || `Button ${idx + 1}`}"`,
        triggerCondition: `Customer taps "${btn.title || `Button ${idx + 1}`}" on WhatsApp.`,
        color: '#6366f1'
      })),
      ...(localData.timeoutEnabled ? [{
        handle: 'timeout',
        title: `Timeout (${localData.timeoutMinutes || 15}m)`,
        triggerCondition: 'Customer did not tap any button within the time limit.',
        color: '#f59e0b'
      }] : [])
    ];
  } else if (type === 'menuNode' && Array.isArray(localData?.sections)) {
    const rowHandles = [];
    localData.sections.forEach((sec, sIdx) => {
      (sec.rows || []).forEach((row, rIdx) => {
        rowHandles.push({
          handle: `row-${row.id || `${sIdx}_${rIdx}`}`,
          title: `Row: "${row.title || `Option ${rIdx + 1}`}"`,
          triggerCondition: `Customer selects "${row.title || `Option ${rIdx + 1}`}" from list.`,
          color: '#10b981'
        });
      });
    });
    if (rowHandles.length > 0) {
      activeHandles = [
        ...rowHandles,
        {
          handle: 'main-handle',
          title: 'Default Fallback',
          triggerCondition: 'Runs if user selects an unmapped option or sends text.',
          color: '#6366f1'
        },
        ...(localData.timeoutEnabled ? [{
          handle: 'timeout',
          title: `Timeout (${localData.timeoutMinutes || 15}m)`,
          triggerCondition: 'Customer did not make a selection within the time limit.',
          color: '#f59e0b'
        }] : [])
      ];
    }
  }

  // Helper to check if a specific handle is connected to any edge
  const isHandleConnected = (handleId) => {
    return (edges || []).some(e => {
      if (e.source !== selectedNodeId) return false;
      if (e.sourceHandle === handleId) return true;
      if (!e.sourceHandle && handleId === 'main-handle') return true;
      return false;
    });
  };

  return (
    <div style={{
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '14px',
      marginBottom: '16px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            flexShrink: 0
          }}>
            ⚡
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block', lineHeight: '1.2' }}>
              Next Step Connection Guide
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
              1-Click auto-add & wire recommendations
            </span>
          </div>
        </div>

        {onOpenFullGuide && (
          <button
            type="button"
            onClick={onOpenFullGuide}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#4F46E5',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; }}
            title="Open comprehensive documentation with live examples"
          >
            <BookOpen size={12} /> Full Guide
          </button>
        )}
      </div>

      {/* WhatsApp Trigger Hint */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '12px',
        color: '#334155',
        lineHeight: '1.45',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        wordBreak: 'break-word'
      }}>
        <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '-1px' }}>📱</span>
        <div>
          <strong style={{ color: '#0F172A' }}>WhatsApp User Action: </strong>
          {recData.hint}
        </div>
      </div>

      {/* Output Handles List with Live Connection Status */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#475569',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ArrowRight size={12} color="#10b981" /> Output Handles & Wire Status ({activeHandles.length}):
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(isExpanded ? activeHandles : activeHandles.slice(0, 3)).map((h, i) => {
            const connected = isHandleConnected(h.handle);
            return (
              <div key={i} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderLeft: `3px solid ${connected ? '#10B981' : (h.color || '#94A3B8')}`,
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11.5px',
                wordBreak: 'break-word'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: connected ? '#10B981' : '#CBD5E1',
                      display: 'inline-block',
                      flexShrink: 0
                    }} />
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>
                      {h.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <code style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                      {h.handle}
                    </code>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: connected ? '#065F46' : '#64748B',
                      background: connected ? '#D1FAE5' : '#F1F5F9',
                      padding: '1px 6px',
                      borderRadius: '100px',
                      flexShrink: 0
                    }}>
                      {connected ? '✓ Wired' : 'Unwired'}
                    </span>
                  </div>
                </div>

                <div style={{ color: '#64748B', fontSize: '11px', lineHeight: '1.4' }}>
                  {h.triggerCondition}
                </div>
              </div>
            );
          })}

          {activeHandles.length > 3 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                fontSize: '11px',
                color: '#2563EB',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isExpanded ? '▲ Show fewer handles' : `▼ Show ${activeHandles.length - 3} more handles`}
            </button>
          )}
        </div>
      </div>

      {/* Recommended Next Nodes with 1-Click Auto-Add */}
      <div>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#475569',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Sparkles size={12} color="#f59e0b" /> Recommended Next Steps (1-Click Auto-Add):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(recData.recommended || []).map((rec, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: rec.bg || '#F1F5F9',
                  color: rec.color || '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {rec.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                      {rec.label}
                    </span>
                    {rec.handleSuggest && (
                      <span style={{ fontSize: '10px', color: '#2563EB', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                        🔗 {rec.handleSuggest}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: '1.35', wordBreak: 'break-word' }}>
                    {rec.desc}
                  </p>
                </div>
              </div>

              {/* 1-Click Auto-Add & Connect Action Button */}
              {onAutoAddNextStep && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => onAutoAddNextStep(rec)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: '#FFFFFF',
                      background: '#10B981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    title={`Click to immediately add ${rec.label} to canvas and connect the wire`}
                  >
                    <Plus size={13} strokeWidth={2.5} /> Add & Connect
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * NodeInlineGuideView
 * Rendered when user selects Tab 2: "💡 How It Works & Guide"
 */
export function NodeInlineGuideView({ type, onOpenModal }) {
  const guide = NODE_GUIDES[type] || NODE_GUIDES.messageNode;
  const recData = NODE_RECOMMENDATIONS[type] || NODE_RECOMMENDATIONS.messageNode;
  const [subTab, setSubTab] = useState('how-it-works');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', width: '100%' }}>
      {/* Node Header Banner */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #E2E8F0',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            fontSize: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${guide.badgeColor || '#4F46E5'}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {guide.icon || '⚡'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                {guide.name}
              </h3>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '100px',
                background: `${guide.badgeColor || '#4F46E5'}15`,
                color: guide.badgeColor || '#4F46E5'
              }}>
                {guide.badge}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748B', lineHeight: '1.35', wordBreak: 'break-word' }}>
              {guide.shortDesc}
            </p>
          </div>
        </div>

        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#4F46E5',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            title="Open enlarged view in dialog"
          >
            <ExternalLink size={12} /> Modal
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF',
        padding: '0 12px',
        gap: '4px',
        flexShrink: 0,
        overflowX: 'auto'
      }}>
        {[
          { id: 'how-it-works', label: 'Next Steps', icon: Zap },
          { id: 'variables', label: 'Variables', icon: Variable },
          { id: 'example', label: 'Example', icon: Lightbulb },
          { id: 'tips', label: 'Meta Limits', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '10px 8px',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#4F46E5' : '#64748B',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={13} color={isActive ? '#4F46E5' : '#94A3B8'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ padding: '14px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {subTab === 'how-it-works' && (
          <>
            {/* Step by step execution */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4F46E5', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={13} /> Step-by-Step Execution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(guide.howItWorks || []).map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '700',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5', wordBreak: 'break-word' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Handles Breakdown */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowRight size={13} color="#10B981" /> Output Connection Handles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(guide.nextStepHandles || []).map((h, i) => (
                  <div key={i} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: `3px solid ${h.color || '#10b981'}`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    wordBreak: 'break-word'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                        {h.title}
                      </span>
                      <code style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                        {h.handle}
                      </code>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#64748B', lineHeight: '1.45' }}>
                      {h.triggerCondition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Nodes */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534', marginBottom: '8px' }}>
                🎯 Recommended Next Workflow Nodes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(recData.recommended || []).map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#FFFFFF', border: '1px solid #DCFCE7', padding: '8px 10px', borderRadius: '6px' }}>
                    <div style={{ color: rec.color, marginTop: '2px' }}>{rec.icon}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{rec.label}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.35', wordBreak: 'break-word' }}>{rec.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {subTab === 'variables' && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Variable size={13} color="#3B82F6" /> Variables Provided by this Node
            </div>
            {(!guide.variablesSaved || guide.variablesSaved.length === 0) ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                This node operates on existing session data and does not produce new variables.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {guide.variablesSaved.map((v, i) => (
                  <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px' }}>
                    <code style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {v.name}
                    </code>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#475569', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subTab === 'example' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#B45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={13} /> {guide.example?.scenario || 'Real-World WhatsApp Scenario'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(guide.example?.steps || []).map((step, i) => (
                <div key={i} style={{ fontSize: '11.5px', color: '#78350F', lineHeight: '1.45', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #FEF3C7', wordBreak: 'break-word' }}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {subTab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} color="#10B981" /> Meta WhatsApp Business Policies & Tips
            </div>
            {(guide.proTips || []).map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: '#10B981', fontSize: '13px', flexShrink: 0 }}>✓</span>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#334155', lineHeight: '1.45', wordBreak: 'break-word' }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
