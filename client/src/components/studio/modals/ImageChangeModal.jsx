export default function ImageChangeModal({ open, images, targetIndex, onClose, onSelect, onGenerate }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Change Image</h2>
            <p className="modal-subtitle">Pick another slide's image or generate a new one</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="image-grid">
          {images.map((img, i) => img && (
            <div
              key={i}
              className={`image-grid-item${i === targetIndex ? ' current' : ''}`}
              onClick={() => onSelect(img)}
              title={`Use Slide ${i + 1}`}
            >
              <img src={img} alt={`Slide ${i + 1}`} />
              <div className="image-grid-label">Slide {i + 1}</div>
              {i === targetIndex && <div className="current-badge">Current</div>}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onGenerate} style={{ width: '100%', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Generate New Image with FLUX AI
          </button>
        </div>
      </div>
    </div>
  )
}
