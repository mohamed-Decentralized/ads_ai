const TABS = [
  { id: 'slideshow', label: 'Slides', title: 'Slideshow',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { id: 'banner', label: 'Banner', title: 'Bottom Banner',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><rect x="2" y="15" width="20" height="6" rx="1"/><path d="M2 4h20M2 9h14"/></svg> },
  { id: 'endscreen', label: 'End', title: 'End Screen',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> },
  { id: 'music', label: 'Music', title: 'Music',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  { id: 'voice', label: 'Voice', title: 'Voice & Script',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
  { id: 'settings', label: 'AI', title: 'AI Settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
]

export default function SidebarIcons({ activeTab, onTabChange }) {
  return (
    <nav className="sidebar-icons">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-icon${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onTabChange(t.id)}
          title={t.title}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
