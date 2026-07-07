export default function BannerTab({ banner, onChange }) {
  const set = (key) => (e) => onChange(prev => ({ ...prev, [key]: e.target.value }))
  const setCheck = (key) => (e) => onChange(prev => ({ ...prev, [key]: e.target.checked }))

  return (
    <div className="tab-content">
      <h3 className="panel-title">Bottom Banner</h3>
      <p className="panel-subtitle">Business info shown in the ad overlay</p>

      <div className="form-group">
        <label>Company Name</label>
        <input className="form-input" value={banner.company} onChange={set('company')} placeholder="Your Company" />
      </div>
      <div className="form-group">
        <label>Tagline</label>
        <input className="form-input" value={banner.tagline} onChange={set('tagline')} placeholder="Your tagline here" />
      </div>
      <div className="form-group">
        <label>Website</label>
        <input className="form-input" value={banner.website} onChange={set('website')} placeholder="www.yourcompany.com" />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input className="form-input" value={banner.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
      </div>
      <div className="form-group">
        <label>Address</label>
        <input className="form-input" value={banner.address} onChange={set('address')} placeholder="123 Main St, City" />
      </div>
      <div className="form-group">
        <label>Banner Color</label>
        <div className="color-picker-row">
          <input type="color" className="color-input" value={banner.color} onChange={set('color')} />
          <span className="color-label">{banner.color}</span>
        </div>
      </div>
      <div className="form-group">
        <div className="toggle-row">
          <span>Show Banner</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={banner.visible} onChange={setCheck('visible')} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </div>
  )
}
