export default function Timeline({ images, currentSlide, onSlideClick, isPlaying, onTogglePlay, timeStr }) {
  const total = Math.max(images.length, 6)
  const w = `${100 / total}%`

  return (
    <div className="timeline-section">
      <div className="timeline-header">
        <button className="timeline-play-btn" onClick={onTogglePlay}>
          {isPlaying
            ? <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>
        <span className="timeline-time">{timeStr}</span>
      </div>

      <div className="timeline-tracks">
        {/* Images track */}
        <div className="track-row">
          <div className="track-label">IMAGES</div>
          <div className="track-content">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`track-block image-block${i === currentSlide ? ' active' : ''}`}
                style={{ width: w }}
                onClick={() => onSlideClick(i)}
                title={`Slide ${i+1}`}
              >
                {images[i]
                  ? <img src={images[i]} alt={`S${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} />
                  : `#${i+1}`
                }
              </div>
            ))}
          </div>
        </div>

        {[
          { label: 'BANNER', cls: 'banner-block', text: 'Bottom Banner' },
          { label: 'MUSIC',  cls: 'music-block',  text: 'Background Music' },
          { label: 'VOICE',  cls: 'voice-block',  text: 'Voiceover Script' },
        ].map(t => (
          <div className="track-row" key={t.label}>
            <div className="track-label">{t.label}</div>
            <div className="track-content">
              <div className={`track-block ${t.cls}`} style={{ width: '100%' }}>{t.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
