'use client'

interface SavePromptProps {
  onSave?: () => void
  onDismiss: () => void
}

export function SavePrompt({ onSave, onDismiss }: SavePromptProps) {
  return (
    <div
      style={{
        borderRadius: '14px',
        border: '1px solid rgba(245,197,66,0.2)',
        background: 'rgba(245,197,66,0.06)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>💾</span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.975rem',
              fontWeight: 600,
              color: '#F4EFE6',
              marginBottom: '4px',
            }}
          >
            Want to save this story forever?
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.85rem',
              color: '#B8B0C8',
              lineHeight: 1.5,
            }}
          >
            Create a free account and all your stories are saved — ready for tonight's bedtime, and every night after.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onSave}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #F5A623 0%, #F5C542 100%)',
            color: '#0D1B2A',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
          }}
        >
          Save it — it&apos;s free
        </button>
        <button
          onClick={onDismiss}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: '#B8B0C8',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          I&apos;ll come back later
        </button>
      </div>
    </div>
  )
}
