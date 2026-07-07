const STEPS = [
  { n: '01', icon: '🔗', title: 'Paste your URL', desc: 'Enter your website URL. Our AI analyzes your brand, products, colors, and messaging automatically.' },
  { n: '02', icon: '✨', title: 'AI creates your ad', desc: 'Generates 6 stunning ad images with FLUX AI and a professional voiceover script tailored to your brand.' },
  { n: '03', icon: '🎬', title: 'Edit & download', desc: 'Customize everything in the studio — swap images, edit script, adjust banner, add music, then download.' },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-inner">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Three steps to your perfect ad</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <>
              <div className="step" key={s.n}>
                <div className="step-number">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="step-arrow" key={`arr-${i}`}>→</div>}
            </>
          ))}
        </div>
      </div>
    </section>
  )
}
