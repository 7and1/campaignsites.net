export function NoScriptFallback() {
  return (
    <noscript>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fef3c7',
          borderBottom: '2px solid #f59e0b',
          padding: '16px',
          textAlign: 'center',
          zIndex: 9999,
        }}
      >
        <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontWeight: 600 }}>
          JavaScript is disabled. Some interactive features may not work. Please enable JavaScript for the best experience.
        </p>
      </div>
    </noscript>
  )
}
