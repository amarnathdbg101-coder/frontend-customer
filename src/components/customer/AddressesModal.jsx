import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';
import { AddAddressForm } from './AddAddressForm';

export const AddressesModal = ({ isOpen, onClose, onSelectAddress }) => {
  const { isHindi, t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const addresses = user?.addresses || [];
  const defaultAddressId = user?.default_address_id;

  const handleSelect = (addr) => {
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    onClose();
  };

  const handleDelete = (addrId, e) => {
    e.stopPropagation();
    const updated = addresses.filter(a => a.id !== addrId);
    updateUser({ addresses: updated });
  };

  const handleSetDefault = (addrId, e) => {
    e.stopPropagation();
    updateUser({ default_address_id: addrId });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="500px">
      <ModalHeader
        title={showAddForm ? (isHindi ? 'नया पता जोड़ें' : 'Add New Address') : (isHindi ? 'मेरे सुरक्षित पते' : 'Saved Addresses')}
        subtitle={showAddForm ? (isHindi ? 'डिलीवरी और पिकअप के लिए' : 'For delivery & reservations') : `${addresses.length} ${isHindi ? 'पते सुरक्षित हैं' : 'saved'}`}
        icon={MapPin}
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {showAddForm ? (
          <AddAddressForm
            onCancel={() => setShowAddForm(false)}
            onSaved={(newAddr) => {
              const updated = [...addresses, newAddr];
              updateUser({
                addresses: updated,
                default_address_id: addresses.length === 0 ? newAddr.id : defaultAddressId,
              });
              setShowAddForm(false);
              if (onSelectAddress) onSelectAddress(newAddr);
            }}
          />
        ) : (
          <div>
            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <MapPin size={42} color="var(--text-muted)" style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {isHindi ? 'कोई सुरक्षित पता नहीं मिला' : 'No Saved Addresses'}
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {isHindi ? 'आसानी से ऑर्डर करने के लिए अपना पता जोड़ें।' : 'Add your address for faster pickup & delivery.'}
                </p>
                <Button variant="primary" icon={Plus} onClick={() => setShowAddForm(true)}>
                  {isHindi ? 'नया पता जोड़ें' : 'Add New Address'}
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((addr) => {
                  const isDefault = addr.id === defaultAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelect(addr)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: isDefault ? '1.5px solid var(--color-primary, #4f46e5)' : '1px solid var(--border-subtle)',
                        backgroundColor: isDefault ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-surface-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {addr.label || (isHindi ? 'घर' : 'Home')}
                          </span>
                          {isDefault && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 700 }}>
                              {isHindi ? 'डिफ़ॉल्ट' : 'Default'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {addr.street || addr.address}, {addr.city} {addr.pincode && `- ${addr.pincode}`}
                        </div>
                        {addr.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {isHindi ? 'फ़ोन: ' : 'Phone: '} {addr.phone}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => handleSetDefault(addr.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {isHindi ? 'डिफ़ॉल्ट बनाएं' : 'Make Default'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(addr.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  icon={Plus}
                  fullWidth={true}
                  style={{ marginTop: '8px' }}
                  onClick={() => setShowAddForm(true)}
                >
                  {isHindi ? 'नया पता जोड़ें' : 'Add Another Address'}
                </Button>
              </div>
            )}
          </div>
        )}
      </ModalBody>
    </BaseModal>
  );
};
export default AddressesModal;
