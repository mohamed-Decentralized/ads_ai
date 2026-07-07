import { Link } from 'react-router-dom'

export default function StudioHeader({ companyName, isPlaying, onTogglePlay, onClose }) {
  return (
    <header className="studio-header">
      <div className="studio-logo">
        <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦</span>
        AdStudio
      </div>
      <div className="studio-header-center">
        <span className="studio-company-name">{companyName || 'Loading…'}</span>
      </div>
      <div className="studio-header-right">
        <button className="btn-outline" onClick={onTogglePlay}>
          {isPlaying
            ? <><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause</>
            : <><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg>Preview</>
          }
        </button>
        <button className="btn-close" onClick={onClose} title="Close studio">✕</button>
      </div>
    </header>
  )
}
