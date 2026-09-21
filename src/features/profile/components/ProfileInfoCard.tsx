import React from 'react';
import { User, Phone, Mail, MapPin, Edit3 } from 'lucide-react';
import { User as UserType } from '../../../types';

interface ProfileInfoCardProps {
  user: UserType | null;
  onEdit?: () => void;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user, onEdit }) => {
  if (!user) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary, #6366f1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name || 'ShopSilo Customer'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Member since {new Date(user.created_at || Date.now()).getFullYear()}
            </span>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit3 size={14} />
            Edit
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Phone size={16} color="var(--color-primary)" />
          <span>{user.phone || 'Phone not linked'}</span>
        </div>

        {user.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color="var(--color-primary)" />
            <span>{user.email}</span>
          </div>
        )}

        {user.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} color="var(--color-primary)" />
            <span>{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};
