export default function AISettingsTab({ settings, onChange, onRegenerateAll }) {
  const set = (key) => (e) => onChange(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="tab-content">
      <h3 className="panel-title">AI Settings</h3>
      <p className="panel-subtitle">Refine your ad generation parameters</p>

      <div className="form-group">
        <label>Ad Tone</label>
        <select className="form-select" value={settings.tone} onChange={set('tone')}>
          <option value="professional">Professional &amp; Corporate</option>
          <option value="fun">Fun &amp; Energetic</option>
          <option value="luxury">Luxury &amp; Premium</option>
          <option value="friendly">Friendly &amp; Approachable</option>
          <option value="bold">Bold &amp; Impactful</option>
        </select>
      </div>

      <div className="form-group">
        <label>Target Platform</label>
        <select className="form-select" value={settings.platform} onChange={set('platform')}>
          <option value="tv">TV Commercial</option>
          <option value="social">Social Media</option>
          <option value="digital">Digital Signage</option>
        </select>
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          className="form-textarea"
          rows="4"
          value={settings.notes}
          onChange={set('notes')}
          placeholder="E.g. Focus on our summer sale, target 25-35 year olds…"
        />
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={onRegenerateAll}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        Regenerate All Images
      </button>
    </div>
  )
}
