import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * Reusable 3-Dot Overflow Menu Component
 * Keeps screens clean and clutter-free by hiding secondary actions inside a modern dropdown.
 *
 * @param {Array} items - List of action items: [{ id, label, icon, onClick, danger, badge, disabled }]
 * @param {ReactNode} [trigger] - Custom trigger element (defaults to 3-dot icon button)
 * @param {string} [align] - 'right' (default) or 'left'
 * @param {string} [ariaLabel] - Accessible label
 */
export const OverflowMenu = ({
  items = [],
  trigger,
  align = 'right',
  ariaLabel = 'More options',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on click outside or ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      {trigger ? (
        <span ref={triggerRef} onClick={handleToggle} role="button" tabIndex={0}>
          {trigger}
        </span>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isOpen ? 'var(--bg-surface-subtle, #f1f5f9)' : 'transparent',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary, #1e293b)',
            transition: 'all 0.15s ease',
            padding: 0,
          }}
        >
          <MoreVertical size={18} />
        </button>
      )}

      {/* Floating Dropdown Card */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'right' ? 'right' : 'left']: 0,
            minWidth: '200px',
            maxWidth: '280px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            padding: '6px',
            zIndex: 9999,
            animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return (
                <div
                  key={`sep-${idx}`}
                  style={{
                    height: '1px',
                    backgroundColor: 'var(--border-subtle, #f1f5f9)',
                    margin: '4px 0',
                  }}
                />
              );
            }

            return (
              <button
                key={item.id || `item-${idx}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  if (item.onClick) item.onClick();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  color: item.danger
                    ? 'var(--color-danger, #ef4444)'
                    : item.disabled
                    ? 'var(--text-muted, #94a3b8)'
                    : 'var(--text-primary, #1e293b)',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.12s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = item.danger
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'var(--bg-surface-subtle, #f8fafc)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      opacity: item.disabled ? 0.5 : 1,
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-primary-light, #eff6ff)',
                      color: 'var(--color-primary, #2563eb)',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
