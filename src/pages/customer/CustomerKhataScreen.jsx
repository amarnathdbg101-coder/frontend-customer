import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { AppLayout } from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { customerKhataApi } from "../../api/khata.api";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const CustomerKhataScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Passbook modal
  const [selectedKhata, setSelectedKhata] = useState(null);
  const [passbookLoading, setPassbookLoading] = useState(false);
  const [passbookData, setPassbookData] = useState(null);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Dispute Modal
  const [disputeTx, setDisputeTx] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  // UPI Payment Modal
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiAmount, setUpiAmount] = useState("");
  const [upiUtr, setUpiUtr] = useState("");
  const [upiNote, setUpiNote] = useState("");
  const [upiLoading, setUpiLoading] = useState(false);

  // Promise to Pay Modal
  const [showPtpModal, setShowPtpModal] = useState(false);
  const [ptpDate, setPtpDate] = useState("");
  const [ptpNote, setPtpNote] = useState("");
  const [ptpLoading, setPtpLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setError(null);
      const data = await customerKhataApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load khata summary:", err);
      setError(err.response?.data?.message || err.message || "Khata summary load karne me dikkat aayi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const openPassbook = async (shopKhata) => {
    setSelectedKhata(shopKhata);
    setPassbookLoading(true);
    setPassbookData(null);
    try {
      const data = await customerKhataApi.getPassbook(shopKhata.khata_id || shopKhata.id);
      setPassbookData(data);
    } catch (err) {
      console.error("Failed to fetch passbook:", err);
    } finally {
      setPassbookLoading(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeTx || !selectedKhata || !disputeReason.trim()) return;
    setDisputeLoading(true);
    try {
      await customerKhataApi.disputeTransaction(
        selectedKhata.khata_id || selectedKhata.id,
        disputeTx.id,
        disputeReason.trim()
      );
      alert("Aapki aappatti darj kar li gayi hai aur dukaandar ko notify kar diya gaya hai.");
      setDisputeTx(null);
      setDisputeReason("");
      const data = await customerKhataApi.getPassbook(selectedKhata.khata_id || selectedKhata.id);
      setPassbookData(data);
    } catch (err) {
      alert(err.response?.data?.message || "Dispute darj karne me dikkat aayi.");
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKhata || !upiAmount || !upiUtr.trim()) return;
    setUpiLoading(true);
    try {
      await customerKhataApi.submitUPIPayment(
        selectedKhata.khata_id || selectedKhata.id,
        upiAmount,
        upiUtr.trim(),
        upiNote.trim()
      );
      alert("Payment proof submit ho gaya hai! Dukaandar verify karke entry update kar dega.");
      setShowUpiModal(false);
      setUpiAmount("");
      setUpiUtr("");
      setUpiNote("");
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.message || "Payment submit karne me dikkat aayi.");
    } finally {
      setUpiLoading(false);
    }
  };

  const handlePtpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKhata || !ptpDate) return;
    setPtpLoading(true);
    try {
      await customerKhataApi.setPromiseToPay(
        selectedKhata.khata_id || selectedKhata.id,
        ptpDate,
        ptpNote.trim()
      );
      alert("Aapka Promise to Pay dukaandar tak pahuch gaya hai. Shukriya!");
      setShowPtpModal(false);
      setPtpDate("");
      setPtpNote("");
    } catch (err) {
      alert(err.response?.data?.message || "Promise to pay submit karne me dikkat aayi.");
    } finally {
      setPtpLoading(false);
    }
  };

  const filteredShops = (summary?.shops || []).filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.shop_name && s.shop_name.toLowerCase().includes(q)) ||
      (s.shop_phone && s.shop_phone.includes(q)) ||
      (s.shop_address && s.shop_address.toLowerCase().includes(q))
    );
  });

  const totalOutstanding = summary?.total_outstanding || summary?.total_due || 0;
  const shopsCount = summary?.shops?.length || 0;

  return (
    <AppLayout title="Mera Khata (Passbook)" subtitle="Aapke mohalle ke dukan ka udhar & hisab-kitab">
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "80px" }}>
        
        {/* Top Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              Mera Digital Khata 📖
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Aas-paas ki verified dukano par aapka credit hisaab
            </p>
          </div>
          <button
            onClick={() => setShowQrModal(true)}
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "12px" }}
          >
            <QrCode size={18} color="var(--color-primary)" />
            <span style={{ fontWeight: 600 }}>My Khata QR</span>
          </button>
        </div>

        {/* Hero Summary Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            borderRadius: "20px",
            padding: "24px",
            color: "#ffffff",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.85rem", opacity: 0.9, fontWeight: 500, letterSpacing: "0.5px" }}>
                KUL BAAKI UDHAR (TOTAL DUE)
              </span>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, marginTop: "6px" }}>
                ₹{Number(totalOutstanding).toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchSummary();
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                cursor: "pointer",
              }}
              title="Refresh"
            >
              <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>ACTIVE DUKANEIN</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>
                {shopsCount} Dukanein
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>CREDIT SECURITY</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>
                <ShieldCheck size={16} /> OTP Protected
              </div>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <Search
            size={18}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Dukan ka naam ya phone number se khojein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "42px", borderRadius: "12px" }}
          />
        </div>

        {/* Shops List */}
        {loading ? (
          <LoadingSpinner message="Khata book load ho rahi hai..." />
        ) : error ? (
          <div className="card" style={{ padding: "20px", textAlign: "center", color: "var(--color-danger)" }}>
            <AlertCircle size={28} style={{ margin: "0 auto 10px" }} />
            <p>{error}</p>
            <button onClick={fetchSummary} className="btn btn-primary" style={{ marginTop: "12px" }}>
              Dobara Try Karein
            </button>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="card" style={{ padding: "40px 20px", textAlign: "center", borderRadius: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <BookOpen size={28} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)" }}>
              Koi Udhar Entry Nahi Hai!
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "360px", margin: "0 auto 20px" }}>
              Aapka kisi bhi dukan par koi purana baki nahi hai ya dukaandar ne abhi tak khata link nahi kiya hai.
            </p>
            <button onClick={() => setShowQrModal(true)} className="btn btn-primary">
              Show My Khata QR
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredShops.map((s) => {
              const due = Number(s.current_balance || s.outstanding_balance || 0);
              return (
                <div
                  key={s.khata_id || s.id}
                  className="card"
                  style={{
                    padding: "16px 20px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.2s",
                    border: "1px solid var(--border-color, #e2e8f0)",
                  }}
                  onClick={() => openPassbook(s)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: due > 0 ? "rgba(220, 38, 38, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: due > 0 ? "#dc2626" : "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Store size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {s.shop_name}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        <Phone size={12} />
                        <span>{s.shop_phone}</span>
                      </div>
                      {s.last_transaction_at && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                          Aakhri Entry: {new Date(s.last_transaction_at).toLocaleDateString("hi-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>BAAKI RASHI</span>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: due > 0 ? "#dc2626" : "#10b981" }}>
                      ₹{due.toFixed(2)}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", marginTop: "4px" }}>
                      Passbook <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PASSBOOK MODAL */}
        {selectedKhata && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
            onClick={() => setSelectedKhata(null)}
          >
            <div
              style={{
                background: "var(--bg-surface, #ffffff)",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "88vh",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -10px 25px rgba(0,0,0,0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Passbook Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {selectedKhata.shop_name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <span>{selectedKhata.shop_phone}</span>
                    {selectedKhata.shop_phone && (
                      <a
                        href={`https://wa.me/91${selectedKhata.shop_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKhata(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Action Buttons: Pay UPI / Promise / PDF */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                <button
                  onClick={() => setShowUpiModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: "0.8rem", padding: "8px", borderRadius: "10px" }}
                >
                  <IndianRupee size={14} /> Pay via UPI
                </button>
                <button
                  onClick={() => setShowPtpModal(true)}
                  className="btn btn-outline"
                  style={{ fontSize: "0.8rem", padding: "8px", borderRadius: "10px" }}
                >
                  <Calendar size={14} /> Promise Date
                </button>
                <a
                  href={customerKhataApi.getStatementPdfUrl(selectedKhata.khata_id || selectedKhata.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ fontSize: "0.8rem", padding: "8px", borderRadius: "10px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                >
                  <FileText size={14} /> PDF Slip
                </a>
              </div>

              {/* Transactions List */}
              <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Len-Den Ki Passbook History
              </h4>

              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                {passbookLoading ? (
                  <LoadingSpinner message="Transactions load ho rahe hain..." />
                ) : !passbookData?.transactions || passbookData.transactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                    Abhi tak koi entry darj nahi hui hai.
                  </div>
                ) : (
                  passbookData.transactions.map((tx) => {
                    const isCredit = tx.transaction_type === "credit" || tx.type === "credit";
                    const isDisputed = tx.status === "disputed";
                    return (
                      <div
                        key={tx.id}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "var(--bg-secondary, #f8fafc)",
                          border: isDisputed ? "1px solid #f59e0b" : "1px solid var(--border-color, #e2e8f0)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: isCredit ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)",
                              color: isCredit ? "#dc2626" : "#10b981",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                              {isCredit ? "Saman Udhar Liya" : "Rashi Jama Ki (Paid)"}
                            </span>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                              {tx.description || tx.items_summary || (isCredit ? "Counter Purchase" : "Cash/UPI Settlement")}
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              {new Date(tx.created_at).toLocaleDateString("hi-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1rem", fontWeight: 800, color: isCredit ? "#dc2626" : "#10b981" }}>
                            {isCredit ? "+" : "-"}₹{Number(tx.amount).toFixed(2)}
                          </div>
                          {isDisputed ? (
                            <span style={{ fontSize: "0.7rem", color: "#d97706", fontWeight: 700 }}>Disputed ⏳</span>
                          ) : (
                            <button
                              onClick={() => setDisputeTx(tx)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                color: "var(--text-muted)",
                                fontSize: "0.7rem",
                                textDecoration: "underline",
                                cursor: "pointer",
                                marginTop: "2px",
                              }}
                            >
                              Galat Entry?
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER QR MODAL */}
        {showQrModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: "380px", width: "100%", padding: "28px 20px", textAlign: "center", borderRadius: "20px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Mera Khata Passbook QR</h3>
                <button onClick={() => setShowQrModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                Dukaandar ko counter billing ke waqt ye QR scan karne ko kahein
              </p>

              <div style={{ padding: "16px", background: "#ffffff", borderRadius: "16px", display: "inline-block", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=shopsilo:customer:${encodeURIComponent(user?.phone || user?.email || user?.id || "")}`}
                  alt="Customer Khata QR"
                  style={{ width: "200px", height: "200px", display: "block" }}
                />
              </div>

              <div style={{ marginTop: "16px", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {user?.full_name || user?.name || "Verified Customer"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Phone: {user?.phone || "Registered Account"}
              </div>
            </div>
          </div>
        )}

        {/* DISPUTE MODAL */}
        {disputeTx && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setDisputeTx(null)}
          >
            <div
              className="card"
              style={{ maxWidth: "420px", width: "100%", padding: "24px", borderRadius: "20px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 800, color: "#dc2626" }}>
                Galat Entry Par Aappatti (Dispute)
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Rashi: <strong>₹{Number(disputeTx.amount).toFixed(2)}</strong> ({new Date(disputeTx.created_at).toLocaleDateString("hi-IN")})
              </p>
              <form onSubmit={handleDisputeSubmit}>
                <div className="form-group">
                  <label className="form-label">Aappatti ka karan likhein:</label>
                  <textarea
                    required
                    className="form-input"
                    rows={3}
                    placeholder="Jaise: Maine ye saman nahi liya / paise de diye the par entry nahi hui..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button type="button" onClick={() => setDisputeTx(null)} className="btn btn-outline" style={{ flex: 1 }}>
                    Radd Karein
                  </button>
                  <button type="submit" disabled={disputeLoading} className="btn btn-danger" style={{ flex: 1 }}>
                    {disputeLoading ? "Submitting..." : "Dispute Bhejein"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* UPI SETTLEMENT MODAL */}
        {showUpiModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowUpiModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: "440px", width: "100%", padding: "24px", borderRadius: "20px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 800 }}>
                UPI Payment Proof Jama Karein
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Dukan: <strong>{selectedKhata?.shop_name}</strong>
              </p>
              <form onSubmit={handleUpiSubmit}>
                <div className="form-group">
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    placeholder="500"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">UPI UTR / Ref Number (12 Digits)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Jaise: 328492019482"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Extra Note (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="GPay / PhonePe se transfer kiya"
                    value={upiNote}
                    onChange={(e) => setUpiNote(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="button" onClick={() => setShowUpiModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={upiLoading} className="btn btn-primary" style={{ flex: 1 }}>
                    {upiLoading ? "Submitting..." : "Proof Bhejein"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PROMISE TO PAY MODAL */}
        {showPtpModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setShowPtpModal(false)}
          >
            <div
              className="card"
              style={{ maxWidth: "420px", width: "100%", padding: "24px", borderRadius: "20px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 800 }}>
                Promise To Pay (Bhugtan Ka Wada)
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Dukaandar ko bataiye ki aap baki rashi kis din tak chuka denge
              </p>
              <form onSubmit={handlePtpSubmit}>
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={ptpDate}
                    onChange={(e) => setPtpDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Note (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Salary aane par dedunga..."
                    value={ptpNote}
                    onChange={(e) => setPtpNote(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="button" onClick={() => setShowPtpModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={ptpLoading} className="btn btn-primary" style={{ flex: 1 }}>
                    {ptpLoading ? "Saving..." : "Promise Save Karein"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};
