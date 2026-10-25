import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Copy, Check, Phone, ShieldCheck, Zap, Users, Star, 
  LayoutGrid
} from 'lucide-react';
import { showToast } from '../../utils/showToast';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'IN +91' },
  { code: '+1', country: 'US', label: 'US +1' },
  { code: '+44', country: 'GB', label: 'GB +44' },
  { code: '+971', country: 'AE', label: 'AE +971' },
  { code: '+966', country: 'SA', label: 'SA +966' },
  { code: '+61', country: 'AU', label: 'AU +61' },
  { code: '+65', country: 'SG', label: 'SG +65' },
  { code: '+49', country: 'DE', label: 'DE +49' },
  { code: '+33', country: 'FR', label: 'FR +33' }
];

export default function StandeeQrGenerator({ 
  localData, 
  updateNodeData, 
  id, 
  channelPhone = ''
}) {
  // Extract or initialize form state - ZERO HARDCODED DEFAULT TEXT
  const [businessName, setBusinessName] = useState(localData.businessName || '');
  const [businessTagline, setBusinessTagline] = useState(localData.businessTagline || '');
  const [businessLogo, setBusinessLogo] = useState(localData.businessLogo || '');
  const [logoFileName, setLogoFileName] = useState(localData.logoFileName || '');
  
  // Clean phone parsing - ZERO HARDCODED DEFAULT PHONE
  const initialRawPhone = (localData.qrPhoneNumber || localData.qrPhone || channelPhone || '').replace(/\D/g, '');
  const defaultCountryCode = localData.qrCountryCode || '+91';
  const defaultNumberOnly = localData.qrPhoneNumber || (initialRawPhone.startsWith('91') && initialRawPhone.length > 10 
    ? initialRawPhone.slice(2) 
    : initialRawPhone) || '';

  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(defaultNumberOnly);
  const [prefilledMessage, setPrefilledMessage] = useState(localData.keyword || '');
  
  // Generation & Action UI states - starts false (Screenshot 2 state) unless already generated
  const [isGenerated, setIsGenerated] = useState(!!localData.qrIsGenerated);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef(null);

  // Computed Full Clean Phone & WhatsApp Link
  const fullCleanPhone = `${countryCode.replace(/\D/g, '')}${phoneNumber.replace(/\D/g, '')}`;
  const waLink = `https://wa.me/${fullCleanPhone}?text=${encodeURIComponent(prefilledMessage || '')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=2&data=${encodeURIComponent(waLink)}`;

  // Handle Logo Upload (Base64 for reliable canvas download & preview without CORS issues)
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('Invalid File', 'Please upload a valid image (PNG, JPG, SVG).');
      return;
    }

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result;
      if (b64) {
        setBusinessLogo(b64);
        updateNodeData(id, { 
          businessLogo: b64, 
          logoFileName: file.name 
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate QR Code Click Handler - ZERO HARDCODED DEFAULTS
  const handleGenerate = () => {
    if (!phoneNumber.trim()) {
      showToast.warning('Phone Required', 'Please enter your WhatsApp phone number.');
      return;
    }
    setIsGenerated(true);
    updateNodeData(id, {
      keyword: prefilledMessage || '',
      businessName: businessName || '',
      businessTagline: businessTagline || '',
      businessLogo: businessLogo || '',
      logoFileName: logoFileName || '',
      qrCountryCode: countryCode,
      qrPhoneNumber: phoneNumber,
      qrIsGenerated: true
    });
    showToast.success('QR Generated', 'Your WhatsApp Desk Standee is ready!');
  };

  // Auto-sync form changes with node data for seamless trigger integration
  useEffect(() => {
    if (prefilledMessage !== localData.keyword) {
      updateNodeData(id, { keyword: prefilledMessage });
    }
  }, [prefilledMessage]);

  // Copy Link Handler
  const handleCopyLink = () => {
    if (!waLink) return;
    navigator.clipboard.writeText(waLink).then(() => {
      setCopied(true);
      showToast.success('Link Copied', 'WhatsApp link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      showToast.error('Copy Failed', 'Could not copy link to clipboard.');
    });
  };

  // 300 DPI Canvas Standee Download Handler
  const handleDownloadStandee = async () => {
    try {
      setIsDownloading(true);
      showToast.info('Preparing Standee', 'Rendering high-resolution print standee...');

      // High-res canvas: 1200 x 1700 px (printable 300 DPI ratio)
      const width = 1200;
      const height = 1700;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      // Helper function: Rounded Rectangle
      const drawRoundedRect = (x, y, w, h, radius, fill, stroke, strokeWidth = 1) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
      };

      // 1. Draw Standee Base Card (Pure White with subtle shadow)
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      const cardMargin = 40;
      const cardW = width - cardMargin * 2;
      const cardH = height - cardMargin * 2;
      drawRoundedRect(cardMargin, cardMargin, cardW, cardH, 50, '#FFFFFF', '#E2E8F0', 3);

      // 2. Top-Left Green Curve & Dot Pattern
      ctx.save();
      ctx.beginPath();
      ctx.arc(cardMargin + 20, cardMargin + 20, 240, 0, Math.PI / 2);
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Top-Left Dots
      ctx.fillStyle = '#CBD5E1';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.arc(cardMargin + 70 + c * 18, cardMargin + 70 + r * 18, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. Top-Right Dot Grid (6 rows x 4 columns)
      ctx.fillStyle = '#CBD5E1';
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.arc(width - cardMargin - 130 + c * 22, cardMargin + 80 + r * 22, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Bottom-Right Green Curve
      ctx.save();
      ctx.beginPath();
      ctx.arc(width - cardMargin - 20, height - cardMargin - 20, 220, Math.PI, Math.PI * 1.5);
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // 5. Draw Business Logo inside centered pill
      let currentY = 160;
      const pillW = 260;
      const pillH = 100;
      const pillX = (width - pillW) / 2;
      drawRoundedRect(pillX, currentY, pillW, pillH, 50, '#FFFFFF', '#F1F5F9', 3);

      if (businessLogo) {
        try {
          const logoImg = new Image();
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = businessLogo;
          });
          const aspect = logoImg.width / logoImg.height;
          let drawW = 160;
          let drawH = drawW / aspect;
          if (drawH > 70) {
            drawH = 70;
            drawW = drawH * aspect;
          }
          ctx.drawImage(logoImg, (width - drawW) / 2, currentY + (pillH - drawH) / 2, drawW, drawH);
        } catch {
          if (businessName) {
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillStyle = '#0F172A';
            ctx.textAlign = 'center';
            ctx.fillText(businessName.slice(0, 10).toUpperCase(), width / 2, currentY + 62);
          }
        }
      } else if (businessName) {
        ctx.font = 'bold 34px Inter, sans-serif';
        ctx.fillStyle = '#16A34A';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ ' + businessName.slice(0, 12).toUpperCase(), width / 2, currentY + 62);
      }

      // 6. Business Name (Uppercase, bold)
      currentY += pillH + 60;
      if (businessName) {
        ctx.font = '800 58px Inter, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.textAlign = 'center';
        ctx.fillText(businessName.toUpperCase(), width / 2, currentY);
      }

      // 7. Business Tagline
      if (businessTagline) {
        currentY += 50;
        ctx.font = '600 28px Inter, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.fillText(businessTagline, width / 2, currentY);
      }

      // 8. Green Divider Line (── • ──)
      currentY += 40;
      const lineLen = 70;
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(width / 2 - lineLen - 16, currentY);
      ctx.lineTo(width / 2 - 16, currentY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, currentY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#16A34A';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width / 2 + 16, currentY);
      ctx.lineTo(width / 2 + lineLen + 16, currentY);
      ctx.stroke();

      // 9. Contact Phone Pill (📞 +91 6203459821)
      currentY += 45;
      const phonePillW = 460;
      const phonePillH = 75;
      const phonePillX = (width - phonePillW) / 2;
      drawRoundedRect(phonePillX, currentY, phonePillW, phonePillH, 38, '#FFFFFF', '#E2E8F0', 3);

      // Green circle inside phone pill
      ctx.beginPath();
      ctx.arc(phonePillX + 46, currentY + phonePillH / 2, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#16A34A';
      ctx.fill();
      ctx.font = '22px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('📞', phonePillX + 46, currentY + phonePillH / 2 + 8);

      // Phone text
      ctx.font = '800 36px Inter, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText(`${countryCode} ${phoneNumber}`, phonePillX + 90, currentY + phonePillH / 2 + 12);

      // 10. QR Code Box (with 2px solid green border + centered WhatsApp logo)
      currentY += phonePillH + 45;
      const qrBoxSize = 480;
      const qrBoxX = (width - qrBoxSize) / 2;
      drawRoundedRect(qrBoxX, currentY, qrBoxSize, qrBoxSize, 36, '#FFFFFF', '#22C55E', 5);

      // Load & Draw QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrCodeUrl;
      });

      const qrInnerMargin = 25;
      ctx.drawImage(
        qrImg, 
        qrBoxX + qrInnerMargin, 
        currentY + qrInnerMargin, 
        qrBoxSize - qrInnerMargin * 2, 
        qrBoxSize - qrInnerMargin * 2
      );

      // WhatsApp Logo Badge in Center of QR
      const waCenterRadius = 45;
      ctx.beginPath();
      ctx.arc(width / 2, currentY + qrBoxSize / 2, waCenterRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#25D366';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.font = '46px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('💬', width / 2, currentY + qrBoxSize / 2 + 16);

      // 11. "Scan & Chat on WhatsApp" Pill Banner
      currentY += qrBoxSize + 30;
      const bannerW = 390;
      const bannerH = 60;
      drawRoundedRect((width - bannerW) / 2, currentY, bannerW, bannerH, 18, '#047857', null);
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('📱  Scan & Chat on WhatsApp', width / 2, currentY + 41);

      // 12. 4 Trust Badges with Dividers
      currentY += bannerH + 45;
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cardMargin + 40, currentY);
      ctx.lineTo(width - cardMargin - 40, currentY);
      ctx.stroke();

      const badges = [
        { label: 'Instant Connect', icon: '⚡' },
        { label: 'Secure & Reliable', icon: '🛡️' },
        { label: 'Trusted by Customers', icon: '👥' },
        { label: 'Fast & Easy', icon: '⭐' }
      ];

      const badgeColW = (width - cardMargin * 2) / 4;
      badges.forEach((b, i) => {
        const colX = cardMargin + i * badgeColW;
        const centerX = colX + badgeColW / 2;

        ctx.font = '30px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.icon, centerX, currentY + 42);

        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText(b.label, centerX, currentY + 74);

        if (i < 3) {
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(colX + badgeColW, currentY + 15);
          ctx.lineTo(colX + badgeColW, currentY + 80);
          ctx.stroke();
        }
      });

      // 13. Footer Watermark: ── Powered By 🐝 MessBee ──
      currentY += 120;
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardMargin + 60, currentY);
      ctx.lineTo(width / 2 - 160, currentY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2 + 160, currentY);
      ctx.lineTo(width - cardMargin - 60, currentY);
      ctx.stroke();

      ctx.font = '500 24px Inter, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.fillText('Powered By', width / 2 - 70, currentY + 8);

      ctx.beginPath();
      ctx.arc(width / 2 + 15, currentY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('🐝', width / 2 + 15, currentY + 7);

      ctx.font = '800 28px Inter, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('Mess', width / 2 + 75, currentY + 9);
      ctx.fillStyle = '#16A34A';
      ctx.fillText('Bee', width / 2 + 120, currentY + 9);

      // Trigger high-res PNG Download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      const sanitizedName = (businessName || 'Business').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadLink.download = `${sanitizedName}_WhatsApp_Desk_Standee.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast.success('Standee Downloaded', 'Print-ready desk standee saved (300 DPI)!');
    } catch (err) {
      console.error('Failed to download standee:', err);
      showToast.error('Download Failed', 'Could not generate standee image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px',
      boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* 2-Column Responsive Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* ───────────────────────────────────────────────────────────── */}
        {/* COLUMN 1: FORM INPUTS ("Enter Your Details")                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div>
          <h3 style={{
            margin: '0 0 18px 0',
            fontSize: '18px',
            fontWeight: '700',
            color: '#0F172A'
          }}>
            Enter Your Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Business Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. AAS TECH"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 2. Business Tagline */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Business Tagline
              </label>
              <input
                type="text"
                value={businessTagline}
                onChange={(e) => setBusinessTagline(e.target.value)}
                placeholder="We Build. We Innovate. We Deliver."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 3. Business Logo */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Business Logo
              </label>
              <div style={{
                border: '1px dashed #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxSizing: 'border-box'
              }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '5px',
                    padding: '5px 12px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Choose File
                </button>
                <span style={{
                  fontSize: '12px',
                  color: '#64748B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {logoFileName || 'No file chosen'}
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* 4. WhatsApp Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                WhatsApp Number
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    width: '110px',
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
                Don't use +, -, or brackets. Just the digits.
              </p>
            </div>

            {/* 5. Pre-filled Message (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Pre-filled Message (Optional)
              </label>
              <textarea
                rows={2}
                value={prefilledMessage}
                onChange={(e) => setPrefilledMessage(e.target.value)}
                placeholder="e.g. Hi! I want to know more about your services."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
              <p style={{ margin: '5px 0 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
                Message will automatically appear in user's chat.
              </p>
            </div>

            {/* Big Green Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              style={{
                width: '100%',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '13px 20px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
                marginTop: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#15803D'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#16A34A'; }}
            >
              <span>Generate QR Code</span>
              <span style={{ fontSize: '18px' }}>&rarr;</span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* COLUMN 2: RIGHT SIDE - PLACEHOLDER OR STANDEE CARD            */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div>
          {!isGenerated ? (
            /* Un-generated state matching screenshot 2 */
            <div style={{
              width: '100%',
              minHeight: '480px',
              background: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '30px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                border: '2px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <LayoutGrid size={30} color="#94A3B8" />
              </div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#94A3B8' }}>
                Your QR Code will appear here.
              </p>
            </div>
          ) : (
            /* Generated state matching screenshot 1 */
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              
              {/* Standee Card */}
              <div style={{
                width: '100%',
                maxWidth: '340px',
                background: '#FFFFFF',
                borderRadius: '18px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #F1F5F9',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px 16px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                
                {/* 1. Top-Left Green Arc Curve */}
                <svg
                  style={{ position: 'absolute', top: 0, left: 0, width: '110px', height: '110px', pointerEvents: 'none' }}
                  viewBox="0 0 110 110"
                  fill="none"
                >
                  <path d="M 0 95 C 15 85, 85 15, 95 0" stroke="#16A34A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>

                {/* Top-Left Dot Grid Under Arc */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 3px)',
                  gap: '5px',
                  pointerEvents: 'none'
                }}>
                  {[...Array(12)].map((_, i) => (
                    <span key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
                  ))}
                </div>

                {/* 2. Top-Right Dot Grid (6 rows x 4 columns) */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 3px)',
                  gap: '5px',
                  pointerEvents: 'none'
                }}>
                  {[...Array(24)].map((_, i) => (
                    <span key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
                  ))}
                </div>

                {/* 3. Bottom-Right Green Arc Curve */}
                <svg
                  style={{ position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px', pointerEvents: 'none' }}
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <path d="M 100 15 C 85 30, 30 85, 15 100" stroke="#16A34A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </svg>

                {/* 4. Business Logo Pill */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '4px 16px',
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #F1F5F9',
                  marginBottom: '10px',
                  maxWidth: '190px'
                }}>
                  {businessLogo ? (
                    <img 
                      src={businessLogo} 
                      alt="Business Logo" 
                      style={{ maxHeight: '28px', maxWidth: '160px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#16A34A', letterSpacing: '0.5px' }}>
                      ⚡ {businessName ? businessName.slice(0, 12).toUpperCase() : 'BUSINESS'}
                    </span>
                  )}
                </div>

                {/* 5. Business Name (Uppercase) */}
                {businessName && (
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}>
                    {businessName.toUpperCase()}
                  </h4>
                )}

                {/* 6. Tagline */}
                {businessTagline && (
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#334155',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {businessTagline}
                  </p>
                )}

                {/* 7. Green Divider: ── • ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '2px', background: '#16A34A', borderRadius: '2px' }} />
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#16A34A' }} />
                  <div style={{ width: '28px', height: '2px', background: '#16A34A', borderRadius: '2px' }} />
                </div>

                {/* 8. Phone Pill: (📞) +91 6203459821 */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '9999px',
                  padding: '5px 14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    <Phone size={11} fill="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', letterSpacing: '0.2px' }}>
                    {countryCode} {phoneNumber}
                  </span>
                </div>

                {/* 9. QR Code with Green Border + Center WhatsApp Badge */}
                <div style={{
                  position: 'relative',
                  padding: '6px',
                  background: '#FFFFFF',
                  border: '2px solid #22C55E',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.12)',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="WhatsApp QR Code" 
                    style={{ width: '160px', height: '160px', display: 'block', borderRadius: '6px' }} 
                  />

                  {/* WhatsApp center glyph badge */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#25D366',
                    border: '2.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                </div>

                {/* 10. Scan & Chat on WhatsApp Pill */}
                <div style={{
                  background: '#047857',
                  color: '#FFFFFF',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '14px'
                }}>
                  <span>📱 Scan & Chat on WhatsApp</span>
                </div>

                {/* 11. 4 Trust Badges */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  width: '100%',
                  borderTop: '1px solid #F1F5F9',
                  borderBottom: '1px solid #F1F5F9',
                  padding: '8px 0',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                    <Zap size={13} color="#10B981" />
                    <span style={{ fontSize: '8.5px', fontWeight: '600', color: '#334155', marginTop: '2px', textAlign: 'center' }}>Instant Connect</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                    <ShieldCheck size={13} color="#10B981" />
                    <span style={{ fontSize: '8.5px', fontWeight: '600', color: '#334155', marginTop: '2px', textAlign: 'center' }}>Secure & Reliable</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                    <Users size={13} color="#10B981" />
                    <span style={{ fontSize: '8.5px', fontWeight: '600', color: '#334155', marginTop: '2px', textAlign: 'center' }}>Trusted by Customers</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px' }}>
                    <Star size={13} color="#10B981" />
                    <span style={{ fontSize: '8.5px', fontWeight: '600', color: '#334155', marginTop: '2px', textAlign: 'center' }}>Fast & Easy</span>
                  </div>
                </div>

                {/* 12. Footer Watermark: Powered By 🐝 MessBee */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                  <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
                    <span>Powered By</span>
                    <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: '#10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '8px' }}>🐝</span>
                    <span style={{ fontWeight: '800', color: '#0F172A' }}>Mess<span style={{ color: '#16A34A' }}>Bee</span></span>
                  </div>
                  <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                </div>
              </div>

              {/* Action Buttons: Download Standee & Copy Link */}
              <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '340px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={handleDownloadStandee}
                  disabled={isDownloading}
                  style={{
                    flex: 1,
                    background: '#0B192C',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(11,25,44,0.18)'
                  }}
                >
                  <Download size={14} />
                  <span>{isDownloading ? 'Preparing...' : 'Download Standee'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
