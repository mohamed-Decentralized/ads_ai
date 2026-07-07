import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StudioHeader from '../components/studio/StudioHeader.jsx'
import SidebarIcons from '../components/studio/SidebarIcons.jsx'
import AdPreview from '../components/studio/AdPreview.jsx'
import Timeline from '../components/studio/Timeline.jsx'
import SlideshowTab from '../components/studio/tabs/SlideshowTab.jsx'
import BannerTab from '../components/studio/tabs/BannerTab.jsx'
import EndScreenTab from '../components/studio/tabs/EndScreenTab.jsx'
import MusicTab from '../components/studio/tabs/MusicTab.jsx'
import VoiceTab from '../components/studio/tabs/VoiceTab.jsx'
import AISettingsTab from '../components/studio/tabs/AISettingsTab.jsx'
import ImageChangeModal from '../components/studio/modals/ImageChangeModal.jsx'
import ExportModal from '../components/studio/modals/ExportModal.jsx'
import RegenOverlay from '../components/studio/RegenOverlay.jsx'
import '../styles/studio.css'

function buildDemo() {
  return {
    brandData: {
      company_name: 'YourBrand', tagline: 'Excellence in every detail',
      description: 'A premium brand delivering exceptional quality.',
      industry: 'Business', primary_color: '#7c3aed',
      website_url: 'yourcompany.com',
      voiceover_script: 'Experience excellence like never before. Our commitment to quality and innovation sets us apart. Join thousands of satisfied customers. Visit us online today.',
      image_prompts: Array(6).fill('Professional brand advertising photography'),
    },
    images: Array(6).fill(null),
    sourceUrl: '#',
  }
}

export default function StudioPage() {
  const navigate = useNavigate()

  // ── Load data from sessionStorage ─────────────────────────────────────────
  const stored = (() => { try { return JSON.parse(sessionStorage.getItem('adStudioData') || '') } catch { return null } })()
  const data   = stored || buildDemo()

  const [brandData, setBrandData]     = useState(data.brandData)
  const [images, setImages]           = useState(data.images || [])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab]     = useState('slideshow')
  const [isPlaying, setIsPlaying]     = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenMessage, setRegenMessage] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [changingSlideIndex, setChangingSlideIndex] = useState(-1)
  const [timeSeconds, setTimeSeconds] = useState(0)
  const playRef   = useRef(null)
  const timerRef  = useRef(null)

  // ── Banner state ──────────────────────────────────────────────────────────
  const [banner, setBanner] = useState({
    company:  data.brandData.company_name || '',
    tagline:  data.brandData.tagline || '',
    website:  (data.brandData.website_url || '').replace(/https?:\/\//, ''),
    phone:    '',
    address:  '',
    color:    '#0a0a14',
    visible:  true,
  })

  // ── End screen state ──────────────────────────────────────────────────────
  const [endScreen, setEndScreen] = useState({
    headline: `Experience ${data.brandData.company_name}`,
    cta:      'Visit Us Today',
    url:      (data.brandData.website_url || '').replace(/https?:\/\//, ''),
    style:    'gradient',
  })

  // ── Music state ───────────────────────────────────────────────────────────
  const [music, setMusic] = useState({ enabled: true, track: 'upbeat', volume: 50 })

  // ── Voice state ───────────────────────────────────────────────────────────
  const [voice, setVoice] = useState({
    enabled: true,
    script:  data.brandData.voiceover_script || '',
    type:    'male-professional',
  })

  // ── AI settings ───────────────────────────────────────────────────────────
  const [aiSettings, setAiSettings] = useState({ tone: 'professional', platform: 'tv', notes: '' })

  const totalSlides = Math.max(images.length, 6)

  // ── Play / pause ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playRef.current  = setInterval(() => setCurrentSlide(s => (s + 1) % totalSlides), 4000)
      timerRef.current = setInterval(() => setTimeSeconds(t => t + 1), 1000)
    } else {
      clearInterval(playRef.current)
      clearInterval(timerRef.current)
    }
    return () => { clearInterval(playRef.current); clearInterval(timerRef.current) }
  }, [isPlaying, totalSlides])

  // ── Open image change modal ───────────────────────────────────────────────
  const openChangeModal = useCallback((index) => {
    setChangingSlideIndex(index)
    setShowImageModal(true)
  }, [])

  // ── Swap image in a slot ─────────────────────────────────────────────────
  const swapImage = useCallback((slot, sourceUrl) => {
    setImages(prev => { const n = [...prev]; n[slot] = sourceUrl; return n })
    setCurrentSlide(slot)
    setShowImageModal(false)
  }, [])

  // ── Generate new image for a slot ────────────────────────────────────────
  const generateNewImage = useCallback(async (slotIndex) => {
    setIsRegenerating(true)
    setRegenMessage(`Generating new image for slide ${slotIndex + 1}…`)
    const promptIdx = slotIndex < (brandData.image_prompts || []).length ? slotIndex : 0
    const prompt    = (brandData.image_prompts || [])[promptIdx] || `Advertising image for ${brandData.company_name}`
    try {
      const res  = await fetch('/api/regenerate-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, index: slotIndex }) })
      const data = await res.json()
      if (data.image) {
        setImages(prev => { const n = [...prev]; n[slotIndex] = data.image; return n })
        setCurrentSlide(slotIndex)
        const stored = JSON.parse(sessionStorage.getItem('adStudioData') || '{}')
        if (stored.images) { stored.images[slotIndex] = data.image; sessionStorage.setItem('adStudioData', JSON.stringify(stored)) }
      }
    } catch (e) { console.error('Regen error:', e) }
    finally { setIsRegenerating(false); setShowImageModal(false) }
  }, [brandData])

  // ── Regenerate ALL images ────────────────────────────────────────────────
  const regenerateAll = useCallback(async () => {
    setIsRegenerating(true)
    setRegenMessage('Regenerating all 6 images with FLUX AI…')
    try {
      const res  = await fetch('/api/generate-images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompts: brandData.image_prompts, company_name: brandData.company_name }) })
      const data = await res.json()
      if (data.images) {
        setImages(data.images)
        const stored = JSON.parse(sessionStorage.getItem('adStudioData') || '{}')
        stored.images = data.images
        sessionStorage.setItem('adStudioData', JSON.stringify(stored))
      }
    } catch (e) { console.error('Regen all error:', e) }
    finally { setIsRegenerating(false); setCurrentSlide(0) }
  }, [brandData])

  // ── Regenerate script ────────────────────────────────────────────────────
  const regenerateScript = useCallback(async () => {
    try {
      const res  = await fetch('/api/regenerate-script', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: brandData.company_name, description: brandData.description, tone: aiSettings.tone, platform: aiSettings.platform }) })
      const data = await res.json()
      if (data.script) setVoice(v => ({ ...v, script: data.script }))
    } catch (e) { console.error('Script regen error:', e) }
  }, [brandData, aiSettings])

  // ── Download helpers ─────────────────────────────────────────────────────
  const downloadImages = () => {
    images.filter(Boolean).forEach((url, i) => {
      const a = Object.assign(document.createElement('a'), { href: url, download: `ad_image_${i+1}.jpg`, target: '_blank' })
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    })
  }
  const downloadScript = () => {
    const txt = `AD SCRIPT — ${brandData.company_name}\n${'='.repeat(50)}\n\n${voice.script}\n\nGenerated by AdStudio AI`
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([txt], { type: 'text/plain' })), download: `${brandData.company_name}_script.txt` })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }
  const downloadBrand = () => {
    const json = JSON.stringify({ ...brandData, images: images.filter(Boolean), banner, voice_script: voice.script, exported_at: new Date().toISOString() }, null, 2)
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: `${brandData.company_name}_brand.json` })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const timeStr = `${String(Math.floor(timeSeconds / 60)).padStart(2,'0')}:${String(timeSeconds % 60).padStart(2,'0')}`

  return (
    <div className="studio-layout">
      <StudioHeader
        companyName={brandData.company_name}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(p => !p)}
        onClose={() => navigate('/')}
      />

      <div className="studio-main">
        <SidebarIcons activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="sidebar-panel">
          {activeTab === 'slideshow' && (
            <SlideshowTab
              images={images}
              currentSlide={currentSlide}
              onSlideClick={setCurrentSlide}
              onChangeClick={openChangeModal}
              onAddImage={() => generateNewImage(currentSlide)}
            />
          )}
          {activeTab === 'banner' && (
            <BannerTab banner={banner} onChange={setBanner} />
          )}
          {activeTab === 'endscreen' && (
            <EndScreenTab endScreen={endScreen} onChange={setEndScreen} />
          )}
          {activeTab === 'music' && (
            <MusicTab music={music} onChange={setMusic} />
          )}
          {activeTab === 'voice' && (
            <VoiceTab voice={voice} onChange={setVoice} onRegenerate={regenerateScript} />
          )}
          {activeTab === 'settings' && (
            <AISettingsTab settings={aiSettings} onChange={setAiSettings} onRegenerateAll={regenerateAll} />
          )}
        </div>

        <div className="preview-section">
          <AdPreview
            images={images}
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            banner={banner}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(p => !p)}
            onPrev={() => setCurrentSlide(s => (s - 1 + totalSlides) % totalSlides)}
            onNext={() => setCurrentSlide(s => (s + 1) % totalSlides)}
            onDotClick={setCurrentSlide}
          />

          <Timeline
            images={images}
            currentSlide={currentSlide}
            onSlideClick={setCurrentSlide}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(p => !p)}
            timeStr={timeStr}
          />

          <div className="save-section">
            <button className="save-btn" onClick={() => setShowExportModal(true)}>
              Save and continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <path d="M5 12h14m-7-7 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageChangeModal
        open={showImageModal}
        images={images}
        targetIndex={changingSlideIndex}
        onClose={() => setShowImageModal(false)}
        onSelect={(url) => swapImage(changingSlideIndex, url)}
        onGenerate={() => generateNewImage(changingSlideIndex >= 0 ? changingSlideIndex : currentSlide)}
      />

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownloadImages={downloadImages}
        onDownloadScript={downloadScript}
        onDownloadBrand={downloadBrand}
        onMakeAnother={() => navigate('/')}
      />

      {isRegenerating && <RegenOverlay message={regenMessage} />}
    </div>
  )
}
