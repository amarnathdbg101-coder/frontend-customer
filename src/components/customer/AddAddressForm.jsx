import React, { useState } from 'react';
import { Home, Briefcase, MapPin, Check } from 'lucide-react';

export const AddAddressForm = ({ onSave, onCancel }) => {
  const [type, setType] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Darbhanga');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!street.trim()) {
      alert('Kripya gali/mohalla ya house number likhein.');
      return;
    }
    onSave({
      type,
      street: street.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      isDefault,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
          Address Type
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'Home', icon: <Home size={15} /> },
            { label: 'Work', icon: <Briefcase size={15} /> },
            { label: 'Other', icon: <MapPin size={15} /> },
          ].map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => setType(item.label)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: `1px solid ${type === item.label ? 'var(--color-primary, #3b82f6)' : 'var(--border-subtle)'}`,
                background: type === item.label ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface-subtle)',
                color: type === item.label ? 'var(--color-primary, #3b82f6)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
          Complete Street / House No. / Landmark *
        </label>
        <textarea
          rows={2}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="e.g. House No. 12, Near Gandhi Chowk, Station Road"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            resize: 'none',
          }}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            Pincode
          </label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="846004"
            maxLength={6}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
          Contact Phone (Optional)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile number"
          maxLength={10}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary, #3b82f6)' }}
        />
        <span>Make this my default address</span>
      </label>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Check size={16} />
          Save Address
        </button>
      </div>
    </form>
  );
};
