export default function LoadingOverlay({ visible, step, stepsDone, stepTitles, progress, loadingUrl }) {
  if (!visible) return null

  return (
    <div className={`loading-overlay${visible ? ' visible' : ''}`}>
      <div className="loading-card">
        <div className="loading-logo">AdStudio AI</div>
        <h2 className="loading-title">{stepTitles[step] ?? 'Processing…'}</h2>

        <div className="loading-progress">
          <div className="loading-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="loading-steps">
          {stepTitles.map((title, i) => {
            const isDone   = stepsDone.includes(i)
            const isActive = step === i && !isDone
            return (
              <div key={i} className={`loading-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
                <span className={`step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`} />
                <span>{title}</span>
              </div>
            )
          })}
        </div>

        {loadingUrl && <p className="loading-url">{loadingUrl}</p>}
      </div>
    </div>
  )
}
