import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  Layers,
  Tag,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  Navigation,
  Sparkles,
  MessageSquare,
  Send,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { getCategoryEmoji } from '../../utils/categoryMeta';
import { getImageUrl } from '../../utils/imageUrl';
import { productApi } from '../../api/product.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductDetailModal = ({
  product,
  onClose,
  onReserve,
  onAdjustStock,
  isMerchant = false,
}) => {
  if (!product) return null;

  const { user } = useAuth();
  const { t, isHindi } = useLanguage();
  const images = product.images && product.images.length > 0 ? product.images : [];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedSKU, setCopiedSKU] = useState(false);

  // Reserve form state for customers
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveHours, setReserveHours] = useState(4);
  const [reserveNotes, setReserveNotes] = useState('');
  const [reserving, setReserving] = useState(false);

  // Bargain State
  const [showBargainBox, setShowBargainBox] = useState(false);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9));
  const [offerQty, setOfferQty] = useState(1);
  const [offerPhone, setOfferPhone] = useState(user?.phone || '');
  const [offerName, setOfferName] = useState(user?.name || user?.full_name || '');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerResult, setOfferResult] = useState(null);
  const [offerError, setOfferError] = useState('');

  // Notify Me State
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState(user?.phone || '');
  const [notifyLoading, setNotifyLoading] = useState(false);

  // Merchant Adjust Stock State
  const [adjustQty, setAdjustQty] = useState(product.stock_quantity || product.available_quantity || 0);
  const [adjustReason, setAdjustReason] = useState('Restock');
  const [adjustingStock, setAdjustingStock] = useState(false);

  const stock = Number(
    product.available_quantity ??
    product.stock_quantity ??
    product.inventory?.available_quantity ??
    product.inventory?.quantity ??
    product.stock ??
    0
  );
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleCopySKU = () => {
    const sku = product.sku || product.barcode || product.sku_barcode;
    if (!sku) return;
    navigator.clipboard?.writeText(sku);
    setCopiedSKU(true);
    setTimeout(() => setCopiedSKU(false), 2000);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!onReserve) return;
    setReserving(true);
    try {
      await onReserve({
        productId: product.id,
        shopId: product.shop_id,
        quantity: reserveQty,
        pickup_hours: reserveHours,
        notes: reserveNotes,
      });
      onClose();
    } catch (err) {
      console.error('Reservation error:', err);
    } finally {
      setReserving(false);
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setOfferError('');
    if (!offerPhone || offerPhone.trim().length < 10) {
      setOfferError(isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (offerPrice <= 0) {
      setOfferError(isHindi ? 'कृपया वैध मूल्य दर्ज करें।' : 'Please enter a valid price.');
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await productApi.submitDealOffer(product.id, {
        offered_price: Number(offerPrice),
        quantity: Number(offerQty),
        customer_phone: offerPhone.trim(),
        customer_name: offerName.trim() || undefined,
      });
      setOfferResult(res);
    } catch (err) {
      setOfferError(err.response?.data?.message || (isHindi ? 'प्रस्ताव दर्ज करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to submit offer. Please try again.'));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notifyPhone || notifyPhone.trim().length < 10) return;
    setNotifyLoading(true);
    try {
      await productApi.subscribeStockAlert(product.id, {
        phone: notifyPhone.trim(),
      });
      setNotifySubscribed(true);
    } catch (err) {
      console.error('Notify me subscription failed:', err);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    if (!onAdjustStock) return;
    setAdjustingStock(true);
    try {
      await onAdjustStock({
        productId: product.id,
        new_quantity: Number(adjustQty),
        reason: adjustReason,
      });
      onClose();
    } catch (err) {
      console.error('Stock adjust error:', err);
    } finally {
      setAdjustingStock(false);
    }
  };

  const sku = product.sku || product.barcode || product.sku_barcode;
  const brand = product.attributes?.brand || product.brand;
  const category = product.category;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={product.name}>
      <div
        className="modal-content product-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            {brand && <span className="product-card-brand">{brand}</span>}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', width: '36px', height: '36px', flexShrink: 0 }}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Gallery */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--bg-surface-subtle)', marginBottom: '16px', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {images.length > 0 ? (
            <img
              src={getImageUrl(images[selectedImageIdx])}
              alt={product.name}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          ) : (
            <Package size={64} color="var(--text-muted)" style={{ opacity: 0.4 }} />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
            <span className={`product-card-stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              {inStock ? (isLowStock ? t('products.low_stock') : t('products.in_stock')) : t('products.out_of_stock')}
            </span>
            {hasDiscount && (
              <span className="badge badge-success" style={{ fontWeight: 800 }}>
                {discountPct}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Price Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('products.selling_price')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹{product.price}</span>
              {hasDiscount && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  ₹{product.compare_price}
                </span>
              )}
            </div>
          </div>
          {sku && (
            <button
              onClick={handleCopySKU}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              title={isHindi ? 'एसकेयू कॉपी करें' : 'Copy SKU'}
            >
              <Copy size={13} />
              <span>{copiedSKU ? (isHindi ? 'कॉपी हो गया' : 'Copied!') : `SKU: ${sku}`}</span>
            </button>
          )}
        </div>

        {/* Shop Info Badge */}
        {product.shop_name && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{product.shop_name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  {isHindi ? 'काउंटर पिकअप उपलब्ध' : 'Counter Pickup Available'}
                </div>
              </div>
            </div>
            {product.shop_phone && (
              <a href={`tel:${product.shop_phone}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={13} /> {t('common.call_shop')}
              </a>
            )}
          </div>
        )}

        {/* Customer Actions: Reserve vs Bargain vs Out-of-Stock */}
        {!isMerchant && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {inStock ? (
              <>
                {/* Hold/Reserve Box */}
                <form onSubmit={handleReserveSubmit} style={{ border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={16} color="var(--color-primary)" />
                    <span>{t('products.reserve_for_pickup')}</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {isHindi ? 'मात्रा (नग)' : 'Quantity'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={stock}
                        value={reserveQty}
                        onChange={(e) => setReserveQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-input"
                        style={{ marginTop: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {isHindi ? 'पिकअप समय' : 'Pickup Window'}
                      </label>
                      <select
                        value={reserveHours}
                        onChange={(e) => setReserveHours(Number(e.target.value))}
                        className="form-input"
                        style={{ marginTop: '4px' }}
                      >
                        <option value={1}>{isHindi ? '1 घंटे में' : 'Within 1 Hour'}</option>
                        <option value={2}>{isHindi ? '2 घंटे में' : 'Within 2 Hours'}</option>
                        <option value={4}>{isHindi ? '4 घंटे में' : 'Within 4 Hours'}</option>
                        <option value={8}>{isHindi ? 'आज शाम तक' : 'By This Evening'}</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={reserving}
                    className="btn btn-primary"
                    style={{ width: '100%', fontWeight: 800 }}
                  >
                    {reserving ? t('common.processing') : `${t('products.reserve_for_pickup')} (₹${product.price * reserveQty})`}
                  </button>
                </form>

                {/* Algorithmic Bargain / Offer Deal Button */}
                {product.allow_bargain !== false && (
                  <div>
                    {!showBargainBox ? (
                      <button
                        type="button"
                        onClick={() => setShowBargainBox(true)}
                        className="btn btn-secondary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
                      >
                        <Sparkles size={16} color="#f59e0b" />
                        <span>{isHindi ? 'भाव-ताव प्रस्ताव प्रस्तुत करें' : 'Propose Bargain Price'}</span>
                      </button>
                    ) : (
                      <div style={{ border: '1.5px dashed var(--color-primary)', padding: '14px', borderRadius: '12px', background: 'var(--bg-surface-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={15} /> {isHindi ? 'भाव-ताव काउंटर' : 'Bargain Deal'}
                          </span>
                          <button type="button" onClick={() => setShowBargainBox(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={15} />
                          </button>
                        </div>

                        {offerResult ? (
                          <div style={{ padding: '10px', borderRadius: '8px', background: offerResult.status === 'accepted' ? '#ecfdf5' : '#fffbeb', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontWeight: 800, color: offerResult.status === 'accepted' ? '#065f46' : '#92400e', fontSize: '0.9rem' }}>
                              {offerResult.status === 'accepted' ? (isHindi ? 'प्रस्ताव स्वीकार हुआ!' : 'Offer Accepted!') : (isHindi ? 'काउंटर ऑफर प्राप्त हुआ:' : 'Counter Offer Received:')}
                            </div>
                            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                              {offerResult.message || (isHindi ? 'दुकानदार से विशेष छूट प्राप्त हुई है।' : 'Special rate approved.')}
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitOffer} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {offerError && <div style={{ color: 'var(--color-danger)', fontSize: '0.78rem' }}>{offerError}</div>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>{isHindi ? 'प्रस्तावित मूल्य (₹)' : 'Offered Price (₹)'}</label>
                                <input
                                  type="number"
                                  value={offerPrice}
                                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                                  className="form-input"
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>{isHindi ? 'मोबाइल नंबर' : 'Mobile Phone'}</label>
                                <input
                                  type="tel"
                                  value={offerPhone}
                                  onChange={(e) => setOfferPhone(e.target.value)}
                                  placeholder="10-digit phone"
                                  className="form-input"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={submittingOffer}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 800, marginTop: '4px' }}
                            >
                              {submittingOffer ? t('common.processing') : (isHindi ? 'प्रस्ताव जमा करें' : 'Submit Deal Proposal')}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Out of Stock - Notify Me */
              <div style={{ border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '12px', background: 'var(--bg-surface-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Bell size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                    {isHindi ? 'स्टॉक आने पर सूचना पाएं' : 'Notify When Back in Stock'}
                  </span>
                </div>
                {notifySubscribed ? (
                  <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 700 }}>
                    {isHindi ? '✓ स्टॉक उपलब्ध होते ही आपको सूचना भेजी जाएगी।' : '✓ You will be notified as soon as stock arrives.'}
                  </div>
                ) : (
                  <form onSubmit={handleNotifyMe} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="tel"
                      value={notifyPhone}
                      onChange={(e) => setNotifyPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button type="submit" disabled={notifyLoading} className="btn btn-primary btn-sm">
                      {notifyLoading ? t('common.processing') : (isHindi ? 'सूचित करें' : 'Notify Me')}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Merchant Quick Stock Adjustment */}
        {isMerchant && (
          <form onSubmit={handleAdjustStockSubmit} style={{ border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800 }}>
              {isHindi ? 'स्टॉक मात्रा संशोधित करें' : 'Adjust Inventory Stock'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>{isHindi ? 'उपलब्ध स्टॉक' : 'New Quantity'}</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>{isHindi ? 'संशोधन का कारण' : 'Reason'}</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="form-input"
                >
                  <option value="Restock">{isHindi ? 'नया माल आया (Restock)' : 'Restock'}</option>
                  <option value="Damaged">{isHindi ? 'खराब / क्षतिग्रस्त (Damaged)' : 'Damaged / Expired'}</option>
                  <option value="CounterSale">{isHindi ? 'काउंटर पर बिक्री (Direct Sale)' : 'Counter Direct Sale'}</option>
                  <option value="Audit">{isHindi ? 'भौतिक गणना (Stock Audit)' : 'Stock Audit Adjustment'}</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={adjustingStock} className="btn btn-primary" style={{ width: '100%' }}>
              {adjustingStock ? t('common.processing') : t('common.save')}
            </button>
          </form>
        )}

        {/* Product Description & Specs */}
        {product.description && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 6px 0' }}>{t('products.description')}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetailModal;
