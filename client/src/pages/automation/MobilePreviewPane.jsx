import React from 'react';
import useCanvasStore from '../../store/useCanvasStore';
import { 
  Smartphone, Image as ImageIcon, FileText, Video, Play, Mic, 
  MapPin, Building, Calendar, 
  CreditCard, Receipt, ShoppingBag, ShoppingCart, 
  Sparkles, Clock, Globe, Split, ArrowRight, ShieldCheck
} from 'lucide-react';
import { formatWhatsAppMarkdown } from '../../utils/markdownParser';

export default function MobilePreviewPane() {
  const { nodes } = useCanvasStore();
  const selectedNode = nodes.find(n => n.selected);

  if (!selectedNode) {
    return (
      <div className="preview-pane" style={{
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
        <Smartphone size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
        <p>Select a node to preview</p>
      </div>
    );
  }

  const { type, data } = selectedNode;

  const renderMediaHeader = (headerType, mediaUrl) => {
    if (['image', 'sticker', 'gif'].includes(headerType)) {
      return (
        <div style={{ width: '100%', height: '140px', background: '#E5E7EB', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          {mediaUrl ? (
            <img src={mediaUrl} alt="Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={32} color="#9CA3AF" />
          )}
        </div>
      );
    } else if (headerType === 'video') {
      return (
        <div style={{ width: '100%', height: '140px', background: '#111827', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', position: 'relative' }}>
          {mediaUrl ? (
            <video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Video size={32} color="#4B5563" />
          )}
          <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px' }}>
            <Play size={24} color="white" fill="white" />
          </div>
        </div>
      );
    } else if (headerType === 'document' || headerType === 'doc') {
      return (
        <div style={{ width: '100%', padding: '12px', background: '#F3F4F6', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', background: '#EF4444', borderRadius: '6px', flexShrink: 0 }}>
            <FileText size={20} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {mediaUrl ? mediaUrl.split('/').pop() : 'document.pdf'}
            </span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              {mediaUrl ? mediaUrl.split('.').pop().toUpperCase() : 'PDF'} • {data.mediaSize || '1.2 MB'}
            </span>
          </div>
        </div>
      );
    } else if (headerType === 'audio' || headerType === 'voice') {
      return (
        <div style={{ width: '220px', display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', marginBottom: '4px' }}>
          <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} color="white" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px' }}>
            <div style={{ position: 'relative', width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '30%', background: '#3B82F6', borderRadius: '2px' }} />
              <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#3B82F6', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>{data.mediaDuration || '0:00'}</span>
            </div>
          </div>
        </div>
      );
    } else if (headerType === 'text') {
      return (
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          {data.headline || 'Headline text'}
        </div>
      );
    }
    return null;
  };

  const renderButtons = (buttons) => {
    if (!buttons || buttons.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E5E7EB', borderRadius: '0 0 8px 8px', overflow: 'hidden', marginTop: '6px' }}>
        {buttons.map((btn, idx) => (
          <div key={idx} style={{ padding: '10px', background: 'white', textAlign: 'center', color: '#0284c7', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {btn.title || btn.text || `Option ${idx + 1}`}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="preview-pane" style={{
      borderLeft: '1px solid #E5E7EB',
      background: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px', background: 'white', flexShrink: 0 }}>
        <div style={{ background: '#FCE7F3', color: '#DB2777', padding: '7px', borderRadius: '8px' }}>
          <Smartphone size={18} />
        </div>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>Live Preview</h2>
      </div>

      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F3F4F6', minHeight: 0, overflow: 'hidden' }}>
        {/* iPhone Mockup Frame */}
        <div style={{
          width: '100%',
          maxWidth: '280px',
          height: 'min(570px, calc(100vh - 145px))',
          minHeight: '430px',
          maxHeight: '100%',
          background: '#E5DDD5', // WhatsApp background color
          borderRadius: '36px',
          border: '7px solid #111827',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Dynamic Island / Notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '90px', height: '20px', background: '#111827', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', zIndex: 10 }}></div>
          
          {/* WhatsApp Header Mock */}
          <div style={{ height: '58px', background: '#075E54', width: '100%', display: 'flex', alignItems: 'flex-end', padding: '8px 12px', color: 'white', fontSize: '14px', fontWeight: '600', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', minWidth: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                MB
              </div>
              <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(() => {
                try {
                  const u = JSON.parse(localStorage.getItem('user'));
                  return u?.tenantName || u?.businessName || 'MessBee Bot';
                } catch(e) {
                  return 'MessBee Bot';
                }
              })()}</span>
            </div>
          </div>

          {/* Chat Container */}
          <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0, gap: '8px' }}>
            
            {/* 1. TRIGGER NODE */}
            {type === 'triggerNode' && (
              <div style={{ alignSelf: 'flex-end', background: '#DCF8C6', padding: '8px 12px', borderRadius: '8px 8px 0 8px', maxWidth: '85%', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <span>{data.keyword || 'hello'}</span>
                <div style={{ fontSize: '10px', color: '#6B7280', textAlign: 'right', marginTop: '2px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {/* 2. REACTION NODE */}
            {type === 'reactionNode' && (
              <div style={{ alignSelf: 'flex-end', position: 'relative', background: '#DCF8C6', padding: '8px 12px', borderRadius: '8px 8px 0 8px', maxWidth: '85%', fontSize: '14px', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: '8px' }}>
                Customer message
                <div style={{ position: 'absolute', bottom: '-10px', right: '12px', background: 'white', borderRadius: '14px', padding: '2px 6px', fontSize: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: '1px solid #E5E7EB', zIndex: 10 }}>
                  {data.emoji || '👍'}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', textAlign: 'right', marginTop: '4px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {/* 3. POLL NODE */}
            {type === 'pollNode' && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '90%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', lineHeight: '1.3' }}>
                    📊 {data.text || 'Choose an option:'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(data.options && data.options.length > 0 ? data.options : [{ text: 'Option 1' }, { text: 'Option 2' }]).map((opt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: data.allowMultipleAnswers ? '3px' : '50%', border: '2px solid #0EA5E9', flexShrink: 0 }}></div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.text || `Option ${i + 1}`}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '10px', color: '#94A3B8' }}>
                    <span>{data.allowMultipleAnswers ? 'Select one or more' : 'Select one'}</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CAROUSEL NODE */}
            {type === 'carouselNode' && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '100%', width: '100%' }}>
                {data.text && (
                  <div style={{ background: 'white', borderRadius: '8px 8px 8px 0', padding: '8px 10px', fontSize: '13px', color: '#111827', marginBottom: '6px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    {data.text}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {(data.cards && data.cards.length > 0 ? data.cards : [{ title: 'Card 1', buttonText: 'Select' }, { title: 'Card 2', buttonText: 'Select' }]).map((card, i) => (
                    <div key={i} style={{ minWidth: '150px', maxWidth: '150px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      {card.mediaUrl ? (
                        <img src={card.mediaUrl} alt="" style={{ width: '100%', height: '75px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '65px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={22} color="#94A3B8" />
                        </div>
                      )}
                      <div style={{ padding: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {card.title || `Item ${i + 1}`}
                        </div>
                        {card.description && (
                          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', lineHeight: '1.2' }}>
                            {card.description}
                          </div>
                        )}
                        <div style={{ width: '100%', padding: '6px 0', background: '#FDF2F8', color: '#DB2777', border: '1px solid #FBCFE8', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>
                          {card.buttonText || 'Select'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CATALOG NODE */}
            {type === 'catalogNode' && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '90px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                  <ShoppingBag size={28} color="#D97706" />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', textTransform: 'uppercase' }}>
                    {data.catalogType === 'multi_product' ? 'Product Collection' : data.catalogType === 'single_product' ? 'Product Highlight' : 'Store Catalog'}
                  </span>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#1F2937', marginBottom: '8px', lineHeight: '1.3' }}>
                    {data.text || 'Explore our full collection directly in WhatsApp!'}
                  </div>
                  {data.footer && (
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px' }}>{data.footer}</div>
                  )}
                  <div style={{ padding: '8px', background: '#D97706', color: 'white', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ShoppingCart size={14} />
                    {data.catalogType === 'single_product' ? 'View Item' : 'View Catalog'}
                  </div>
                </div>
              </div>
            )}

            {/* 6. COMMERCE NODE */}
            {type === 'commerceNode' && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '88%', width: '240px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* 6A. Payment */}
                {data.commerceType === 'payment' && (
                  <div>
                    <div style={{ background: '#ECFDF5', padding: '10px', borderBottom: '1px solid #A7F3D0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Request</span>
                        <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          {data.paymentGateway ? data.paymentGateway.toUpperCase() : 'RAZORPAY'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#064E3B' }}>{data.itemName || 'Order Payment'}</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                        {data.currency === 'USD' ? '$' : data.currency === 'AED' ? 'AED ' : data.currency === 'EUR' ? '€' : '₹'}
                        {data.amount || '499.00'}
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      {data.text && <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '8px' }}>{data.text}</div>}
                      <div style={{ padding: '9px', background: '#059669', color: 'white', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <CreditCard size={14} /> Review & Pay
                      </div>
                    </div>
                  </div>
                )}

                {/* 6B. Coupon */}
                {data.commerceType === 'coupon' && (
                  <div style={{ padding: '10px' }}>
                    <div style={{ border: '2px dashed #10B981', borderRadius: '8px', padding: '10px', background: '#F0FDF4', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#047857', textTransform: 'uppercase' }}>Exclusive Discount</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#065F46', margin: '4px 0', letterSpacing: '0.08em' }}>
                        🎟️ {data.couponCode || 'FESTIVE25'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                        {data.discountText || 'Flat 25% OFF'}
                      </div>
                      {data.validUntil && (
                        <div style={{ fontSize: '10px', color: '#6EE7B7', marginTop: '4px' }}>
                          ⏱️ {data.validUntil}
                        </div>
                      )}
                    </div>
                    {data.text && (
                      <div style={{ fontSize: '12px', color: '#374151', marginTop: '8px' }}>{data.text}</div>
                    )}
                  </div>
                )}

                {/* 6C. OTP */}
                {data.commerceType === 'otp' && (
                  <div style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', marginBottom: '8px' }}>
                      <ShieldCheck size={18} color="#10B981" />
                      <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Verification Code</span>
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '0.25em', color: '#0F172A', fontFamily: 'monospace' }}>
                        {data.otpCode || '482910'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                        Expires in {data.otpExpiry || 10} minutes
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontStyle: 'italic' }}>
                      Do not share this code with anyone.
                    </div>
                  </div>
                )}

                {/* 6D. Invoice */}
                {data.commerceType === 'invoice' && (
                  <div>
                    <div style={{ background: '#F1F5F9', padding: '10px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Receipt size={16} color="#475569" />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>{data.invoiceNumber || 'INV-2026-001'}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>₹{data.amount || '1,499.00'}</span>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      {data.invoiceDate && <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>Date: {data.invoiceDate}</div>}
                      {data.text && <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px' }}>{data.text}</div>}
                      <div style={{ padding: '8px', background: '#3B82F6', color: 'white', borderRadius: '6px', textAlign: 'center', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FileText size={14} /> Download Invoice PDF
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. UTILITY NODE */}
            {type === 'utilityNode' && (
              <>
                {/* 7A. Location */}
                {data.utilityType === 'location' && (
                  <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100px', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={28} color="#EF4444" />
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {data.locationName || 'Our Location'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {data.locationAddress || 'Address will show on Google Maps'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7B. Contact Card */}
                {data.utilityType === 'contact' && (
                  <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', flexShrink: 0 }}>
                        {(data.contactName ? data.contactName.charAt(0) : 'C').toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {data.contactName || 'Sales Support'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {data.contactPhone || '+91 9876543210'}
                        </div>
                      </div>
                    </div>
                    {data.contactCompany && (
                      <div style={{ padding: '0 10px 6px', fontSize: '11px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} color="#9CA3AF" /> {data.contactCompany}
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #E5E7EB', display: 'flex' }}>
                      <div style={{ flex: 1, padding: '8px', textAlign: 'center', color: '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Message
                      </div>
                    </div>
                  </div>
                )}

                {/* 7C. Calendar Invite */}
                {data.utilityType === 'calendar' && (
                  <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ background: '#EEF2FF', padding: '10px', borderBottom: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="#4F46E5" />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#312E81' }}>{data.eventName || 'Meeting Invitation'}</div>
                        <div style={{ fontSize: '10px', color: '#4338CA' }}>{data.eventDate || 'Scheduled Date'} • {data.eventTime || '10:00 AM'}</div>
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      {data.eventDescription && <div style={{ fontSize: '11px', color: '#4B5563', marginBottom: '8px' }}>{data.eventDescription}</div>}
                      <div style={{ padding: '7px', background: '#4F46E5', color: 'white', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: '600' }}>
                        📅 Add to Calendar
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 8. INPUT NODE */}
            {type === 'inputNode' && (
              <>
                <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', padding: '8px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '13px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {data.text || 'Please enter your response:'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'right', marginTop: '4px' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {/* Simulated Customer Input Expected */}
                <div style={{ alignSelf: 'flex-end', background: '#DCF8C6', opacity: 0.85, padding: '6px 10px', borderRadius: '8px 8px 0 8px', maxWidth: '80%', fontSize: '11px', color: '#166534', border: '1px dashed #86EFAC' }}>
                  <span>Waiting for {data.validationType || 'text'}</span>
                  <div style={{ fontSize: '9px', color: '#15803D', marginTop: '2px', fontFamily: 'monospace' }}>
                    Saved to: {data.variableName || 'contact.value'}
                  </div>
                </div>
              </>
            )}

            {/* 9. AI NODE */}
            {type === 'aiNode' && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', width: '230px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ background: '#F5F3FF', padding: '6px 10px', borderBottom: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#7C3AED" />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#5B21B6' }}>
                    {data.model ? data.model.toUpperCase() : 'AI ASSISTANT'}
                  </span>
                </div>
                <div style={{ padding: '8px 10px', fontSize: '12px', color: '#334155', fontStyle: 'italic' }}>
                  "{data.systemPrompt ? (data.systemPrompt.length > 70 ? data.systemPrompt.substring(0, 70) + '...' : data.systemPrompt) : 'Dynamically analyzes conversation context & generates intelligent response.'}"
                </div>
              </div>
            )}

            {/* 10. SYSTEM & LOGIC NODES */}
            {['delayNode', 'conditionNode', 'apiNode', 'shopifyNode', 'actionNode', 'randomizerNode', 'waitForEventNode'].includes(type) && (
              <div style={{ alignSelf: 'center', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '4px 12px', fontSize: '10px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                {type === 'delayNode' && <><Clock size={12} color="#0284C7" /> Delay: {data.delayAmount || 1} {data.delayUnit || 'Minutes'}</>}
                {type === 'conditionNode' && <><Split size={12} color="#64748B" /> Branch: {data.variable || 'var'} {data.operator || 'equals'} {data.value || ''}</>}
                {type === 'apiNode' && <><Globe size={12} color="#3B82F6" /> API: {data.method || 'POST'} {data.url ? data.url.substring(0, 20) : 'Webhook'}</>}
                {type === 'shopifyNode' && <><ShoppingBag size={12} color="#95BF47" /> Shopify: {data.shopifyAction || 'Action'}</>}
                {type === 'actionNode' && <><ArrowRight size={12} color="#10B981" /> Action: {(data.actionType || 'Update').replace(/_/g, ' ')}</>}
                {type === 'randomizerNode' && <>🎲 Split: {data.splitPercentage || 50}% / {100 - (data.splitPercentage || 50)}%</>}
                {type === 'waitForEventNode' && <><Clock size={12} color="#6366F1" /> Wait Event: {(data.eventType || 'message').replace(/_/g, ' ')}</>}
              </div>
            )}

            {/* 11. STANDARD OUTGOING MESSAGES (template, media, interactive, menu, text) */}
            {['messageNode', 'mediaNode', 'templateNode', 'menuNode'].includes(type) && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '8px 8px 8px 0', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '8px 12px' }}>
                  {(data.messageType === 'interactive' || type === 'templateNode') && renderMediaHeader(data.headerType, data.mediaUrl)}
                  {type === 'mediaNode' && renderMediaHeader(data.messageType, data.mediaUrl)}
                  
                  {((type === 'mediaNode' && ['image', 'video', 'doc', 'document', 'gif'].includes(data.messageType) && data.text) || (type !== 'mediaNode')) && (
                    <div 
                      style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}
                      dangerouslySetInnerHTML={{
                        __html: formatWhatsAppMarkdown((() => {
                          let txt = data.text || (type === 'mediaNode' ? '' : 'Message text here...');
                          if (type === 'templateNode' && txt) {
                            let userName = 'Aayush Kumar';
                            try {
                              const u = JSON.parse(localStorage.getItem('user'));
                              userName = u?.name || u?.tenantName || 'Aayush Kumar';
                            } catch (_) {}
                            if (data.variables && Array.isArray(data.variables)) {
                              data.variables.forEach((v, idx) => {
                                let val = v?.value || '';
                                if (val.includes('contact.name') || val.includes('name')) {
                                  val = userName;
                                }
                                txt = txt.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val || userName);
                              });
                            }
                            txt = txt.replace(/\{\{1\}\}/g, userName);
                          }
                          return txt;
                        })())
                      }}
                    />
                  )}

                  {data.footer && (
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                      {data.footer}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'right', marginTop: '4px' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Interactive Buttons */}
                {(data.messageType === 'interactive' || type === 'templateNode') && renderButtons(data.buttons)}

                {/* Menu Buttons */}
                {(type === 'menuNode' || data.messageType === 'menu') && (
                  <div style={{ padding: '10px', borderTop: '1px solid #E5E7EB', textAlign: 'center', color: '#0284c7', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    ☰ {data.menuButtonText || 'View Options'}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* WhatsApp Footer Mock */}
          <div style={{ height: '48px', background: '#F0F0F0', width: '100%', display: 'flex', alignItems: 'center', padding: '0 10px', flexShrink: 0 }}>
            <div style={{ flex: 1, height: '34px', background: 'white', borderRadius: '17px', padding: '0 12px', display: 'flex', alignItems: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              Type a message
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
