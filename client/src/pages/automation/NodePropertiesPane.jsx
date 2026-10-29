import React, { useState, useEffect, useRef } from 'react';
import useCanvasStore from '../../store/useCanvasStore';
import api from '../../context/axios';
import { Settings, Zap, Variable, AlertTriangle, Link as LinkIcon, Phone, MessageCircle, Trash2, ClipboardList, Clock, Tag, Image as ImageIcon, LayoutGrid, Bold, Italic, Strikethrough, Code, BookOpen, Calendar, Check, Plus, Edit3, Save, UserCheck, Sparkles, Copy } from 'lucide-react';
import { showToast } from '../../utils/showToast';
import TriggerSelectionModal from '../../components/Modol/automation/TriggerSelectionModal';
import NodeGuideModal from '../../components/Modol/automation/NodeGuideModal';
import { NextStepRecommendationCard, NodeInlineGuideView } from '../../components/Modol/automation/NodeRecommendations';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import StandeeQrGenerator from './StandeeQrGenerator';

// Fix Leaflet's default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ localData, setLocalData, updateNodeData, id }) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);

  const defaultCenter = [51.505, -0.09]; // Default London
  const center = localData.latitude && localData.longitude 
    ? [localData.latitude, localData.longitude] 
    : defaultCenter;

  const handleMapClick = async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    setLocalData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    updateNodeData(id, { latitude: lat, longitude: lng });

    try {
      setIsGeocoding(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
         setLocalData(prev => ({ ...prev, locationAddress: data.display_name }));
         updateNodeData(id, { locationAddress: data.display_name });
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsGeocoding(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setLocalData(prev => ({ ...prev, latitude: lat, longitude: lng, locationAddress: data[0].display_name }));
        updateNodeData(id, { latitude: lat, longitude: lng, locationAddress: data[0].display_name });
        
        if (mapInstance) {
          mapInstance.flyTo([lat, lng], 13);
        }
      } else {
        showToast.warning("Location", "Location not found. Try a different city or pin code.");
      }
    } catch (e) {
      console.error(e);
      showToast.error("Location Error", "Failed to search location.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      if (map && !mapInstance) {
        setMapInstance(map);
      }
    }, [map]);
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
        Search or Select Location on Map
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Search city, pin code, etc." 
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
        />
        <button 
          onClick={handleSearch}
          disabled={isGeocoding}
          style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '0 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: isGeocoding ? 'not-allowed' : 'pointer' }}
        >
          {isGeocoding ? '...' : 'Search'}
        </button>
      </div>
      <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1', position: 'relative' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {(localData.latitude && localData.longitude) && (
            <Marker position={[localData.latitude, localData.longitude]} />
          )}
          <MapEvents />
        </MapContainer>
      </div>
      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Click on the map or use the search bar to drop a pin and auto-fill the address.</div>
    </div>
  );
}
const inputStyle = {
  width: '100%',
  padding: '8px 11px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#1F2937',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

function WhatsAppMessageField({
  label = 'Message',
  name = 'text',
  value = '',
  placeholder = 'Write a message...',
  maxLength = 1024,
  minHeight = '120px',
  inputStyle = {},
  localData,
  setLocalData,
  updateNodeData,
  id,
  showVariables = true,
  showFormatting = true,
}) {
  const textareaRef = useRef(null);

  const applyFormat = (marker) => {
    const el = textareaRef.current;
    const str = value || '';
    const start = el ? el.selectionStart : str.length;
    const end = el ? el.selectionEnd : str.length;

    let newStr = '';
    let selStart = start;
    let selEnd = end;

    if (start !== end) {
      const selected = str.substring(start, end);
      if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= marker.length * 2) {
        // Toggle off if already formatted
        const inner = selected.slice(marker.length, -marker.length);
        newStr = str.substring(0, start) + inner + str.substring(end);
        selStart = start;
        selEnd = start + inner.length;
      } else {
        // Wrap with marker
        const wrapped = `${marker}${selected}${marker}`;
        newStr = str.substring(0, start) + wrapped + str.substring(end);
        selStart = start;
        selEnd = start + wrapped.length;
      }
    } else {
      // Nothing selected: insert sample placeholder
      const sample = 'text';
      const inserted = `${marker}${sample}${marker}`;
      newStr = str.substring(0, start) + inserted + str.substring(end);
      selStart = start + marker.length;
      selEnd = start + marker.length + sample.length;
    }

    if (newStr.length <= maxLength) {
      setLocalData(prev => ({ ...prev, [name]: newStr }));
      updateNodeData(id, { [name]: newStr });
      setTimeout(() => {
        if (el) {
          el.focus();
          el.setSelectionRange(selStart, selEnd);
        }
      }, 0);
    }
  };

  const insertVariable = (varText = '{{contact.name}}') => {
    const el = textareaRef.current;
    const str = value || '';
    const start = el ? el.selectionStart : str.length;
    const end = el ? el.selectionEnd : str.length;

    const newStr = str.substring(0, start) + varText + str.substring(end);
    if (newStr.length <= maxLength) {
      setLocalData(prev => ({ ...prev, [name]: newStr }));
      updateNodeData(id, { [name]: newStr });
      setTimeout(() => {
        if (el) {
          el.focus();
          const nextPos = start + varText.length;
          el.setSelectionRange(nextPos, nextPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('*');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('_');
    }
  };

  const toolBtnStyle = {
    background: '#F3F4F6',
    border: '1px solid #E5E7EB',
    color: '#374151',
    borderRadius: '5px',
    padding: '3px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.15s ease'
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>
          {label} <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'normal', marginLeft: '4px' }}>({(value || '').length}/{maxLength})</span>
        </label>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {showFormatting && (
            <>
              <button 
                type="button" 
                title="Bold (*text* or Ctrl+B)" 
                onClick={() => applyFormat('*')} 
                style={{ ...toolBtnStyle, minWidth: '26px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
              >
                <Bold size={13} strokeWidth={2.8} />
              </button>
              <button 
                type="button" 
                title="Italic (_text_ or Ctrl+I)" 
                onClick={() => applyFormat('_')} 
                style={{ ...toolBtnStyle, minWidth: '26px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
              >
                <Italic size={13} />
              </button>
              <button 
                type="button" 
                title="Strikethrough (~text~)" 
                onClick={() => applyFormat('~')} 
                style={{ ...toolBtnStyle, minWidth: '26px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
              >
                <Strikethrough size={13} />
              </button>
            </>
          )}

          {showVariables && (
            <button 
              type="button" 
              title="Insert variable" 
              onClick={() => insertVariable('{{contact.name}}')} 
              style={toolBtnStyle}
              onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
              onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
            >
              <Variable size={12} /> Insert {'{}'}
            </button>
          )}
        </div>
      </div>

      <textarea 
        ref={textareaRef}
        name={name} 
        value={value || ''} 
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            setLocalData(prev => ({ ...prev, [name]: e.target.value }));
          }
        }} 
        onBlur={(e) => {
          updateNodeData(id, { [name]: e.target.value });
        }} 
        onKeyDown={handleKeyDown}
        style={{ ...inputStyle, minHeight, resize: 'vertical' }} 
        placeholder={placeholder} 
      />
    </div>
  );
}

export default function NodePropertiesPane({ currentChannelId }) {
  const { nodes, setNodes, edges, setEdges, updateNodeData, takeSnapshot } = useCanvasStore();
  const [localData, setLocalData] = useState(null);
  const [uploadMode, setUploadMode] = useState('url');
  const [isUploading, setIsUploading] = useState(false);
  const [channelPhone, setChannelPhone] = useState('');
  const [approvedTemplates, setApprovedTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [availableEntities, setAvailableEntities] = useState([]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);

  useEffect(() => {
    if (currentChannelId) {
      api.get('/whatsapp/channels').then(res => {
        const channel = res.data.find(c => c._id === currentChannelId);
        if (channel && channel.phoneNumber) {
          // Remove all non-digits (spaces, +, dashes) for valid wa.me link
          setChannelPhone(channel.phoneNumber.replace(/\D/g, ''));
        }
      }).catch(console.error);
    }
  }, [currentChannelId]);

  useEffect(() => {
    api.get('/entities')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAvailableEntities(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching entities for dropdown:', err));
  }, []);

  const selectedNode = nodes.find(n => n.selected);

  // ─── Inline Booking & Resource Timing States ─────────────────────
  const [selectedEntityForTiming, setSelectedEntityForTiming] = useState('');
  const [isSavingTiming, setIsSavingTiming] = useState(false);
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);
  const [timingFormData, setTimingFormData] = useState({
    name: '',
    category: 'doctor',
    identifier: '',
    start1: '09:00',
    end1: '13:00',
    hasShift2: true,
    start2: '17:00',
    end2: '20:00',
    stepMinutes: 30,
    totalCapacity: 1,
    activeDays: [1, 2, 3, 4, 5, 6] // Mon-Sat
  });

  const loadEntityTimingIntoForm = (ent) => {
    if (!ent) return;
    setSelectedEntityForTiming(ent._id);
    const w0 = ent.availabilityWindows?.[0] || {};
    const int1 = w0.activeIntervals?.[0] || { start: '09:00', end: '13:00' };
    const int2 = w0.activeIntervals?.[1] || null;
    const days = (ent.availabilityWindows || []).map(w => w.dayOfWeek);

    setTimingFormData({
      name: ent.name || '',
      category: ent.category || 'doctor',
      identifier: ent.identifier || '',
      start1: int1.start || '09:00',
      end1: int1.end || '13:00',
      hasShift2: !!int2,
      start2: int2?.start || '17:00',
      end2: int2?.end || '20:00',
      stepMinutes: ent.allocationStepMinutes || 30,
      totalCapacity: ent.totalCapacity || 1,
      activeDays: days.length > 0 ? days : [1, 2, 3, 4, 5, 6]
    });
  };

  const handleSaveResourceTiming = async () => {
    if (!timingFormData.name || !timingFormData.name.trim()) {
      showToast.error('Please enter a Resource / Doctor Name');
      return;
    }
    setIsSavingTiming(true);
    try {
      const activeIntervals = [
        { start: timingFormData.start1, end: timingFormData.end1 }
      ];
      if (timingFormData.hasShift2 && timingFormData.start2 && timingFormData.end2) {
        activeIntervals.push({ start: timingFormData.start2, end: timingFormData.end2 });
      }

      const availabilityWindows = (timingFormData.activeDays || [1, 2, 3, 4, 5, 6]).map(day => ({
        dayOfWeek: day,
        activeIntervals
      }));

      const existing = availableEntities.find(ent => 
        (selectedEntityForTiming && ent._id === selectedEntityForTiming) ||
        (timingFormData.name && ent.name.trim().toLowerCase() === timingFormData.name.trim().toLowerCase())
      );

      let targetId = existing?._id;

      if (targetId) {
        const payload = {
          name: timingFormData.name.trim(),
          category: timingFormData.category || 'general',
          allocationStepMinutes: Number(timingFormData.stepMinutes) || 30,
          totalCapacity: Number(timingFormData.totalCapacity) || 1,
          availabilityWindows
        };
        const res = await api.put(`/entities/${targetId}`, payload);
        if (!res.data?.success) throw new Error(res.data?.message || 'Failed to save');
        showToast.success('Timings Saved!', `Updated schedule for ${timingFormData.name.trim()}`);
      } else {
        const idClean = timingFormData.name.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
        const payload = {
          name: timingFormData.name.trim(),
          identifier: idClean,
          category: timingFormData.category || 'general',
          allocationStepMinutes: Number(timingFormData.stepMinutes) || 30,
          totalCapacity: Number(timingFormData.totalCapacity) || 1,
          availabilityWindows,
          isActive: true
        };
        const res = await api.post('/entities', payload);
        if (!res.data?.success) throw new Error(res.data?.message || 'Failed to create');
        targetId = res.data.data?._id;
        showToast.success('Resource Created!', `${timingFormData.name.trim()} added with live schedule!`);
      }

      if (targetId) {
        setSelectedEntityForTiming(targetId);
        if (selectedNode?.type === 'bookingNode') {
          const up = { entityId: targetId, entityName: timingFormData.name.trim(), useDynamicEntity: false };
          setLocalData(prev => ({ ...prev, ...up }));
          updateNodeData(selectedNode.id, up);
        }
      }

      const refreshRes = await api.get('/entities');
      if (refreshRes.data?.success && Array.isArray(refreshRes.data.data)) {
        setAvailableEntities(refreshRes.data.data);
      }
    } catch (err) {
      console.error('Error saving entity timing:', err);
      showToast.error('Save Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSavingTiming(false);
    }
  };

  const handleCreateNewResource = handleSaveResourceTiming;

  const handleSelectTrigger = (triggerId) => {
    let mappedType = triggerId;
    if (triggerId === 'webhook') mappedType = 'api_webhook';
    if (triggerId === 'crm') mappedType = 'crm_event';
    if (triggerId === 'manual') mappedType = 'manual_trigger';
    if (triggerId === 'specific_message') mappedType = 'exact_match';

    const updated = { triggerType: mappedType };
    setLocalData(prev => ({ ...prev, ...updated }));
    if (selectedNode?.id) {
      updateNodeData(selectedNode.id, updated);
    }
    setIsTriggerModalOpen(false);
    showToast.success('Trigger Selected', `Trigger set to: ${triggerId.replace(/_/g, ' ')}`);
  };

  const handleAutoAddNextStep = (recItem, preferredHandle) => {
    if (!selectedNode) return;
    
    if (takeSnapshot) takeSnapshot();

    const newNodeId = `node_${Date.now()}`;
    const baseType = recItem.type === 'human_handoff' ? 'actionNode' : recItem.type;

    let dataPayload = { text: `Configure your ${recItem.label} here.` };
    let messageType = 'text';

    if (baseType === 'messageNode') {
      messageType = 'text';
      dataPayload = { text: 'Hello! How can we help you today?' };
    } else if (baseType === 'inputNode') {
      dataPayload = {
        text: 'Please enter your reply:',
        validationType: 'text',
        variableName: 'contact.answer',
        validationErrorMessage: 'Please provide a valid answer.'
      };
    } else if (baseType === 'conditionNode') {
      dataPayload = {
        variable: 'contact.tags',
        operator: 'contains',
        value: ''
      };
    } else if (baseType === 'menuNode') {
      const defaultRowId = `row_${Date.now()}`;
      dataPayload = {
        text: 'Please select an option from the list below:',
        menuButtonText: 'View Options',
        sections: [{
          id: `sec_${Date.now()}`,
          title: 'Options',
          rows: [{ id: defaultRowId, title: 'Option 1', description: '', postbackId: defaultRowId }]
        }]
      };
    } else if (baseType === 'apiNode') {
      dataPayload = { method: 'GET', url: '', headers: '', body: '' };
    } else if (baseType === 'delayNode') {
      dataPayload = { delayAmount: '5', delayUnit: 'Minutes' };
    } else if (baseType === 'actionNode') {
      const actType = recItem.actionType || (recItem.type === 'human_handoff' ? 'human_handoff' : 'notify_whatsapp');
      dataPayload = { actionType: actType, tag: '' };
    } else if (baseType === 'templateNode') {
      dataPayload = { templateName: '', templateLanguage: 'en', variables: [] };
    }

    const currentX = Number(selectedNode.position?.x) || 250;
    const currentY = Number(selectedNode.position?.y) || 150;
    
    const existingOutgoers = (edges || []).filter(e => e.source === selectedNode.id);
    const yOffset = existingOutgoers.length * 140;

    const spawnX = currentX + 340;
    const spawnY = currentY + yOffset;

    const newNode = {
      id: newNodeId,
      type: baseType,
      position: { x: spawnX, y: spawnY },
      data: {
        label: recItem.label,
        messageType: messageType,
        ...dataPayload
      },
      selected: false
    };

    // Determine the sourceHandle
    let safeSourceHandle = preferredHandle;
    if (!safeSourceHandle) {
      if (selectedNode.type === 'conditionNode') {
        const hasTrue = existingOutgoers.some(e => e.sourceHandle === 'true');
        safeSourceHandle = hasTrue ? 'false' : 'true';
      } else if (selectedNode.type === 'apiNode') {
        const hasSuccess = existingOutgoers.some(e => e.sourceHandle === 'success');
        safeSourceHandle = hasSuccess ? 'failure' : 'success';
      } else if (selectedNode.type === 'messageNode' && localData?.messageType === 'interactive' && localData?.buttons?.length > 0) {
        const unconnectedBtn = localData.buttons.find(b => !existingOutgoers.some(e => e.sourceHandle === `btn-${b.id}`));
        safeSourceHandle = unconnectedBtn ? `btn-${unconnectedBtn.id}` : `btn-${localData.buttons[0].id}`;
      } else if (selectedNode.type === 'menuNode' && localData?.sections?.length > 0) {
        let firstUnconnected = null;
        for (const sec of localData.sections) {
          for (const row of sec.rows || []) {
            if (!existingOutgoers.some(e => e.sourceHandle === `row-${row.id}`)) {
              firstUnconnected = `row-${row.id}`;
              break;
            }
          }
          if (firstUnconnected) break;
        }
        safeSourceHandle = firstUnconnected || 'main-handle';
      } else {
        safeSourceHandle = 'main-handle';
      }
    }

    const newEdge = {
      id: `edge_${selectedNode.id}_${newNodeId}_${Date.now()}`,
      source: selectedNode.id,
      sourceHandle: safeSourceHandle,
      target: newNodeId,
      targetHandle: baseType === 'inputNode' ? 'target-handle' : undefined,
      type: 'deletableEdge',
      animated: true,
      style: { strokeWidth: 2, stroke: '#10b981' }
    };

    if (setNodes) {
      setNodes(nds => nds.concat(newNode));
    }
    if (setEdges) {
      setEdges(eds => eds.concat(newEdge));
    }

    showToast.success('Node Connected', `Added ${recItem.label} and wired to ${safeSourceHandle}`);
  };

  useEffect(() => {
    if (selectedNode) {
      let data = { ...selectedNode.data };
      // If template is already chosen, ensure isLimitedTimeOffer is only true if template actually has LIMITED_TIME_OFFER
      if (data.isLimitedTimeOffer && approvedTemplates.length > 0) {
        const matchingTmpl = approvedTemplates.find(t => t.name === data.templateName);
        if (matchingTmpl) {
          const hasLto = (matchingTmpl.components || []).some(c => String(c?.type || '').toUpperCase() === 'LIMITED_TIME_OFFER') || matchingTmpl.isLimitedTimeOffer === true;
          if (!hasLto) {
            data.isLimitedTimeOffer = false;
            data.customExpirationHours = null;
            updateNodeData(selectedNode.id, { isLimitedTimeOffer: false, customExpirationHours: null });
          }
        }
      }

      if (selectedNode.type === 'commerceNode' && data.commerceType === 'payment') {
        let changed = false;
        if (!data.currency) { data.currency = 'INR'; changed = true; }
        if (!data.amount) { data.amount = '499'; changed = true; }
        if (changed) updateNodeData(selectedNode.id, { currency: data.currency, amount: data.amount });
      }
      setLocalData(data);
      setTemplateSearch('');
      if (selectedNode.type === 'bookingNode' && availableEntities.length > 0) {
        const ent = availableEntities.find(e => e._id === data.entityId) || availableEntities[0];
        if (ent) loadEntityTimingIntoForm(ent);
      }
    } else {
      setLocalData(null);
    }
  }, [selectedNode?.id, approvedTemplates, availableEntities]);

  // Fetch approved templates when a templateNode is selected
  useEffect(() => {
    if (selectedNode?.type === 'templateNode' && approvedTemplates.length === 0) {
      setLoadingTemplates(true);
      api.get('/whatsapp/templates')
        .then(res => {
          const all = res.data?.approvedTemplates || res.data?.data?.data || (Array.isArray(res.data?.data) ? res.data.data : []);
          const approved = all.filter(t => t.status === 'APPROVED');
          setApprovedTemplates(approved.length > 0 ? approved : all);
        })
        .catch(() => {})
        .finally(() => setLoadingTemplates(false));
    }
  }, [selectedNode?.id, selectedNode?.type]);

  if (!selectedNode || !localData) {
    return (
      <div className="properties-pane" style={{
        borderLeft: '1px solid #E5E7EB',
        background: '#F9FAFB',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6B7280',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <Settings size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
        <p>Select a node to edit its properties</p>
      </div>
    );
  }

  const { id, type } = selectedNode;

  const handleLocalChange = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    updateNodeData(id, { [name]: value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
    const fileSizeStr = formatBytes(file.size);

    let durationStr = null;
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      try {
        const objectUrl = URL.createObjectURL(file);
        const media = document.createElement(file.type.startsWith('audio/') ? 'audio' : 'video');
        media.src = objectUrl;
        await new Promise((resolve) => {
          media.addEventListener('loadedmetadata', () => {
            if (media.duration && media.duration !== Infinity) {
              const totalSeconds = Math.floor(media.duration);
              const m = Math.floor(totalSeconds / 60);
              const s = totalSeconds % 60;
              durationStr = `${m}:${s.toString().padStart(2, '0')}`;
            }
            URL.revokeObjectURL(objectUrl);
            resolve();
          });
          media.addEventListener('error', () => {
             URL.revokeObjectURL(objectUrl);
             resolve();
          });
        });
      } catch (err) {
        console.error("Error reading duration", err);
      }
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const resData = response.data;
      if (resData && resData.success) {
        const updatePayload = { mediaUrl: resData.data.url, mediaSize: fileSizeStr, fileName: file.name };
        if (durationStr) updatePayload.mediaDuration = durationStr;
        
        setLocalData(prev => ({ ...prev, ...updatePayload }));
        updateNodeData(id, updatePayload);
      } else {
        throw new Error(resData.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      showToast.error('Upload Failed', error.response?.data?.message || 'Upload failed. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonLocalChange = (index, field, value) => {
    const newButtons = [...(localData.buttons || [])];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setLocalData(prev => ({ ...prev, buttons: newButtons }));
  };

  const handleButtonBlur = () => {
    updateNodeData(id, { buttons: localData.buttons });
  };

  const addButton = () => {
    const newButtons = [...(localData.buttons || []), { id: `btn_${Date.now()}`, title: '', type: 'reply' }];
    setLocalData(prev => ({ ...prev, buttons: newButtons }));
    updateNodeData(id, { buttons: newButtons });
  };

  const removeButton = (index) => {
    const newButtons = [...(localData.buttons || [])];
    const removedBtn = newButtons[index];
    newButtons.splice(index, 1);
    setLocalData(prev => ({ ...prev, buttons: newButtons }));
    updateNodeData(id, { buttons: newButtons });
    
    // Clean up connected edges
    if (setEdges) {
      const handleId = `btn-${removedBtn.id || index}`;
      setEdges(eds => eds.filter(e => !(e.source === id && e.sourceHandle === handleId)));
    }
  };

  const addSection = () => {
    const newSections = [...(localData.sections || []), { id: `sec_${Date.now()}`, title: '', rows: [] }];
    setLocalData(prev => ({ ...prev, sections: newSections }));
    updateNodeData(id, { sections: newSections });
  };

  const removeSection = (secIdx) => {
    const newSections = [...(localData.sections || [])];
    const removedSection = newSections[secIdx];
    newSections.splice(secIdx, 1);
    setLocalData(prev => ({ ...prev, sections: newSections }));
    updateNodeData(id, { sections: newSections });

    if (setEdges && removedSection && removedSection.rows) {
      const handleIdsToRemove = removedSection.rows.map((row, rowIdx) => `row-${row.id || rowIdx}`);
      setEdges(eds => eds.filter(e => !(e.source === id && handleIdsToRemove.includes(e.sourceHandle))));
    }
  };

  const handleSectionChange = (secIdx, field, value) => {
    const newSections = [...(localData.sections || [])];
    newSections[secIdx] = { ...newSections[secIdx], [field]: value };
    setLocalData(prev => ({ ...prev, sections: newSections }));
  };

  const addRow = (secIdx) => {
    if (totalRowsCount >= 10) return;
    const newSections = [...(localData.sections || [])];
    const sectionToUpdate = { ...newSections[secIdx] };
    sectionToUpdate.rows = [...(sectionToUpdate.rows || []), { id: `row_${Date.now()}`, title: '', description: '', postbackId: '' }];
    newSections[secIdx] = sectionToUpdate;
    setLocalData(prev => ({ ...prev, sections: newSections }));
    updateNodeData(id, { sections: newSections });
  };

  const removeRow = (secIdx, rowIdx) => {
    const newSections = [...(localData.sections || [])];
    const sectionToUpdate = { ...newSections[secIdx] };
    const newRows = [...(sectionToUpdate.rows || [])];
    const removedRow = newRows[rowIdx];
    newRows.splice(rowIdx, 1);
    sectionToUpdate.rows = newRows;
    newSections[secIdx] = sectionToUpdate;
    setLocalData(prev => ({ ...prev, sections: newSections }));
    updateNodeData(id, { sections: newSections });

    // Clean up connected edges
    if (setEdges && removedRow) {
      const handleId = `row-${removedRow.id || rowIdx}`;
      setEdges(eds => eds.filter(e => !(e.source === id && e.sourceHandle === handleId)));
    }
  };

  const handleRowChange = (secIdx, rowIdx, field, value) => {
    const newSections = [...(localData.sections || [])];
    const sectionToUpdate = { ...newSections[secIdx] };
    const newRows = [...(sectionToUpdate.rows || [])];
    newRows[rowIdx] = { ...newRows[rowIdx], [field]: value };
    sectionToUpdate.rows = newRows;
    newSections[secIdx] = sectionToUpdate;
    setLocalData(prev => ({ ...prev, sections: newSections }));
  };

  const handleMenuBlur = () => {
    updateNodeData(id, { sections: localData.sections });
  };

  const totalRowsCount = (localData.sections || []).reduce((acc, sec) => acc + (sec.rows?.length || 0), 0);

  return (
    <div className="properties-pane" style={{
      borderLeft: '1px solid #E5E7EB',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'width 0.25s ease'
    }}>
      {/* Top Segmented Tabs: ⚙️ Configuration | 💡 How It Works & Guide */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E5E7EB',
        background: '#F8FAFC',
        padding: '6px 12px 0 12px',
        gap: '6px',
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('config')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            fontSize: '13px',
            fontWeight: '600',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            border: 'none',
            borderBottom: activeTab === 'config' ? '2px solid #2563EB' : '2px solid transparent',
            background: activeTab === 'config' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'config' ? '#1D4ED8' : '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Settings size={15} /> Configuration
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 12px',
            fontSize: '13px',
            fontWeight: '600',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            border: 'none',
            borderBottom: activeTab === 'guide' ? '2px solid #7C3AED' : '2px solid transparent',
            background: activeTab === 'guide' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'guide' ? '#6D28D9' : '#64748B',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BookOpen size={15} /> How It Works & Guide
        </button>
      </div>

      {activeTab === 'guide' ? (
        <NodeInlineGuideView 
          type={type} 
          onOpenModal={() => setIsGuideOpen(true)}
        />
      ) : (
        <>
          {type !== 'triggerNode' && (
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '7px', borderRadius: '8px' }}>
                  <Settings size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Configuration</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; }}
                title="Read how this node works and its next step behavior"
              >
                <BookOpen size={14} /> How It Works
              </button>
            </div>
          )}

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Inline Next Step Recommendation Card with 1-Click Auto-Add */}
            <NextStepRecommendationCard 
              type={type} 
              localData={localData} 
              edges={edges}
              selectedNodeId={id}
              onAutoAddNextStep={handleAutoAddNextStep}
              onOpenFullGuide={() => setActiveTab('guide')}
            />

            {/* Common Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Node Label</label>
              <input
                type="text"
                name="label"
                value={localData.label || ''}
                onChange={handleLocalChange}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="e.g. Welcome Message"
              />
            </div>

        {/* Trigger Node Specific */}
        {type === 'triggerNode' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header card with Active Trigger, Description, Browse All Triggers Button, and Quick Switch */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Active Trigger
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 9px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4F46E5'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; }}
                  title="Read how this trigger works"
                >
                  <BookOpen size={12} /> How It Works
                </button>
              </div>

              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0', lineHeight: '1.35', wordBreak: 'break-word' }}>
                {localData.triggerType === 'qr_link' ? 'QR & Click-to-Chat Link' :
                 localData.triggerType === 'whatsapp_ad' ? 'Click-to-WhatsApp Ad' :
                 localData.triggerType === 'any_message' ? 'Incoming Message (Any)' :
                 localData.triggerType === 'welcome_message' ? 'Welcome Message' :
                 localData.triggerType === 'away_message' ? 'Away Message' :
                 localData.triggerType === 'fallback' ? 'Default Fallback' :
                 localData.triggerType === 'tag_added' ? 'CRM Tag Added' :
                 localData.triggerType === 'api_webhook' || localData.triggerType === 'webhook' ? 'API Webhook' :
                 localData.triggerType === 'schedule' ? 'Scheduled Trigger' :
                 localData.triggerType === 'recurring' ? 'Recurring Trigger' :
                 localData.triggerType === 'contains' ? 'Keyword Contains' :
                 localData.triggerType === 'starts_with' ? 'Keyword Starts With' :
                 localData.triggerType === 'ends_with' ? 'Keyword Ends With' :
                 localData.triggerType === 'media_any' || localData.triggerType === 'media_received' ? 'Media Received' :
                 localData.triggerType === 'image_received' ? 'Image Received' :
                 localData.triggerType === 'video_received' ? 'Video Received' :
                 localData.triggerType === 'document_received' ? 'Document Received' :
                 localData.triggerType === 'voice_received' ? 'Voice Note Received' :
                 localData.triggerType === 'location_received' ? 'Location Shared' :
                 localData.triggerType === 'contact_shared' ? 'Contact Card Shared' :
                 localData.triggerType === 'reaction' ? 'Reaction Received' :
                 localData.triggerType === 'order_created' ? 'Order Created' :
                 localData.triggerType === 'payment_success' ? 'Payment Success' :
                 'Keyword Exact Match'}
              </h2>

              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0', lineHeight: '1.45', wordBreak: 'break-word' }}>
                {localData.triggerType === 'qr_link' ? 'Generates a QR code and custom wa.me link for customers to start this automation.' :
                 localData.triggerType === 'whatsapp_ad' ? 'Starts this automation when customers click on your Meta WhatsApp ad.' :
                 localData.triggerType === 'any_message' ? 'Starts whenever any incoming message is received from a contact.' :
                 localData.triggerType === 'welcome_message' ? 'Starts when a new contact writes to your WhatsApp number for the first time.' :
                 localData.triggerType === 'away_message' ? 'Replies automatically when a contact writes outside of business hours.' :
                 localData.triggerType === 'fallback' ? 'Executes when no keywords or other automations match customer message.' :
                 localData.triggerType === 'tag_added' ? 'Runs automatically when a specific tag is attached to a contact profile.' :
                 localData.triggerType === 'api_webhook' || localData.triggerType === 'webhook' ? 'Trigger this flow via an inbound webhook payload.' :
                 localData.triggerType === 'schedule' || localData.triggerType === 'recurring' ? 'Executes automatically based on schedule.' :
                 'Configure when and how this automated workflow starts.'}
              </p>

              <button
                type="button"
                onClick={() => setIsTriggerModalOpen(true)}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#065F46',
                  backgroundColor: '#D1FAE5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#A7F3D0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; }}
              >
                <LayoutGrid size={14} />
                Browse All Triggers
              </button>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0', marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  When to trigger (Quick Switch)
                </label>
                <select 
                  name="triggerType" 
                  value={localData.triggerType || 'exact_match'} 
                  onChange={(e) => { handleLocalChange(e); handleBlur(e); }} 
                  style={{ ...inputStyle, background: 'white' }}
                >
                  <optgroup label="Keywords & Chat Messages">
                    <option value="exact_match">Exact Match</option>
                    <option value="contains">Contains</option>
                    <option value="starts_with">Starts With</option>
                    <option value="ends_with">Ends With</option>
                    <option value="any_message">Any Message (Reply / Greeting)</option>
                  </optgroup>
                  <optgroup label="Links & Ads">
                    <option value="qr_link">QR & Click-to-Chat Link</option>
                    <option value="whatsapp_ad">Click-to-WhatsApp Ad</option>
                  </optgroup>
                  <optgroup label="Media & Attachments">
                    <option value="media_any">Media Received (Any)</option>
                    <option value="image_received">Image Received</option>
                    <option value="video_received">Video Received</option>
                    <option value="document_received">Document Received</option>
                    <option value="voice_received">Voice Note Received</option>
                    <option value="location_received">Location Received</option>
                    <option value="contact_shared">Contact Shared</option>
                    <option value="reaction">Reaction Received</option>
                  </optgroup>
                  <optgroup label="System, CRM & Integrations">
                    <option value="api_webhook">API Webhook</option>
                    <option value="crm_event">CRM Event</option>
                    <option value="tag_added">Tag Added (CRM)</option>
                    <option value="order_created">Order Created</option>
                    <option value="payment_success">Payment Success</option>
                    <option value="schedule">Schedule (One-time)</option>
                    <option value="recurring">Recurring</option>
                  </optgroup>
                  <optgroup label="Special Behaviors">
                    <option value="welcome_message">Welcome Message (New Contact)</option>
                    <option value="away_message">Away Message (Outside Business Hours)</option>
                    <option value="fallback">Default Fallback (Unrecognized text)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Specific Trigger Sub-panels */}
            {localData.triggerType === 'qr_link' ? (
              <StandeeQrGenerator
                localData={localData}
                updateNodeData={updateNodeData}
                id={id}
                channelPhone={channelPhone}
                inputStyle={inputStyle}
              />
            ) : localData.triggerType === 'whatsapp_ad' ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="#3B82F6" /> WhatsApp Ad Integration
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: '1.4' }}>
                  Connect this flow to your Meta Ads. Use the keyword below as the pre-filled message in your Ad's Message Template.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Ad Keyword (Required)</label>
                  <input
                    type="text"
                    name="keyword"
                    value={localData.keyword || ''}
                    onChange={handleLocalChange}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, background: 'white', borderColor: '#CBD5E1' }}
                    placeholder="e.g. ad_promo_2026"
                  />
                </div>

                <div style={{ background: '#EFF6FF', border: '1px dashed #BFDBFE', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#1E3A8A', lineHeight: '1.5' }}>
                  <span style={{ fontWeight: '700' }}>Setup Instructions:</span><br/>
                  1. Go to Meta Ads Manager.<br/>
                  2. Set Destination to "WhatsApp".<br/>
                  3. Under Message Template, edit the "Customer Actions" to include the exact keyword above.
                </div>
              </div>
            ) : !['fallback', 'welcome_message', 'away_message', 'any_message', 'new_subscriber', 'media_any', 'media_received', 'image_received', 'video_received', 'document_received', 'voice_received', 'location_received', 'contact_shared', 'reaction', 'missed_call', 'api_webhook', 'webhook', 'crm_event', 'crm', 'order_created', 'payment_success', 'schedule', 'recurring', 'manual_trigger', 'manual', 'qr_link', 'whatsapp_ad'].includes(localData.triggerType) ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    Trigger Keywords
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Comma separated
                  </span>
                </div>
                <input
                  type="text"
                  name="keyword"
                  value={localData.keyword || ''}
                  onChange={handleLocalChange}
                  onBlur={handleBlur}
                  style={{ ...inputStyle, background: 'white' }}
                  placeholder="e.g. hi, hello, start, menu"
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: '1.4' }}>
                  Add multiple keywords separated by commas (e.g. <code style={{ background: '#E2E8F0', padding: '1px 4px', borderRadius: '4px' }}>hi, hello, hey</code>). Any of these will trigger this automation.
                </div>
                {localData.keyword && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {localData.keyword.split(',').map(k => k.trim()).filter(Boolean).map((kw, i) => (
                      <span 
                        key={i} 
                        style={{ 
                          background: '#EFF6FF', 
                          color: '#2563EB', 
                          fontSize: '12px', 
                          fontWeight: '500', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          border: '1px solid #BFDBFE',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>#</span> {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: '#1E293B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#10B981" /> Automated Event Trigger
                </div>
                This flow triggers automatically based on the selected event. No keyword input is needed.
              </div>
            )}
          </div>
        )}

        {/* Message Node Specific */}
        {type === 'messageNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Message Type</label>
              <select name="messageType" value={localData.messageType || 'text'} onChange={(e) => { 
                const val = e.target.value;
                if (val === 'interactive' && (!localData.buttons || localData.buttons.length === 0)) {
                  const initialButtons = [{ id: `btn_${Date.now()}`, title: 'Option 1', type: 'reply' }];
                  setLocalData(prev => ({ ...prev, messageType: val, buttons: initialButtons }));
                  updateNodeData(id, { messageType: val, buttons: initialButtons });
                } else {
                  handleLocalChange(e); 
                  handleBlur(e); 
                }
              }} style={inputStyle}>
                <option value="text">Text Only</option>
                <option value="interactive">Interactive</option>
              </select>
            </div>

            {localData.messageType === 'interactive' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Header type</label>
                  <select name="headerType" value={localData.headerType || 'none'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                    <option value="none">None</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document (PDF)</option>
                  </select>
                </div>
                {localData.headerType === 'text' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Headline</label>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.headline || '').length}/60</span>
                    </div>
                    <input type="text" name="headline" value={localData.headline || ''} onChange={(e) => { if (e.target.value.length <= 60) { handleLocalChange(e); } }} onBlur={handleBlur} style={inputStyle} placeholder="Add a headline" />
                  </div>
                )}
                {['image', 'video', 'document'].includes(localData.headerType) && (
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>
                        Upload {localData.headerType ? localData.headerType.charAt(0).toUpperCase() + localData.headerType.slice(1) : 'Media'}
                      </label>
                      <input 
                        type="file" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        accept={localData.headerType === 'document' ? '.pdf' : localData.headerType === 'video' ? 'video/mp4,video/3gpp' : 'image/jpeg,image/png'}
                        style={{ width: '100%', padding: '16px', background: 'white', border: '1px dashed #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748B' }} 
                      />
                      {isUploading && <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '8px', fontWeight: '600' }}>Uploading...</div>}
                      {localData.mediaUrl && !isUploading && (
                        <div style={{ fontSize: '11px', color: '#10B981', marginTop: '8px', fontWeight: '600', wordBreak: 'break-all' }}>
                          ✓ Uploaded: {localData.mediaUrl.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <WhatsAppMessageField
              label="Message"
              name="text"
              value={localData.text || ''}
              placeholder="Write a message..."
              maxLength={1024}
              minHeight="120px"
              inputStyle={inputStyle}
              localData={localData}
              setLocalData={setLocalData}
              updateNodeData={updateNodeData}
              id={id}
            />

            {localData.messageType === 'interactive' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Footer (Optional)</label>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.footer || '').length}/60</span>
                </div>
                <input type="text" name="footer" value={localData.footer || ''} onChange={(e) => { if (e.target.value.length <= 60) { handleLocalChange(e); } }} onBlur={handleBlur} style={inputStyle} placeholder="Enter footer text" />
              </div>
            )}

            {localData.messageType === 'interactive' && (
              <div style={{ paddingTop: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Buttons</h3>
                {(localData.buttons || []).map((btn, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>BUTTON {idx + 1}</label>
                      <button onClick={() => removeButton(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Remove</button>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Type</label>
                      <select value={btn.type || 'reply'} onChange={(e) => handleButtonLocalChange(idx, 'type', e.target.value)} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white' }}>
                        <option value="reply">Quick Reply</option>
                        <option value="url">Website URL</option>
                        <option value="phone">Phone Number</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>Button Title</label>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{(btn.title || '').length}/20</span>
                      </div>
                      <input type="text" value={btn.title || ''} onChange={(e) => { if (e.target.value.length <= 20) { handleButtonLocalChange(idx, 'title', e.target.value); } }} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white', marginBottom: '8px' }} placeholder="Title" />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>Button ID / Payload (Optional)</label>
                      </div>
                      <input type="text" value={btn.payload || ''} onChange={(e) => handleButtonLocalChange(idx, 'payload', e.target.value)} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white' }} placeholder="e.g. buy_now" />
                    </div>
                    {btn.type === 'url' && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Website URL</label>
                        <input type="text" value={btn.url || ''} onChange={(e) => handleButtonLocalChange(idx, 'url', e.target.value)} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white' }} placeholder="https://example.com" />
                      </div>
                    )}
                    {btn.type === 'phone' && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Phone Number</label>
                        <input type="text" value={btn.phone || ''} onChange={(e) => handleButtonLocalChange(idx, 'phone', e.target.value)} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white' }} placeholder="+1234567890" />
                      </div>
                    )}
                  </div>
                ))}
                {(localData.buttons || []).length < 3 && (
                  <button onClick={addButton} style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                    + Add Another Button
                  </button>
                )}
                {(localData.buttons || []).length >= 3 && (
                  <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '8px' }}>Maximum 3 buttons allowed.</div>
                )}
              </div>
            )}
            
            {localData.messageType === 'interactive' && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Button ID to Variable (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                    <Variable size={14} />
                  </div>
                  <input type="text" name="saveVariableAs" value={localData.saveVariableAs || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, paddingLeft: '32px' }} placeholder="e.g. contact.selected_plan" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Menu Node Specific */}
        {type === 'menuNode' && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Header (Optional)</label>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.header || '').length}/60</span>
              </div>
              <input type="text" name="header" value={localData.header || ''} onChange={(e) => { if (e.target.value.length <= 60) { handleLocalChange(e); } }} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Explore Our Services" />
            </div>

            <WhatsAppMessageField
              label="Message Body"
              name="text"
              value={localData.text || ''}
              placeholder="Please select an option from the list below..."
              maxLength={1024}
              minHeight="110px"
              inputStyle={inputStyle}
              localData={localData}
              setLocalData={setLocalData}
              updateNodeData={updateNodeData}
              id={id}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Footer (Optional)</label>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.footer || '').length}/60</span>
              </div>
              <input type="text" name="footer" value={localData.footer || ''} onChange={(e) => { if (e.target.value.length <= 60) { handleLocalChange(e); } }} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Tap below to view" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Menu Button Label</label>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.menuButtonText || '').length}/20</span>
              </div>
              <input type="text" name="menuButtonText" value={localData.menuButtonText || ''} onChange={(e) => { if (e.target.value.length <= 20) handleLocalChange(e); }} onBlur={handleBlur} style={inputStyle} placeholder="e.g. View Options" />
            </div>

            <div style={{ paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div><h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Menu Sections</h3></div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: totalRowsCount > 10 ? '#EF4444' : '#64748B' }}>{totalRowsCount} Rows</div>
              </div>

              {(localData.sections || []).map((sec, secIdx) => (
                <div key={sec.id || secIdx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>SECTION {secIdx + 1}</label>
                    <button onClick={() => removeSection(secIdx)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Remove</button>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>Section Title</label>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{(sec.title || '').length}/24</span>
                    </div>
                    <input type="text" value={sec.title || ''} onChange={(e) => { if (e.target.value.length <= 24) handleSectionChange(secIdx, 'title', e.target.value); }} onBlur={handleMenuBlur} style={{ ...inputStyle, background: 'white' }} placeholder="e.g. Main Course" />
                  </div>
                  <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Options (Rows)</label>
                    {(sec.rows || []).map((row, rowIdx) => (
                      <div key={row.id || rowIdx} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF' }}>Row {rowIdx + 1}</span>
                          <button onClick={() => removeRow(secIdx, rowIdx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
                        </div>
                        <div style={{ marginBottom: '8px', position: 'relative' }}>
                          <input type="text" value={row.title || ''} onChange={(e) => { if (e.target.value.length <= 24) handleRowChange(secIdx, rowIdx, 'title', e.target.value); }} onBlur={handleMenuBlur} style={{ ...inputStyle, padding: '8px', paddingRight: '40px' }} placeholder="Option Title" />
                          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#9CA3AF' }}>{(row.title || '').length}/24</span>
                        </div>
                        <div style={{ marginBottom: '8px', position: 'relative' }}>
                          <input type="text" value={row.description || ''} onChange={(e) => { if (e.target.value.length <= 72) handleRowChange(secIdx, rowIdx, 'description', e.target.value); }} onBlur={handleMenuBlur} style={{ ...inputStyle, padding: '8px', paddingRight: '40px' }} placeholder="Description" />
                          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#9CA3AF' }}>{(row.description || '').length}/72</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input type="text" value={row.postbackId || ''} onChange={(e) => handleRowChange(secIdx, rowIdx, 'postbackId', e.target.value)} onBlur={handleMenuBlur} style={{ ...inputStyle, padding: '8px' }} placeholder="Option ID / Payload (Optional)" />
                        </div>
                      </div>
                    ))}
                    {totalRowsCount < 10 ? (
                      <button onClick={() => addRow(secIdx)} style={{ background: 'transparent', color: '#10B981', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        + Add Row
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>Max 10 rows limit reached</span>
                    )}
                  </div>
                </div>
              ))}
              {totalRowsCount < 10 && (
                <button onClick={addSection} style={{ width: '100%', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  + Add Section
                </button>
              )}
              {totalRowsCount >= 10 && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '8px', textAlign: 'center' }}>Maximum 10 rows allowed across all sections.</div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Selected Row ID to Variable (Optional)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Variable size={14} />
                </div>
                <input type="text" name="saveVariableAs" value={localData.saveVariableAs || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, paddingLeft: '32px' }} placeholder="e.g. contact.selected_plan" />
              </div>
            </div>
          </>
        )}

        {/* Input Node Specific */}
        {type === 'inputNode' && (
          <>
            <WhatsAppMessageField
              label="Question to Ask"
              name="text"
              value={localData.text || ''}
              placeholder="E.g., What is your email address?"
              maxLength={1024}
              minHeight="120px"
              inputStyle={inputStyle}
              localData={localData}
              setLocalData={setLocalData}
              updateNodeData={updateNodeData}
              id={id}
            />

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Expected Input (Validation)</label>
              <select name="validationType" value={localData.validationType || 'text'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="text">Text (Any input)</option>
                <option value="number">Number</option>
                <option value="email">Email Address</option>
                <option value="mobile">Phone Number</option>
                <option value="date">Date</option>
                <option value="location">Location</option>
                <option value="url">Website URL</option>
                <option value="address">Address (Delivery / Physical Address)</option>
                <option value="photo">Photo / Image</option>
                <option value="audio">Audio Message</option>
                <option value="pdf">Document (PDF)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Answer to Variable</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                  <Variable size={14} />
                </div>
                <input type="text" name="variableName" value={localData.variableName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, paddingLeft: '32px' }} placeholder="e.g. contact.email" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {['contact.name', 'contact.email', 'contact.phone', 'contact.city', 'customer_budget'].map(varChip => (
                  <button 
                    key={varChip}
                    type="button"
                    onClick={() => {
                      setLocalData(prev => ({ ...prev, variableName: varChip }));
                      updateNodeData(id, { variableName: varChip });
                    }}
                    style={{
                      background: localData.variableName === varChip ? '#E0E7FF' : '#F1F5F9',
                      color: localData.variableName === varChip ? '#4338CA' : '#475569',
                      border: '1px solid ' + (localData.variableName === varChip ? '#C7D2FE' : '#E2E8F0'),
                      borderRadius: '4px',
                      fontSize: '11px',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    {varChip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Invalid Input Retry Message</label>
              </div>
              <input 
                type="text" 
                name="validationErrorMessage" 
                value={localData.validationErrorMessage || ''} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={inputStyle} 
                placeholder={`e.g. Please provide a valid ${localData.validationType || 'input'}.`} 
              />
              <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0 0' }}>
                Sent if customer's response does not pass the expected validation format.
              </p>
            </div>
          </>
        )}



        {/* New Nodes Specific */}
        {type === 'mediaNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Upload {localData.messageType === 'doc' ? 'Document' : localData.messageType ? localData.messageType.charAt(0).toUpperCase() + localData.messageType.slice(1) : 'Media'}
              </label>
              <input 
                type="file" 
                onChange={handleFileUpload}
                disabled={isUploading}
                accept={
                  localData.messageType === 'doc' ? '.pdf,.doc,.docx,.xls,.xlsx,.txt' : 
                  localData.messageType === 'video' ? 'video/mp4,video/3gpp' : 
                  ['audio', 'voice'].includes(localData.messageType) ? 'audio/*' : 
                  'image/*'
                }
                style={{ width: '100%', padding: '16px', background: 'white', border: '1px dashed #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748B' }} 
              />
              {isUploading && <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '8px', fontWeight: '600' }}>Uploading...</div>}
              {localData.mediaUrl && !isUploading && (
                <div style={{ fontSize: '11px', color: '#10B981', marginTop: '8px', fontWeight: '600', wordBreak: 'break-all' }}>
                  ✓ Uploaded: {localData.mediaUrl.split('/').pop()}
                </div>
              )}
            </div>
            {['image', 'video', 'doc', 'document', 'gif'].includes(localData.messageType) && (
              <WhatsAppMessageField
                label="Caption"
                name="text"
                value={localData.text || ''}
                placeholder="Add a caption..."
                maxLength={1024}
                minHeight="80px"
                inputStyle={inputStyle}
                localData={localData}
                setLocalData={setLocalData}
                updateNodeData={updateNodeData}
                id={id}
              />
            )}
          </>
        )}

        {type === 'carouselNode' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                Cards <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#6B7280' }}>({(localData.cards || []).length}/10 max)</span>
              </label>
            </div>
            {(localData.cards || []).map((card, idx) => (
              <div key={idx} style={{ background: '#fdf2f8', padding: '12px', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#be185d' }}>CARD {idx + 1}</span>
                  <button type="button" onClick={() => {
                    const newCards = (localData.cards || []).filter((_, i) => i !== idx);
                    setLocalData(prev => ({ ...prev, cards: newCards }));
                    updateNodeData(id, { cards: newCards });
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    Remove
                  </button>
                </div>
                <input type="text" value={card.title || ''} maxLength={160} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], title: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={{ ...inputStyle, marginBottom: '8px' }} placeholder="Card Title (max 160 chars)" />
                
                <input type="text" value={card.description || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], description: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={{ ...inputStyle, marginBottom: '8px' }} placeholder="Description" />
                
                <input type="text" value={card.mediaUrl || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], mediaUrl: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={{ ...inputStyle, marginBottom: '8px' }} placeholder="Image URL (https://...)" />

                <input type="text" value={card.buttonText || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], buttonText: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={inputStyle} placeholder="Button Label (e.g. Select / View)" maxLength={20} />
              </div>
            ))}
            {(localData.cards || []).length < 10 ? (
              <button onClick={() => {
                const newCards = [...(localData.cards || []), { id: `card_${Date.now()}`, title: '', description: '', mediaUrl: '', buttonText: 'Select' }];
                setLocalData(prev => ({ ...prev, cards: newCards }));
                updateNodeData(id, { cards: newCards });
              }} style={{ background: 'transparent', color: '#ec4899', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                + Add Card
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>Maximum 10 cards reached (Meta limit)</span>
            )}
          </div>
        )}

        {type === 'catalogNode' && (
          <>
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>Catalog Message Type</label>
              
              <select 
                name="catalogType" 
                value={localData.catalogType || 'single_product'} 
                onChange={(e) => { handleLocalChange(e); handleBlur(e); }} 
                style={{ ...inputStyle, borderColor: '#fcd34d', marginBottom: '12px' }}
              >
                <option value="single_product">🛍️ Single Product Message</option>
                <option value="multi_product">🛒 Multiple Products Message</option>
                <option value="catalog">🏬 Full Store Catalog</option>
              </select>

              <p style={{ fontSize: '12px', color: '#b45309', marginBottom: '16px', lineHeight: '1.4' }}>
                {localData.catalogType === 'multi_product' 
                  ? 'Displays up to 30 products across custom sections from your WhatsApp Catalog.' 
                  : localData.catalogType === 'catalog'
                  ? 'Lets customers open and browse your complete WhatsApp Commerce Catalog directly in chat.'
                  : 'Displays a specific product card with price, image, and "View Item" action.'}
              </p>
              
              {localData.catalogType !== 'catalog' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                    Catalog ID
                  </label>
                  <input 
                    type="text" 
                    name="catalogId" 
                    value={localData.catalogId || ''} 
                    onChange={handleLocalChange} 
                    onBlur={handleBlur} 
                    style={{ ...inputStyle, borderColor: '#fcd34d' }} 
                    placeholder="Enter Catalog ID (optional if set in Commerce)" 
                  />
                  <span style={{ fontSize: '11px', color: '#b45309', display: 'block', marginTop: '2px' }}>
                    Leave blank to use Catalog ID from Commerce Settings automatically.
                  </span>
                </div>
              )}
              
              {localData.catalogType !== 'multi_product' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                    {localData.catalogType === 'catalog' ? 'Thumbnail Product SKU / ID (Optional)' : 'Product Retailer ID / SKU (Required)'}
                  </label>
                  <input 
                    type="text" 
                    name="productId" 
                    value={localData.productId || ''} 
                    onChange={handleLocalChange} 
                    onBlur={handleBlur} 
                    style={{ ...inputStyle, borderColor: '#fcd34d' }} 
                    placeholder="Enter Product SKU e.g. TSHIRT-001" 
                  />
                  <span style={{ fontSize: '11px', color: '#b45309', display: 'block', marginTop: '2px' }}>
                    Must match the SKU of the product in your Products list / Meta Catalog.
                  </span>
                </div>
              )}
            </div>

            {localData.catalogType === 'multi_product' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Header Text (Required)</label>
                <input type="text" name="headerText" value={localData.headerText || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="Header for your product list" maxLength="60" />
              </div>
            )}

            <WhatsAppMessageField
              label="Body Text (Required)"
              name="text"
              value={localData.text || ''}
              placeholder="Write a message to go with your products..."
              maxLength={1024}
              minHeight="80px"
              inputStyle={inputStyle}
              localData={localData}
              setLocalData={setLocalData}
              updateNodeData={updateNodeData}
              id={id}
            />

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Footer Text (Optional)</label>
              <input type="text" name="footer" value={localData.footer || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="Footer text" maxLength="60" />
            </div>

            {localData.catalogType === 'multi_product' && (
              <div style={{ paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>Product Sections</h3>
                {(localData.sections || []).map((sec, secIdx) => (
                  <div key={sec.id || secIdx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>SECTION {secIdx + 1}</label>
                      <button onClick={() => {
                        const newSections = [...(localData.sections || [])];
                        newSections.splice(secIdx, 1);
                        setLocalData(prev => ({ ...prev, sections: newSections }));
                        updateNodeData(id, { sections: newSections });
                      }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Remove</button>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Section Title</label>
                      <input type="text" value={sec.title || ''} onChange={(e) => {
                        const newSections = [...(localData.sections || [])];
                        newSections[secIdx] = { ...newSections[secIdx], title: e.target.value };
                        setLocalData(prev => ({ ...prev, sections: newSections }));
                      }} onBlur={() => updateNodeData(id, { sections: localData.sections })} style={{ ...inputStyle, background: 'white' }} placeholder="e.g. Best Sellers" maxLength="24" />
                    </div>
                    <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Product IDs</label>
                      {(sec.productItems || []).map((item, itemIdx) => (
                        <div key={itemIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" value={item.productId || ''} onChange={(e) => {
                            const newSections = [...(localData.sections || [])];
                            const newItems = [...(newSections[secIdx].productItems || [])];
                            newItems[itemIdx] = { productId: e.target.value };
                            newSections[secIdx].productItems = newItems;
                            setLocalData(prev => ({ ...prev, sections: newSections }));
                          }} onBlur={() => updateNodeData(id, { sections: localData.sections })} style={inputStyle} placeholder="Product Retailer ID (SKU)" />
                          <button onClick={() => {
                            const newSections = [...(localData.sections || [])];
                            const newItems = [...(newSections[secIdx].productItems || [])];
                            newItems.splice(itemIdx, 1);
                            newSections[secIdx].productItems = newItems;
                            setLocalData(prev => ({ ...prev, sections: newSections }));
                            updateNodeData(id, { sections: newSections });
                          }} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newSections = [...(localData.sections || [])];
                        const newItems = [...(newSections[secIdx].productItems || []), { productId: '' }];
                        newSections[secIdx].productItems = newItems;
                        setLocalData(prev => ({ ...prev, sections: newSections }));
                        updateNodeData(id, { sections: newSections });
                      }} style={{ background: 'transparent', color: '#10B981', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        + Add Product
                      </button>
                    </div>
                  </div>
                ))}
                {(!localData.sections || localData.sections.length < 10) && (
                  <button onClick={() => {
                    const newSections = [...(localData.sections || []), { id: `sec_${Date.now()}`, title: '', productItems: [] }];
                    setLocalData(prev => ({ ...prev, sections: newSections }));
                    updateNodeData(id, { sections: newSections });
                  }} style={{ width: '100%', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    + Add Section
                  </button>
                )}
              </div>
            )}
          </>
        )}



        {type === 'pollNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Question</label>
              <input type="text" name="text" value={localData.text || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="Ask a question..." />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Options</label>
              {(localData.options || []).map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input type="text" value={opt.text || ''} onChange={(e) => {
                    const newOpts = [...(localData.options || [])];
                    newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                    setLocalData(prev => ({ ...prev, options: newOpts }));
                  }} onBlur={() => updateNodeData(id, { options: localData.options })} style={{ ...inputStyle, flex: 1 }} placeholder={`Option ${idx + 1}`} />
                  <input type="text" value={opt.id || ''} onChange={(e) => {
                    const newOpts = [...(localData.options || [])];
                    newOpts[idx] = { ...newOpts[idx], id: e.target.value };
                    setLocalData(prev => ({ ...prev, options: newOpts }));
                  }} onBlur={() => updateNodeData(id, { options: localData.options })} style={{ ...inputStyle, width: '100px', flex: 'none' }} placeholder="ID" />
                  {(localData.options || []).length > 2 && (
                    <button type="button" onClick={() => {
                      const newOpts = (localData.options || []).filter((_, i) => i !== idx);
                      setLocalData(prev => ({ ...prev, options: newOpts }));
                      updateNodeData(id, { options: newOpts });
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Remove Option">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => {
                const newOpts = [...(localData.options || []), { id: `opt_${Date.now()}`, text: '' }];
                setLocalData(prev => ({ ...prev, options: newOpts }));
                updateNodeData(id, { options: newOpts });
              }} style={{ background: 'transparent', color: '#0ea5e9', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                + Add Option
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input type="checkbox" id="allowMultiple" checked={localData.allowMultipleAnswers || false} onChange={(e) => {
                setLocalData(prev => ({ ...prev, allowMultipleAnswers: e.target.checked }));
                updateNodeData(id, { allowMultipleAnswers: e.target.checked });
              }} />
              <label htmlFor="allowMultiple" style={{ fontSize: '13px', color: '#4b5563' }}>Allow multiple answers</label>
            </div>
          </>
        )}

        {type === 'commerceNode' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Commerce Type</label>
              <select 
                name="commerceType" 
                value={localData.commerceType || 'payment'} 
                onChange={(e) => { handleLocalChange(e); handleBlur(e); }} 
                style={inputStyle}
              >
                <option value="payment">💳 WhatsApp Payment / Payment Link</option>
                <option value="coupon">🏷️ Coupon Offer / Discount Code</option>
                <option value="otp">🔑 One-Time Password (OTP)</option>
                <option value="invoice">🧾 Invoice / Receipt</option>
              </select>
            </div>

            {localData.commerceType === 'payment' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Item / Service Name</label>
                  <input type="text" name="itemName" value={localData.itemName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Annual Subscription" />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Currency</label>
                    <select name="currency" value={localData.currency || 'INR'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Amount</label>
                    <input type="number" name="amount" value={localData.amount || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="499.00" min="1" />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Payment Gateway</label>
                  <select name="paymentGateway" value={localData.paymentGateway || 'razorpay'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                    <option value="razorpay">Razorpay</option>
                    <option value="payu">PayU</option>
                    <option value="stripe">Stripe</option>
                    <option value="whatsapp_pay">Meta WhatsApp Pay</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select 
                    name="paymentMode" 
                    value={localData.paymentMode || 'upi'} 
                    onChange={(e) => { 
                      handleLocalChange(e); 
                      handleBlur(e); 
                    }} 
                    style={inputStyle}
                  >
                    <option value="upi">📱 Direct UPI (Recommended: GPay, PhonePe, Paytm - 0% Fee)</option>
                    <option value="link">🔗 Payment Gateway Link (Razorpay / Stripe / Website)</option>
                  </select>
                </div>

                {/* Primary: Client UPI ID */}
                <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    📱 Client UPI ID (VPA) <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: '500' }}>[Direct Bank Settlement]</span>
                  </label>
                  <input 
                    type="text" 
                    name="upiId" 
                    value={localData.upiId || ''} 
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setLocalData(prev => ({ 
                        ...prev, 
                        upiId: val
                      }));
                      updateNodeData(id, { 
                        upiId: val
                      });
                    }} 
                    onBlur={handleBlur} 
                    style={inputStyle} 
                    placeholder="e.g. clinic@okaxis ya 9876543210@paytm" 
                  />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    💡 Customer ke WhatsApp par direct <b>GPay / PhonePe / Paytm</b> ka clickable link jayega. Paisa seedha bank me credit hoga (0% fee).
                  </div>
                </div>

                {/* Optional: Razorpay / Gateway Link */}
                <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                    🔗 Razorpay / Card Payment Link <span style={{ color: '#94a3b8', fontSize: '11px' }}>(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    name="paymentUrl" 
                    value={localData.paymentUrl || ''} 
                    onChange={handleLocalChange} 
                    onBlur={handleBlur} 
                    style={inputStyle} 
                    placeholder="https://rzp.io/l/... (Optional for Card / NetBanking)" 
                  />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    💡 Optional: Agar customer Credit/Debit Card se pay karna chahe toh apna Razorpay / Payment Link yahan paste karein.
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Reference / Order ID</label>
                  <input type="text" name="referenceId" value={localData.referenceId || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. ORD_{{contact.phone}}" />
                </div>
              </>
            )}

            {localData.commerceType === 'coupon' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Coupon Code</label>
                  <input type="text" name="couponCode" value={localData.couponCode || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. FESTIVE25" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Discount Summary</label>
                  <input type="text" name="discountText" value={localData.discountText || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Flat 25% OFF on orders above ₹999" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Valid Until</label>
                  <input type="text" name="validUntil" value={localData.validUntil || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Valid till midnight tonight" />
                </div>
              </>
            )}

            {localData.commerceType === 'otp' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>OTP Code or Variable</label>
                  <input type="text" name="otpCode" value={localData.otpCode || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. {{otp_code}} or 482910" />
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Leave empty or use variable from previous API call</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Code Validity (Minutes)</label>
                  <input type="number" name="otpExpiry" value={localData.otpExpiry || 10} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} min="1" max="60" />
                </div>
              </>
            )}

            {localData.commerceType === 'invoice' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Invoice Number</label>
                  <input type="text" name="invoiceNumber" value={localData.invoiceNumber || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. INV-2026-{{order_id}}" />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Total Amount</label>
                    <input type="text" name="amount" value={localData.amount || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="1,499.00" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Invoice Date</label>
                    <input type="text" name="invoiceDate" value={localData.invoiceDate || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Today or 12 Oct" />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>PDF Invoice Download URL</label>
                  <input type="text" name="pdfUrl" value={localData.pdfUrl || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="https://example.com/invoices/inv_123.pdf" />
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Accompanying Message</label>
              <textarea name="text" value={localData.text || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Add note or instructions for customer..." />
            </div>
          </>
        )}

        {type === 'utilityNode' && (
          <>
            {localData.utilityType === 'location' && (
              <>
                <LocationPicker localData={localData} setLocalData={setLocalData} updateNodeData={updateNodeData} id={id} />
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Location Name</label>
                  <input type="text" name="locationName" value={localData.locationName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Our Store" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Address</label>
                  <input type="text" name="locationAddress" value={localData.locationAddress || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="Full address" />
                </div>
              </>
            )}
            {localData.utilityType === 'contact' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Contact Name</label>
                  <input type="text" name="contactName" value={localData.contactName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Sales Team" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Phone Number</label>
                  <input type="text" name="contactPhone" value={localData.contactPhone || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="+91 9876543210" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Email Address (Optional)</label>
                  <input type="email" name="contactEmail" value={localData.contactEmail || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="contact@example.com" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Company / Organization (Optional)</label>
                  <input type="text" name="contactCompany" value={localData.contactCompany || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Acme Corp" />
                </div>
              </>
            )}
            {localData.utilityType === 'calendar' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Event Name</label>
                  <input type="text" name="eventName" value={localData.eventName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. 1-on-1 Strategy Session" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Event Date & Time</label>
                  <input type="text" name="eventTime" value={localData.eventTime || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Tomorrow at 3:00 PM IST" />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Meeting / Add-to-Calendar Link</label>
                  <input type="text" name="calendarLink" value={localData.calendarLink || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="https://meet.google.com/xyz or calendly.com/..." />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Event Description</label>
                  <textarea name="eventDescription" value={localData.eventDescription || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '60px' }} placeholder="Brief agenda or instructions..." />
                </div>
              </>
            )}
          </>
        )}

        {type === 'eventTriggerNode' && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>API Webhook Setup</label>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Event Name (Required)</label>
              <input
                type="text"
                name="eventName"
                value={localData.eventName || ''}
                onChange={handleLocalChange}
                onBlur={handleBlur}
                style={{ ...inputStyle, background: 'white' }}
                placeholder="e.g. order_created"
              />
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                This is the unique identifier for this trigger. You will use it in your API call.
              </p>
            </div>

            {localData.eventName && currentChannelId && (
              <div style={{ background: '#1E293B', padding: '16px', borderRadius: '8px', border: '1px solid #334155', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' }}>Integration Code (cURL)</label>
                <button 
                  onClick={() => navigator.clipboard.writeText(`curl -X POST ${import.meta.env.VITE_API_URL}/webhooks/trigger-event \\
-H "Content-Type: application/json" \\
-d '{"channelId": "${currentChannelId}", "phone": "1234567890", "eventName": "${localData.eventName}", "eventData": {"order_id": "123"}}'`)} 
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  Copy
                </button>
                <pre style={{ margin: 0, color: '#E2E8F0', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  curl -X POST &#123;import.meta.env.VITE_API_URL&#125;/webhooks/trigger-event \<br/>
                  -H "Content-Type: application/json" \<br/>
                  -d '&#123;<br/>
                  &nbsp;&nbsp;"channelId": "{currentChannelId}",<br/>
                  &nbsp;&nbsp;"phone": "+1234567890",<br/>
                  &nbsp;&nbsp;"eventName": "{localData.eventName}",<br/>
                  &nbsp;&nbsp;"eventData": &#123; "key": "value" &#125;<br/>
                  &#125;'
                </pre>
              </div>
            )}
          </div>
        )}

        {type === 'templateNode' && (() => {
          // Helper to pick template and auto-populate node data
          const applyTemplate = (tmpl) => {
            if (!tmpl) return;
            let variables = [];
            let templateButtons = [];
            const bodyComp = (tmpl.components || []).find(c => c.type === 'BODY');
            if (bodyComp?.example?.body_text?.[0]) {
              variables = bodyComp.example.body_text[0].map(() => ({ value: '' }));
            } else if (bodyComp?.text) {
              const matches = bodyComp.text.match(/\{\{(\d+)\}\}/g) || [];
              const uniqueIndices = Array.from(new Set(matches));
              variables = uniqueIndices.map(() => ({ value: '' }));
            }
            const btnComp = (tmpl.components || []).find(c => c.type === 'BUTTONS');
            if (btnComp?.buttons) {
              templateButtons = btnComp.buttons.map((b, i) => ({
                id: b.payload || b.id || `btn_${i}`,
                type: (b.type || 'QUICK_REPLY').toLowerCase(),
                text: b.text || b.title || `Button ${i + 1}`,
                title: b.text || b.title || `Button ${i + 1}`,
                url: b.url,
                phoneNumber: b.phone_number,
                payload: b.payload
              }));
            } else if (Array.isArray(tmpl.buttons)) {
              templateButtons = tmpl.buttons.map((b, i) => ({
                id: b.payload || b.id || `btn_${i}`,
                type: (b.type || 'quick_reply').toLowerCase(),
                text: b.text || b.title || `Button ${i + 1}`,
                title: b.text || b.title || `Button ${i + 1}`
              }));
            }

            // Header media / text
            let headerType = null;
            let headerText = '';
            let mediaUrl = '';
            const headerComp = (tmpl.components || []).find(c => c.type === 'HEADER');
            if (headerComp) {
              if (headerComp.format === 'TEXT') {
                headerType = 'text';
                headerText = headerComp.text || '';
              } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp.format)) {
                headerType = headerComp.format.toLowerCase();
                mediaUrl = headerComp.example?.header_handle?.[0] || headerComp.example?.header_url?.[0] || '';
              }
            }

            // Limited Time Offer (LTO)
            const hasLtoComp = (tmpl.components || []).some(c => String(c?.type || '').toUpperCase() === 'LIMITED_TIME_OFFER');
            const isLimitedTimeOffer = hasLtoComp || tmpl.isLimitedTimeOffer === true;
            const customExpirationHours = isLimitedTimeOffer ? (tmpl.customExpirationHours || 72) : null;
            const expirationDate = isLimitedTimeOffer ? (tmpl.expirationDate || '') : '';

            // Coupon / Offer Code
            let offerCode = tmpl.offerCode || '';
            if (!offerCode && btnComp?.buttons) {
              const copyCodeBtn = btnComp.buttons.find(b => b.type === 'COPY_CODE');
              if (copyCodeBtn?.example) {
                offerCode = Array.isArray(copyCodeBtn.example) ? copyCodeBtn.example[0] : copyCodeBtn.example;
              }
            }

            const langCode = tmpl.language && tmpl.language !== 'en' ? tmpl.language : 'en_US';
            const updates = {
              templateName: tmpl.name,
              templateLanguage: langCode,
              variables,
              buttons: templateButtons,
              headerType,
              headerText,
              mediaUrl,
              isLimitedTimeOffer,
              customExpirationHours,
              expirationDate,
              offerCode
            };
            setLocalData(prev => ({ ...prev, ...updates }));
            updateNodeData(id, updates);
          };

          const filteredTpls = approvedTemplates.filter(t =>
            (t.name || '').toLowerCase().includes((templateSearch || '').toLowerCase())
          );

          return (
            <>
              {/* Template Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>Select Template</label>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                    placeholder={loadingTemplates ? 'Loading templates...' : 'Search approved templates...'}
                    style={{ ...inputStyle, paddingRight: '32px' }}
                    disabled={loadingTemplates}
                  />
                  {loadingTemplates && (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9CA3AF' }}>⏳</span>
                  )}
                </div>
                {(templateSearch || filteredTpls.length > 0) && (
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', background: 'white', marginBottom: '12px' }}>
                    {filteredTpls.length === 0 ? (
                      <div style={{ padding: '12px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>No approved templates found</div>
                    ) : filteredTpls.map(t => (
                      <div
                        key={t.id || t.name}
                        onClick={() => { applyTemplate(t); setTemplateSearch(''); }}
                        style={{
                          padding: '10px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                          color: localData.templateName === t.name ? '#10B981' : '#111827',
                          background: localData.templateName === t.name ? '#ECFDF5' : 'white',
                          borderBottom: '1px solid #F3F4F6',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        onMouseOver={e => { if (localData.templateName !== t.name) e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseOut={e => { if (localData.templateName !== t.name) e.currentTarget.style.background = 'white'; }}
                      >
                        <span>{t.name}</span>
                        <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '100px', fontWeight: '700', textTransform: 'uppercase' }}>{t.language || 'en'}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Show selected template name */}
                {localData.templateName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>✓ Selected:</span>
                    <span style={{ fontSize: '12px', color: '#065F46', fontFamily: 'monospace' }}>{localData.templateName}</span>
                    <button
                      onClick={() => { setLocalData(p => ({...p, templateName: '', templateLanguage: '', variables: [], buttons: [], isLimitedTimeOffer: false, customExpirationHours: null, offerCode: '', mediaUrl: '', headerType: null})); updateNodeData(id, { templateName: '', templateLanguage: '', variables: [], buttons: [], isLimitedTimeOffer: false, customExpirationHours: null, offerCode: '', mediaUrl: '', headerType: null }); }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                      title="Clear selection"
                    >×</button>
                  </div>
                )}
              </div>

              {/* Language Code (auto-filled, editable) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Language Code</label>
                <input type="text" name="templateLanguage" value={localData.templateLanguage || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. en_US" />
              </div>

              {/* Header Media URL if image/video/document */}
              {localData.headerType && ['image', 'video', 'document'].includes(localData.headerType) && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ImageIcon size={14} color="#6366f1" />
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
                      Header {localData.headerType.toUpperCase()}
                    </label>
                  </div>

                  {/* Direct File Upload */}
                  <div style={{ marginBottom: '10px' }}>
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept={localData.headerType === 'document' ? '.pdf' : localData.headerType === 'video' ? 'video/mp4,video/3gpp' : 'image/jpeg,image/png'}
                      style={{ width: '100%', padding: '10px', background: 'white', border: '1px dashed #CBD5E1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#64748B' }} 
                    />
                    {isUploading && <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px', fontWeight: '600' }}>Uploading to server...</div>}
                    {localData.mediaUrl && !isUploading && (
                      <div style={{ fontSize: '11px', color: '#10B981', marginTop: '6px', fontWeight: '600', wordBreak: 'break-all' }}>
                        ✓ Uploaded: {localData.mediaUrl.split('/').pop()}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Or enter media URL manually:</div>
                  <input
                    type="text"
                    value={localData.mediaUrl || ''}
                    onChange={(e) => {
                      setLocalData(p => ({ ...p, mediaUrl: e.target.value }));
                      updateNodeData(id, { mediaUrl: e.target.value });
                    }}
                    style={{ ...inputStyle, fontSize: '12px', background: 'white' }}
                    placeholder={`https://example.com/media.${localData.headerType === 'video' ? 'mp4' : localData.headerType === 'document' ? 'pdf' : 'jpg'}`}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Auto-injected into WhatsApp header component when sending.
                  </span>
                </div>
              )}

              {/* Limited Time Offer (LTO) Configuration */}
              {localData.isLimitedTimeOffer && (
                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Clock size={14} color="#d97706" />
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>
                      Offer Expiration Duration (LTO)
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    {[
                      { label: '24h (1d)', hours: 24 },
                      { label: '48h (2d)', hours: 48 },
                      { label: '72h (3d)', hours: 72 },
                      { label: '7 Days', hours: 168 }
                    ].map(opt => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => {
                          setLocalData(p => ({ ...p, customExpirationHours: opt.hours }));
                          updateNodeData(id, { customExpirationHours: opt.hours });
                        }}
                        style={{
                          flex: 1, padding: '5px 4px', fontSize: '11px', fontWeight: '600',
                          borderRadius: '6px', cursor: 'pointer',
                          background: Number(localData.customExpirationHours) === opt.hours ? '#d97706' : '#fef3c7',
                          color: Number(localData.customExpirationHours) === opt.hours ? 'white' : '#92400e',
                          border: 'none', transition: 'all 0.15s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={localData.customExpirationHours || ''}
                      onChange={(e) => {
                        const h = parseInt(e.target.value) || 0;
                        setLocalData(p => ({ ...p, customExpirationHours: h }));
                        updateNodeData(id, { customExpirationHours: h });
                      }}
                      style={{ ...inputStyle, width: '90px', background: 'white', fontSize: '12px', padding: '6px 8px' }}
                      placeholder="Hours"
                    />
                    <span style={{ fontSize: '11px', color: '#78350f' }}>Hours from send time (Default: 72h / 3 days)</span>
                  </div>
                </div>
              )}

              {/* Coupon / Offer Code Configuration */}
              {(localData.offerCode || (localData.buttons || []).some(b => b.type === 'copy_code')) && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Tag size={14} color="#7c3aed" />
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#5b21b6' }}>
                      Coupon / Offer Code (COPY_CODE)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={localData.offerCode || ''}
                    onChange={(e) => {
                      const cleanCode = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                      setLocalData(p => ({ ...p, offerCode: cleanCode }));
                      updateNodeData(id, { offerCode: cleanCode });
                    }}
                    style={{ ...inputStyle, background: 'white', fontFamily: 'monospace', fontSize: '12px' }}
                    placeholder="e.g. SAVE20 or FLAT50"
                  />
                  <span style={{ fontSize: '10px', color: '#6d28d9', marginTop: '4px', display: 'block' }}>
                    User taps button to copy this code to clipboard. Alphanumeric only.
                  </span>
                </div>
              )}

              {/* Variables */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Variables</label>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Auto-filled from template</span>
                </div>
                {(localData.variables || []).map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{`{{${idx+1}}}`}</div>
                    <input type="text" value={v.value || ''} onChange={(e) => {
                      const newVars = [...(localData.variables || [])];
                      newVars[idx] = { ...newVars[idx], value: e.target.value };
                      setLocalData(prev => ({ ...prev, variables: newVars }));
                      updateNodeData(id, { variables: newVars });
                    }} style={{ ...inputStyle, flex: 1, minWidth: 0 }} placeholder={`Value for {{${idx+1}}}`} />
                    <button
                      onClick={() => { const nv = (localData.variables||[]).filter((_,i) => i!==idx); setLocalData(p => ({...p, variables: nv})); updateNodeData(id, { variables: nv }); }}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}
                    >×</button>
                  </div>
                ))}
                <button onClick={() => {
                  const newVars = [...(localData.variables || []), { id: `var_${Date.now()}`, value: '' }];
                  setLocalData(prev => ({ ...prev, variables: newVars }));
                  updateNodeData(id, { variables: newVars });
                }} style={{ background: 'transparent', color: '#8b5cf6', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                  + Add Variable
                </button>
              </div>

              {/* Template Buttons (auto-filled from template, editable for branching) */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Template Buttons</label>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Auto-filled from template</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px', lineHeight: '1.4' }}>
                  Buttons are auto-loaded when you select a template. Each button creates a branch to connect next steps.
                </p>
                {(localData.buttons || []).map((btn, idx) => (
                  <div key={btn.id || idx} style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '10px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', background: btn.type === 'url' ? '#EFF6FF' : btn.type === 'phone_number' || btn.type === 'phone' ? '#F0FDF4' : '#F3E8FF', color: btn.type === 'url' ? '#2563EB' : btn.type === 'phone_number' || btn.type === 'phone' ? '#16A34A' : '#7C3AED', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {btn.type === 'url' ? '🔗 URL' : btn.type === 'phone_number' || btn.type === 'phone' ? '📞 PHONE' : '⚡ QUICK REPLY'}
                      </span>
                      <button
                        onClick={() => { const nb = localData.buttons.filter((_, i) => i !== idx); setLocalData(p => ({...p, buttons: nb})); updateNodeData(id, { buttons: nb }); }}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                      >×</button>
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '3px', fontWeight: '600' }}>Button Text</label>
                      <input type="text" value={btn.text || btn.title || ''} onChange={(e) => {
                        const nb = [...localData.buttons];
                        nb[idx] = { ...nb[idx], text: e.target.value, title: e.target.value };
                        setLocalData(prev => ({ ...prev, buttons: nb }));
                        updateNodeData(id, { buttons: nb });
                      }} style={{ ...inputStyle, background: 'white', fontSize: '12px', padding: '8px 10px' }} placeholder="Button text" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '3px', fontWeight: '600' }}>Payload / Branch ID</label>
                      <input type="text" value={btn.id || btn.payload || ''} onChange={(e) => {
                        const nb = [...localData.buttons];
                        nb[idx] = { ...nb[idx], id: e.target.value, payload: e.target.value };
                        setLocalData(prev => ({ ...prev, buttons: nb }));
                        updateNodeData(id, { buttons: nb });
                      }} style={{ ...inputStyle, background: 'white', fontSize: '12px', padding: '8px 10px', fontFamily: 'monospace' }} placeholder="e.g. btn_yes" />
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const nb = [...(localData.buttons || []), { id: `btn_${Date.now()}`, type: 'quick_reply', text: 'Quick Reply', title: 'Quick Reply' }];
                  setLocalData(prev => ({ ...prev, buttons: nb }));
                  updateNodeData(id, { buttons: nb });
                }} style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                  + Add Button
                </button>
              </div>
            </>
          );
        })()}

        {type === 'reactionNode' && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Emoji</label>
            <input type="text" name="emoji" value={localData.emoji || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, fontSize: '24px', padding: '12px', textAlign: 'center' }} placeholder="👍" maxLength="2" />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
              {['👍', '❤️', '😂', '🔥', '🎉', '👏', '🙏'].map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setLocalData(prev => ({ ...prev, emoji: e }));
                    updateNodeData(id, { emoji: e });
                  }}
                  style={{
                    fontSize: '18px', padding: '6px 10px', background: localData.emoji === e ? '#dcfce7' : '#f1f5f9',
                    border: localData.emoji === e ? '1.5px solid #10b981' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>Reacts to the customer's last received WhatsApp message.</p>
          </div>
        )}

        {type === 'conditionNode' && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Variable Name</label>
              </div>
              <input type="text" name="variable" value={localData.variable || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. contact.name or selected_option" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {['contact.name', 'contact.phone', 'contact.email', 'contact.tags', 'selected_option'].map(varChip => (
                  <button 
                    key={varChip}
                    type="button"
                    onClick={() => {
                      setLocalData(prev => ({ ...prev, variable: varChip }));
                      updateNodeData(id, { variable: varChip });
                    }}
                    style={{
                      background: localData.variable === varChip ? '#E0E7FF' : '#F1F5F9',
                      color: localData.variable === varChip ? '#4338CA' : '#475569',
                      border: '1px solid ' + (localData.variable === varChip ? '#C7D2FE' : '#E2E8F0'),
                      borderRadius: '4px',
                      fontSize: '11px',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    {varChip}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Operator</label>
              <select name="operator" value={localData.operator || 'equals'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="equals">Equal to (Exact match)</option>
                <option value="not_equals">Not equal to</option>
                <option value="contains">Contains (Keyword / Text)</option>
                <option value="does_not_contain">Does not contain</option>
                <option value="starts_with">Starts with</option>
                <option value="ends_with">Ends with</option>
                <option value="greater_than">Greater than (&gt; Number)</option>
                <option value="less_than">Less than (&lt; Number)</option>
                <option value="not_empty">Has any value (Is Not Empty)</option>
                <option value="is_empty">Is Empty / Not set</option>
              </select>
            </div>
            {!['not_empty', 'is_empty'].includes(localData.operator) && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Compare Value</label>
                <input type="text" name="value" value={localData.value || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. VIP or Yes or 100" />
              </div>
            )}
          </>
        )}

        {type === 'apiNode' && (() => {
          const currentMode = localData.apiPreset || (localData.url && localData.url.includes('/check-availability') ? 'slot_availability' : (localData.url ? 'custom_webhook' : 'slot_availability'));

          const handleSelectSlotEntity = (entId) => {
            const isDynamic = entId === 'dynamic';
            const selectedEnt = availableEntities.find(ent => ent._id === entId);
            const defaultVar = localData.datetimeVariable || '{{preferred_datetime}}';
            const autoPayload = {
              apiPreset: 'slot_availability',
              entityId: entId,
              entityName: isDynamic ? 'Dynamic (Customer Choice)' : (selectedEnt ? selectedEnt.name : ''),
              method: 'POST',
              url: entId ? `/api/entities/${entId}/check-availability` : '',
              endpoint: entId ? `/api/entities/${entId}/check-availability` : '',
              datetimeVariable: defaultVar,
              body: JSON.stringify({ datetime: defaultVar }),
              headers: '{"Content-Type": "application/json"}',
              label: isDynamic ? 'Check Slots: Dynamic Doctor' : (selectedEnt ? `Check Slots: ${selectedEnt.name}` : 'Check Slot Availability'),
              responseMapping: [
                { responseField: 'is_available', sessionVariable: 'is_slot_available' },
                { responseField: 'confirmed_slot_label', sessionVariable: 'booking_slot_label' },
                { responseField: 'confirmed_date_label', sessionVariable: 'booking_date_label' },
                { responseField: 'alt_slot_label', sessionVariable: 'alt_slot_label' },
                { responseField: 'alt_date_label', sessionVariable: 'alt_date_label' },
                { responseField: 'entity_name', sessionVariable: 'booking_entity_name' }
              ]
            };
            setLocalData(prev => ({ ...prev, ...autoPayload }));
            updateNodeData(id, autoPayload);
          };

          const handleSelectDatetimeVar = (varName) => {
            const updated = {
              datetimeVariable: varName,
              body: JSON.stringify({ datetime: varName })
            };
            setLocalData(prev => ({ ...prev, ...updated }));
            updateNodeData(id, updated);
          };

          const handleSwitchMode = (mode) => {
            if (mode === 'slot_availability') {
              const firstEntId = localData.entityId || (availableEntities[0]?._id || '');
              handleSelectSlotEntity(firstEntId);
            } else {
              const customPayload = {
                apiPreset: 'custom_webhook',
                method: localData.method || 'POST',
                url: (localData.url && !localData.url.includes('/check-availability')) ? localData.url : ''
              };
              setLocalData(prev => ({ ...prev, ...customPayload }));
              updateNodeData(id, customPayload);
            }
          };

          return (
            <>
              {/* Mode Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                  Integration Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('slot_availability')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: currentMode === 'slot_availability' ? '2px solid #10B981' : '1px solid #D1D5DB',
                      background: currentMode === 'slot_availability' ? '#F0FDF4' : '#F9FAFB',
                      color: currentMode === 'slot_availability' ? '#065F46' : '#374151',
                      fontWeight: currentMode === 'slot_availability' ? '700' : '500',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>⚡</span>
                    <span>Check Slots (Auto)</span>
                    <span style={{ fontSize: '10px', color: '#059669', fontWeight: 'normal' }}>Zero API URL needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchMode('custom_webhook')}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: currentMode === 'custom_webhook' ? '2px solid #3B82F6' : '1px solid #D1D5DB',
                      background: currentMode === 'custom_webhook' ? '#EFF6FF' : '#F9FAFB',
                      color: currentMode === 'custom_webhook' ? '#1E40AF' : '#374151',
                      fontWeight: currentMode === 'custom_webhook' ? '700' : '500',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>🌐</span>
                    <span>External Webhook</span>
                    <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'normal' }}>Zapier / Custom API</span>
                  </button>
                </div>
              </div>

              {currentMode === 'slot_availability' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Automated Slot Check Form */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                      Select Bookable Resource / Doctor <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={localData.entityId || ''}
                      onChange={(e) => handleSelectSlotEntity(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">-- Choose from your configured entities --</option>
                      <option value="dynamic">✨ Dynamic (Use Doctor selected by customer in flow)</option>
                      {availableEntities.map(ent => (
                        <option key={ent._id} value={ent._id}>
                          {ent.name} ({ent.identifier})
                        </option>
                      ))}
                    </select>
                    {availableEntities.length === 0 && (
                      <div style={{ marginTop: '6px' }}>
                        <input 
                          type="text" 
                          value={localData.entityId || ''} 
                          onChange={(e) => handleSelectSlotEntity(e.target.value)} 
                          style={inputStyle} 
                          placeholder="Enter custom Entity ID (e.g. 660f1234567890abcdef1234)" 
                        />
                      </div>
                    )}
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Real-time shift calendar & live capacity will be evaluated automatically.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                      Customer Requested Time Variable
                    </label>
                    <input
                      type="text"
                      value={localData.datetimeVariable || '{{preferred_datetime}}'}
                      onChange={(e) => handleSelectDatetimeVar(e.target.value)}
                      style={inputStyle}
                      placeholder="{{preferred_datetime}}"
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['{{preferred_datetime}}', '{{appointment_slot}}', '{{datetime}}', '{{preferred_slot}}'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSelectDatetimeVar(chip)}
                          style={{
                            background: (localData.datetimeVariable || '{{preferred_datetime}}') === chip ? '#E0E7FF' : '#F1F5F9',
                            color: (localData.datetimeVariable || '{{preferred_datetime}}') === chip ? '#4338CA' : '#475569',
                            border: '1px solid ' + ((localData.datetimeVariable || '{{preferred_datetime}}') === chip ? '#C7D2FE' : '#E2E8F0'),
                            borderRadius: '4px',
                            fontSize: '11px',
                            padding: '2px 6px',
                            cursor: 'pointer'
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Variable captured from earlier input node (e.g. "Kal sham 5 baje").
                    </p>
                  </div>

                  {/* Automatic Output Variables Card */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>✨</span> Automatic Variables Created Downstream:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <code style={{ color: '#059669', fontWeight: '600' }}>{'{{is_slot_available}}'}</code>
                        <span style={{ color: '#64748B' }}>true / false (Use in Condition Node!)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <code style={{ color: '#2563EB', fontWeight: '600' }}>{'{{booking_slot_label}}'}</code>
                        <span style={{ color: '#64748B' }}>e.g. 10:00 AM - 10:30 AM</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <code style={{ color: '#2563EB', fontWeight: '600' }}>{'{{booking_date_label}}'}</code>
                        <span style={{ color: '#64748B' }}>e.g. 16 Oct 2026</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <code style={{ color: '#D97706', fontWeight: '600' }}>{'{{alt_slot_label}}'}</code>
                        <span style={{ color: '#64748B' }}>Next free alternative slot</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <code style={{ color: '#4B5563', fontWeight: '600' }}>{'{{booking_entity_name}}'}</code>
                        <span style={{ color: '#64748B' }}>Resource / Doctor Name</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '6px 8px', borderRadius: '6px' }}>
                      💡 <strong>Next Step:</strong> Connect the <strong>Success</strong> handle to a <strong>Condition Node</strong> with condition <code>is_slot_available == true</code>.
                    </div>
                  </div>
                </div>
              ) : (
                /* Custom External Webhook View */
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>HTTP Method</label>
                    <select name="method" value={localData.method || 'POST'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Endpoint URL</label>
                    <input type="text" name="url" value={localData.url || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="https://api.yoursystem.com/webhook" />
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Supports variables: {'{{contact.phone}}'}, {'{{contact.name}}'}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Headers (JSON)</label>
                    <textarea name="headers" value={localData.headers || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'monospace', fontSize: '12px' }} placeholder='{"Authorization": "Bearer YOUR_TOKEN"}' />
                  </div>
                  {['POST', 'PUT', 'PATCH'].includes(localData.method || 'POST') && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Request Body (JSON)</label>
                      <textarea name="body" value={localData.body || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '90px', fontFamily: 'monospace', fontSize: '12px' }} placeholder='{"phone": "{{contact.phone}}", "name": "{{contact.name}}"}' />
                    </div>
                  )}
                  <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Response Mapping</label>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Extract API data</span>
                    </div>
                    {(localData.responseMapping || []).map((m, mIdx) => (
                      <div key={mIdx} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={m.responseField || ''} 
                          placeholder="e.g. data.id"
                          onChange={(e) => {
                            const newMap = [...(localData.responseMapping || [])];
                            newMap[mIdx] = { ...newMap[mIdx], responseField: e.target.value };
                            setLocalData(prev => ({ ...prev, responseMapping: newMap }));
                          }}
                          onBlur={() => updateNodeData(id, { responseMapping: localData.responseMapping })}
                          style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: '12px' }} 
                        />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>→</span>
                        <input 
                          type="text" 
                          value={m.sessionVariable || ''} 
                          placeholder="contact.api_id"
                          onChange={(e) => {
                            const newMap = [...(localData.responseMapping || [])];
                            newMap[mIdx] = { ...newMap[mIdx], sessionVariable: e.target.value };
                            setLocalData(prev => ({ ...prev, responseMapping: newMap }));
                          }}
                          onBlur={() => updateNodeData(id, { responseMapping: localData.responseMapping })}
                          style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: '12px' }} 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newMap = localData.responseMapping.filter((_, i) => i !== mIdx);
                            setLocalData(prev => ({ ...prev, responseMapping: newMap }));
                            updateNodeData(id, { responseMapping: newMap });
                          }} 
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => {
                        const newMap = [...(localData.responseMapping || []), { responseField: '', sessionVariable: '' }];
                        setLocalData(prev => ({ ...prev, responseMapping: newMap }));
                        updateNodeData(id, { responseMapping: newMap });
                      }} 
                      style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: '4px 0' }}
                    >
                      + Add Variable Mapping
                    </button>
                  </div>
                </>
              )}
            </>
          );
        })()}

        {type === 'bookingNode' && (
          <>
            {/* Header info badge */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontWeight: '700', fontSize: '13px' }}>
                <Calendar size={16} />
                <span>Real-Time Dynamic Slot Booking</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#0284C7', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                Computes live slot availability, prevents double-booking, and displays real-time WhatsApp interactive list menus.
              </p>
            </div>

            {/* 1. Resource Mode Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                Bookable Resource Target
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const up = { useDynamicEntity: true, entityId: '{{selected_doctor_id}}', entityName: '{{doctor_name}}' };
                    setLocalData(prev => ({ ...prev, ...up }));
                    updateNodeData(id, up);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: (localData.useDynamicEntity !== false) ? '2px solid #0EA5E9' : '1px solid #D1D5DB',
                    background: (localData.useDynamicEntity !== false) ? '#F0F9FF' : '#F9FAFB',
                    color: (localData.useDynamicEntity !== false) ? '#0369A1' : '#374151',
                    fontWeight: (localData.useDynamicEntity !== false) ? '700' : '500',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <Sparkles size={14} color="#0EA5E9" />
                  <span>Dynamic Resource</span>
                  <span style={{ fontSize: '10px', color: '#0284C7' }}>From Previous Menu / Bot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const firstEnt = availableEntities[0];
                    const up = { useDynamicEntity: false, entityId: firstEnt?._id || '', entityName: firstEnt?.name || '' };
                    setLocalData(prev => ({ ...prev, ...up }));
                    updateNodeData(id, up);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: (localData.useDynamicEntity === false) ? '2px solid #0EA5E9' : '1px solid #D1D5DB',
                    background: (localData.useDynamicEntity === false) ? '#F0F9FF' : '#F9FAFB',
                    color: (localData.useDynamicEntity === false) ? '#0369A1' : '#374151',
                    fontWeight: (localData.useDynamicEntity === false) ? '700' : '500',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center'
                  }}
                >
                  <UserCheck size={14} color="#64748B" />
                  <span>Fixed Specific Resource</span>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Choose 1 Doctor/Room</span>
                </button>
              </div>

              {localData.useDynamicEntity === false ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>
                    Specific Resource Name
                  </label>
                  <input
                    type="text"
                    list="specific-resource-list"
                    value={timingFormData.name || localData.entityName || ''}
                    onChange={(e) => {
                      const typed = e.target.value;
                      setTimingFormData(prev => ({ ...prev, name: typed }));
                      const sel = availableEntities.find(ent => ent.name.toLowerCase() === typed.toLowerCase() || ent._id === typed);
                      if (sel) {
                        loadEntityTimingIntoForm(sel);
                        const up = { entityId: sel._id, entityName: sel.name, useDynamicEntity: false };
                        setLocalData(prev => ({ ...prev, ...up }));
                        updateNodeData(id, up);
                      } else {
                        setSelectedEntityForTiming('');
                        const up = { entityName: typed, useDynamicEntity: false };
                        setLocalData(prev => ({ ...prev, ...up }));
                        updateNodeData(id, up);
                      }
                    }}
                    placeholder="Type name (e.g. raj, Dr. Rajesh, Room 101...)"
                    style={{ ...inputStyle, background: 'white' }}
                  />
                  <datalist id="specific-resource-list">
                    {availableEntities.map(ent => (
                      <option key={ent._id} value={ent.name}>
                        {ent.category ? `(${ent.category})` : ''}
                      </option>
                    ))}
                  </datalist>
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11.5px', color: '#475569' }}>
                  Variable: <code style={{ color: '#0284C7', fontWeight: '600' }}>{localData.entityId || '{{selected_doctor_id}}'}</code> (Automatically passes the doctor, room, or table selected by the user).
                </div>
              )}
            </div>

            {/* 2. Direct Real-Time Timing & Schedule Editor (In-Node!) */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                  <Clock size={16} color="#0EA5E9" />
                  <span>Configure Resource Timings (Live)</span>
                </div>
                {selectedEntityForTiming && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEntityForTiming('');
                      setTimingFormData({
                        name: '',
                        category: '',
                        identifier: '',
                        start1: '09:00',
                        end1: '13:00',
                        hasShift2: true,
                        start2: '17:00',
                        end2: '20:00',
                        stepMinutes: 30,
                        totalCapacity: 1,
                        activeDays: [1, 2, 3, 4, 5, 6]
                      });
                    }}
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#0284C7',
                      background: '#E0F2FE',
                      border: '1px solid #BAE6FD',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    + New Resource
                  </button>
                )}
              </div>

              {/* Resource / Doctor Name Text Input */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Resource / Doctor / Room Name:
                </label>
                <input
                  type="text"
                  list="resource-datalist"
                  value={timingFormData.name || ''}
                  onChange={(e) => {
                    const typed = e.target.value;
                    setTimingFormData(prev => ({ ...prev, name: typed }));
                    const matched = availableEntities.find(ent => 
                      ent.name.toLowerCase() === typed.toLowerCase() ||
                      ent._id === typed
                    );
                    if (matched) {
                      loadEntityTimingIntoForm(matched);
                      const up = { entityId: matched._id, entityName: matched.name, useDynamicEntity: false };
                      setLocalData(prev => ({ ...prev, ...up }));
                      updateNodeData(id, up);
                    } else {
                      setSelectedEntityForTiming('');
                      const up = { entityName: typed, useDynamicEntity: false };
                      setLocalData(prev => ({ ...prev, ...up }));
                      updateNodeData(id, up);
                    }
                  }}
                  placeholder="Type name directly (e.g. raj, Dr. Rajesh, Room 101, Deluxe Cabin...)"
                  style={{ ...inputStyle, background: '#FFFFFF', fontSize: '13px', fontWeight: '600', color: '#0F172A', border: '1.5px solid #94A3B8' }}
                />
                <datalist id="resource-datalist">
                  {availableEntities.map(ent => (
                    <option key={ent._id} value={ent.name}>
                      {ent.category ? `(${ent.category})` : ''}
                    </option>
                  ))}
                </datalist>
                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                  💡 Direct text likhein ya suggestions me se click karein.
                </div>
              </div>

              {/* Category / Type Text Input (Free Text) */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  Category (Koi bhi category text likhein):
                </label>
                <input
                  type="text"
                  list="category-datalist"
                  value={timingFormData.category || ''}
                  onChange={(e) => setTimingFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. room, doctor, salon, consultation, tutor, clinic, table, opd..."
                  style={{ ...inputStyle, background: '#FFFFFF', fontSize: '12.5px' }}
                />
                <datalist id="category-datalist">
                  <option value="doctor" />
                  <option value="room" />
                  <option value="salon" />
                  <option value="consultation" />
                  <option value="clinic" />
                  <option value="tutor" />
                  <option value="table" />
                  <option value="service" />
                </datalist>

                {/* Quick suggestion pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                  {['doctor', 'room', 'salon', 'clinic', 'consultation', 'table', 'service'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTimingFormData(prev => ({ ...prev, category: cat }))}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: timingFormData.category === cat ? '1px solid #0EA5E9' : '1px solid #E2E8F0',
                        background: timingFormData.category === cat ? '#E0F2FE' : '#F1F5F9',
                        color: timingFormData.category === cat ? '#0284C7' : '#64748B',
                        fontSize: '10.5px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      +{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timing Fields - ALWAYS visible */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  
                  {/* Shift 1 Timing */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      ☀️ Shift 1 (Morning / Opening Hours)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>Start Time</span>
                        <input
                          type="time"
                          value={timingFormData.start1}
                          onChange={(e) => setTimingFormData(prev => ({ ...prev, start1: e.target.value }))}
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>End Time</span>
                        <input
                          type="time"
                          value={timingFormData.end1}
                          onChange={(e) => setTimingFormData(prev => ({ ...prev, end1: e.target.value }))}
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shift 2 Timing (Optional Evening) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155' }}>
                        🌙 Shift 2 (Evening Hours - Optional)
                      </label>
                      <input
                        type="checkbox"
                        checked={timingFormData.hasShift2}
                        onChange={(e) => setTimingFormData(prev => ({ ...prev, hasShift2: e.target.checked }))}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    {timingFormData.hasShift2 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>Start Time</span>
                          <input
                            type="time"
                            value={timingFormData.start2}
                            onChange={(e) => setTimingFormData(prev => ({ ...prev, start2: e.target.value }))}
                            style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>End Time</span>
                          <input
                            type="time"
                            value={timingFormData.end2}
                            onChange={(e) => setTimingFormData(prev => ({ ...prev, end2: e.target.value }))}
                            style={{ ...inputStyle, padding: '4px 8px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slot Duration Step */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      ⏱️ Slot Duration (Time per Booking)
                    </label>
                    <select
                      value={timingFormData.stepMinutes}
                      onChange={(e) => setTimingFormData(prev => ({ ...prev, stepMinutes: Number(e.target.value) }))}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                    >
                      <option value="15">15 Minutes (Fast Consultation / Interview)</option>
                      <option value="30">30 Minutes (Standard Clinic OPD / Salon)</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (1 Hour - Therapy / Meeting)</option>
                      <option value="90">90 Minutes (Restaurant Dining / Studio)</option>
                      <option value="120">120 Minutes (2 Hours - Turf / Service)</option>
                      <option value="1440">1440 Minutes (Full Day - Hotel Room / Car)</option>
                    </select>
                  </div>

                  {/* Working Days */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                      📅 Working Days of Week
                    </label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {[
                        { day: 1, label: 'Mon' },
                        { day: 2, label: 'Tue' },
                        { day: 3, label: 'Wed' },
                        { day: 4, label: 'Thu' },
                        { day: 5, label: 'Fri' },
                        { day: 6, label: 'Sat' },
                        { day: 0, label: 'Sun' }
                      ].map(d => {
                        const isSelected = (timingFormData.activeDays || []).includes(d.day);
                        return (
                          <button
                            key={d.day}
                            type="button"
                            onClick={() => {
                              const curr = [...(timingFormData.activeDays || [])];
                              const next = isSelected ? curr.filter(x => x !== d.day) : [...curr, d.day];
                              setTimingFormData(prev => ({ ...prev, activeDays: next }));
                            }}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: isSelected ? '1px solid #0EA5E9' : '1px solid #D1D5DB',
                              background: isSelected ? '#E0F2FE' : '#F8FAFC',
                              color: isSelected ? '#0369A1' : '#64748B',
                              fontSize: '11px',
                              fontWeight: isSelected ? '700' : '500',
                              cursor: 'pointer'
                            }}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Timing Button */}
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      disabled={isSavingTiming}
                      onClick={handleSaveResourceTiming}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#0EA5E9',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isSavingTiming ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(14, 165, 233, 0.25)'
                      }}
                    >
                      <Save size={14} />
                      {isSavingTiming ? 'Saving to Database...' : 'Save Resource & Live Schedule'}
                    </button>
                  </div>

                </div>
            </div>

            {/* 3. WhatsApp Interactive Message Configuration */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                WhatsApp Slot Menu Body Text
              </label>
              <textarea
                name="text"
                value={localData.text || ''}
                onChange={handleLocalChange}
                onBlur={handleBlur}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="e.g. 📅 Live Available Slots for {{doctor_name}}:\n\nTap below to choose your consultation slot for the next 3 days:"
              />
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
                Supports dynamic variables like <code>{'{{doctor_name}}'}</code>, <code>{'{{patient_name}}'}</code>.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Menu Button Text
                </label>
                <input
                  type="text"
                  name="menuButtonText"
                  value={localData.menuButtonText || 'View Live Slots'}
                  onChange={handleLocalChange}
                  onBlur={handleBlur}
                  style={inputStyle}
                  placeholder="View Live Slots"
                  maxLength={20}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                  Days Ahead
                </label>
                <select
                  name="daysAhead"
                  value={localData.daysAhead || 3}
                  onChange={(e) => { handleLocalChange(e); handleBlur(e); }}
                  style={inputStyle}
                >
                  <option value={1}>1 Day (Today only)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Recommended)</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Full Week)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                Save Confirmed Slot to Variable
              </label>
              <input
                type="text"
                name="saveVariableAs"
                value={localData.saveVariableAs || 'booking_slot_id'}
                onChange={handleLocalChange}
                onBlur={handleBlur}
                style={inputStyle}
                placeholder="booking_slot_id"
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                Booking Operation Mode
              </label>
              <select
                name="bookingMode"
                value={localData.bookingMode || 'new'}
                onChange={(e) => { handleLocalChange(e); handleBlur(e); }}
                style={inputStyle}
              >
                <option value="new">📅 Standard New Booking</option>
                <option value="reschedule">🔄 Reschedule Mode (Atomic Swap - Releases Old Slot)</option>
              </select>
              <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                In Reschedule Mode, when a new slot is chosen, the customer's previous booking is automatically released.
              </div>
            </div>
          </>
        )}

        {type === 'delayNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Delay Amount</label>
              <input type="number" name="delayAmount" value={localData.delayAmount || '1'} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="1" min="1" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Time Unit</label>
              <select name="delayUnit" value={localData.delayUnit || 'Minutes'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="Minutes">Minutes</option>
                <option value="Hours">Hours</option>
                <option value="Days">Days</option>
              </select>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#b45309', marginTop: '8px' }}>
              If a customer sends a message while this delay is running, the flow will pause to preserve state.
            </div>
          </>
        )}

        {type === 'aiNode' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>AI Engine & Model</label>
              <select name="model" value={localData.model || 'gpt-4o'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="gpt-4o">⚡ GPT-4o (Smartest & Fastest)</option>
                <option value="gpt-4o-mini">🚀 GPT-4o Mini (Cost Effective)</option>
                <option value="gpt-3.5-turbo">🤖 GPT-3.5 Turbo</option>
                <option value="garvik-ai">✨ Garvik AI Engine</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111827' }}>Creativity (Temperature)</label>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{localData.temperature || 0.7}</span>
              </div>
              <input type="range" name="temperature" min="0.1" max="1.0" step="0.1" value={localData.temperature || 0.7} onChange={handleLocalChange} onBlur={handleBlur} style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>System Prompt (Instructions)</label>
              <textarea name="systemPrompt" value={localData.systemPrompt || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '110px' }} placeholder="You are a helpful assistant for Messbee..." />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Supports variables: {'{{contact.name}}'}, {'{{contact.phone}}'}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>Save Response to Variable</label>
              <input type="text" name="saveVariable" value={localData.saveVariable || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. ai_reply" />
            </div>
          </>
        )}

        {type === 'actionNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Action Type</label>
              <select name="actionType" value={localData.actionType || 'update_contact'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="notify_whatsapp">📱 Send WhatsApp Alert (Staff / Doctor / Admin)</option>
                <option value="release_booking">❌ Cancel / Release Booking Slot</option>
                <option value="lookup_active_booking">🔍 Lookup Customer Active Booking</option>
                <option value="add_tag">🏷️ Add Tag to Contact</option>
                <option value="remove_tag">🗑️ Remove Tag from Contact</option>
                <option value="update_contact">✏️ Update Field / Custom Data</option>
                <option value="human_handoff">👤 General Human Handoff</option>
                <option value="assign_team">👥 Assign to Team Member</option>
                <option value="round_robin_assign">🔄 Round-Robin Agent Handoff</option>
                <option value="opt_in">✅ Marketing Opt-in</option>
                <option value="opt_out">⛔ Marketing Opt-out</option>
                <option value="unassign_team">❌ Unassign Team Member</option>
              </select>
            </div>
            {['notify_whatsapp', 'send_whatsapp_notification'].includes(localData.actionType) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📱 Real WhatsApp Direct Transfer
                  </div>
                  <p style={{ fontSize: '12px', color: '#15803D', margin: 0, lineHeight: '1.4' }}>
                    Sends a complete lead summary directly to the staff/doctor's personal WhatsApp. They can tap the one-click link to start chatting with the customer immediately from their Real WhatsApp app.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    Staff / Doctor WhatsApp Phone Number(s) *
                  </label>
                  <input 
                    type="text" 
                    name="recipientPhone" 
                    value={localData.recipientPhone || localData.targetPhone || ''} 
                    onChange={(e) => {
                      handleLocalChange(e);
                      setLocalData(prev => ({ ...prev, recipientPhone: e.target.value, targetPhone: e.target.value }));
                    }} 
                    onBlur={() => updateNodeData(id, { recipientPhone: localData.recipientPhone || localData.targetPhone, targetPhone: localData.recipientPhone || localData.targetPhone })} 
                    style={inputStyle} 
                    placeholder="e.g. +919876543210 or {{doctor_phone}}" 
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    Supports country code (e.g. +91) and dynamic variables. Separate with commas to notify multiple numbers.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    Admin / Supervisor CC Phone (Optional)
                  </label>
                  <input 
                    type="text" 
                    name="adminPhone" 
                    value={localData.adminPhone || ''} 
                    onChange={handleLocalChange} 
                    onBlur={handleBlur} 
                    style={inputStyle} 
                    placeholder="e.g. +919811122233 (Hospital/Store Admin number)" 
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    The 3rd person (Admin/Manager) will receive a duplicate notification for real-time supervision.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                      Alert Message Body *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultTemplate = `🔔 *NEW RECEPTION TRANSFER ALERT* 🔔\n\n👤 *Customer/Patient:* {{name|Customer}}\n📞 *Mobile:* +{{contact.phone}}\n🩺 *Requirement/Symptoms:* {{problem|{{requirement|General Enquiry}}}}\n⏰ *Slot/Time:* {{appointment_slot|{{preferred_slot|Earliest Available}}}}\n📅 *Date:* {{system.date}} at {{system.time}}\n\n---\n💬 *Tap to chat directly with customer on WhatsApp:*\nhttps://wa.me/{{contact.phone}}?text=Hello%20{{name|there}},%20this%20is%20regarding%20your%20reception%20request...`;
                        setLocalData(prev => ({ ...prev, notificationMessage: defaultTemplate }));
                        updateNodeData(id, { notificationMessage: defaultTemplate });
                      }}
                      style={{ fontSize: '11px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                    >
                      Use Recommended Template
                    </button>
                  </div>
                  <textarea 
                    name="notificationMessage" 
                    rows={7}
                    value={localData.notificationMessage || localData.messageBody || ''} 
                    onChange={(e) => {
                      handleLocalChange(e);
                      setLocalData(prev => ({ ...prev, notificationMessage: e.target.value, messageBody: e.target.value }));
                    }} 
                    onBlur={() => updateNodeData(id, { notificationMessage: localData.notificationMessage || localData.messageBody, messageBody: localData.notificationMessage || localData.messageBody })} 
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }} 
                    placeholder="Type the message that will be sent to the staff/doctor..." 
                  />
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}>
                    Quick Insert Dynamic Variables:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      { label: 'Patient/Customer Name', code: '{{name}}' },
                      { label: 'Customer Mobile', code: '{{contact.phone}}' },
                      { label: 'Problem/Requirement', code: '{{problem}}' },
                      { label: 'Slot / Date', code: '{{appointment_slot}}' },
                      { label: 'Direct Chat Link', code: 'https://wa.me/{{contact.phone}}' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = localData.notificationMessage || localData.messageBody || '';
                          const updated = current + (current ? '\n' : '') + item.code;
                          setLocalData(prev => ({ ...prev, notificationMessage: updated, messageBody: updated }));
                          updateNodeData(id, { notificationMessage: updated, messageBody: updated });
                        }}
                        style={{
                          background: '#F3F4F6',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#1F2937',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    Assign in Messbee Live Inbox (Agent Name)
                  </label>
                  <input 
                    type="text" 
                    name="assignToStaff" 
                    value={localData.assignToStaff || localData.assignTo || ''} 
                    onChange={(e) => {
                      handleLocalChange(e);
                      setLocalData(prev => ({ ...prev, assignToStaff: e.target.value, assignTo: e.target.value }));
                    }} 
                    onBlur={() => updateNodeData(id, { assignToStaff: localData.assignToStaff || localData.assignTo, assignTo: localData.assignToStaff || localData.assignTo })} 
                    style={inputStyle} 
                    placeholder="e.g. Dr. Rahul or Sales Team" 
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    When set, automatically pauses the bot and assigns this conversation to this agent in Messbee's Live Inbox.
                  </div>
                </div>
              </div>
            )}

            {['add_tag', 'remove_tag'].includes(localData.actionType) && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {localData.actionType === 'add_tag' ? 'Tag to Add' : 'Tag to Remove'}
                </label>
                <input 
                  type="text" 
                  name="tagValue" 
                  value={localData.tagValue || localData.tag || ''} 
                  onChange={(e) => {
                    handleLocalChange(e);
                    setLocalData(prev => ({ ...prev, tagValue: e.target.value, tag: e.target.value }));
                  }} 
                  onBlur={() => updateNodeData(id, { tagValue: localData.tagValue || localData.tag, tag: localData.tagValue || localData.tag })} 
                  style={inputStyle} 
                  placeholder="e.g. VIP, Demo Requested, Qualified" 
                />
              </div>
            )}

            {['release_booking', 'cancel_booking'].includes(localData.actionType) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>
                    ❌ Atomic Slot Release
                  </div>
                  <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, lineHeight: '1.4' }}>
                    Safely releases the customer's upcoming active booking slot and returns capacity immediately to the public availability pool.
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    Specific Allocation ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="allocationId"
                    value={localData.allocationId || ''}
                    onChange={handleLocalChange}
                    onBlur={handleBlur}
                    style={inputStyle}
                    placeholder="e.g. {{booking_allocation_id}} (leave blank to auto-detect)"
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    If blank, automatically detects the upcoming active booking for this customer's WhatsApp number.
                  </div>
                </div>
              </div>
            )}

            {['lookup_active_booking', 'lookup_booking'].includes(localData.actionType) && (
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369A1', marginBottom: '4px' }}>
                  🔍 Active Booking Auto-Lookup
                </div>
                <p style={{ fontSize: '12px', color: '#0284C7', margin: 0, lineHeight: '1.4' }}>
                  Automatically checks for any upcoming COMMITTED booking for the current customer's phone and populates variables:
                  <br />
                  <code>{'{{has_active_booking}}'}</code>, <code>{'{{active_booking_id}}'}</code>, <code>{'{{active_booking_entity_name}}'}</code>, <code>{'{{active_booking_slot_label}}'}</code>.
                </p>
              </div>
            )}
            {localData.actionType === 'update_contact' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Field to Update</label>
                  <input 
                    type="text" 
                    name="updateField" 
                    value={localData.updateField || localData.fieldKey || ''} 
                    onChange={(e) => {
                      handleLocalChange(e);
                      setLocalData(prev => ({ ...prev, updateField: e.target.value, fieldKey: e.target.value }));
                    }} 
                    onBlur={() => updateNodeData(id, { updateField: localData.updateField || localData.fieldKey, fieldKey: localData.updateField || localData.fieldKey })} 
                    style={inputStyle} 
                    placeholder="e.g. status or city" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>New Value</label>
                  <input 
                    type="text" 
                    name="updateValue" 
                    value={localData.updateValue || localData.fieldValue || ''} 
                    onChange={(e) => {
                      handleLocalChange(e);
                      setLocalData(prev => ({ ...prev, updateValue: e.target.value, fieldValue: e.target.value }));
                    }} 
                    onBlur={() => updateNodeData(id, { updateValue: localData.updateValue || localData.fieldValue, fieldValue: localData.updateValue || localData.fieldValue })} 
                    style={inputStyle} 
                    placeholder="e.g. qualified_lead or {{city}}" 
                  />
                </div>
              </>
            )}
            {['assign_team', 'unassign_team', 'human_handoff'].includes(localData.actionType) && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Assign To (Team or Agent)</label>
                <input type="text" name="assignTo" value={localData.assignTo || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Sales Team or Agent Name" />
              </div>
            )}
            {localData.actionType === 'round_robin_assign' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Agents List (Round-Robin)</label>
                {(localData.agents || []).map((agent, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" value={agent || ''} onChange={(e) => {
                      const newAgents = [...(localData.agents || [])];
                      newAgents[idx] = e.target.value;
                      setLocalData(prev => ({ ...prev, agents: newAgents }));
                    }} onBlur={() => updateNodeData(id, { agents: localData.agents })} style={inputStyle} placeholder={`Agent ${idx + 1}`} />
                    <button onClick={() => {
                      const newAgents = localData.agents.filter((_, i) => i !== idx);
                      setLocalData(prev => ({ ...prev, agents: newAgents }));
                      updateNodeData(id, { agents: newAgents });
                    }} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
                <button onClick={() => {
                  const newAgents = [...(localData.agents || []), ''];
                  setLocalData(prev => ({ ...prev, agents: newAgents }));
                  updateNodeData(id, { agents: newAgents });
                }} style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                  + Add Agent
                </button>
              </div>
            )}
          </>
        )}

        {type === 'randomizerNode' && (
          <>
            <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '12px', border: '1px solid #fbcfe8', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#be185d', marginBottom: '6px' }}>A/B Split Test</label>
              <p style={{ fontSize: '12px', color: '#9d174d', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                Split your customer traffic between two paths to test different offers, copy, or message sequences.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0284c7' }}>
                  Path A: {Number(localData.splitPercentage) || 50}%
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#d97706' }}>
                  Path B: {100 - (Number(localData.splitPercentage) || 50)}%
                </span>
              </div>

              <input 
                type="range" 
                min="1" 
                max="99" 
                value={Number(localData.splitPercentage) || 50} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalData(prev => ({ ...prev, splitPercentage: val }));
                  updateNodeData(id, { splitPercentage: val });
                }} 
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ec4899', margin: '8px 0' }}
              />

              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', lineHeight: '1.4' }}>
                Connect the blue <strong>Path A</strong> handle and orange <strong>Path B</strong> handle to the different steps you want to test.
              </div>
            </div>
          </>
        )}

        {type === 'shopifyNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Shopify Action</label>
              <select 
                name="shopifyAction" 
                value={localData.shopifyAction || 'get_customer'} 
                onChange={(e) => { handleLocalChange(e); handleBlur(e); }} 
                style={inputStyle}
              >
                <option value="get_customer">👤 Get Customer Profile by Phone</option>
                <option value="get_order">📦 Look up Recent Order Status</option>
                <option value="check_inventory">🏷️ Check Product Stock / Inventory</option>
                <option value="abandoned_checkout">🛒 Recover Abandoned Checkout Cart</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Shopify Store Domain</label>
              <input 
                type="text" 
                name="shopifyStoreUrl" 
                value={localData.shopifyStoreUrl || ''} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={inputStyle} 
                placeholder="e.g. your-brand.myshopify.com" 
              />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Enter your myshopify.com domain name.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Admin API Access Token (Optional)</label>
              <input 
                type="password" 
                name="shopifyAccessToken" 
                value={localData.shopifyAccessToken || ''} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={inputStyle} 
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" 
              />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Leave blank if configured globally in Settings &gt; Integrations.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Result to Variable</label>
              <input 
                type="text" 
                name="saveVariable" 
                value={localData.saveVariable || 'shopify.customer'} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={inputStyle} 
                placeholder="e.g. shopify.customer" 
              />
            </div>
          </>
        )}

        {type === 'waitForEventNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Event to Wait For</label>
              <select 
                name="eventType" 
                value={localData.eventType || 'any_message'} 
                onChange={(e) => { handleLocalChange(e); handleBlur(e); }} 
                style={inputStyle}
              >
                <option value="any_message">💬 Customer Sends Any Message</option>
                <option value="tag_added">🏷️ Specific Tag is Added</option>
                <option value="payment_success">💳 Payment Received / Completed</option>
                <option value="link_clicked">🔗 Tracked Link Clicked</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Timeout Duration (Hours)</label>
              <input 
                type="number" 
                min="1" 
                max="720" 
                name="waitHours" 
                value={localData.waitHours || 24} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={inputStyle} 
                placeholder="24" 
              />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Maximum time to wait before taking the orange Timeout Reached path.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
              <div>🟢 <strong>Event Happened:</strong> Runs immediately when the customer completes the event.</div>
              <div style={{ marginTop: '6px' }}>🟠 <strong>Timeout Reached:</strong> Runs if no event occurs within {localData.waitHours || 24} hours.</div>
            </div>
          </>
        )}

        {(type === 'inputNode' || type === 'menuNode' || (type === 'messageNode' && localData.messageType === 'interactive')) && (
          <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '12px', border: '1px solid #FDE68A', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#D97706" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#92400E' }}>Timeout Path</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="timeoutEnabled" 
                  checked={!!localData.timeoutEnabled} 
                  onChange={(e) => { 
                    setLocalData(prev => ({ ...prev, timeoutEnabled: e.target.checked }));
                    updateNodeData(id, { timeoutEnabled: e.target.checked });
                  }} 
                  style={{ marginRight: '8px' }} 
                />
                <span style={{ fontSize: '12px', color: '#92400E' }}>Enable</span>
              </label>
            </div>
            
            {localData.timeoutEnabled && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#92400E', marginBottom: '8px' }}>Trigger timeout after (Minutes)</label>
                <input 
                  type="number" 
                  name="timeoutMinutes" 
                  value={localData.timeoutMinutes || 15} 
                  onChange={handleLocalChange} 
                  onBlur={handleBlur} 
                  style={{ ...inputStyle, background: 'white', borderColor: '#FCD34D' }} 
                  min="1" 
                />
                <p style={{ fontSize: '11px', color: '#B45309', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                  If the customer does not reply within this time, the flow will proceed through the orange Timeout handle.
                </p>
              </div>
            )}
          </div>
        )}

        {(['menuNode', 'pollNode', 'carouselNode', 'commerceNode', 'catalogNode', 'interactiveNode', 'templateNode'].includes(type) || (type === 'messageNode' && localData.messageType === 'interactive')) && (
          <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Answer to Variable</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <Variable size={14} />
              </div>
              <input 
                type="text" 
                name="saveVariableAs" 
                value={localData.saveVariableAs || ''} 
                onChange={handleLocalChange} 
                onBlur={handleBlur} 
                style={{ ...inputStyle, paddingLeft: '32px', background: 'white' }} 
                placeholder="e.g. contact.selected_plan" 
              />
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
              The customer's selection will be saved to this variable and can be used in Condition nodes.
            </p>
          </div>
        )}

      </div>
    </>
  )}

      {isTriggerModalOpen && (
        <TriggerSelectionModal 
          onClose={() => setIsTriggerModalOpen(false)} 
          onSelectTrigger={handleSelectTrigger} 
        />
      )}

      {isGuideOpen && (
        <NodeGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          nodeType={type}
        />
      )}

      {isStandeeModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} 
          onClick={() => setIsStandeeModalOpen(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '900px',
              maxWidth: '95vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '24px',
              position: 'relative'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                📱 WhatsApp QR Code Designer
              </h3>
              <button
                type="button"
                onClick={() => setIsStandeeModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>
            <StandeeQrGenerator
              localData={localData}
              updateNodeData={updateNodeData}
              id={id}
              channelPhone={channelPhone}
              inputStyle={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
