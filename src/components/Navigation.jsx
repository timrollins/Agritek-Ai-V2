import '../styles/Navigation.css'

export default function Navigation({ onNavigate, currentPage }) {
  const navItems = [
    { id: 1, icon: '📊', label: 'Dashboard', active: true, page: 'dashboard' },
    { id: 2, icon: '🌱', label: 'My Plants', page: 'my-plants' },
    { id: 3, icon: '🤖', label: 'AI Insights', page: 'ai-insights' }
  ]

  const handleNavClick = (page) => {
    onNavigate(page)
  }

  return (
    <nav className="navigation closed">
      

      <ul className="nav-items">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              className={`nav-link ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => handleNavClick(item.page)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-footer">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <p className="user-name">Tim</p>
            <p className="user-email">tim@agritek.com</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
