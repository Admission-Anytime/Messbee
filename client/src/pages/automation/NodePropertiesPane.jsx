import React, { useState, useEffect } from 'react';
import useCanvasStore from '../../store/useCanvasStore';
import api from '../../context/axios';
import { Settings, Zap, Variable, AlertTriangle, Link as LinkIcon, Phone, MessageCircle, Trash2, ClipboardList } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
        alert("Location not found. Try a different city or pin code.");
      }
    } catch (err) {
      console.error("Search failed", err);
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
  padding: '10px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1F2937',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

export default function NodePropertiesPane({ currentChannelId }) {
  const { nodes, updateNodeData, setEdges } = useCanvasStore();
  const [localData, setLocalData] = useState(null);
  const [uploadMode, setUploadMode] = useState('url');
  const [isUploading, setIsUploading] = useState(false);
  const [channelPhone, setChannelPhone] = useState('');

  useEffect(() => {
    if (currentChannelId) {
      api.get('/whatsapp/channels').then(res => {
        const channel = res.data.find(c => c._id === currentChannelId);
        if (channel && channel.phoneNumber) {
          // Remove '+' for wa.me link
          setChannelPhone(channel.phoneNumber.replace('+', ''));
        }
      }).catch(console.error);
    }
  }, [currentChannelId]);

  const selectedNode = nodes.find(n => n.selected);

  useEffect(() => {
    if (selectedNode) {
      setLocalData(selectedNode.data);
    } else {
      setLocalData(null);
    }
  }, [selectedNode?.id]);

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
        const updatePayload = { mediaUrl: resData.data.url, mediaSize: fileSizeStr };
        if (durationStr) updatePayload.mediaDuration = durationStr;
        
        setLocalData(prev => ({ ...prev, ...updatePayload }));
        updateNodeData(id, updatePayload);
      } else {
        throw new Error(resData.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Upload failed. Is the backend running?');
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
      overflowY: 'auto'
    }}>
      {type !== 'triggerNode' && (
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '8px', borderRadius: '8px' }}>
            <Settings size={20} />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>Configuration</h2>
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>New incoming conversation</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Starts when a contact writes to you for the first time.
              </p>
            </div>
            
            {localData.triggerType === 'qr_link' ? (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkIcon size={16} color="#10B981" /> QR & Link Generator
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: '1.4' }}>
                  Create a pre-filled WhatsApp link and QR code. When customers use them, they'll send this exact keyword to start the flow.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Pre-filled Keyword</label>
                  <input
                    type="text"
                    name="keyword"
                    value={localData.keyword || ''}
                    onChange={handleLocalChange}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, background: 'white', borderColor: '#CBD5E1' }}
                    placeholder="e.g. I want to order"
                  />
                </div>

                {localData.keyword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Link Section */}
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LinkIcon size={14} color="#3B82F6" /> Your WhatsApp Link
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', wordBreak: 'break-all', background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
                        https://wa.me/{channelPhone}?text={encodeURIComponent(localData.keyword)}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(`https://wa.me/${channelPhone}?text=${encodeURIComponent(localData.keyword)}`); alert('Link copied to clipboard!'); }} style={{ width: '100%', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                        Copy Link
                      </button>
                    </div>

                    {/* QR Code Section */}
                    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '12px', alignSelf: 'flex-start' }}>
                        Your QR Code
                      </div>
                      <div style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://wa.me/${channelPhone}?text=${localData.keyword}`)}`} 
                          alt="WhatsApp QR Code" 
                          style={{ width: '150px', height: '150px', display: 'block' }} 
                        />
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
                        Customers can scan this with their phone's camera to instantly start a chat with the pre-filled keyword.
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
            ) : localData.triggerType === 'interactive_template' ? (
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} color="#9333EA" /> Interactive Template (Campaign)
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', lineHeight: '1.4' }}>
                  Trigger this flow when a customer clicks a Quick Reply button on an outbound Meta Template message.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Template Button Payload (Required)</label>
                  <input
                    type="text"
                    name="keyword"
                    value={localData.keyword || ''}
                    onChange={handleLocalChange}
                    onBlur={handleBlur}
                    style={{ ...inputStyle, background: 'white', borderColor: '#CBD5E1' }}
                    placeholder="e.g. btn_confirm_order"
                  />
                </div>

                <div style={{ background: 'white', border: '1px dashed #D8B4FE', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#6B21A8', lineHeight: '1.5' }}>
                  <span style={{ fontWeight: '700' }}>Where to find this?</span><br/>
                  When you create a message template in your Meta WhatsApp Manager, each button asks for a "Payload". Paste that exact payload here to connect the button to this automation flow.
                </div>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>Trigger Settings</div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>When to trigger</label>
                  <select name="triggerType" value={localData.triggerType || 'exact_match'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={{ ...inputStyle, background: 'white' }}>
                    <option value="exact_match">Exact Match</option>
                    <option value="contains">Contains</option>
                    <option value="starts_with">Starts With</option>
                    <option value="ends_with">Ends With</option>
                    <option value="media_any">Media Received (Any)</option>
                    <option value="image_received">Image Received</option>
                    <option value="video_received">Video Received</option>
                    <option value="document_received">Document Received</option>
                    <option value="voice_received">Voice Received</option>
                    <option value="location_received">Location Received</option>
                    <option value="contact_shared">Contact Shared</option>
                    <option value="reaction">Reaction Received</option>
                    <option value="template_reply">Template Reply</option>
                    <option disabled>--- System & API Triggers ---</option>
                    <option value="api_webhook">API Webhook</option>
                    <option value="crm_event">CRM Event</option>
                    <option value="order_created">Order Created</option>
                    <option value="payment_success">Payment Success</option>
                    <option value="schedule">Schedule (One-time)</option>
                    <option value="recurring">Recurring</option>
                    <option value="manual_trigger">Manual Trigger</option>
                    <option disabled>--- Special Behaviors ---</option>
                    <option value="welcome_message">Welcome Message (New Contact)</option>
                    <option value="away_message">Away Message (Outside Business Hours)</option>
                    <option value="fallback">Default Fallback (Unrecognized text)</option>
                  </select>
                </div>

                {!['fallback', 'welcome_message', 'away_message', 'media_any', 'image_received', 'video_received', 'document_received', 'voice_received', 'location_received', 'contact_shared', 'reaction', 'api_webhook', 'crm_event', 'order_created', 'payment_success', 'schedule', 'recurring', 'manual_trigger'].includes(localData.triggerType) && (
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      name="keyword"
                      value={localData.keyword || ''}
                      onChange={handleLocalChange}
                      onBlur={handleBlur}
                      style={{ ...inputStyle, background: 'white' }}
                      placeholder="hello"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Node Specific */}
        {type === 'messageNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Message Type</label>
              <select name="messageType" value={localData.messageType || 'text'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
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

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Message <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'normal', marginLeft: '4px' }}>({(localData.text || '').length}/1024)</span></label>
                <button onClick={() => { const newText = (localData.text || '') + '{{contact.name}}'; if (newText.length <= 1024) { setLocalData(prev => ({ ...prev, text: newText })); updateNodeData(id, { text: newText }); } }} style={{ background: '#F3F4F6', border: 'none', color: '#4B5563', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Variable size={12} /> Insert { }
                </button>
              </div>
              <textarea name="text" value={localData.text || ''} onChange={(e) => { if (e.target.value.length <= 1024) { handleLocalChange(e); } }} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Write a message..." />
            </div>

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
                      <input type="text" value={btn.title || ''} onChange={(e) => { if (e.target.value.length <= 20) { handleButtonLocalChange(idx, 'title', e.target.value); } }} onBlur={handleButtonBlur} style={{ ...inputStyle, background: 'white' }} placeholder="Title" />
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
          </>
        )}

        {/* Menu Node Specific */}
        {type === 'menuNode' && (
          <>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Message <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'normal', marginLeft: '4px' }}>({(localData.text || '').length}/1024)</span></label>
              </div>
              <textarea name="text" value={localData.text || ''} onChange={(e) => { if (e.target.value.length <= 1024) { handleLocalChange(e); } }} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Write a message..." />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Menu Button Text</label>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{(localData.menuButtonText || '').length}/20</span>
              </div>
              <input type="text" name="menuButtonText" value={localData.menuButtonText || ''} onChange={(e) => { if (e.target.value.length <= 20) handleLocalChange(e); }} onBlur={handleBlur} style={inputStyle} placeholder="e.g. View Menu" />
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
                      </div>
                    ))}
                    <button onClick={() => addRow(secIdx)} style={{ background: 'transparent', color: '#10B981', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      + Add Row
                    </button>
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
          </>
        )}

        {/* Input Node Specific */}
        {type === 'inputNode' && (
          <>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Question to Ask <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'normal', marginLeft: '4px' }}>({(localData.text || '').length}/1024)</span></label>
                <button onClick={() => { const newText = (localData.text || '') + '{{contact.name}}'; if (newText.length <= 1024) { setLocalData(prev => ({ ...prev, text: newText })); updateNodeData(id, { text: newText }); } }} style={{ background: '#F3F4F6', border: 'none', color: '#4B5563', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Variable size={12} /> Insert { }
                </button>
              </div>
              <textarea name="text" value={localData.text || ''} onChange={(e) => { if (e.target.value.length <= 1024) { handleLocalChange(e); } }} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="E.g., What is your email address?" />
            </div>

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
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '8px 0 0 0' }}>
                The user's response will be saved to this variable for future use.
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
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Caption</label>
                <textarea name="text" value={localData.text || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Add a caption..." />
              </div>
            )}
          </>
        )}

        {type === 'carouselNode' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Cards</label>
            </div>
            {(localData.cards || []).map((card, idx) => (
              <div key={idx} style={{ background: '#fdf2f8', padding: '12px', borderRadius: '8px', border: '1px solid #fbcfe8', marginBottom: '12px' }}>
                <input type="text" value={card.title || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], title: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={{ ...inputStyle, marginBottom: '8px' }} placeholder="Card Title" />
                
                <input type="text" value={card.description || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], description: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={{ ...inputStyle, marginBottom: '8px' }} placeholder="Description" />
                
                <input type="text" value={card.mediaUrl || ''} onChange={(e) => {
                  const newCards = [...(localData.cards || [])];
                  newCards[idx] = { ...newCards[idx], mediaUrl: e.target.value };
                  setLocalData(prev => ({ ...prev, cards: newCards }));
                }} onBlur={() => updateNodeData(id, { cards: localData.cards })} style={inputStyle} placeholder="Image URL" />
              </div>
            ))}
            <button onClick={() => {
              const newCards = [...(localData.cards || []), { id: `card_${Date.now()}`, title: '', description: '', mediaUrl: '' }];
              setLocalData(prev => ({ ...prev, cards: newCards }));
              updateNodeData(id, { cards: newCards });
            }} style={{ background: 'transparent', color: '#ec4899', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              + Add Card
            </button>
          </div>
        )}

        {type === 'catalogNode' && (
          <>
            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>Catalog Settings</label>
              <p style={{ fontSize: '12px', color: '#b45309', marginBottom: '16px' }}>
                {localData.catalogType === 'multi_product' 
                  ? 'Connect this to your WhatsApp Commerce Catalog to display multiple items.' 
                  : 'Select a single specific product from your WhatsApp Catalog.'}
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>Catalog ID (Optional)</label>
                <input type="text" name="catalogId" value={localData.catalogId || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, borderColor: '#fcd34d' }} placeholder="Enter Catalog ID" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Accompanying Text</label>
              <textarea name="text" value={localData.text || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Write a message to go with your products..." />
            </div>
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
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={opt.text || ''} onChange={(e) => {
                    const newOpts = [...(localData.options || [])];
                    newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                    setLocalData(prev => ({ ...prev, options: newOpts }));
                  }} onBlur={() => updateNodeData(id, { options: localData.options })} style={{ ...inputStyle }} placeholder={`Option ${idx + 1}`} />
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
            {localData.commerceType === 'payment' && (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Currency</label>
                    <input type="text" name="currency" value={localData.currency || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="USD" />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Amount</label>
                    <input type="number" name="amount" value={localData.amount || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="0.00" />
                  </div>
                </div>
              </>
            )}
            {localData.commerceType === 'coupon' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Coupon Code</label>
                <input type="text" name="couponCode" value={localData.couponCode || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. PROMO2026" />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Message Text</label>
              <textarea name="text" value={localData.text || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Add details..." />
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
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Contact Name</label>
                  <input type="text" name="contactName" value={localData.contactName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Sales Team" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Phone Number</label>
                  <input type="text" name="contactPhone" value={localData.contactPhone || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="+1 234 567 8900" />
                </div>
              </>
            )}
            {localData.utilityType === 'calendar' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Event Name</label>
                  <input type="text" name="eventName" value={localData.eventName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Consultation" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Time</label>
                  <input type="text" name="eventTime" value={localData.eventTime || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. Tomorrow at 3PM" />
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

        {type === 'templateNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Template Name</label>
              <input type="text" name="templateName" value={localData.templateName || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. welcome_msg" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Language Code</label>
              <input type="text" name="templateLanguage" value={localData.templateLanguage || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. en_US" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Variables</label>
              </div>
              {(localData.variables || []).map((v, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>{`{{${idx+1}}}`}</div>
                  <input type="text" value={v.value || ''} onChange={(e) => {
                    const newVars = [...(localData.variables || [])];
                    newVars[idx] = { ...newVars[idx], value: e.target.value };
                    setLocalData(prev => ({ ...prev, variables: newVars }));
                  }} onBlur={() => updateNodeData(id, { variables: localData.variables })} style={{ ...inputStyle }} placeholder="Variable Value" />
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

            <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827' }}>Template Buttons</label>
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>Define the buttons that exist in this template to branch from them.</p>
              
              {(localData.buttons || []).map((btn, idx) => (
                <div key={btn.id || idx} style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '12px', position: 'relative' }}>
                  <button 
                    onClick={() => {
                      const newBtns = localData.buttons.filter((_, i) => i !== idx);
                      setLocalData(prev => ({ ...prev, buttons: newBtns }));
                      updateNodeData(id, { buttons: newBtns });
                    }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Payload ID</label>
                    <input type="text" value={btn.id || ''} onChange={(e) => {
                      const newBtns = [...localData.buttons];
                      newBtns[idx] = { ...newBtns[idx], id: e.target.value };
                      setLocalData(prev => ({ ...prev, buttons: newBtns }));
                    }} onBlur={() => updateNodeData(id, { buttons: localData.buttons })} style={{ ...inputStyle, background: 'white' }} placeholder="Button ID/Payload" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Button Title</label>
                    <input type="text" value={btn.title || ''} onChange={(e) => {
                      const newBtns = [...localData.buttons];
                      newBtns[idx] = { ...newBtns[idx], title: e.target.value };
                      setLocalData(prev => ({ ...prev, buttons: newBtns }));
                    }} onBlur={() => updateNodeData(id, { buttons: localData.buttons })} style={{ ...inputStyle, background: 'white' }} placeholder="Title" />
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const newBtns = [...(localData.buttons || []), { id: `btn_${Date.now()}`, title: 'New Button', type: 'reply' }];
                setLocalData(prev => ({ ...prev, buttons: newBtns }));
                updateNodeData(id, { buttons: newBtns });
              }} style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                + Add Button
              </button>
            </div>
          </>
        )}

        {type === 'reactionNode' && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Emoji</label>
            <input type="text" name="emoji" value={localData.emoji || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, fontSize: '24px', padding: '12px', textAlign: 'center' }} placeholder="👍" maxLength="2" />
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Enter a single emoji character.</p>
          </div>
        )}

        {type === 'conditionNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Variable Name</label>
              <input type="text" name="variable" value={localData.variable || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. contact.name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Operator</label>
              <select name="operator" value={localData.operator || 'equals'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="not_empty">Is Not Empty</option>
              </select>
            </div>
            {localData.operator !== 'not_empty' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Value</label>
                <input type="text" name="value" value={localData.value || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. VIP" />
              </div>
            )}
          </>
        )}

        {type === 'apiNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Method</label>
              <select name="method" value={localData.method || 'POST'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Endpoint URL</label>
              <input type="text" name="url" value={localData.url || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="https://api.yoursystem.com/webhook" />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Supports variables: {'{{contact.phone}}'}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Headers (JSON)</label>
              <textarea name="headers" value={localData.headers || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '60px', fontFamily: 'monospace', fontSize: '12px' }} placeholder='{"Authorization": "Bearer token"}' />
            </div>
            {['POST', 'PUT'].includes(localData.method || 'POST') && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Body (JSON)</label>
                <textarea name="body" value={localData.body || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '100px', fontFamily: 'monospace', fontSize: '12px' }} placeholder='{"phone": "{{contact.phone}}"}' />
              </div>
            )}
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
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>System Prompt</label>
              <textarea name="systemPrompt" value={localData.systemPrompt || ''} onChange={handleLocalChange} onBlur={handleBlur} style={{ ...inputStyle, minHeight: '120px' }} placeholder="You are a helpful assistant..." />
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Supports variables: {'{{contact.name}}'}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Save Response to Variable (Optional)</label>
              <input type="text" name="saveVariable" value={localData.saveVariable || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. ai_summary" />
            </div>
          </>
        )}

        {type === 'actionNode' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Action Type</label>
              <select name="actionType" value={localData.actionType || 'update_contact'} onChange={(e) => { handleLocalChange(e); handleBlur(e); }} style={inputStyle}>
                <option value="opt_in">Marketing Opt-in</option>
                <option value="opt_out">Marketing Opt-out</option>
                <option value="update_contact">Update Field</option>
                <option value="assign_team">Assign to Team Member</option>
                <option value="human_handoff">General Human Handoff</option>
                <option value="round_robin_assign">Round-Robin Agent Handoff</option>
                <option value="unassign_team">Unassign Team Member</option>
              </select>
            </div>
            {localData.actionType === 'update_contact' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Field to Update</label>
                  <input type="text" name="updateField" value={localData.updateField || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. status" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>New Value</label>
                  <input type="text" name="updateValue" value={localData.updateValue || ''} onChange={handleLocalChange} onBlur={handleBlur} style={inputStyle} placeholder="e.g. qualified_lead" />
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

      </div>
    </div>
  );
}
