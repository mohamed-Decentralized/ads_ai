export default function SlideshowTab({ images, currentSlide, onSlideClick, onChangeClick, onAddImage }) {
  const total = Math.max(images.length, 6)
  const secPer = 4

  return (
    <div className="tab-content">
      <h3 className="panel-title">Slideshow</h3>
      <p className="panel-subtitle">Click to preview · Click Change to swap image</p>

      <div className="slideshow-list">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`slide-item${i === currentSlide ? ' active-slide' : ''}`}
            onClick={() => onSlideClick(i)}
          >
            <span className="slide-drag-handle">⠿</span>
            {images[i]
              ? <img className="slide-thumbnail" src={images[i]} alt={`Slide ${i+1}`} loading="lazy" />
              : <div className="slide-thumbnail-placeholder"><span>🖼️</span></div>
            }
            <div className="slide-meta">
              <div className="slide-label">Image #{i + 1}</div>
              <div className="slide-timing">{i * secPer}s – {(i + 1) * secPer}s</div>
              {i === currentSlide && <div className="slide-active-badge">Currently visible</div>}
            </div>
            <button
              className="slide-change-btn"
              onClick={e => { e.stopPropagation(); onChangeClick(i) }}
            >
              Change
            </button>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onAddImage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Generate a New Image
        </button>
      </div>
    </div>
  )
}
