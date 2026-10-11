import React from 'react';
import QRCode from 'qrcode';
import { Printer, MessageCircle, Store } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const ShopQRModal = ({ isOpen, onClose, shop }) => {
  const { isHindi } = useLanguage();
  if (!isOpen || !shop) return null;

  const shopSlug = shop.slug || shop.id || 'store';
  const shopUrl = `${window.location.origin}/shop/${shopSlug}`;

  const handleShareWhatsApp = () => {
    const text = `🛒 *Order & Pickup from ${shop.name}*\n📍 Store: ${shop.address || 'Local Market'}\n🔗 Open Live Catalog & Offers: ${shopUrl}\n\nScan or tap the link to order directly!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrintStandee = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(shopUrl, {
        errorCorrectionLevel: 'H',
        scale: 16,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      const printWindow = window.open('', '_blank', 'width=700,height=900');
      if (!printWindow) {
        alert('Please allow popups to print official counter standee.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Official Counter Standee - ${shop.name}</title>
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { font-family: system-ui, sans-serif; text-align: center; padding: 20px; }
              .card { border: 3px solid #0f172a; border-radius: 24px; padding: 30px; max-width: 500px; margin: 0 auto; }
              h1 { font-size: 26px; margin: 10px 0; color: #0f172a; }
              p { color: #475569; margin: 4px 0 20px 0; font-size: 14px; }
              img { width: 300px; height: 300px; }
              .footer { margin-top: 20px; font-weight: 700; color: #4f46e5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>${shop.name}</h1>
              <p>${shop.address || 'Local Neighborhood Store'}</p>
              <img src="${qrDataUrl}" alt="QR Code" />
              <div class="footer">Scan to View Catalog &amp; Offers on ShopSilo</div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error('Print QR error:', e);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <ModalHeader
        title={isHindi ? 'काउंटर क्यूआर कोड' : 'Official Store QR'}
        subtitle={shop.name}
        icon={Store}
        onClose={onClose}
      />
      <ModalBody padding="24px" style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isHindi
            ? 'ग्राहक इस क्यूआर को स्कैन करके आपकी दुकान की लाइव लिस्टिंग व ऑफर्स देख सकते हैं।'
            : 'Shoppers can scan this QR code to browse your live catalog and deals directly.'}
        </p>

        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            marginBottom: '1.25rem',
          }}
        >
          <RealQRCode
            value={shopUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Button
            variant="whatsapp"
            icon={MessageCircle}
            onClick={handleShareWhatsApp}
          >
            {isHindi ? 'व्हाट्सएप शेयर' : 'Share QR'}
          </Button>

          <Button
            variant="secondary"
            icon={Printer}
            onClick={handlePrintStandee}
          >
            {isHindi ? 'प्रिंट स्टैंडी' : 'Print Standee'}
          </Button>
        </div>
      </ModalBody>
    </BaseModal>
  );
};
export default ShopQRModal;
