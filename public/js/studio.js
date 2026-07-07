/* ═══════════════════════════════════════════════════════════════════════════
   AI AD CREATOR — STUDIO EDITOR JAVASCRIPT
   Handles: slide management, sidebar tabs, banner editor, export, modals
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  let studioData = null;
  let brandData  = null;
  let images     = [];          // Array of image URLs (may include nulls)
  let currentSlide = 0;        // 0-based index
  let isPlaying  = false;
  let playInterval = null;
  let changingSlideIndex = -1; // which slide is being changed via modal
  let timelineSeconds = 0;
  let timelineTimer = null;

  // ── DOM References ─────────────────────────────────────────────────────────
  const slideContainer    = document.getElementById('slide-container');
  const slideshowList     = document.getElementById('slideshow-list');
  const slideCounter      = document.getElementById('slide-counter');
  const slideDotsEl       = document.getElementById('slide-dots');
  const imageTrack        = document.getElementById('image-track');
  const bannerOverlay     = document.getElementById('banner-overlay');
  const previewCompanyName= document.getElementById('preview-company-name');
  const previewTagline    = document.getElementById('preview-tagline');
  const previewPhone      = document.getElementById('preview-phone');
  const previewWebsite    = document.getElementById('preview-website');
  const studioCompanyName = document.getElementById('studio-company-name');
  const timelineTimeEl    = document.getElementById('timeline-time');
  const wordCount         = document.getElementById('word-count');

  // Modals
  const modalOverlay      = document.getElementById('modal-overlay');
  const modalImages       = document.getElementById('modal-images');
  const exportModalOverlay= document.getElementById('export-modal-overlay');
  const regenOverlay      = document.getElementById('regen-overlay');
  const regenMessage      = document.getElementById('regen-message');

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    const raw = sessionStorage.getItem('adStudioData');
    if (!raw) {
      // No data — show demo / redirect
      loadDemoData();
    } else {
      try {
        studioData = JSON.parse(raw);
        brandData  = studioData.brandData;
        images     = studioData.images || [];
      } catch {
        loadDemoData();
        return;
      }
    }

    populateBrandData();
    buildSlides();
    buildSlideshowList();
    buildTimeline();
    setupTabs();
    setupBannerControls();
    setupVoiceControls();
    setupMusicControls();
    setupNavButtons();
    setupSaveExport();
    setupModal();
  }

  // ── Demo data (fallback when no sessionStorage) ────────────────────────────
  function loadDemoData() {
    brandData = {
      company_name:  'YourBrand',
      tagline:       'Excellence in every detail',
      description:   'A premium brand delivering exceptional quality and innovation.',
      industry:      'Business',
      primary_color: '#7c3aed',
      website_url:   'yourcompany.com',
      voiceover_script: 'Experience excellence like never before. Our commitment to quality and innovation sets us apart. From premium products to outstanding service, we deliver on every promise. Join thousands of satisfied customers who trust us every day. Visit us online and discover the difference.',
      image_prompts:  Array(6).fill('Professional brand advertising photography'),
    };
    images = Array(6).fill(null);
    studioData = { brandData, images, sourceUrl: '#' };

    populateBrandData();
    buildSlides();
    buildSlideshowList();
    buildTimeline();
    setupTabs();
    setupBannerControls();
    setupVoiceControls();
    setupMusicControls();
    setupNavButtons();
    setupSaveExport();
    setupModal();
  }

  // ── Populate brand data into form fields ───────────────────────────────────
  function populateBrandData() {
    studioCompanyName.textContent = brandData.company_name || 'Your Ad';

    // Banner overlay
    previewCompanyName.textContent = brandData.company_name || 'Company Name';
    previewTagline.textContent     = brandData.tagline || '';
    previewWebsite.textContent     = (brandData.website_url || '').replace(/https?:\/\//, '');

    // Form fields
    setVal('banner-company',  brandData.company_name || '');
    setVal('banner-tagline',  brandData.tagline || '');
    setVal('banner-website',  (brandData.website_url || '').replace(/https?:\/\//, ''));
    setVal('voice-script',    brandData.voiceover_script || '');
    setVal('end-url',         (brandData.website_url || '').replace(/https?:\/\//, ''));
    setVal('end-headline',    `Experience ${brandData.company_name || 'Excellence'}`);
    setVal('end-cta',         'Visit Us Today');
    updateWordCount();

    // Banner color from brand
    const colorEl = document.getElementById('banner-color');
    if (colorEl) {
      colorEl.value = '#0a0a14';
      document.getElementById('banner-color-label').textContent = '#0a0a14';
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  // ── Build slide elements ───────────────────────────────────────────────────
  function buildSlides() {
    slideContainer.innerHTML = '';
    const totalSlides = Math.max(images.length, 6);

    for (let i = 0; i < totalSlides; i++) {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' visible' : '');
      slide.id = `slide-${i}`;

      const imgUrl = images[i];
      if (imgUrl) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `Ad slide ${i + 1}`;
        img.onerror = () => {
          slide.innerHTML = getSlideError(i);
        };
        slide.appendChild(img);
      } else {
        slide.innerHTML = getSlideError(i);
      }

      slideContainer.appendChild(slide);
    }

    buildDots();
    updateSlideCounter();
  }

  function getSlideError(i) {
    const colors = ['#1a0a2e', '#0a1a2e', '#0a2e1a', '#2e1a0a', '#2e0a1a', '#0a0a2e'];
    const emojis = ['🖼️', '✨', '🎯', '💫', '🌟', '🚀'];
    return `<div class="slide-error" style="background: ${colors[i % colors.length]}">
      <span style="font-size:32px">${emojis[i % emojis.length]}</span>
      <span>Slide ${i + 1}</span>
    </div>`;
  }

  // ── Build dots ─────────────────────────────────────────────────────────────
  function buildDots() {
    slideDotsEl.innerHTML = '';
    const total = Math.max(images.length, 6);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'slide-dot-item' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      slideDotsEl.appendChild(dot);
    }
  }

  // ── Build slideshow list (sidebar) ─────────────────────────────────────────
  function buildSlideshowList() {
    slideshowList.innerHTML = '';
    const total = Math.max(images.length, 6);

    for (let i = 0; i < total; i++) {
      const item = document.createElement('div');
      item.className = 'slide-item' + (i === 0 ? ' active-slide' : '');
      item.dataset.index = i;
      item.setAttribute('role', 'listitem');

      const seconds_per = 4;
      const start = i * seconds_per;
      const end   = start + seconds_per;

      item.innerHTML = `
        <div class="slide-drag-handle" aria-hidden="true">⠿</div>
        ${images[i]
          ? `<img class="slide-thumbnail" src="${images[i]}" alt="Slide ${i+1}" loading="lazy">`
          : `<div class="slide-thumbnail-placeholder"><span style="color:var(--text-disabled);font-size:18px">🖼️</span></div>`
        }
        <div class="slide-meta">
          <div class="slide-label">Image #${i + 1}</div>
          <div class="slide-timing">${start}s – ${end}s</div>
          <div class="slide-active-badge">${i === 0 ? 'Currently visible' : ''}</div>
        </div>
        <button class="slide-change-btn" data-slide="${i}" aria-label="Change image ${i+1}">Change</button>
      `;

      // Click slide item → go to that slide
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('slide-change-btn')) {
          goToSlide(i);
        }
      });

      // Change button → open modal
      item.querySelector('.slide-change-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openChangeModal(i);
      });

      slideshowList.appendChild(item);
    }
  }

  // ── Build timeline image track ─────────────────────────────────────────────
  function buildTimeline() {
    imageTrack.innerHTML = '';
    const total = Math.max(images.length, 6);
    const widthPct = 100 / total;

    for (let i = 0; i < total; i++) {
      const block = document.createElement('div');
      block.className = 'track-block image-block' + (i === 0 ? ' active' : '');
      block.style.width = `${widthPct}%`;
      block.dataset.index = i;
      block.setAttribute('aria-label', `Slide ${i + 1}`);

      if (images[i]) {
        block.innerHTML = `<img src="${images[i]}" alt="Slide ${i+1}" style="width:100%;height:100%;object-fit:cover;border-radius:3px">`;
      } else {
        block.textContent = `#${i + 1}`;
      }

      block.addEventListener('click', () => goToSlide(i));
      imageTrack.appendChild(block);
    }
  }

  // ── Slide navigation ───────────────────────────────────────────────────────
  function goToSlide(index) {
    const total = Math.max(images.length, 6);
    if (index < 0 || index >= total) return;

    // Hide old slide
    const oldSlide = document.getElementById(`slide-${currentSlide}`);
    if (oldSlide) oldSlide.classList.remove('visible');

    // Update sidebar list
    const oldItem = slideshowList.querySelector('.active-slide');
    if (oldItem) {
      oldItem.classList.remove('active-slide');
      const badge = oldItem.querySelector('.slide-active-badge');
      if (badge) badge.textContent = '';
    }

    // Show new slide
    currentSlide = index;
    const newSlide = document.getElementById(`slide-${currentSlide}`);
    if (newSlide) newSlide.classList.add('visible');

    // Update sidebar item
    const newItem = slideshowList.querySelector(`[data-index="${currentSlide}"]`);
    if (newItem) {
      newItem.classList.add('active-slide');
      const badge = newItem.querySelector('.slide-active-badge');
      if (badge) badge.textContent = 'Currently visible';
    }

    // Update dots
    document.querySelectorAll('.slide-dot-item').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Update timeline
    document.querySelectorAll('.image-block').forEach((block, i) => {
      block.classList.toggle('active', i === currentSlide);
    });

    updateSlideCounter();
  }

  function updateSlideCounter() {
    const total = Math.max(images.length, 6);
    slideCounter.textContent = `${currentSlide + 1} / ${total}`;
  }

  // ── Sidebar tab switching ──────────────────────────────────────────────────
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-icon');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update buttons
        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Update panels
        document.querySelectorAll('.tab-content').forEach(panel => {
          panel.classList.remove('active');
        });
        const panel = document.getElementById(`tab-${tab}`);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── Banner Controls (live preview update) ──────────────────────────────────
  function setupBannerControls() {
    const fields = {
      'banner-company':  (v) => { previewCompanyName.textContent = v || 'Company Name'; },
      'banner-tagline':  (v) => { previewTagline.textContent = v; },
      'banner-phone':    (v) => { previewPhone.textContent = v; },
      'banner-website':  (v) => { previewWebsite.textContent = v; },
    };

    Object.entries(fields).forEach(([id, handler]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => handler(el.value));
      }
    });

    // Banner color
    const colorEl = document.getElementById('banner-color');
    const colorLabel = document.getElementById('banner-color-label');
    if (colorEl) {
      colorEl.addEventListener('input', () => {
        bannerOverlay.style.background = colorEl.value + 'ee';
        colorLabel.textContent = colorEl.value;
      });
    }

    // Banner visibility toggle
    const visibleToggle = document.getElementById('banner-visible-toggle');
    if (visibleToggle) {
      visibleToggle.addEventListener('change', () => {
        bannerOverlay.classList.toggle('hidden', !visibleToggle.checked);
      });
    }
  }

  // ── Voice & Script Controls ────────────────────────────────────────────────
  function setupVoiceControls() {
    const scriptEl = document.getElementById('voice-script');
    if (scriptEl) {
      scriptEl.addEventListener('input', updateWordCount);
    }

    // Regenerate script button
    const regenScriptBtn = document.getElementById('regenerate-script-btn');
    if (regenScriptBtn) {
      regenScriptBtn.addEventListener('click', regenerateScript);
    }
  }

  function updateWordCount() {
    const scriptEl = document.getElementById('voice-script');
    if (!scriptEl) return;
    const text  = scriptEl.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const secs  = Math.round(words * 0.45); // ~135wpm average
    wordCount.textContent = `${words} words · ~${secs}s`;
  }

  async function regenerateScript() {
    const btn = document.getElementById('regenerate-script-btn');
    if (!btn) return;
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Regenerating...';

    try {
      const tone     = document.getElementById('ai-tone')?.value || 'professional';
      const platform = document.getElementById('ai-platform')?.value || 'tv';
      const res = await fetch('/api/regenerate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: brandData.company_name,
          description:  brandData.description,
          tone,
          platform,
        }),
      });
      const data = await res.json();
      if (data.script) {
        const scriptEl = document.getElementById('voice-script');
        if (scriptEl) {
          scriptEl.value = data.script;
          updateWordCount();
          flashGreen(scriptEl);
        }
      }
    } catch (e) {
      console.error('Script regen error:', e);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  }

  // ── Music Controls ─────────────────────────────────────────────────────────
  function setupMusicControls() {
    const tracks = document.querySelectorAll('.music-track');
    tracks.forEach(track => {
      track.addEventListener('click', () => {
        tracks.forEach(t => {
          t.classList.remove('selected');
          t.setAttribute('aria-checked', 'false');
        });
        track.classList.add('selected');
        track.setAttribute('aria-checked', 'true');
      });
    });
  }

  // ── Navigation buttons ─────────────────────────────────────────────────────
  function setupNavButtons() {
    document.getElementById('prev-slide')?.addEventListener('click', () => {
      const total = Math.max(images.length, 6);
      goToSlide((currentSlide - 1 + total) % total);
    });
    document.getElementById('next-slide')?.addEventListener('click', () => {
      const total = Math.max(images.length, 6);
      goToSlide((currentSlide + 1) % total);
    });

    // Preview play button
    document.getElementById('preview-play-btn')?.addEventListener('click', togglePlay);
    document.getElementById('timeline-play')?.addEventListener('click', togglePlay);
    document.getElementById('preview-btn')?.addEventListener('click', togglePlay);

    // Add image button
    document.getElementById('add-image-btn')?.addEventListener('click', () => {
      generateNewImage(currentSlide);
    });

    // Regenerate all
    document.getElementById('regenerate-all-btn')?.addEventListener('click', regenerateAll);
  }

  // ── Play/Pause slideshow ───────────────────────────────────────────────────
  function togglePlay() {
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('preview-play-btn');
    const tlPlayBtn = document.getElementById('timeline-play');

    if (isPlaying) {
      if (playBtn) playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="28" height="28"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      if (tlPlayBtn) tlPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      // Start timeline
      timelineTimer = setInterval(() => {
        timelineSeconds++;
        const m = Math.floor(timelineSeconds / 60).toString().padStart(2, '0');
        const s = (timelineSeconds % 60).toString().padStart(2, '0');
        timelineTimeEl.textContent = `${m}:${s}`;
      }, 1000);
      // Auto-advance slides every 4s
      playInterval = setInterval(() => {
        const total = Math.max(images.length, 6);
        goToSlide((currentSlide + 1) % total);
      }, 4000);
    } else {
      clearInterval(playInterval);
      clearInterval(timelineTimer);
      if (playBtn) playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      if (tlPlayBtn) tlPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
  }

  // ── Image Change Modal ─────────────────────────────────────────────────────
  function openChangeModal(slideIndex) {
    changingSlideIndex = slideIndex;
    modalImages.innerHTML = '';

    const total = Math.max(images.length, 6);
    for (let i = 0; i < total; i++) {
      const item = document.createElement('div');
      item.className = 'modal-image-item' + (i === slideIndex ? ' selected' : '');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', i === slideIndex ? 'true' : 'false');
      item.dataset.index = i;

      if (images[i]) {
        item.innerHTML = `<img src="${images[i]}" alt="Slide ${i + 1}" loading="lazy">`;
      } else {
        item.innerHTML = `<div class="img-placeholder">Slide ${i + 1}</div>`;
      }

      item.addEventListener('click', () => {
        if (images[i]) {
          swapSlideImage(slideIndex, i);
          closeModal();
        }
      });
      modalImages.appendChild(item);
    }

    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    changingSlideIndex = -1;
  }

  function swapSlideImage(targetSlot, sourceSlot) {
    if (!images[sourceSlot]) return;
    const newUrl = images[sourceSlot];
    // Update images array
    images[targetSlot] = newUrl;
    // Rebuild slides and list
    buildSlides();
    buildSlideshowList();
    buildTimeline();
    goToSlide(targetSlot);
  }

  function setupModal() {
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.getElementById('generate-new-variation-btn')?.addEventListener('click', () => {
      closeModal();
      generateNewImage(changingSlideIndex >= 0 ? changingSlideIndex : currentSlide);
    });
  }

  // ── Generate new image for a slot ─────────────────────────────────────────
  async function generateNewImage(slotIndex) {
    showRegen(`Generating new image for slide ${slotIndex + 1}...`);
    const promptIndex = slotIndex < (brandData.image_prompts || []).length
      ? slotIndex
      : Math.floor(Math.random() * (brandData.image_prompts || []).length);
    const prompt = (brandData.image_prompts || [])[promptIndex]
      || `Professional advertising photography for ${brandData.company_name}`;

    try {
      const res = await fetch('/api/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, index: slotIndex }),
      });
      const data = await res.json();
      if (data.image) {
        images[slotIndex] = data.image;
        // Persist to session storage
        studioData.images = images;
        sessionStorage.setItem('adStudioData', JSON.stringify(studioData));
        buildSlides();
        buildSlideshowList();
        buildTimeline();
        goToSlide(slotIndex);
      }
    } catch (e) {
      console.error('Regen image error:', e);
    } finally {
      hideRegen();
    }
  }

  // ── Regenerate ALL images ──────────────────────────────────────────────────
  async function regenerateAll() {
    showRegen('Regenerating all 6 images...');
    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: brandData.image_prompts,
          company_name: brandData.company_name,
        }),
      });
      const data = await res.json();
      if (data.images) {
        images = data.images;
        studioData.images = images;
        sessionStorage.setItem('adStudioData', JSON.stringify(studioData));
        buildSlides();
        buildSlideshowList();
        buildTimeline();
        goToSlide(0);
      }
    } catch (e) {
      console.error('Regenerate all error:', e);
    } finally {
      hideRegen();
    }
  }

  // ── Regen overlay ──────────────────────────────────────────────────────────
  function showRegen(msg) {
    regenMessage.textContent = msg;
    regenOverlay.style.display = 'flex';
  }
  function hideRegen() {
    regenOverlay.style.display = 'none';
  }

  // ── Save & Export ──────────────────────────────────────────────────────────
  function setupSaveExport() {
    document.getElementById('save-btn')?.addEventListener('click', () => {
      exportModalOverlay.classList.add('open');
    });

    document.getElementById('export-close-btn')?.addEventListener('click', () => {
      exportModalOverlay.classList.remove('open');
    });
    document.getElementById('export-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === exportModalOverlay) exportModalOverlay.classList.remove('open');
    });

    document.getElementById('make-another-btn')?.addEventListener('click', () => {
      window.location.href = '/';
    });

    // Download images — open each in new tab
    document.getElementById('download-images-btn')?.addEventListener('click', downloadImages);
    document.getElementById('download-script-btn')?.addEventListener('click', downloadScript);
    document.getElementById('download-brand-btn')?.addEventListener('click', downloadBrand);
  }

  function downloadImages() {
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) {
      alert('No images to download yet.');
      return;
    }
    validImages.forEach((url, i) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(brandData.company_name)}_ad_image_${i + 1}.jpg`;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  function downloadScript() {
    const script = document.getElementById('voice-script')?.value || brandData.voiceover_script || '';
    const company = brandData.company_name || 'YourBrand';
    const content = `AD SCRIPT — ${company}\n${'='.repeat(50)}\n\n${script}\n\n${'='.repeat(50)}\nGenerated by AdStudio AI\n`;
    downloadText(content, `${sanitizeFilename(company)}_ad_script.txt`);
  }

  function downloadBrand() {
    const company = brandData.company_name || 'YourBrand';
    const exportObj = {
      ...brandData,
      generated_images: images.filter(Boolean),
      studio_settings: {
        banner: {
          company:  document.getElementById('banner-company')?.value,
          tagline:  document.getElementById('banner-tagline')?.value,
          website:  document.getElementById('banner-website')?.value,
          phone:    document.getElementById('banner-phone')?.value,
        },
        voice_script: document.getElementById('voice-script')?.value,
        end_screen: {
          headline: document.getElementById('end-headline')?.value,
          cta:      document.getElementById('end-cta')?.value,
        },
      },
      exported_at: new Date().toISOString(),
      tool: 'AdStudio AI',
    };
    downloadText(JSON.stringify(exportObj, null, 2), `${sanitizeFilename(company)}_brand_brief.json`);
  }

  function downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function sanitizeFilename(name) {
    return (name || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function flashGreen(el) {
    el.style.borderColor = 'var(--success)';
    el.style.boxShadow = '0 0 0 3px var(--success-glow)';
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }, 1500);
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  init();
})();
