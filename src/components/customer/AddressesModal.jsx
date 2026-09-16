import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Briefcase, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { AddAddressForm } from './AddAddressForm';

const STORAGE_KEY = 'shopsilo_customer_addresses';

export const AddressesModal = ({ isOpen, onClose }) => {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setAddresses(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        const initial = [
          {
            id: 'addr_1',
            type: 'Home',
            street: 'Station Road, Near Tower Chowk',
            city: 'Darbhanga',
            pincode: '846004',
            phone: '9876543210',
            isDefault: true,
          }
        ];
        setAddresses(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    }
  }, [isOpen]);

  const saveToStorage = (list) => {
    setAddresses(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleSaveNew = (addrData) => {
    let updated;
    const newId = 'addr_' + Date.now();
    if (addrData.isDefault || addresses.length === 0) {
      updated = [
        ...addresses.map((a) => ({ ...a, isDefault: false })),
        { ...addrData, id: newId, isDefault: true },
      ];
    } else {
      updated = [...addresses, { ...addrData, id: newId }];
    }
    saveToStorage(updated);
    setShowAddForm(false);
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveToStorage(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-subtle, #334155)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Saved Delivery Addresses</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {showAddForm ? (
          <AddAddressForm onSave={handleSaveNew} onCancel={() => setShowAddForm(false)} />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
              </span>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-primary, #3b82f6)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <Plus size={16} />
                Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                <MapPin size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                <p style={{ margin: 0 }}>Koi address saved nahi hai.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {addresses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSetDefault(item.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      border: `1px solid ${item.isDefault ? 'var(--color-primary, #3b82f6)' : 'var(--border-subtle, #334155)'}`,
                      background: item.isDefault ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface-subtle, #0f172a)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: item.type === 'Home' ? 'rgba(59, 130, 246, 0.2)' : item.type === 'Work' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: item.type === 'Home' ? '#60a5fa' : item.type === 'Work' ? '#34d399' : '#fbbf24',
                        }}>
                          {item.type === 'Home' ? <Home size={12} /> : item.type === 'Work' ? <Briefcase size={12} /> : <MapPin size={12} />}
                          {item.type}
                        </span>
                        {item.isDefault && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                            <CheckCircle2 size={12} /> Default
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.street}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.city} {item.pincode ? `- ${item.pincode}` : ''} {item.phone ? `| Tel: ${item.phone}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
