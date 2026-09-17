import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  ScanBarcode,
  Sparkles,
  Search,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { productApi } from '../../api/product.api';
import { aiApi } from '../../api/ai.api';
import { formatCurrency } from '../../utils/format';

export const ProductScannerModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'barcode'
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setErrorMsg('');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraActive(false);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, startCamera, stopCamera]);

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleCaptureAndAnalyze = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg('');
      setScanResult(null);

      const base64Data = captureFrame();
      if (!base64Data) {
        throw new Error('Camera frame capture nahi ho paya');
      }

      const res = await aiApi.scanProduct(base64Data);
      if (!res || (!res.name && !res.product_name && !res.product)) {
        throw new Error('Product identify nahi ho paya. Kripya dukan ke barcode ya clear photo se dobara koshish karein.');
      }

      setScanResult({
        type: 'ai',
        name: res.name || res.product_name || res.product?.name,
        brand: res.brand || res.product?.brand || '',
        category: res.category || res.product?.category_name || '',
        description: res.description || res.summary || '',
        price: res.estimated_price || res.price || res.product?.price || 0,
        raw: res,
      });
    } catch (err) {
      setErrorMsg(err.message || 'AI scanning me dikkat aayi. Barcode code se dhundhein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsProcessing(true);
        setErrorMsg('');
        setScanResult(null);

        const base64Data = reader.result;
        const res = await aiApi.scanProduct(base64Data);
        if (!res || (!res.name && !res.product_name && !res.product)) {
          throw new Error('Photo se product pehchana nahi ja saka.');
        }

        setScanResult({
          type: 'ai',
          name: res.name || res.product_name || res.product?.name,
          brand: res.brand || res.product?.brand || '',
          category: res.category || res.product?.category_name || '',
          description: res.description || res.summary || '',
          price: res.estimated_price || res.price || res.product?.price || 0,
          raw: res,
        });
      } catch (err) {
        setErrorMsg(err.message || 'AI photo analysis fail ho gaya');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBarcodeSearch = async (e) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) {
      setErrorMsg('Kripya Barcode ya SKU number likhein');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setScanResult(null);

      const res = await productApi.scanProduct(code);
      const product = res.data?.product || res.product || res.data || res;

      if (!product || !product.id) {
        throw new Error(`Barcode "${code}" se koi product match nahi hua.`);
      }

      setScanResult({
        type: 'exact',
        product,
        name: product.name,
        brand: product.brand,
        price: product.price,
        stock: product.stock_quantity ?? product.stock ?? product.available_quantity ?? 0,
        category: product.category_name,
        raw: product,
      });
    } catch (err) {
      setErrorMsg(err.message || `Barcode '${code}' se product nahi mila`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelect = () => {
    if (scanResult?.product && onSelectProduct) {
      onSelectProduct(scanResult.product);
    }
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setBarcodeInput('');
    setErrorMsg('');
    setScanResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ScanBarcode size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Scan & Check Price
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                AI Camera Photo ya Barcode/SKU se dukan ka item dhundhein
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', padding: '12px 20px 0 20px', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: activeTab === 'camera' ? 'var(--color-primary)' : 'var(--border-subtle)',
              backgroundColor: activeTab === 'camera' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === 'camera' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
            }}
          >
            <Camera size={16} />
            <span>AI Visual Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: activeTab === 'barcode' ? 'var(--color-primary)' : 'var(--border-subtle)',
              backgroundColor: activeTab === 'barcode' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === 'barcode' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
            }}
          >
            <ScanBarcode size={16} />
            <span>Barcode / SKU Code</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '16px 20px' }}>
          {activeTab === 'camera' && (
            <div>
              {cameraActive ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Scanner overlay target frame */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '180px',
                      height: '140px',
                      border: '2px dashed #6366f1',
                      borderRadius: '12px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px 16px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-surface-subtle)',
                  }}
                >
                  <Camera size={42} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Camera access uplabdh nahi hai
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Aap live camera chalu karein ya gallery se photo upload karein
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <RefreshCw size={14} /> Retry Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <Upload size={14} /> Photo Upload Karein
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons for Camera */}
              {cameraActive && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={handleCaptureAndAnalyze}
                    disabled={isProcessing}
                    className="btn btn-primary btn-block"
                    style={{ gap: '8px', fontWeight: 800 }}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>AI Analyze Kar Raha Hai...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Photo Capture & Check Price</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                    title="Upload image"
                    style={{ padding: '0 14px' }}
                  >
                    <Upload size={18} />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}

          {activeTab === 'barcode' && (
            <form onSubmit={handleBarcodeSearch}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter barcode or SKU (e.g. E-EMC, 8901030...)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isProcessing || !barcodeInput.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0 18px', fontWeight: 700 }}
                >
                  {isProcessing ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Tip: Product box ya packet par chhape barcode ke niche ka number daalein.
              </div>
            </form>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--color-danger)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Scan Result Card */}
          {scanResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} color="var(--color-success)" />
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {scanResult.name}
                </div>
              </div>

              {scanResult.brand && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Brand: <strong>{scanResult.brand}</strong> {scanResult.category ? `• ${scanResult.category}` : ''}
                </div>
              )}

              {scanResult.description && (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {scanResult.description}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Price</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    {formatCurrency(scanResult.price)}
                  </div>
                </div>

                {scanResult.product ? (
                  <button
                    type="button"
                    onClick={handleSelect}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px', fontWeight: 700 }}
                  >
                    <span>View / Reserve Item</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    AI detected item
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
