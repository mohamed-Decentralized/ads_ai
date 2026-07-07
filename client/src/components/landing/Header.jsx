export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo">
          <span className="logo-icon">✦</span>
          AdStudio <span className="logo-badge">AI</span>
        </a>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <button className="btn-ghost" style={{ marginLeft: 'auto' }}>Sign in →</button>
      </div>
    </header>
  )
}
