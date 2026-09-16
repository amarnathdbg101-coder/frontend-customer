import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Store,
  Phone,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  IndianRupee,
  ShieldCheck,
  X,
  Search,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Download,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { customerKhataApi } from '../../api/khata.api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CustomerKhataQRModal } from '../../components/customer/CustomerKhataQRModal';
import { CreditOTPProtectionModal } from '../../components/customer/CreditOTPProtectionModal';
import { getImageUrl } from '../../utils/imageUrl';

export const CustomerKhataScreen = () => {
  const { user } = useAuth();
  const { t, isHindi } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedKhata, setSelectedKhata] = useState(null);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [passbookData, setPassbookData] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [viewParchiUrl, setViewParchiUrl] = useState(null);

  const fetchSummary = async () => {
    try {
      setError(null);
      const res = await customerKhataApi.getMyKhataSummary();
      setSummary(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || (isHindi ? 'खाता विवरण लोड करने में त्रुटि' : 'Failed to load khata summary'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const openPassbook = async (khata) => {
    setSelectedKhata(khata);
    setPassbookLoading(true);
    setPassbookData(null);
    try {
      const res = await customerKhataApi.getShopPassbook(khata.shop_id);
      setPassbookData(res?.data || res);
    } catch (err) {
      alert(err.response?.data?.message || (isHindi ? 'पासबुक लोड करने में त्रुटि' : 'Failed to load passbook'));
    } finally {
      setPassbookLoading(false);
    }
  };

  const netBalance = Number(summary?.net_balance || summary?.total_due || 0);
  const activeKhatas = summary?.khatas || summary?.shops || [];

  const filteredKhatas = activeKhatas.filter((k) =>
    (k.shop_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (k.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title={t('nav.khata')} subtitle={isHindi ? 'डिजिटल पासबुक एवं उधारी बहीखाता' : 'Digital ledger and outstanding credit'}>
      {/* Top Banner Card */}
      <div style={{ backgroundColor: 'var(--bg-card, var(--bg-surface))', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t('khata.total_balance')}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: netBalance > 0 ? '#ef4444' : '#10b981', marginTop: '2px' }}>
              ₹{Math.abs(netBalance).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '6px', color: 'var(--text-secondary)' }}>
                {netBalance > 0 ? (isHindi ? '(देय)' : '(Due)') : (isHindi ? '(खाता चुकता)' : '(Settled)')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowQrModal(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <QrCode size={16} />
              <span>{isHindi ? 'मेरा क्यूआर' : 'Khata QR'}</span>
            </button>
            <button onClick={() => setShowOtpModal(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--color-primary)" />
              <span>{isHindi ? 'ओटीपी सुरक्षा' : 'OTP Security'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Store Ledger Search */}
      <div style={{ marginBottom: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={isHindi ? 'दुकान के नाम से खोजें...' : 'Search store ledgers...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Khatas List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '10px' }}>{t('common.loading')}</p>
        </div>
      ) : filteredKhatas.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '16px' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.4 }} />
          <h4 style={{ margin: '12px 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {t('khata.no_khata_records')}
          </h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredKhatas.map((khata) => {
            const bal = Number(khata.balance || khata.due_amount || 0);
            return (
              <div
                key={khata.id || khata.shop_id}
                onClick={() => openPassbook(khata)}
                style={{
                  backgroundColor: 'var(--bg-card, var(--bg-surface))',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={22} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {khata.shop_name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {khata.owner_name || (isHindi ? 'प्रमाणित दुकानदार' : 'Verified Merchant')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: bal > 0 ? '#ef4444' : '#10b981' }}>
                    ₹{Math.abs(bal).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {bal > 0 ? (isHindi ? 'बाकी उधार' : 'Due') : (isHindi ? 'चुकता' : 'Settled')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passbook Drawer / Modal */}
      {selectedKhata && (
        <div className="modal-backdrop" onClick={() => setSelectedKhata(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {selectedKhata.shop_name} - {isHindi ? 'खाता बही' : 'Passbook'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {t('khata.running_balance', { balance: Math.abs(Number(selectedKhata.balance || 0)) })}
                </div>
              </div>
              <button onClick={() => setSelectedKhata(null)} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {passbookLoading ? (
              <div style={{ padding: '30px', textAlign: 'center' }}><LoadingSpinner /></div>
            ) : passbookData?.transactions?.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                {t('khata.no_khata_records')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(passbookData?.transactions || []).map((tx) => {
                  const isDebit = tx.type === 'debit' || tx.transaction_type === 'give_credit';
                  return (
                    <div
                      key={tx.id}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isDebit ? (
                          <ArrowDownLeft size={20} color="#ef4444" />
                        ) : (
                          <ArrowUpRight size={20} color="#10b981" />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                            {isDebit ? t('khata.credit_given') : t('khata.payment_made')}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {tx.notes || tx.description || (isHindi ? 'बिल लेन-देन' : 'Bill Entry')} • {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isDebit ? '#ef4444' : '#10b981' }}>
                        {isDebit ? '+ ' : '- '}₹{tx.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Khata QR Modal */}
      {showQrModal && (
        <CustomerKhataQRModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Credit OTP Protection Modal */}
      {showOtpModal && (
        <CreditOTPProtectionModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </AppLayout>
  );
};
export default CustomerKhataScreen;
