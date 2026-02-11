import { useState, useEffect } from 'react'
import './Navbar.css'

function Navbar({ onLoginClick, onFindGameClick, onHomeClick, onContactClick, onHistoryClick, onTransactionClick, currentUser, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-profile')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
    setIsMenuOpen(false)
  }

  const handleFindGameClick = () => {
    if (onFindGameClick) {
      onFindGameClick()
    } else {
      scrollToSection('find-game')
    }
    setIsMenuOpen(false)
  }

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      scrollToSection('our-contact')
    }
    setIsMenuOpen(false)
  }

  const handleTransactionClick = () => {
    if (onTransactionClick) {
      onTransactionClick()
    }
    setIsMenuOpen(false)
  }

  const isAdmin = currentUser && currentUser.email === 'aryafian232@gmail.com'

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <button onClick={handleHomeClick} className="nav-btn">
            Home
          </button>
          <button onClick={handleFindGameClick} className="nav-btn">
            Booking
          </button>
          <button onClick={handleContactClick} className="nav-btn">
            Our Contact
          </button>
          {isAdmin && (
            <button onClick={handleTransactionClick} className="nav-btn">
              Transaction
            </button>
          )}
        </div>

        <div className="nav-right">
          {currentUser ? (
            <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
              {currentUser.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.email[0].toUpperCase()}
                </div>
              )}
              <span className="user-name">{currentUser.name || currentUser.email}</span>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <strong>{currentUser.name}</strong>
                    <p>{currentUser.email}</p>
                  </div>
                  <button className="history-btn" onClick={(e) => { e.stopPropagation(); onHistoryClick(); setShowUserMenu(false); }}>
                    History
                  </button>
                  <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onLogout(); setShowUserMenu(false); }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={onLoginClick}>
                Login
              </button>
              <button className="user-icon" onClick={onLoginClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
