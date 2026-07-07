export default function EndScreenTab({ endScreen, onChange }) {
  const set = (key) => (e) => onChange(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="tab-content">
      <h3 className="panel-title">End Screen</h3>
      <p className="panel-subtitle">The final call-to-action screen</p>

      <div className="form-group">
        <label>Headline</label>
        <input className="form-input" value={endScreen.headline} onChange={set('headline')} placeholder="Ready to get started?" />
      </div>
      <div className="form-group">
        <label>CTA Button Text</label>
        <input className="form-input" value={endScreen.cta} onChange={set('cta')} placeholder="Visit Us Today" />
      </div>
      <div className="form-group">
        <label>URL</label>
        <input className="form-input" value={endScreen.url} onChange={set('url')} placeholder="www.yourcompany.com" />
      </div>
      <div className="form-group">
        <label>Background Style</label>
        <select className="form-select" value={endScreen.style} onChange={set('style')}>
          <option value="gradient">Purple Gradient</option>
          <option value="dark">Dark Minimal</option>
          <option value="brand">Brand Color</option>
        </select>
      </div>
    </div>
  )
}
