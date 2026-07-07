import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { scrapeWebsite, analyzeContent, generateVideo, generateImage } from '../services/aiService.js'
import '../styles/landing.css'

const PLATFORMS = [
  { id: 'instagram-post',  label: 'Instagram Post',  size: '1:1 Square',  icon: '📸' },
  { id: 'instagram-story', label: 'Instagram Story', size: '9:16 Vertical',icon: '📱' },
  { id: 'facebook',        label: 'Facebook',        size: '16:9 Wide',   icon: '👥' },
  { id: 'linkedin',        label: 'LinkedIn',        size: '16:9 Wide',   icon: '💼' },
  { id: 'twitter',         label: 'Twitter / X',     size: '2:1 Wide',    icon: '🐦' },
]

function normalizeUrl(raw) {
  raw = raw.trim()
  if (!raw) return null
  if (!raw.startsWith('http')) raw = 'https://' + raw
  try { return new URL(raw).href } catch { return null }
}

export default function LandingPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState('input') 

  const [url, setUrl] = useState('')
  const [siteContent, setSiteContent] = useState('')
  const [brandData, setBrandData] = useState(null)
  const [error, setError] = useState('')
  const [includeHumans, setIncludeHumans] = useState(false)

  const [type, setType] = useState(null)
  const [platform, setPlatform] = useState('instagram-post')
  const [headline, setHeadline] = useState('')
  const [cta, setCta] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  
  const [genProgress, setGenProgress] = useState(0)
  const [genMessage, setGenMessage] = useState('')
  const progressRef = useRef(null)

  const [generationCount, setGenerationCount] = useState(() => parseInt(localStorage.getItem('generationCount') || '0', 10))
  const [userFalKey, setUserFalKey] = useState(() => localStorage.getItem('userFalKey') || '')
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)

  useEffect(() => {
    localStorage.setItem('generationCount', generationCount.toString())
  }, [generationCount])

  useEffect(() => {
    localStorage.setItem('userFalKey', userFalKey)
  }, [userFalKey])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 6000)
    return () => clearTimeout(t)
  }, [error])

  async function handleScrape() {
    const cleanUrl = normalizeUrl(url)
    if (!cleanUrl) { setError('Invalid URL'); return }
    setStep('scraping')
    
    try {
      const content = await scrapeWebsite(cleanUrl)
      setSiteContent(content)
      setStep('scraped')
    } catch (err) {
      setError('Scraping failed.')
      setStep('input')
    }
  }

  async function handleAnalyze() {
    setStep('analyzing')
    try {
      const cleanUrl = normalizeUrl(url)
      const bd = await analyzeContent(siteContent, cleanUrl, includeHumans)
      
      setBrandData(bd)
      setHeadline(bd.social_copy?.headline || bd.tagline || '')
      setCta(bd.social_copy?.cta || 'Learn More')
      setVideoPrompt(bd.video_concept || `A professional advertisement video for ${bd.company_name}.`)
      setImagePrompt(bd.image_prompts?.hero || `Professional advertisement photography for ${bd.company_name}.`)
      
      setStep('review_prompts')
    } catch (err) {
      setError('Analysis failed.')
      setStep('scraped')
    }
  }

  function handleConfirmPrompts() {
    setStep('format')
  }

  async function handleGenerate() {
    if (!type) return

    if (generationCount >= 3 && !userFalKey) {
      setShowApiKeyPrompt(true)
      return
    }
    setShowApiKeyPrompt(false)

    setStep('generating')
    setGenProgress(5)
    const animId = animateBar(5, 85, type === 'video' ? 120000 : 20000)

    try {
      if (type === 'video') {
        setGenMessage('Generating Video (Kling AI)')
        const videoUrl = await generateVideo(videoPrompt, brandData, userFalKey)
        clearInterval(animId)
        setGenProgress(100)
        setGenerationCount(prev => prev + 1)
        sessionStorage.setItem('videoAdData', JSON.stringify({ video_url: videoUrl, script: brandData.voiceover_script, brandData }))
        await delay(300)
        navigate('/video-ad')
      } else {
        setGenMessage('Generating Image (FLUX)')
        const fullPrompt = `${imagePrompt}\nBrand: ${brandData.company_name}. Industry: ${brandData.industry}.\nVisual concept: "${headline}".\nStyle: Ultra high quality commercial advertising photography. Do NOT include any text, words, letters, or watermarks in the image.`
        
        const aspectRatioMap = {
          'instagram-post':  '1:1',
          'instagram-story': '9:16',
          'facebook':        '16:9',
          'linkedin':        '16:9',
          'twitter':         '16:9',
        }
        
        const imageUrl = await generateImage(fullPrompt, aspectRatioMap[platform] || '1:1', userFalKey)
        clearInterval(animId)
        setGenProgress(100)
        setGenerationCount(prev => prev + 1)
        
        sessionStorage.setItem('imagePostData', JSON.stringify({
          image_url: imageUrl,
          headline: headline,
          subheadline: brandData.social_copy?.subheadline || brandData.tagline,
          cta: cta,
          platform,
          brandData
        }))
        await delay(300)
        navigate('/image-post')
      }
    } catch (err) {
      clearInterval(animId)
      setError(err.message || 'Generation failed.')
      setStep('format')
    }
  }

  function animateBar(from, to, ms) {
    const steps = 80
    const interval = ms / steps
    const inc = (to - from) / steps
    let cur = from
    const id = setInterval(() => {
      cur = Math.min(cur + inc, to)
      setGenProgress(Math.round(cur))
    }, interval)
    progressRef.current = id
    return id
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  return (
    <div className="landing">
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-logo">AdStudio</div>
          {step !== 'input' && (
            <button className="lp-reset-btn" onClick={() => { setStep('input'); setBrandData(null); setType(null); setSiteContent('') }}>
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="lp-main">
        {step === 'input' && (
          <section className="step-section">
            <h1 className="step-title">Create Ad</h1>
            <div className="url-box">
              <input
                className="url-input"
                type="url"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="apple.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScrape()}
              />
              <button className="primary-btn" onClick={handleScrape}>
                Start Process
              </button>
            </div>
            <div className="chips-row">
              {['apple.com','nike.com','tesla.com'].map(u => (
                <button key={u} className="chip" onClick={() => setUrl(u)}>{u}</button>
              ))}
            </div>
          </section>
        )}

        {step === 'scraping' && (
          <section className="step-section">
            <div className="spinner large" />
            <h2 className="step-title" style={{marginTop: 20}}>Scraping Website...</h2>
            <p className="step-sub">{url}</p>
          </section>
        )}

        {step === 'scraped' && (
          <section className="step-section">
            <h2 className="step-title">Website Scraped</h2>
            <p className="step-sub">Successfully extracted content.</p>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
              <div className="toggle-row">
                <span>Include Human Actors in Video?</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={includeHumans} onChange={(e) => setIncludeHumans(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                If enabled, the AI will write a story featuring characters. If disabled, it focuses strictly on the product and graphics.
              </p>
            </div>

            <button className="primary-btn" onClick={handleAnalyze}>
              Continue to AI Analysis
            </button>
          </section>
        )}

        {step === 'analyzing' && (
          <section className="step-section">
            <div className="spinner large" />
            <h2 className="step-title" style={{marginTop: 20}}>Analyzing Brand...</h2>
            <p className="step-sub">Gemini Pro is working</p>
          </section>
        )}

        {step === 'review_prompts' && brandData && (
          <section className="step-section left-align">
            <h2 className="step-title">Review Prompts</h2>
            <p className="step-sub">Edit AI suggestions before generation.</p>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
              <div className="toggle-row">
                <span>Include Human Actors in Video?</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={includeHumans} onChange={(e) => setIncludeHumans(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="form-group" style={{marginTop: 20}}>
              <label>Video Concept Prompt</label>
              <textarea 
                className="form-input" 
                rows="4"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
              />
            </div>

            <div className="form-group" style={{marginTop: 20}}>
              <label>Image Photography Prompt</label>
              <textarea 
                className="form-input" 
                rows="3"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              <button className="primary-btn" style={{ flex: 1 }} onClick={handleConfirmPrompts}>
                Confirm Prompts
              </button>
              <button className="btn-secondary" onClick={handleAnalyze}>
                Regenerate AI Concept
              </button>
            </div>
          </section>
        )}

        {step === 'format' && brandData && (
          <section className="step-section left-align">
            <h2 className="step-title">Format</h2>
            
            <div className="type-cards">
              <div
                className={`type-card${type === 'video' ? ' selected' : ''}`}
                onClick={() => setType('video')}
              >
                <h3>🎬 Video</h3>
              </div>
              <div
                className={`type-card${type === 'image-post' ? ' selected' : ''}`}
                onClick={() => setType('image-post')}
              >
                <h3>🖼️ Image</h3>
              </div>
            </div>

            {type === 'image-post' && (
              <div className="post-options">
                <div className="form-group">
                  <label>Platform Format</label>
                  <select className="form-select" value={platform} onChange={e => setPlatform(e.target.value)}>
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label} ({p.size})</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Headline</label>
                    <input className="form-input" value={headline} onChange={e => setHeadline(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>CTA</label>
                    <input className="form-input" value={cta} onChange={e => setCta(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {type && showApiKeyPrompt && (
              <div className="form-group" style={{marginTop: 30, padding: '16px', background: 'rgba(228, 31, 38, 0.1)', border: '1px solid #E41F26', borderRadius: 'var(--radius)'}}>
                <h3 style={{color: '#E41F26', marginBottom: '8px', fontSize: '16px'}}>Generation Limit Reached (3/3)</h3>
                <p style={{fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)'}}>
                  You have reached the free generation limit. Please enter your Fal AI API key to continue. 
                  <strong style={{display: 'block', marginTop: '8px', color: '#E41F26'}}>WARNING: Do not enter an API key from an account that is not funded/recharged, or generation will fail.</strong>
                </p>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="sk-fal-..."
                  value={userFalKey}
                  onChange={(e) => setUserFalKey(e.target.value)}
                  style={{marginBottom: '12px'}}
                />
                <button className="primary-btn" onClick={() => setShowApiKeyPrompt(false)} style={{width: '100%'}}>Save API Key</button>
              </div>
            )}

            {type && !showApiKeyPrompt && (
              <button className="primary-btn" style={{marginTop: 30}} onClick={handleGenerate}>
                Generate Media
              </button>
            )}
          </section>
        )}

        {step === 'generating' && (
          <section className="step-section">
            <h2 className="step-title">{genMessage}</h2>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${genProgress}%` }} />
            </div>
          </section>
        )}
      </main>

      {error && <div className="error-toast">{error}</div>}
    </div>
  )
}
