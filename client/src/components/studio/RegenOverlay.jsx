export default function RegenOverlay({ message }) {
  return (
    <div className="regen-overlay">
      <div className="regen-card">
        <div className="spinner large" />
        <p className="regen-message">{message}</p>
        <div className="regen-sub">Powered by FLUX Schnell AI</div>
      </div>
    </div>
  )
}
