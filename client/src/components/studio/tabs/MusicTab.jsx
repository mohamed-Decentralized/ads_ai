const TRACKS = [
  { id: 'upbeat',    icon: '⚡', name: 'Upbeat & Energetic',    meta: '120 BPM · Pop' },
  { id: 'corporate', icon: '🎼', name: 'Corporate Professional', meta: '90 BPM · Ambient' },
  { id: 'cinematic', icon: '🎬', name: 'Cinematic Epic',         meta: '110 BPM · Orchestral' },
  { id: 'modern',    icon: '🎧', name: 'Modern Electronic',      meta: '128 BPM · Electronic' },
]

export default function MusicTab({ music, onChange }) {
  const set = (key) => (val) => onChange(prev => ({ ...prev, [key]: val }))

  return (
    <div className="tab-content">
      <h3 className="panel-title">Music</h3>
      <p className="panel-subtitle">Add background music to your ad</p>

      <div className="form-group">
        <div className="toggle-row">
          <span>Enable Music</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={music.enabled} onChange={e => set('enabled')(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="music-tracks">
        {TRACKS.map(t => (
          <div
            key={t.id}
            className={`music-track${music.track === t.id ? ' selected' : ''}`}
            onClick={() => set('track')(t.id)}
          >
            <div className="track-icon">{t.icon}</div>
            <div className="track-info">
              <div className="track-name">{t.name}</div>
              <div className="track-meta">{t.meta}</div>
            </div>
            <div className="track-play">▶</div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Volume</label>
        <input
          type="range" min="0" max="100"
          className="range-input"
          value={music.volume}
          onChange={e => set('volume')(+e.target.value)}
        />
      </div>
    </div>
  )
}
