import { useState, useEffect } from 'react'

const HINTS = [
  'apple.com · tesla.com · nike.com · starbucks.com',
  'airbnb.com · spotify.com · shopify.com · stripe.com',
  'yourcompany.com · yourbrand.co · myshop.store',
]

export default function Hero({ url, setUrl, onGenerate, isLoading }) {
  const [hint, setHint] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setHint(h => (h + 1) % HINTS.length), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-inner">
        <div className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Ad Creation
        </div>
        <h1 className="hero-title">
          No Creative?<br />
          <span className="gradient-text">No Problem.</span>
        </h1>
        <p className="hero-subtitle">
          Paste your business URL and we'll turn it into a professional<br />
          video ad — AI-generated visuals, script, and music, ready instantly.
        </p>

        {/* URL Input */}
        <div className="url-input-container">
          <div className="url-input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </span>
            <input
              type="url"
              className="url-input"
              placeholder="Enter your website URL (e.g. yourcompany.com)"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLoading && onGenerate()}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
            <button
              className="generate-btn"
              onClick={onGenerate}
              disabled={isLoading}
            >
              {isLoading ? 'Generating…' : 'Generate Ad'}
              {!isLoading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>
          <div className="input-hint">
            Try: <span className="hint-cycle">{HINTS[hint]}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="feature-badges">
          {['Ready in under 60 seconds', 'AI-generated visuals', 'Fully customizable'].map(b => (
            <div className="badge" key={b}>
              <svg className="badge-check" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Mockup preview */}
      <div className="studio-preview-wrapper">
        <div className="studio-preview">
          <div className="preview-header">
            <div className="preview-dots"><span/><span/><span/></div>
            <span className="preview-title">✦ AdStudio AI Editor</span>
          </div>
          <div className="preview-mockup">
            <div className="mockup-sidebar">
              {[true,false,false,false,false].map((a,i) => <div key={i} className={`mockup-tab${a?' active':''}`}/>)}
            </div>
            <div className="mockup-canvas">
              <div className="mockup-image-placeholder"><div className="mockup-shimmer"/></div>
              <div className="mockup-timeline">
                <div className="mockup-track"/>
                <div className="mockup-track short"/>
                <div className="mockup-track medium"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
