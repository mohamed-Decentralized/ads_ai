/* ═══════════════════════════════════════════════════════════════════════════
   AI AD CREATOR — LANDING PAGE JAVASCRIPT
   Handles: URL input, validation, API calls, loading animation, redirect
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Elements ───────────────────────────────────────────────────────────────
  const urlInput       = document.getElementById('url-input');
  const generateBtn    = document.getElementById('generate-btn');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingTitle   = document.getElementById('loading-title');
  const loadingBar     = document.getElementById('loading-bar');
  const loadingUrlEl   = document.getElementById('loading-url');
  const errorToast     = document.getElementById('error-toast');

  // ── Step elements ──────────────────────────────────────────────────────────
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5'),
  ];

  const stepTitles = [
    'Analyzing your website...',
    'Extracting brand identity...',
    'Writing your ad script...',
    'Generating 6 AI visuals...',
    'Opening your studio...',
  ];

  // ── Utilities ──────────────────────────────────────────────────────────────
  function normalizeUrl(raw) {
    raw = raw.trim();
    if (!raw) return null;
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      raw = 'https://' + raw;
    }
    try {
      const u = new URL(raw);
      return u.href;
    } catch {
      return null;
    }
  }

  function showError(msg) {
    errorToast.textContent = msg;
    errorToast.classList.add('visible');
    setTimeout(() => errorToast.classList.remove('visible'), 5000);
  }

  function setStepState(index, state) {
    // state: 'active' | 'done' | 'pending'
    const stepEl = steps[index];
    if (!stepEl) return;
    const dot = stepEl.querySelector('.step-dot');
    dot.className = `step-dot ${state}`;
    stepEl.className = `loading-step${state === 'active' ? ' active' : ''}${state === 'done' ? ' done' : ''}`;
  }

  function setProgress(pct, title) {
    loadingBar.style.width = `${pct}%`;
    if (title) loadingTitle.textContent = title;
  }

  function showLoading(url) {
    loadingUrlEl.textContent = url;
    loadingOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    // Reset all steps
    steps.forEach((_, i) => setStepState(i, 'pending'));
    setProgress(0, stepTitles[0]);
  }

  function hideLoading() {
    loadingOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // ── Main generation flow ───────────────────────────────────────────────────
  async function generateAd() {
    const rawUrl = urlInput.value.trim();
    const url = normalizeUrl(rawUrl);

    if (!url) {
      showError('Please enter a valid website URL (e.g. yourcompany.com)');
      urlInput.focus();
      return;
    }

    // Disable button
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    showLoading(url);

    try {
      // ── STEP 1: Analyze URL ──────────────────────────────────────────────
      setStepState(0, 'active');
      setProgress(5, stepTitles[0]);

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Failed to analyze URL');
      }

      const analyzeData = await analyzeRes.json();
      const brandData = analyzeData.brandData;

      setStepState(0, 'done');

      // ── STEP 2: Brand extraction done ────────────────────────────────────
      setStepState(1, 'active');
      setProgress(25, stepTitles[1]);
      await delay(600);
      setStepState(1, 'done');

      // ── STEP 3: Script ready ─────────────────────────────────────────────
      setStepState(2, 'active');
      setProgress(40, stepTitles[2]);
      await delay(500);
      setStepState(2, 'done');

      // ── STEP 4: Generate images ───────────────────────────────────────────
      setStepState(3, 'active');
      setProgress(50, stepTitles[3]);

      // Update progress during image generation
      const progressTimer = animateProgress(50, 90, 40000); // simulate up to 90% over 40s

      const imagesRes = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: brandData.image_prompts,
          company_name: brandData.company_name
        })
      });

      clearInterval(progressTimer);

      if (!imagesRes.ok) {
        const err = await imagesRes.json().catch(() => ({ error: 'Image generation failed' }));
        throw new Error(err.error || 'Failed to generate images');
      }

      const imagesData = await imagesRes.json();
      setStepState(3, 'done');

      // ── STEP 5: Redirecting ───────────────────────────────────────────────
      setStepState(4, 'active');
      setProgress(97, stepTitles[4]);

      // Store all data in sessionStorage
      const studioData = {
        brandData,
        images: imagesData.images,
        timestamp: Date.now(),
        sourceUrl: url,
      };
      sessionStorage.setItem('adStudioData', JSON.stringify(studioData));

      await delay(500);
      setStepState(4, 'done');
      setProgress(100, 'Ready!');
      await delay(400);

      // Navigate to studio
      window.location.href = '/studio';

    } catch (err) {
      console.error('[Generate] Error:', err);
      hideLoading();
      generateBtn.disabled = false;
      generateBtn.innerHTML = `Generate Ad <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`;
      showError(err.message || 'Something went wrong. Please try again.');
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function animateProgress(from, to, durationMs) {
    const steps = 60;
    const interval = durationMs / steps;
    const step = (to - from) / steps;
    let current = from;
    const timer = setInterval(() => {
      current += step;
      if (current >= to) {
        clearInterval(timer);
        return;
      }
      loadingBar.style.width = `${current}%`;
    }, interval);
    return timer;
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  generateBtn.addEventListener('click', generateAd);

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateAd();
  });

  // Focus input on load
  urlInput.focus();

  // Hint cycling
  const hints = [
    'apple.com · tesla.com · nike.com · starbucks.com',
    'airbnb.com · spotify.com · shopify.com · stripe.com',
    'yourcompany.com · yourbrand.co · myshop.store',
  ];
  let hintIndex = 0;
  const hintEl = document.getElementById('hint-example');
  if (hintEl) {
    setInterval(() => {
      hintIndex = (hintIndex + 1) % hints.length;
      hintEl.style.opacity = '0';
      setTimeout(() => {
        hintEl.textContent = hints[hintIndex];
        hintEl.style.opacity = '1';
      }, 300);
    }, 3000);
  }
})();
