import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LoginModal from './components/LoginModal'
import FindAGame from './components/FindAGame'
import OurContact from './components/OurContact'
import './App.css'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [currentBgImage, setCurrentBgImage] = useState(0)
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'find-game', 'our-contact'
  const [currentUser, setCurrentUser] = useState(null)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          picture: user.photoURL,
          loginMethod: user.providerData[0]?.providerId.includes('google') ? 'google' : 'email'
        })
      } else {
        // User is signed out
        setCurrentUser(null)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleLogin = () => {
    setIsLoginOpen(false)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      alert('Logout berhasil!')
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Gagal logout. Silakan coba lagi.')
    }
  }

  // Array untuk background images - bisa diganti sesuai kebutuhan
  const backgroundImages = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2000',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000'
  ]

  const changeBackground = () => {
    setCurrentBgImage((prev) => (prev + 1) % backgroundImages.length)
  }

  const navigateToFindGame = () => {
    setCurrentPage('find-game')
  }

  const navigateToContact = () => {
    setCurrentPage('our-contact')
  }

  const navigateToHome = () => {
    setCurrentPage('home')
    // Scroll to top setelah navigasi
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  if (currentPage === 'find-game') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <FindAGame 
          onBack={navigateToHome} 
          currentUser={currentUser}
          onLoginClick={() => setIsLoginOpen(true)}
        />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (currentPage === 'our-contact') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <OurContact onBack={navigateToHome} />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)} 
        onFindGameClick={navigateToFindGame}
        onHomeClick={navigateToHome}
        onContactClick={navigateToContact}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <Hero 
        backgroundImage={backgroundImages[currentBgImage]}
        onChangeBackground={changeBackground}
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default App
