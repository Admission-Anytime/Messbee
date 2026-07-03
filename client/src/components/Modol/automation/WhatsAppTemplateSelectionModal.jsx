import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, MessageSquare, LayoutTemplate } from 'lucide-react';
import api from '../../../context/axios';

export default function WhatsAppTemplateSelectionModal({ onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/whatsapp/templates');
        // Filter only approved templates if needed, or show all
        const approvedTemplates = (response.data.data || []).filter(t => t.status === 'APPROVED');
        setTemplates(approvedTemplates);
      } catch (err) {
        setError('Failed to fetch templates. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => 
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '600px', height: '80vh', maxHeight: '600px',
        borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', borderBottom: '1px solid #E5E7EB', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#ECFDF5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutTemplate size={20} color="#10B981" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>Select a Template</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Choose an approved WhatsApp template to start your flow.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ 
            background: '#F3F4F6', border: 'none', color: '#6B7280', cursor: 'pointer', 
            width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
            onMouseOver={e => e.currentTarget.style.background = '#E5E7EB'}
            onMouseOut={e => e.currentTarget.style.background = '#F3F4F6'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search templates by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #D1D5DB', borderRadius: '8px',
                fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F3F4F6' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <Loader2 size={32} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>Loading your templates...</span>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#EF4444', padding: '40px 0' }}>{error}</div>
          ) : filteredTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>
              <MessageSquare size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No templates found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchQuery ? 'Try adjusting your search query.' : 'You have no approved WhatsApp templates yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {filteredTemplates.map(template => (
                <div
                  key={template._id || template.id || template.name}
                  onClick={() => onSelect(template)}
                  style={{
                    background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#10B981';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ background: '#ECFDF5', color: '#059669', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {template.category || 'MARKETING'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>{template.language || 'en'}</div>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#111827', wordBreak: 'break-word' }}>
                    {template.name}
                  </h3>
                  
                  {/* Variables Preview if any */}
                  {template.components && template.components.some(c => c.example) && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #E5E7EB', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', width: '100%' }}>Requires variables:</span>
                      <div style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                        {'{{...}}'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
