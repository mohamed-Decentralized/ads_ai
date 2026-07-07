import { useState } from 'react'

export default function VoiceTab({ voice, onChange, onRegenerate }) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const words = voice.script.trim() ? voice.script.trim().split(/\s+/).length : 0
  const secs  = Math.round(words * 0.45)

  async function handleRegen() {
    setIsRegenerating(true)
    await onRegenerate()
    setIsRegenerating(false)
  }

  return (
    <div className="tab-content">
      <h3 className="panel-title">Voice &amp; Script</h3>
      <p className="panel-subtitle">AI-generated copy — edit freely</p>

      <div className="form-group">
        <div className="toggle-row">
          <span>Enable Voiceover</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={voice.enabled}
              onChange={e => onChange(v => ({ ...v, enabled: e.target.checked }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Ad Script</label>
        <textarea
          className="form-textarea"
          rows="9"
          value={voice.script}
          onChange={e => onChange(v => ({ ...v, script: e.target.value }))}
          placeholder="Your AI-generated ad script…"
        />
        <div className="word-count">{words} words · ~{secs}s</div>
      </div>

      <div className="form-group">
        <label>Voice Style</label>
        <select
          className="form-select"
          value={voice.type}
          onChange={e => onChange(v => ({ ...v, type: e.target.value }))}
        >
          <option value="male-professional">Male · Professional · American</option>
          <option value="female-professional">Female · Professional · American</option>
          <option value="male-young">Male · Young · Energetic</option>
          <option value="female-warm">Female · Warm · Friendly</option>
          <option value="male-deep">Male · Deep · Authoritative</option>
        </select>
      </div>

      <button
        className="btn-secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleRegen}
        disabled={isRegenerating}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        {isRegenerating ? 'Regenerating…' : 'Regenerate Script'}
      </button>
    </div>
  )
}
