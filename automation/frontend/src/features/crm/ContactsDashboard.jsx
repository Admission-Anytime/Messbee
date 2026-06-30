import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Search, Filter, Plus, Users, UserPlus, MoreVertical, 
  MessageCircle, Trash2, Edit3, Shield, Mail, Phone,
  ChevronLeft, ChevronRight, Activity, Clock
} from 'lucide-react';

export default function ContactsDashboard() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      setActiveDropdownId(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete contact. Check server logs.');
    }
  };

  // Filter and Search logic
  const filteredContacts = contacts.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage) || 1;

  const getInitials = (name) => {
    if (!name || name === 'Unknown') return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPTED_IN': return { bg: '#ECFDF5', text: '#10B981', dot: '#10B981', label: 'Opted In' };
      case 'OPTED_OUT': return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444', label: 'Opted Out' };
      default: return { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Pending' };
    }
  };

  const getActiveLast24h = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return contacts.filter(c => c.lastInteractionAt && new Date(c.lastInteractionAt) > oneDayAgo).length.toString();
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Contacts & CRM</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage your WhatsApp audience and customer data.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ 
            background: 'white', color: '#374151', border: '1px solid #E5E7EB', 
            padding: '10px 16px', borderRadius: '8px', fontSize: '13px', 
            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Filter size={16} /> Filters
          </button>
          <button style={{ 
            background: '#10B981', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', fontSize: '13px', 
            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'background 0.2s'
          }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
          >
            <UserPlus size={16} /> Import Contacts
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <MetricCard title="Total Contacts" value={contacts.length.toString()} icon={<Users size={18} color="#3B82F6" />} />
        <MetricCard title="Opted In" value={contacts.filter(c => c.optInStatus === 'OPTED_IN').length.toString()} icon={<Shield size={18} color="#10B981" />} />
        <MetricCard title="Opted Out" value={contacts.filter(c => c.optInStatus === 'OPTED_OUT').length.toString()} icon={<Shield size={18} color="#EF4444" />} />
        <MetricCard title="Active Last 24h" value={getActiveLast24h()} icon={<Activity size={18} color="#F59E0B" />} />
      </div>

      {/* Main Table Card */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, phone, or tag..." 
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
            Showing {filteredContacts.length} contacts
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>CONTACT</th>
              <th style={thStyle}>PHONE NUMBER</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>TAGS</th>
              <th style={thStyle}>LAST ACTIVE</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>Loading contacts...</td></tr>
            ) : currentContacts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '64px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#F3F4F6', padding: '16px', borderRadius: '50%' }}><Users size={32} color="#9CA3AF" /></div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>No contacts found</h3>
                    <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Import contacts or wait for inbound messages to see them here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentContacts.map(contact => {
                const statusInfo = getStatusColor(contact.optInStatus);
                return (
                  <tr key={contact._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}
                  >
                    {/* Contact Info */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' }}>
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{contact.name || 'Unknown'}</div>
                          {contact.customFields?.email && (
                            <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Mail size={10} /> {contact.customFields.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Phone */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
                        <Phone size={12} color="#9CA3AF" /> {contact.phone}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusInfo.bg, color: statusInfo.text, padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.dot }} />
                        {statusInfo.label}
                      </div>
                    </td>

                    {/* Tags */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(!contact.tags || contact.tags.length === 0) && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>—</span>
                        )}
                        {contact.tags?.slice(0, 2).map((tag, i) => (
                          <span key={i} style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px' }}>
                            {tag}
                          </span>
                        ))}
                        {contact.tags?.length > 2 && (
                          <span style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px' }}>
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
                        <Clock size={12} />
                        {new Date(contact.lastInteractionAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button style={actionBtnStyle} title="Start Chat">
                          <MessageCircle size={15} color="#10B981" />
                        </button>
                        <button 
                          onClick={() => setActiveDropdownId(activeDropdownId === contact._id ? null : contact._id)}
                          style={actionBtnStyle}
                        >
                          <MoreVertical size={15} color="#6B7280" />
                        </button>
                      </div>

                      {/* Dropdown */}
                      {activeDropdownId === contact._id && (
                        <div style={{
                          position: 'absolute', right: '24px', top: '48px', background: 'white',
                          border: '1px solid #E5E7EB', borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, minWidth: '140px'
                        }}>
                          <button style={dropdownBtnStyle}><Edit3 size={13} /> Edit Contact</button>
                          <button onClick={() => handleDelete(contact._id)} style={{ ...dropdownBtnStyle, color: '#EF4444', borderTop: '1px solid #F3F4F6' }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {filteredContacts.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Showing {indexOfFirstContact + 1} to {Math.min(indexOfLastContact, filteredContacts.length)} of {filteredContacts.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ ...pageBtnStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ ...pageBtnStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components & Styles
const MetricCard = ({ title, value, icon }) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '10px' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  </div>
);

const thStyle = { padding: '14px 24px', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const actionBtnStyle = { background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const dropdownBtnStyle = { background: 'white', border: 'none', padding: '10px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' };
const pageBtnStyle = { background: 'white', border: '1px solid #E5E7EB', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' };
