import { printKhataStatement } from '../../utils/pdfGenerator';
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
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { customerKhataApi } from '../../api/khata.api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUrl';
import { RealQRCode } from '../../components/common/RealQRCode';

export const CustomerKhataScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Passbook modal
  const [selectedKhata, setSelectedKhata] = useState(null);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [passbookData, setPassbookData] = useState(null);

  // My Khata QR Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Parchi / Receipt Photo Viewer Modal
  const [viewParchiUrl, setViewParchiUrl] = useState(null);

  // Dispute Modal
  const [disputeTx, setDisputeTx] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  // UPI Payment Modal
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiAmount, setUpiAmount] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [upiNote, setUpiNote] = useState('');
  const [upiLoading, setUpiLoading] = useState(false);

  // Promise to Pay Modal
  const [showPtpModal, setShowPtpModal] = useState(false);
  const [ptpDate, setPtpDate] = useState('');
  const [ptpNote, setPtpNote] = useState('');
  const [ptpLoading, setPtpLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setError(null);
      const data = await customerKhataApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load khata summary:', err);
      setError(err.response?.data?.message || err.message || 'Khata summary load karne me dikkat aayi.');
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
      const data = await customerKhataApi.getPassbook(khata.id);
      setPassbookData(data);
    } catch (err) {
      console.error('Failed to load passbook:', err);
      alert('Passbook load karne me error: ' + (err.message || 'Network error'));
    } finally {
      setPassbookLoading(false);
    }
  };

  const handleOpenUpiModal = (khata) => {
    setSelectedKhata(khata);
    setUpiAmount(String(khata.current_balance || khata.balance || ''));
    setUpiUtr('');
    setUpiNote('');
    setShowUpiModal(true);
  };

  const handleOpenPtpModal = (khata) => {
    setSelectedKhata(khata);
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    setPtpDate(in3Days.toISOString().split('T')[0]);
    setPtpNote('');
    setShowPtpModal(true);
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    try {
      setDisputeLoading(true);
      await customerKhataApi.disputeTransaction(selectedKhata.id, disputeTx.id, disputeReason);
      alert('Dispute safaltapoorvak bhej diya gaya hai. Dukaandaar iska samadhan karenge.');
      setDisputeTx(null);
      setDisputeReason('');
      // Reload passbook
      openPassbook(selectedKhata);
    } catch (err) {
      alert('Dispute bhejne me error: ' + (err.response?.data?.message || err.message));
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleUpiPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!upiAmount || Number(upiAmount) <= 0) {
      alert('Valid payment amount likhein');
      return;
    }
    const cleanUtr = upiUtr.trim();
    if (cleanUtr.length < 6) {
      alert('Kripya valid 12-digit UPI Reference / UTR Number daalein');
      return;
    }

    try {
      setUpiLoading(true);
      await customerKhataApi.submitUPIPayment(selectedKhata.id, upiAmount, cleanUtr, upiNote);
      alert('UPI payment proof safaltapoorvak submit ho gaya hai!');
      setShowUpiModal(false);
      setUpiUtr('');
      setUpiNote('');
      fetchSummary();
      if (selectedKhata) openPassbook(selectedKhata);
    } catch (err) {
      alert('Payment proof submit karne me error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpiLoading(false);
    }
  };

  const handlePtpSubmit = async (e) => {
    e.preventDefault();
    if (!ptpDate) {
      alert('Promise date chunein');
      return;
    }

    try {
      setPtpLoading(true);
      await customerKhataApi.setPromiseToPay(selectedKhata.id, ptpDate, ptpNote);
      alert('Promise to Pay date set ho gayi hai. Dukaandaar ko notify kar diya gaya hai.');
      setShowPtpModal(false);
      fetchSummary();
    } catch (err) {
      alert('Promise date set karne me error: ' + (err.response?.data?.message || err.message));
    } finally {
      setPtpLoading(false);
    }
  };

  // Filtered accounts
  const accounts = summary?.accounts || summary?.khatas || [];
  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const name = (acc.shop_name || acc.shop?.name || '').toLowerCase();
    const phone = (acc.shop_phone || acc.shop?.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const totalOutstanding = summary?.total_outstanding ?? summary?.total_balance ?? 0;

  // Generate UPI URI for selected shop using real shop upi_id
  const getShopUpiUri = () => {
    if (!selectedKhata) return '';
    const shopVpa = (
      selectedKhata.shop_upi_id ||
      selectedKhata.shop?.upi_id ||
      selectedKhata.shop_vpa ||
      selectedKhata.shop?.vpa ||
      selectedKhata.shop_upi ||
      ''
    ).trim();
    if (!shopVpa) return '';
    const shopName = selectedKhata.shop_name || selectedKhata.shop?.name || 'Shop';
    const amt = upiAmount || selectedKhata.current_balance || 0;
    return `upi://pay?pa=${encodeURIComponent(shopVpa)}&pn=${encodeURIComponent(shopName)}&am=${amt}&cu=INR&tn=${encodeURIComponent(`Khata_${user?.phone || 'Payment'}`)}`;
  };

  if (loading) {
    return (
      <AppLayout title="Mera Khata">
        <LoadingSpinner message="Khata aur Udhar Passbook load ho raha hai..." fullScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mera Khata (Passbook)" subtitle="Aapke Udhar aur Jama Ka Hisaab">
      <title>Mera Khata & Udhar Passbook — ShopSilo</title>

      {/* Top Banner & Summary Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          padding: '22px 20px',
          marginBottom: '16px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kul Baki Udhar (Total Payable)
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.5px' }}>
              ₹{Number(totalOutstanding).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '4px' }}>
              {accounts.length} {accounts.length === 1 ? 'dukan' : 'dukano'} par aapka khata chalu hai
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontWeight: 700,
                gap: '6px',
                backdropFilter: 'blur(4px)',
              }}
              title="Show my personal khata QR code to shopkeeper"
            >
              <QrCode size={16} />
              <span>My Khata QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchSummary();
              }}
              disabled={refreshing}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0 10px',
              }}
              title="Refresh balances"
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      {accounts.length > 2 && (
        <div className="search-box" style={{ marginBottom: '14px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="search"
            placeholder="Dukan ka naam ya phone number se filter karein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Shop Khata Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAccounts.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Koi Khata Record Nahi Mila
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '380px', margin: '4px auto 0 auto' }}>
              Aap jab kisi dukan par udhar saman lete hain, to aapka digital hisaab yahan live dikhayi deta hai.
            </div>
          </div>
        ) : (
          filteredAccounts.map((acc) => {
            const balance = Number(acc.current_balance ?? acc.balance ?? 0);
            const shopName = acc.shop_name || acc.shop?.name || 'Local Dukan';
            const shopPhone = acc.shop_phone || acc.shop?.phone || '';
            const promiseDate = acc.promise_to_pay_date;

            return (
              <div
                key={acc.id}
                className="card"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Header: Shop Info & Balance */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.2) 100%)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={22} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {shopName}
                      </div>
                      {shopPhone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={12} />
                          <span>{shopPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>BAKI UDHAR</div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: balance > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                      }}
                    >
                      ₹{balance.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Promise Date Badge (if any) */}
                {promiseDate && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Calendar size={13} />
                    <span>Aapne <strong>{new Date(promiseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> tak payment ka vada kiya hai</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openPassbook(acc)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, minWidth: '110px', gap: '5px', fontWeight: 700, fontSize: '0.78rem' }}
                  >
                    <BookOpen size={14} />
                    <span>Passbook Dekhein</span>
                  </button>

                  {balance > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenUpiModal(acc)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, minWidth: '100px', gap: '5px', fontWeight: 800, fontSize: '0.78rem' }}
                      >
                        <QrCode size={14} />
                        <span>UPI Pay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPtpModal(acc)}
                        className="btn btn-outline btn-sm"
                        style={{ gap: '5px', fontSize: '0.76rem' }}
                        title="Set promise to pay date"
                      >
                        <Calendar size={13} />
                        <span>Promise Date</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL 1: PASSBOOK LEDGER ================= */}
      {selectedKhata && (
        <div className="modal-backdrop" onClick={() => setSelectedKhata(null)}>
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="sheet-handle" />

            {/* Passbook Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {selectedKhata.shop_name || selectedKhata.shop?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Digital Khata Statement • Live Passbook
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NET BALANCE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-danger)' }}>
                  ₹{Number(selectedKhata.current_balance || selectedKhata.balance || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Passbook Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0' }}>
              {passbookLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px auto', color: 'var(--color-primary)' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Passbook load ho rahi hai...</div>
                </div>
              ) : !passbookData?.transactions || passbookData.transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                  <FileText size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.85rem' }}>Is khate me abhi koi transaction nahi hai.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {passbookData.transactions.map((tx) => {
                    const isCredit = tx.type === 'GIVE_CREDIT' || tx.type === 'credit';
                    const isDisputed = tx.status === 'DISPUTED';

                    return (
                      <div
                        key={tx.id}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: isDisputed ? '1px dashed var(--color-danger)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isCredit ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                color: isCredit ? 'var(--color-danger)' : 'var(--color-success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isCredit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                {isCredit ? 'उधार लिया (Udhar Taken)' : 'उधार वापस किया (Payment Paid)'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: '1rem',
                                color: isCredit ? 'var(--color-danger)' : 'var(--color-success)',
                              }}
                            >
                              {isCredit ? '-' : '+'}₹{Number(tx.amount).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Bal: ₹{tx.balance_after}
                            </div>
                          </div>
                        </div>

                        {/* Notes / Details */}
                        {tx.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '36px' }}>
                            Note: {tx.notes}
                          </div>
                        )}

                        {/* Parchi Photo Link & Dispute trigger */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingLeft: '36px', fontSize: '0.74rem' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {tx.parchi_image_url && (
                              <button
                                type="button"
                                onClick={() => setViewParchiUrl(getImageUrl(tx.parchi_image_url))}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-primary)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <ImageIcon size={12} />
                                <span>View Bill Slip</span>
                              </button>
                            )}
                            {tx.bill_number && (
                              <span style={{ color: 'var(--text-muted)' }}>Bill #{tx.bill_number}</span>
                            )}
                          </div>

                          {/* Dispute Button */}
                          {isCredit && !isDisputed && (
                            <button
                              type="button"
                              onClick={() => {
                                setDisputeTx(tx);
                                setDisputeReason('');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                padding: 0,
                              }}
                              title="Dispute if this amount is wrong"
                            >
                              Dispute?
                            </button>
                          )}

                          {isDisputed && (
                            <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.72rem' }}>
                              ⚠️ Disputed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Passbook Footer Actions */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedKhata(null)}
                className="btn btn-secondary btn-block"
              >
                Band Karein
              </button>
              {Number(selectedKhata.current_balance || selectedKhata.balance || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenUpiModal(selectedKhata);
                  }}
                  className="btn btn-primary btn-block"
                  style={{ gap: '6px', fontWeight: 800 }}
                >
                  <QrCode size={16} />
                  <span>UPI Payment Karein</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: DYNAMIC UPI PAYMENT & QR ================= */}
      {showUpiModal && selectedKhata && (
        <div className="modal-backdrop" onClick={() => setShowUpiModal(false)}>
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="sheet-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  Pay via UPI
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  To: <strong>{selectedKhata.shop_name || selectedKhata.shop?.name}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Dynamic UPI QR Code Preview */}
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}
            >
              {(() => {
                const shopVpa = (
                  selectedKhata.shop_upi_id ||
                  selectedKhata.shop?.upi_id ||
                  selectedKhata.shop_vpa ||
                  selectedKhata.shop?.vpa ||
                  selectedKhata.shop_upi ||
                  ''
                ).trim();
                const upiUri = getShopUpiUri();

                if (!shopVpa) {
                  return (
                    <div style={{ padding: '14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.82rem', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, marginBottom: '4px' }}>⚠️ Dukaandaar ne direct UPI ID set nahi ki hai</div>
                      <div>Dukan par direct payment karne ke baad, payment screenshot se 12-digit UTR Ref Number niche daal kar proof submit karein.</div>
                    </div>
                  );
                }

                return (
                  <>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                      SCAN WITH ANY UPI APP (GPay / PhonePe / Paytm / BHIM)
                    </div>
                    <RealQRCode value={upiUri} size={180} logoText="UPI" showDownload={true} downloadFilename={"upi-pay-" + (selectedKhata?.shop_name || "store")} />

                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>UPI ID:</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{shopVpa}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(shopVpa);
                          alert(`UPI ID copy ho gayi: ${shopVpa}`);
                        }}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    {/* Direct UPI App Intent Trigger on Mobile */}
                    <a
                      href={upiUri}
                      className="btn btn-success btn-block"
                      style={{ marginTop: '12px', gap: '6px', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ExternalLink size={16} />
                      <span>Open in UPI App (GPay/PhonePe/Paytm)</span>
                    </a>
                  </>
                );
              })()}
            </div>

            {/* Submit UTR / Reference Form */}
            <form onSubmit={handleUpiPaymentSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  value={upiAmount}
                  onChange={(e) => setUpiAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  12-Digit UPI UTR / Ref No. (Payment ke baad screenshot me se daalein)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 423589123456"
                  className="form-input"
                  value={upiUtr}
                  onChange={(e) => setUpiUtr(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Optional Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPay se ₹500 bheje"
                  className="form-input"
                  value={upiNote}
                  onChange={(e) => setUpiNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  type="submit"
                  disabled={upiLoading || !upiUtr.trim()}
                  className="btn btn-primary btn-block"
                  style={{ fontWeight: 800 }}
                >
                  {upiLoading ? 'Proof Submit Ho Raha Hai...' : 'Payment Proof Submit Karein'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PROMISE TO PAY ================= */}
      {showPtpModal && selectedKhata && (
        <div className="modal-backdrop" onClick={() => setShowPtpModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
              Promise to Pay (Bhugtan Ka Vada)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Dukaandaar ko batayein ki aap kab tak hisaab chukta kar denge. Isse dukaandaar ka bharosa bana rahta hai.
            </p>

            {/* Quick Preset Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                { label: '3 Din Me', days: 3 },
                { label: '1 Hafte Me', days: 7 },
                { label: '15 Din Me', days: 15 },
                { label: 'Agle Mahine 1 Ko', days: 30 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + p.days);
                    setPtpDate(d.toISOString().split('T')[0]);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <form onSubmit={handlePtpSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Promise Date
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={ptpDate}
                  onChange={(e) => setPtpDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Message for Dukaandar (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salary aate hi 1 tareekh ko de dunga"
                  className="form-input"
                  value={ptpNote}
                  onChange={(e) => setPtpNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="submit"
                  disabled={ptpLoading}
                  className="btn btn-primary btn-block"
                  style={{ fontWeight: 800 }}
                >
                  {ptpLoading ? 'Save Ho Raha Hai...' : 'Promise Date Confirm Karein'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPtpModal(false)}
                  className="btn btn-secondary"
                >
                  Radd
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DISPUTE TRANSACTION ================= */}
      {disputeTx && (
        <div className="modal-backdrop" onClick={() => setDisputeTx(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', color: 'var(--color-danger)' }}>
              Transaction Dispute Karein
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Amount: <strong>₹{disputeTx.amount}</strong> ({new Date(disputeTx.created_at).toLocaleDateString('en-IN')})
            </p>

            {/* Quick Reason Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {[
                'Saman wapas kar diya tha',
                'Galat amount likha hai',
                'Pehle hi cash me de chuka hoon',
                'Maine yeh saman nahi liya',
              ].map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDisputeReason(r)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleDisputeSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Karan / Reason
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Karan likhein taaki dukaandaar check karke hisaab theek karein..."
                  className="form-input"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="submit"
                  disabled={disputeLoading || !disputeReason.trim()}
                  className="btn btn-danger btn-block"
                  style={{ fontWeight: 800 }}
                >
                  {disputeLoading ? 'Dispute Bhej Rahe Hain...' : 'Dispute Submit Karein'}
                </button>
                <button
                  type="button"
                  onClick={() => setDisputeTx(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: MY KHATA QR ================= */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div
            className="bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', padding: '24px 20px' }}
          >
            <div className="sheet-handle" />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
              }}
            >
              <QrCode size={26} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Mera Khata QR Code
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Dukan ke counter par yeh QR scan karwayein
            </p>

            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '16px',
                display: 'inline-block',
                margin: '16px auto',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              }}
            >
              <RealQRCode value={"SHOPSILO-CUSTOMER-KHATA:" + (user?.phone || user?.id || "")} size={200} logoText="KHATA" showDownload={true} downloadFilename={"my-khata-qr-" + (user?.phone || "")} />
            </div>

            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {user?.name || user?.full_name || 'Grahak'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.phone || 'Phone verified'}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="btn btn-secondary btn-block"
              style={{ marginTop: '20px' }}
            >
              Band Karein
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: BILL / PARCHI PHOTO PREVIEW ================= */}
      {viewParchiUrl && (
        <div className="modal-backdrop" onClick={() => setViewParchiUrl(null)}>
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              backgroundColor: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewParchiUrl(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
            <img
              src={viewParchiUrl}
              alt="Physical Parchi Slip"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
};
