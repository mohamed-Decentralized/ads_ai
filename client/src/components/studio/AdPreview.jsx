const COLORS = ['#1a0a2e','#0a1a2e','#0a2e1a','#2e1a0a','#2e0a1a','#0a0a2e']
const EMOJIS = ['🖼️','✨','🎯','💫','🌟','🚀']

export default function AdPreview({ images, currentSlide, totalSlides, banner, isPlaying, onTogglePlay, onPrev, onNext, onDotClick }) {
  return (
    <div className="ad-preview-container">
      <div className="ad-preview">
        {/* Slides */}
        <div className="slide-container">
          {Array.from({ length: totalSlides }, (_, i) => (
            <div key={i} className={`slide${i === currentSlide ? ' visible' : ''}`}>
              {images[i]
                ? <img src={images[i]} alt={`Slide ${i+1}`} />
                : <div className="slide-placeholder" style={{ background: COLORS[i % COLORS.length] }}>
                    <span>{EMOJIS[i % EMOJIS.length]}</span>
                    <span>Slide {i + 1}</span>
                  </div>
              }
            </div>
          ))}
        </div>

        {/* Banner overlay */}
        {banner.visible && (
          <div className="banner-overlay" style={{ background: banner.color + 'ee' }}>
            <div className="banner-logo-area">
              <span className="banner-logo-placeholder">✦</span>
            </div>
            <div className="banner-info">
              <div className="banner-company-name">{banner.company || 'Company Name'}</div>
              <div className="banner-tagline">{banner.tagline}</div>
              <div className="banner-details">
                {banner.phone && <span>{banner.phone}</span>}
                {banner.website && <span>{banner.website}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Play button hover */}
        <div className="preview-controls">
          <button className="preview-play-btn" onClick={onTogglePlay}>
            {isPlaying
              ? <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
          </button>
        </div>

        {/* Slide counter */}
        <div className="slide-counter">{currentSlide + 1} / {totalSlides}</div>
      </div>

      {/* Navigation */}
      <div className="preview-actions">
        <button className="nav-btn" onClick={onPrev}>‹</button>
        <div className="slide-dots">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              className={`slide-dot-item${i === currentSlide ? ' active' : ''}`}
              onClick={() => onDotClick(i)}
              aria-label={`Slide ${i+1}`}
            />
          ))}
        </div>
        <button className="nav-btn" onClick={onNext}>›</button>
      </div>
    </div>
  )
}
