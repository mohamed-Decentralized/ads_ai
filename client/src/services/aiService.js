const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const FAL_KEY = import.meta.env.VITE_FAL_API_KEY;

async function fetchWithTimeout(url, opts = {}, ms = 30000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function callGemini(prompt, system = '', jsonMode = true) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {})
    }
  };
  
  if (jsonMode) {
    body.generationConfig.responseSchema = {
      type: "OBJECT",
      properties: {
        company_name: { type: "STRING" },
        tagline: { type: "STRING" },
        description: { type: "STRING" },
        industry: { type: "STRING" },
        primary_color: { type: "STRING" },
        key_products: { type: "ARRAY", items: { type: "STRING" } },
        key_benefits: { type: "ARRAY", items: { type: "STRING" } },
        target_audience: { type: "STRING" },
        brand_tone: { type: "STRING" },
        website_url: { type: "STRING" },
        voiceover_script: { type: "STRING" },
        video_concept: { type: "STRING" },
        image_prompts: {
          type: "OBJECT",
          properties: {
            hero: { type: "STRING" },
            product: { type: "STRING" },
            lifestyle: { type: "STRING" }
          },
          required: ["hero", "product", "lifestyle"]
        },
        social_copy: {
          type: "OBJECT",
          properties: {
            headline: { type: "STRING" },
            subheadline: { type: "STRING" },
            cta: { type: "STRING" }
          },
          required: ["headline", "subheadline", "cta"]
        }
      },
      required: ["company_name", "tagline", "description", "industry", "primary_color", "key_products", "key_benefits", "target_audience", "brand_tone", "website_url", "voiceover_script", "video_concept", "image_prompts", "social_copy"]
    };
  }

  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, 50000);
  
  const data = await res.json();
  if (!res.ok) throw new Error(`Gemini: ${data.error?.message || JSON.stringify(data)}`);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

export async function scrapeWebsite(baseUrl) {
  const subPaths = ['/about', '/about-us', '/products', '/services', '/our-story', '/what-we-do'];
  const toVisit = [baseUrl];

  try {
    const homeRes = await fetchWithTimeout(`https://r.jina.ai/${baseUrl}`, { 
      headers: { Accept: 'text/plain', 'X-Return-Format': 'text' } 
    }, 18000);
    const homeText = homeRes.ok ? await homeRes.text() : '';

    for (const sub of subPaths) {
      try { toVisit.push(new URL(sub, baseUrl).href); } catch {}
    }

    let combined = `--- HOME (${baseUrl}) ---\n${homeText.slice(0, 4000)}\n\n`;

    const subResults = await Promise.allSettled(
      toVisit.slice(1, 4).map(async (url) => {
        const res = await fetchWithTimeout(`https://r.jina.ai/${url}`, { 
          headers: { Accept: 'text/plain', 'X-Return-Format': 'text' } 
        }, 12000);
        if (!res.ok) return null;
        const text = await res.text();
        return `--- ${url} ---\n${text.slice(0, 2500)}\n\n`;
      })
    );

    for (const r of subResults) {
      if (r.status === 'fulfilled' && r.value) combined += r.value;
    }

    return combined.slice(0, 14000);
  } catch (e) {
    console.warn('[Scrape] Failed:', e.message);
    return `Website URL: ${baseUrl}`;
  }
}

function fallbackBrand(cleanUrl) {
  const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('.')[0];
  const name = domain.charAt(0).toUpperCase() + domain.slice(1);
  return {
    company_name: name, tagline: 'Excellence in every detail',
    description: `${name} delivers exceptional products and services.`,
    industry: 'Business', primary_color: '#7c3aed',
    key_products: ['Products', 'Services', 'Solutions'],
    key_benefits: ['Quality', 'Innovation', 'Trust'],
    target_audience: 'Discerning consumers', brand_tone: 'professional',
    website_url: cleanUrl,
    video_concept: `A cinematic advertisement for ${name} showcasing their products in a modern, professional environment with beautiful lighting and dynamic camera movements.`,
    voiceover_script: `Discover ${name}. Where quality meets innovation. Join thousands of satisfied customers who trust us every day. Visit us online now.`,
    image_prompts: {
      hero: `Professional advertising photograph for ${name}. Stunning commercial photography, brand colors, aspirational lifestyle.`,
      product: `${name} product showcase, professional studio lighting, premium quality, commercial advertising style.`,
      lifestyle: `People enjoying ${name} products, authentic lifestyle photography, warm golden light, aspirational.`,
    },
    social_copy: {
      headline: name,
      subheadline: 'Excellence in every detail',
      cta: 'Learn More'
    }
  };
}

export async function analyzeContent(siteContent, cleanUrl, includeHumans = false) {
  const system = `You are an expert advertising creative director and brand analyst.
Analyze the provided website content thoroughly and return ONLY valid JSON — no markdown, no explanation.`;

  const humanInstruction = includeHumans 
    ? "The video concept MUST feature human actors (can be animated or photorealistic humans). Create a story focused on characters, lifestyle, and how people interact with the product or service."
    : "The video concept MUST NOT feature human actors. Create a story focused heavily on the product itself, dynamic camera movements, beautiful environments matching the brand aesthetic, and abstract or graphical elements.";

  const videoFormat = "To get a multi-scene video, physically chain the scenes together using transition phrases and semicolons. Describe the subject, their action, and the environment. Focus strictly on the observable. Command the lighting and aesthetic (e.g. 'soft ambient lighting', 'pristine white', 'cinematic depth of field'). Dictate camera movement (e.g. 'smoothly zooms', 'pans and rotates'). Specify transitions (e.g. 'seamless morph'). Isolate the subject using clean backgrounds. Example: '[Format & Theme] + [Scene 1 Action + Setting] + \"transitioning to\" + [Scene 2 Action + Setting] + [Aesthetic Keywords] + \"ending with\" + [Final Frame/Text].'";

  const prompt = `Analyze this website content deeply and create a comprehensive brand and advertising profile.

Website URL: ${cleanUrl}
Website Content (multiple pages):
${siteContent}

User Preference for Video: ${includeHumans ? "MUST include human actors" : "MUST NOT include human actors"}

Return ONLY a JSON object with this exact structure:
{
  "company_name": "Actual company name from the site",
  "tagline": "Short punchy tagline (max 8 words) — either from site or create a better one",
  "description": "2-3 sentence company description covering what they do, who they serve, and their value proposition",
  "industry": "Specific industry category",
  "primary_color": "#hexcolor matching their actual brand",
  "key_products": ["product/service 1", "product/service 2", "product/service 3"],
  "key_benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "target_audience": "Specific target customer description",
  "brand_tone": "professional|fun|luxury|bold|friendly",
  "website_url": "${cleanUrl}",
  "voiceover_script": "Compelling 25-35 second TV voiceover script (55-70 words). Emotional, engaging, ends with strong CTA.",
  "video_concept": "Write a dense, linear set of visual instructions for a video ad. ${videoFormat} ${humanInstruction} Be extremely specific about lighting, color, style, and motion. Do not use bullet points or newlines, just one continuous paragraph chaining the scenes.",
  "image_prompts": {
    "hero": "Write an extremely detailed image generation prompt for a hero social media ad. Describe the exact background (matching the website design), product-related icons/imagery, and atmospheric lighting. If short, smart text should appear in the image, specify exactly what it is (e.g. 'Text rendering: \"Smart Words\"'). Make the description perfectly relevant to the brand.",
    "product": "Highly detailed product/service showcase image prompt. Studio quality, commercial photography.",
    "lifestyle": "Lifestyle photography prompt showing target customers using/benefiting from the product/service."
  },
  "social_copy": {
    "headline": "A punchy 5-7 word ad headline for social media",
    "subheadline": "A supporting line (10-12 words)",
    "cta": "Call to action text (2-4 words, e.g. Shop Now, Learn More, Get Started)"
  }
}`;

  try {
    const text = await callGemini(prompt, system, true);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[Analyze] Gemini failed:', e.message);
    return fallbackBrand(cleanUrl);
  }
}

export async function generateImage(prompt, aspectRatio = '1:1', userFalKey = '') {
  let imageSize;
  switch (aspectRatio) {
    case '16:9': imageSize = 'landscape_16_9'; break;
    case '9:16': imageSize = 'portrait_16_9'; break;
    default: imageSize = 'square_hd'; break;
  }

  const url = 'https://fal.run/fal-ai/flux/dev';
  const apiKey = userFalKey || FAL_KEY;
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: imageSize,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true
    })
  }, 90000);

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error?.message || 'fal.ai FLUX generation failed');
  
  if (data.images && data.images[0] && data.images[0].url) {
    return data.images[0].url;
  }
  throw new Error('No image returned from fal.ai');
}

export async function generateVideo(prompt, brandData, userFalKey = '') {
  const falUrl = 'https://fal.run/fal-ai/kling-video/v2.6/pro/text-to-video';
  
  const videoPrompt = `${prompt}
Cinematic quality, professional commercial production, smooth camera movement, high production value, 4K quality, vibrant colors matching ${brandData.primary_color} brand palette.`;

  const apiKey = userFalKey || FAL_KEY;
  const res = await fetchWithTimeout(
    falUrl,
    {
      method: 'POST',
      headers: { 
        'Authorization': `Key ${apiKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        negative_prompt: 'blurry, low quality, text, watermark, amateur, shaky, dark, ugly',
        duration: '10'
      })
    },
    180000
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Video generation failed');

  return data.video?.url;
}
