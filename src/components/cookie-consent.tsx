import { useState, useEffect, useCallback } from 'react';

interface CookiePreferences {
  analytics: boolean;
  functional: boolean;
}

const STORAGE_KEY = 'cookie-consent';

function getStoredPreferences(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function storePreferences(prefs: CookiePreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);

  useEffect(() => {
    const existing = getStoredPreferences();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    storePreferences({ analytics: true, functional: true });
    setVisible(false);
  }, []);

  const savePreferences = useCallback(() => {
    storePreferences({ analytics, functional });
    setVisible(false);
  }, [analytics, functional]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'var(--background, #ffffff)',
        borderTop: '1px solid var(--border, #e5e7eb)',
        padding: '16px 24px',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {!showPreferences ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted-foreground, #6b7280)' }}>
              We use cookies to improve your experience and analyze site traffic.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => setShowPreferences(true)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: '1px solid var(--border, #e5e7eb)',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground, #1a1a1a)',
                }}
              >
                Manage preferences
              </button>
              <button
                onClick={acceptAll}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary, #0f172a)',
                  color: 'var(--primary-foreground, #ffffff)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--foreground, #1a1a1a)',
              }}
            >
              Cookie Preferences
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--foreground, #1a1a1a)',
                }}
              >
                <input type="checkbox" checked disabled />
                Essential (always on)
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--foreground, #1a1a1a)',
                }}
              >
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                />
                Functional
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--foreground, #1a1a1a)',
                }}
              >
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                Analytics
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: '1px solid var(--border, #e5e7eb)',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground, #1a1a1a)',
                }}
              >
                Back
              </button>
              <button
                onClick={savePreferences}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary, #0f172a)',
                  color: 'var(--primary-foreground, #ffffff)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
