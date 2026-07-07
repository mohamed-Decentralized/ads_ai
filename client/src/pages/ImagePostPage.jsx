import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/results.css'

const PLATFORM_CONFIG = {
  'instagram-post':  { label: 'Instagram Post',  ratio: 1/1,   w: 1080, h: 1080 },
  'instagram-story': { label: 'Instagram Story', ratio: 9/16,  w: 1080, h: 1920 },
  'facebook':        { label: 'Facebook Post',   ratio: 16/9,  w: 1200, h: 628  },
  'linkedin':        { label: 'LinkedIn Post',   ratio: 16/9,  w: 1200, h: 627  },
  'twitter':         { label: 'Twitter / X',     ratio: 2/1,   w: 1200, h: 600  },
}

export default function ImagePostPage() {
  const navigate   = useNavigate()
  const canvasRef  = useRef(null)
  const imgRef     = useRef(null)

  const stored    = (() => { try { return JSON.parse(sessionStorage.getItem('imagePostData') || '') } catch { return null } })()
  const brand     = stored?.brandData || {}
  const platform  = stored?.platform  || 'instagram-post'
  const pc        = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG['instagram-post']

  const [imageUrl, setImageUrl]     = useState(stored?.image_url || null)
  const [headline, setHeadline]     = useState(stored?.headline  || '')
  const [subline, setSubline]       = useState(stored?.subheadline || brand.tagline || '')
  const [cta, setCta]               = useState(stored?.cta       || 'Learn More')
  const [editing, setEditing]       = useState(false)
  const [isRegen, setIsRegen]       = useState(false)
  const [imgLoaded, setImgLoaded]   = useState(false)
  const [textColor, setTextColor]   = useState('#ffffff')
  const [overlayStyle, setOverlay]  = useState('dark')   // dark | purple | brand | none
  const [error, setError]           = useState('')

  useEffect(() => { if (!stored) navigate('/') }, [])

  /* ── Draw canvas ──────────────────────────────────────────────────────── */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img    = imgRef.current
    if (!canvas || !img || !imgLoaded) return

    const W = 1080, H = Math.round(1080 / pc.ratio)
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Draw background image
    ctx.drawImage(img, 0, 0, W, H)

    // Overlay gradient
    const overlayGradients = {
      dark:   [[0, 'rgba(0,0,0,0)'], [0.5, 'rgba(0,0,0,0.15)'], [1, 'rgba(0,0,0,0.85)']],
      purple: [[0, 'rgba(0,0,0,0)'], [0.4, 'rgba(80,0,120,0.3)'], [1, 'rgba(80,0,120,0.88)']],
      brand:  [[0, 'rgba(0,0,0,0)'], [0.4, 'rgba(0,0,0,0.2)'], [1, `${brand.primary_color}dd`]],
      none:   null,
    }

    const gradStops = overlayGradients[overlayStyle]
    if (gradStops) {
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      gradStops.forEach(([pos, col]) => grad.addColorStop(pos, col))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }

    // Text zone
    const pad   = W * 0.07
    const botY  = H - pad
    const lineH = W * 0.055

    ctx.textAlign = 'left'
    ctx.fillStyle = textColor

    // Headline
    if (headline) {
      const fs = Math.round(W * 0.058)
      ctx.font = `800 ${fs}px Inter, sans-serif`
      ctx.shadowColor   = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur    = 10
      wrapText(ctx, headline, pad, botY - lineH * 2.8, W - pad * 2, lineH)
      ctx.shadowBlur = 0
    }

    // Sub-headline
    if (subline) {
      const fs = Math.round(W * 0.028)
      ctx.font = `400 ${fs}px Inter, sans-serif`
      ctx.fillStyle = textColor === '#ffffff' ? 'rgba(255,255,255,0.85)' : textColor
      ctx.fillText(subline, pad, botY - lineH * 0.7, W - pad * 2)
      ctx.fillStyle = textColor
    }

    // CTA Button
    if (cta) {
      const fs       = Math.round(W * 0.026)
      const btnH     = lineH * 0.82
      ctx.font       = `700 ${fs}px Inter, sans-serif`
      const metrics  = ctx.measureText(cta)
      const btnW     = metrics.width + W * 0.06
      const btnX     = pad
      const btnY     = botY + pad * 0.15

      // Button bg
      ctx.fillStyle = brand.primary_color || '#7c3aed'
      ctx.beginPath()
      ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2)
      ctx.fill()

      // Button text
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(cta, btnX + btnW / 2, btnY + btnH / 2 + fs * 0.35)
      ctx.textAlign = 'left'
    }

    // Company watermark top right
    if (brand.company_name) {
      const fs = Math.round(W * 0.022)
      ctx.font = `600 ${fs}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.textAlign = 'right'
      ctx.fillText(brand.company_name, W - pad, pad + fs)
      ctx.textAlign = 'left'
    }
  }, [imageUrl, imgLoaded, headline, subline, cta, textColor, overlayStyle, brand, pc])

  // Redraw on any change
  useEffect(() => { drawCanvas() }, [drawCanvas])

  // Load image for canvas
  useEffect(() => {
    if (!imageUrl) return
    setImgLoaded(false)
    const img = new Image()
    // If it's a base64 data URL (from Gemini), no CORS needed
    if (imageUrl.startsWith('http')) img.crossOrigin = 'anonymous'
    img.onload  = () => { imgRef.current = img; setImgLoaded(true) }
    img.onerror = () => setError('Failed to load image for editing')
    img.src = imageUrl
  }, [imageUrl])


  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ')
    let line = ''
    let curY = y
    for (const word of words) {
      const test = line ? line + ' ' + word : word
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, curY)
        curY += lineH
        line = word
      } else { line = test }
    }
    if (line) ctx.fillText(line, x, curY)
  }

  /* ── Download PNG ─────────────────────────────────────────────────────── */
  function downloadPng() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `${brand.company_name || 'ad'}_${platform}.png`
      })
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    }, 'image/png', 1)
  }

  /* ── Regenerate image ─────────────────────────────────────────────────── */
  async function handleRegenerate() {
    setIsRegen(true)
    setError('')
    setEditing(false)
    try {
      const { generateImage } = await import('../services/aiService.js')
      
      const basePrompt = brand?.image_prompts?.hero || `Professional advertisement photography for ${brand?.company_name}`
      const fullPrompt = `${basePrompt}\nBrand: ${brand.company_name}. Industry: ${brand.industry}.\nVisual concept: "${headline}".\nStyle: Ultra high quality commercial advertising photography. Do NOT include any text, words, letters, or watermarks in the image.`
      
      const aspectRatioMap = {
        'instagram-post':  '1:1',
        'instagram-story': '9:16',
        'facebook':        '16:9',
        'linkedin':        '16:9',
        'twitter':         '16:9',
      }
      const aspectRatio = aspectRatioMap[platform] || '1:1'
      
      const newImageUrl = await generateImage(fullPrompt, aspectRatio)
      
      setImageUrl(newImageUrl)
      sessionStorage.setItem('imagePostData', JSON.stringify({ ...stored, image_url: newImageUrl, headline, cta }))
    } catch (e) { setError(e.message || 'Regeneration failed') }
    finally { setIsRegen(false) }
  }

  if (!stored) return null

  /* ── Canvas preview size ── */
  const previewH = Math.round(520 / pc.ratio)

  return (
    <div className="result-page">
      {/* Header */}
      <header className="result-header">
        <div className="lp-logo" style={{ cursor:'pointer' }} onClick={() => navigate('/')}>
          <span className="lp-logo-star">✦</span>
          AdStudio <span className="lp-logo-ai">AI</span>
        </div>
        <div className="result-header-center">
          <span className="result-badge">🖼️ Image Post</span>
          <span className="result-company">{brand.company_name}</span>
          <span className="platform-chip">{pc.label}</span>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/')}>← Make Another</button>
      </header>

      <div className="result-body post-body">
        {/* ── Center: Canvas preview ── */}
        <div className="post-preview-col">
          <div className="canvas-wrapper" style={{ maxHeight: previewH + 40, maxWidth: Math.round(previewH * pc.ratio) + 40 }}>
            {isRegen && (
              <div className="canvas-regen-overlay">
                <div className="spinner" />
                <p>Regenerating…</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="post-canvas"
              style={{ width: '100%', height: 'auto', borderRadius: 12 }}
            />
            {!imgLoaded && !isRegen && imageUrl && (
              <div className="canvas-loading"><div className="spinner"/></div>
            )}
          </div>

          {/* Platform badge */}
          <div className="platform-info">
            <span className="pi-label">Format</span>
            <span className="pi-val">{pc.label}</span>
            <span className="pi-size">{pc.w} × {pc.h}px</span>
          </div>
        </div>

        {/* ── Right: Edit panel ── */}
        <div className="result-side-panel">
          {/* Brand */}
          <div className="result-brand-card">
            <div className="rbc-row">
              <div className="rbc-dot" style={{ background: brand.primary_color }} />
              <div>
                <div className="rbc-name">{brand.company_name}</div>
                <div className="rbc-industry">{brand.industry}</div>
              </div>
            </div>
          </div>

          {/* Text editor */}
          <div className="post-editor">
            <div className="pe-header">
              <h3>Edit Text Overlay</h3>
              <button className="pe-toggle" onClick={() => setEditing(e => !e)}>
                {editing ? 'Done' : '✏️ Edit'}
              </button>
            </div>

            {editing ? (
              <div className="pe-fields">
                <div className="form-group">
                  <label>Headline</label>
                  <input className="form-input" value={headline} onChange={e => setHeadline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Sub-headline</label>
                  <input className="form-input" value={subline} onChange={e => setSubline(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>CTA Button Text</label>
                  <input className="form-input" value={cta} onChange={e => setCta(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Overlay Style</label>
                  <select className="form-select" value={overlayStyle} onChange={e => setOverlay(e.target.value)}>
                    <option value="dark">Dark Gradient</option>
                    <option value="purple">Purple Gradient</option>
                    <option value="brand">Brand Color</option>
                    <option value="none">No Overlay</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Text Color</label>
                  <div className="color-picker-row">
                    <input type="color" className="color-input" value={textColor} onChange={e => setTextColor(e.target.value)} />
                    <span className="color-label">{textColor}</span>
                  </div>
                </div>
                <p className="pe-note">Preview updates live ↑ — click Regenerate to get a new AI image</p>
              </div>
            ) : (
              <div className="pe-preview-text">
                <div className="pet-headline">{headline}</div>
                {subline && <div className="pet-sub">{subline}</div>}
                {cta && <div className="pet-cta" style={{ background: brand.primary_color }}>{cta}</div>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="post-actions">
            <button className="btn-primary" onClick={downloadPng} disabled={!imgLoaded}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PNG
            </button>
            <button className="btn-secondary" onClick={handleRegenerate} disabled={isRegen}>
              {isRegen ? 'Generating…' : '↺ New AI Image'}
            </button>
          </div>

          {/* Key products */}
          {brand.key_products?.length > 0 && (
            <div className="info-section">
              <h4>Products / Services</h4>
              <div className="brand-tags" style={{ marginTop: 8 }}>
                {brand.key_products.map(p => <span key={p} className="brand-tag">{p}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-toast">{error}</div>}
    </div>
  )
}
