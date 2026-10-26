import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Copy, Check, Phone, ShieldCheck, Zap, Users, Star, 
  LayoutGrid, Edit3, Eye, Sparkles
} from 'lucide-react';
import { showToast } from '../../utils/showToast';
import api from '../../context/axios';
import useAuthStore from '../../store/useAuthStore';
import messbeeLogo from '../../assets/MessBee Logo.png';

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'MB';
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

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
  const [offerLabel, setOfferLabel] = useState(localData.offerLabel ?? localData.qrOfferLabel ?? 'Scan & Chat on WhatsApp');
  
  // Generation & Action UI states
  const [isGenerated, setIsGenerated] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState('card'); // 'card' | 'form'
  
  const fileInputRef = useRef(null);

  // Auto-fetch profile logo and business details from Auth store and API
  useEffect(() => {
    // 1. From Zustand Auth Store
    const authUser = useAuthStore.getState()?.user;
    if (authUser) {
      if (!businessLogo && (authUser.avatar || authUser.profileImage || authUser.logo)) {
        const autoLogo = authUser.avatar || authUser.profileImage || authUser.logo;
        setBusinessLogo(autoLogo);
        setLogoFileName('Profile Photo');
        updateNodeData(id, { businessLogo: autoLogo, logoFileName: 'Profile Photo' });
      }
      if (!businessName && (authUser.businessName || authUser.companyName || authUser.name)) {
        const autoName = authUser.businessName || authUser.companyName || authUser.name;
        setBusinessName(autoName);
        updateNodeData(id, { businessName: autoName });
      }
      if (!phoneNumber && authUser.phone) {
        const cleanDigits = authUser.phone.replace(/\D/g, '');
        const numOnly = cleanDigits.startsWith('91') && cleanDigits.length > 10 ? cleanDigits.slice(2) : cleanDigits;
        setPhoneNumber(numOnly);
      }
    }

    // 2. From User Profile API
    api.get('/users/profile').then(res => {
      const p = res.data?.data || res.data?.user || res.data;
      if (p) {
        if (!businessLogo && (p.avatar || p.profileImage || p.logo)) {
          const autoLogo = p.avatar || p.profileImage || p.logo;
          setBusinessLogo(autoLogo);
          setLogoFileName('Profile Photo');
          updateNodeData(id, { businessLogo: autoLogo, logoFileName: 'Profile Photo' });
        }
        if (!businessName && (p.businessName || p.companyName || p.name)) {
          const autoName = p.businessName || p.companyName || p.name;
          setBusinessName(autoName);
          updateNodeData(id, { businessName: autoName });
        }
      }
    }).catch(() => {});

    // 3. From WhatsApp Profile Settings
    api.get('/settings/whatsapp_profile_details').then(res => {
      const wa = res.data?.data?.value || res.data?.value || res.data?.data;
      if (wa) {
        if (!businessLogo && (wa.profileImagePreview || wa.profileImage)) {
          const autoLogo = wa.profileImagePreview || wa.profileImage;
          setBusinessLogo(autoLogo);
          setLogoFileName('WhatsApp Profile');
          updateNodeData(id, { businessLogo: autoLogo, logoFileName: 'WhatsApp Profile' });
        }
        if (!businessName && (wa.businessName || wa.name)) {
          const autoName = wa.businessName || wa.name;
          setBusinessName(autoName);
          updateNodeData(id, { businessName: autoName });
        }
      }
    }).catch(() => {});
  }, []);

  // Computed Full Clean Phone & WhatsApp Link
  const fullCleanPhone = `${countryCode.replace(/\D/g, '')}${phoneNumber.replace(/\D/g, '')}`;
  const waLink = `https://wa.me/${fullCleanPhone}?text=${encodeURIComponent(prefilledMessage || '')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&ecc=H&margin=2&data=${encodeURIComponent(waLink)}`;

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
    setViewTab('card');
    updateNodeData(id, {
      keyword: prefilledMessage || '',
      businessName: businessName || '',
      businessTagline: businessTagline || '',
      businessLogo: businessLogo || '',
      logoFileName: logoFileName || '',
      offerLabel: offerLabel || '',
      qrOfferLabel: offerLabel || '',
      qrCountryCode: countryCode,
      qrPhoneNumber: phoneNumber,
      qrIsGenerated: true
    });
    showToast.success('QR Generated', 'Your WhatsApp QR Code is ready!');
  };

  // Auto-sync form changes with node data for seamless trigger integration
  useEffect(() => {
    if (prefilledMessage !== localData.keyword) {
      updateNodeData(id, { keyword: prefilledMessage });
    }
  }, [prefilledMessage]);

  useEffect(() => {
    if (offerLabel !== (localData.offerLabel || localData.qrOfferLabel)) {
      updateNodeData(id, { offerLabel, qrOfferLabel: offerLabel });
    }
  }, [offerLabel]);

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
      showToast.info('Preparing QR Code', 'Rendering high-resolution print QR...');

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

      // 2. Top-Left Green Curve & Dot Pattern (Tightly in corner)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cardMargin + 20, cardMargin + 20, 160, 0, Math.PI / 2);
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Top-Left Dots
      ctx.fillStyle = '#CBD5E1';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.arc(cardMargin + 55 + c * 16, cardMargin + 55 + r * 16, 4, 0, Math.PI * 2);
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

      // 5. Draw Business Logo / 2-letter Initials Fallback inside Circular Badge (like messbee.com/whatsapp-qr-generator)
      let currentY = 160;
      const initials = getInitials(businessName || 'Business');
      let drewLogoImage = false;
      const badgeRadius = 70;
      const badgeCenterX = width / 2;
      const badgeCenterY = currentY + badgeRadius;

      // Outer soft ring / glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(badgeCenterX, badgeCenterY, badgeRadius + 14, 0, Math.PI * 2);
      ctx.fillStyle = '#F0FDF4';
      ctx.fill();
      ctx.strokeStyle = '#DCFCE7';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (businessLogo) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            logoImg.src = businessLogo;
          });

          // Clip image into circle
          ctx.beginPath();
          ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.save();
          ctx.clip();

          // Calculate cover fit
          const aspect = logoImg.width / logoImg.height;
          let drawW = badgeRadius * 2;
          let drawH = badgeRadius * 2;
          if (aspect > 1) {
            drawW = drawH * aspect;
          } else {
            drawH = drawW / aspect;
          }
          ctx.drawImage(logoImg, badgeCenterX - drawW / 2, badgeCenterY - drawH / 2, drawW, drawH);
          ctx.restore();

          // Circle border
          ctx.beginPath();
          ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#DCFCE7';
          ctx.lineWidth = 6;
          ctx.stroke();

          drewLogoImage = true;
          currentY += (badgeRadius + 14) * 2 + 35;
        } catch {
          drewLogoImage = false;
        }
      }

      if (!drewLogoImage) {
        // Fallback: 2-Letter Initials inside circular emerald badge
        ctx.beginPath();
        ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#16A34A';
        ctx.fill();
        ctx.strokeStyle = '#DCFCE7';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.font = '800 56px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, badgeCenterX, badgeCenterY);

        currentY += (badgeRadius + 14) * 2 + 35;
      }
      ctx.restore();

      // 6. Business Name (Uppercase, adaptive bold)
      if (businessName) {
        const nameLen = businessName.length;
        ctx.font = nameLen > 30 ? '800 40px Inter, sans-serif' : nameLen > 20 ? '800 48px Inter, sans-serif' : '800 56px Inter, sans-serif';
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

      // Center Logo Badge in QR Code (Custom Logo or WhatsApp)
      const waCenterRadius = 46;
      const qrCenterX = width / 2;
      const qrCenterY = currentY + qrBoxSize / 2;
      let drewQrCenterLogo = false;

      if (businessLogo) {
        try {
          const centerLogoImg = new Image();
          centerLogoImg.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            centerLogoImg.onload = resolve;
            centerLogoImg.onerror = reject;
            centerLogoImg.src = businessLogo;
          });

          // Draw white circle backing
          ctx.beginPath();
          ctx.arc(qrCenterX, qrCenterY, waCenterRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Clip image into circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(qrCenterX, qrCenterY, waCenterRadius, 0, Math.PI * 2);
          ctx.clip();

          const aspect = centerLogoImg.width / centerLogoImg.height;
          let drawW = waCenterRadius * 2;
          let drawH = waCenterRadius * 2;
          if (aspect > 1) {
            drawW = drawH * aspect;
          } else {
            drawH = drawW / aspect;
          }
          ctx.drawImage(centerLogoImg, qrCenterX - drawW / 2, qrCenterY - drawH / 2, drawW, drawH);
          ctx.restore();

          // Outer white ring
          ctx.beginPath();
          ctx.arc(qrCenterX, qrCenterY, waCenterRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 6;
          ctx.stroke();

          drewQrCenterLogo = true;
        } catch {
          drewQrCenterLogo = false;
        }
      }

      if (!drewQrCenterLogo) {
        // WhatsApp fallback
        ctx.beginPath();
        ctx.arc(qrCenterX, qrCenterY, waCenterRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#25D366';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.font = '46px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('💬', qrCenterX, qrCenterY + 16);
      }

      // 11. "Scan & Chat on WhatsApp" / Offer Label Pill Banner
      currentY += qrBoxSize + 30;
      const rawBanner = (offerLabel || 'Scan & Chat on WhatsApp').trim();
      const cleanBanner = rawBanner.startsWith('📱') ? rawBanner : `📱  ${rawBanner}`;
      const bannerW = rawBanner.length > 30 ? 520 : 440;
      const bannerH = 64;
      drawRoundedRect((width - bannerW) / 2, currentY, bannerW, bannerH, 20, '#047857', null);
      const canvasOfferFontSize = rawBanner.length > 38 ? 17 : rawBanner.length > 25 ? 20 : rawBanner.length > 15 ? 23 : 26;
      ctx.font = `bold ${canvasOfferFontSize}px Inter, sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(cleanBanner, width / 2, currentY + 42);

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

      try {
        const mbLogoImg = new Image();
        mbLogoImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          mbLogoImg.onload = resolve;
          mbLogoImg.onerror = reject;
          mbLogoImg.src = messbeeLogo;
        });
        ctx.drawImage(mbLogoImg, width / 2 - 2, currentY - 18, 36, 36);
      } catch {
        ctx.beginPath();
        ctx.arc(width / 2 + 15, currentY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.font = '18px Inter, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('🐝', width / 2 + 15, currentY + 7);
      }

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
      downloadLink.download = `${sanitizedName}_WhatsApp_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast.success('QR Downloaded', 'Print-ready WhatsApp QR saved (300 DPI)!');
    } catch (err) {
      console.error('Failed to download standee:', err);
      showToast.error('Download Failed', 'Could not generate standee image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const nameLen = (businessName || '').length;
  const titleFontSize = nameLen > 34 ? '12px' : nameLen > 22 ? '13.5px' : '15.5px';

  const offerText = (offerLabel || 'Scan & Chat on WhatsApp').trim();
  const offerLen = offerText.length;
  const offerFontSize = offerLen > 38 ? '7.5px' : offerLen > 25 ? '8.5px' : offerLen > 15 ? '9.5px' : '10.5px';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '12px',
      boxSizing: 'border-box',
      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      width: '100%'
    }}>
      {/* Responsive Segmented Tab Switcher */}
      <div style={{
        display: 'flex',
        background: '#F1F5F9',
        padding: '3px',
        borderRadius: '9px',
        marginBottom: '12px'
      }}>
        <button
          type="button"
          onClick={() => setViewTab('card')}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: viewTab === 'card' ? '700' : '600',
            color: viewTab === 'card' ? '#0F172A' : '#64748B',
            background: viewTab === 'card' ? '#FFFFFF' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: viewTab === 'card' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Eye size={13} color={viewTab === 'card' ? '#16A34A' : '#64748B'} />
          <span>QR Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setViewTab('form')}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '12px',
            fontWeight: viewTab === 'form' ? '700' : '600',
            color: viewTab === 'form' ? '#0F172A' : '#64748B',
            background: viewTab === 'form' ? '#FFFFFF' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: viewTab === 'form' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Edit3 size={13} color={viewTab === 'form' ? '#16A34A' : '#64748B'} />
          <span>Edit Details</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: STANDEE PREVIEW (Default Responsive View)              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewTab === 'card' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* Single Line WhatsApp Link with Copy */}
          <div style={{ width: '100%', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                WhatsApp Link
              </span>
              <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '600' }}>
                Instant Connect
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={waLink}
                onClick={(e) => e.target.select()}
                style={{
                  flex: 1,
                  padding: '6px 9px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#2563EB',
                  background: '#F8FAFC',
                  outline: 'none',
                  textOverflow: 'ellipsis',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Standee Card - Proportioned & Non-overlapping */}
          <div style={{
            width: '100%',
            maxWidth: '320px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            position: 'relative',
            overflow: 'hidden',
            padding: '14px 12px 10px 12px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            
            {/* 1. Corner Green Arc - Compact so it never crosses the center logo */}
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: '48px', height: '48px', pointerEvents: 'none' }}
              viewBox="0 0 48 48"
              fill="none"
            >
              <path d="M 0 40 C 8 30, 30 8, 40 0" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>

            {/* Top-Left Dots */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 3px)',
              gap: '3.5px',
              pointerEvents: 'none'
            }}>
              {[...Array(9)].map((_, i) => (
                <span key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
              ))}
            </div>

            {/* 2. Top-Right Dot Grid */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 3px)',
              gap: '3.5px',
              pointerEvents: 'none'
            }}>
              {[...Array(16)].map((_, i) => (
                <span key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#CBD5E1' }} />
              ))}
            </div>

            {/* 3. Bottom-Right Green Arc */}
            <svg
              style={{ position: 'absolute', bottom: 0, right: 0, width: '45px', height: '45px', pointerEvents: 'none' }}
              viewBox="0 0 45 45"
              fill="none"
            >
              <path d="M 45 8 C 35 18, 18 35, 8 45" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>

            {/* 4. Business Logo (Gol / Circular with soft outer ring like messbee.com) */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#F0FDF4',
                border: '2px solid #DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(22, 163, 74, 0.12)',
                padding: '3px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                {businessLogo ? (
                  <img 
                    src={businessLogo} 
                    alt="Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px' }}>
                      {getInitials(businessName || 'Business')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Business Name (Uppercase) */}
            {businessName && (
              <h4 style={{
                margin: '0 0 3px 0',
                fontSize: titleFontSize,
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '0.3px',
                textAlign: 'center',
                lineHeight: '1.25',
                maxWidth: '92%'
              }}>
                {businessName.toUpperCase()}
              </h4>
            )}

            {/* 6. Tagline */}
            {businessTagline && (
              <p style={{
                margin: '0 0 6px 0',
                fontSize: '10.5px',
                fontWeight: '600',
                color: '#475569',
                textAlign: 'center',
                lineHeight: '1.3',
                maxWidth: '92%'
              }}>
                {businessTagline}
              </p>
            )}

            {/* 7. Green Divider: ── • ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}>
              <div style={{ width: '22px', height: '2px', background: '#16A34A', borderRadius: '2px' }} />
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#16A34A' }} />
              <div style={{ width: '22px', height: '2px', background: '#16A34A', borderRadius: '2px' }} />
            </div>

            {/* 8. Phone Pill: (📞) +91 XXXXXXXXXX */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              padding: '3px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Phone size={10} fill="#FFFFFF" />
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', letterSpacing: '0.2px' }}>
                {countryCode} {phoneNumber}
              </span>
            </div>

            {/* 9. QR Code with Green Border + Center WhatsApp Badge */}
            <div style={{
              position: 'relative',
              padding: '5px',
              background: '#FFFFFF',
              border: '2px solid #22C55E',
              borderRadius: '10px',
              boxShadow: '0 3px 10px rgba(34, 197, 94, 0.12)',
              display: 'inline-block',
              marginBottom: '8px'
            }}>
              <img 
                src={qrCodeUrl} 
                alt="WhatsApp QR Code" 
                style={{ width: '130px', height: '130px', display: 'block', borderRadius: '6px' }} 
              />

              {/* Center Logo Badge (Custom business logo or WhatsApp fallback) */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '2.5px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {businessLogo ? (
                  <img
                    src={businessLogo}
                    alt="Center Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 10. Offer Label / Call to Action Pill */}
            <div style={{
              background: '#047857',
              color: '#FFFFFF',
              padding: offerLen > 28 ? '4px 8px' : '4px 10px',
              borderRadius: '6px',
              fontSize: offerFontSize,
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '8px',
              maxWidth: '94%',
              boxShadow: '0 2px 5px rgba(4, 120, 87, 0.25)',
              boxSizing: 'border-box',
              lineHeight: '1.25',
              textAlign: 'center'
            }}>
              <span style={{ flexShrink: 0 }}>📱</span>
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.2px',
                whiteSpace: offerLen > 32 ? 'normal' : 'nowrap',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {offerText || 'Scan & Chat on WhatsApp'}
              </span>
            </div>

            {/* 11. 4 Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              width: '100%',
              borderTop: '1px solid #F1F5F9',
              borderBottom: '1px solid #F1F5F9',
              padding: '6px 0',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                <Zap size={11} color="#10B981" />
                <span style={{ fontSize: '7.5px', fontWeight: '600', color: '#334155', marginTop: '1px', textAlign: 'center' }}>Instant Connect</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                <ShieldCheck size={11} color="#10B981" />
                <span style={{ fontSize: '7.5px', fontWeight: '600', color: '#334155', marginTop: '1px', textAlign: 'center' }}>Secure & Reliable</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #E2E8F0', padding: '0 2px' }}>
                <Users size={11} color="#10B981" />
                <span style={{ fontSize: '7.5px', fontWeight: '600', color: '#334155', marginTop: '1px', textAlign: 'center' }}>Customer Trust</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2px' }}>
                <Star size={11} color="#10B981" />
                <span style={{ fontSize: '7.5px', fontWeight: '600', color: '#334155', marginTop: '1px', textAlign: 'center' }}>Fast & Easy</span>
              </div>
            </div>

            {/* 12. Footer Watermark: Powered By MessBee Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#64748B', fontWeight: '500' }}>
                <span>Powered By</span>
                <img 
                  src={messbeeLogo} 
                  alt="MessBee" 
                  style={{ width: '14px', height: '14px', objectFit: 'contain', display: 'inline-block' }} 
                />
                <span style={{ fontWeight: '800', color: '#0F172A' }}>Mess<span style={{ color: '#16A34A' }}>Bee</span></span>
              </div>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>
          </div>

          {/* Action Buttons: Download Standee & Edit Details */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '320px', marginTop: '10px' }}>
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
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(11,25,44,0.18)'
              }}
            >
              <Download size={13} />
              <span>{isDownloading ? 'Preparing...' : 'Download QR'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('form')}
              style={{
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Edit3 size={13} />
              <span>Edit Details</span>
            </button>
          </div>

        </div>
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* TAB 2: EDIT DETAILS FORM                                      */
        /* ───────────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 1. Business Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. AAS TECH"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '7px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 2. Business Tagline */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
              Business Tagline
            </label>
            <input
              type="text"
              value={businessTagline}
              onChange={(e) => setBusinessTagline(e.target.value)}
              placeholder="We Build. We Innovate. We Deliver."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '7px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 3. Business Logo with Profile Auto-fetch & Initials Fallback */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#374151', margin: 0 }}>
                Business Logo
              </label>
              <span style={{ fontSize: '11px', color: businessLogo ? '#16A34A' : '#64748B', fontWeight: '500' }}>
                {businessLogo ? '✓ Synced' : `Using "${getInitials(businessName || 'Business')}" fallback`}
              </span>
            </div>
            <div style={{
              border: '1px dashed #CBD5E1',
              borderRadius: '8px',
              padding: '7px 10px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}>
              {businessLogo ? (
                <img
                  src={businessLogo}
                  alt="Logo"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(22,163,74,0.25)'
                }}>
                  {getInitials(businessName || 'Business')}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {businessLogo ? 'Change' : 'Upload'}
              </button>
              <span style={{
                fontSize: '11px',
                color: '#64748B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {logoFileName || (businessLogo ? 'Profile Logo' : 'Initials fallback active')}
              </span>
              {businessLogo && (
                <button
                  type="button"
                  onClick={() => {
                    setBusinessLogo('');
                    setLogoFileName('');
                    updateNodeData(id, { businessLogo: '', logoFileName: '' });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: '2px 4px'
                  }}
                  title="Remove custom logo and use initials fallback"
                >
                  Reset
                </button>
              )}
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
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
              WhatsApp Number
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  width: '95px',
                  padding: '8px 6px',
                  borderRadius: '7px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12.5px',
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
                placeholder="9876543210"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '7px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 5. Pre-filled Message (Keyword) */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
              Pre-filled Message / Keyword
            </label>
            <input
              type="text"
              value={prefilledMessage}
              onChange={(e) => setPrefilledMessage(e.target.value)}
              placeholder="e.g. Hi, I want to book an appointment"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '7px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 6. Offer Label (Under QR Code) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#374151', margin: 0 }}>
                Offer Label (Under QR Code)
              </label>
              <span style={{ fontSize: '11px', color: (offerLabel || '').length >= 50 ? '#EF4444' : '#64748B', fontWeight: '600' }}>
                {(offerLabel || '').length}/50 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={50}
              value={offerLabel}
              onChange={(e) => setOfferLabel(e.target.value.slice(0, 50))}
              placeholder="e.g. Flat 20% Off, Scan & Chat, Book Free Demo"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '7px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Save & View Standee Button */}
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              width: '100%',
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(22,163,74,0.25)',
              marginTop: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#15803D'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#16A34A'; }}
          >
            <Sparkles size={14} />
            <span>Save & View QR</span>
            <span style={{ fontSize: '15px' }}>&rarr;</span>
          </button>

        </div>
      )}

    </div>
  );
}
