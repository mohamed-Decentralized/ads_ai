const EXPORTS = [
  { icon: '🖼️', title: 'Download Images', desc: '6 AI-generated ad images (JPG)', action: 'images' },
  { icon: '📝', title: 'Download Script',  desc: 'Voiceover script (TXT)',         action: 'script' },
  { icon: '📦', title: 'Brand Package',    desc: 'All brand data (JSON)',           action: 'brand'  },
]

export default function ExportModal({ open, onClose, onDownloadImages, onDownloadScript, onDownloadBrand, onMakeAnother }) {
  if (!open) return null

  const handlers = { images: onDownloadImages, script: onDownloadScript, brand: onDownloadBrand }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Export Your Ad</h2>
            <p className="modal-subtitle">Download your assets</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="export-list">
          {EXPORTS.map(e => (
            <button key={e.action} className="export-item" onClick={handlers[e.action]}>
              <span className="export-icon">{e.icon}</span>
              <div>
                <div className="export-title">{e.title}</div>
                <div className="export-desc">{e.desc}</div>
              </div>
              <svg className="export-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          ))}
        </div>

        <div className="modal-footer" style={{ gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Close</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onMakeAnother}>
            + Make Another Ad
          </button>
        </div>
      </div>
    </div>
  )
}
