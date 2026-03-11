import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import LoginModal from './components/LoginModal'
import FindAGame from './components/FindAGame'
import OurContact from './components/OurContact'
import History from './components/History'
import Transaction from './components/Transaction'
import News from './components/News'
import NewsDetail from './components/NewsDetail'
import AboutFacilities from './components/AboutFacilities'
import Admin from './components/Admin'
import './App.css'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [currentBgImage, setCurrentBgImage] = useState(0)
  const [nextBgImage, setNextBgImage] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'find-game', 'our-contact', 'history', 'transaction', 'news', 'news-detail', 'admin'
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [backgroundImages, setBackgroundImages] = useState([
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2000',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000'
  ])

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          picture: user.photoURL,
          loginMethod: user.providerData[0]?.providerId.includes('google') ? 'google' : 'email'
        })
        setIsLoginOpen(false) // Tutup modal otomatis setelah login berhasil
      } else {
        setCurrentUser(null)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Load backgrounds from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'backgrounds'), (snapshot) => {
      const bgData = snapshot.docs.map(doc => doc.data().url)
      
      // If Firestore has backgrounds, use them; otherwise keep default
      if (bgData.length > 0) {
        setBackgroundImages(bgData)
      }
    }, (error) => {
      console.error('Error loading backgrounds:', error)
    })

    return () => unsubscribe()
  }, [])

  // Auto-change background every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBgImage + 1) % backgroundImages.length
      setNextBgImage(nextIndex)
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentBgImage(nextIndex)
        setNextBgImage(null)
        setIsTransitioning(false)
      }, 5000) // Match CSS transition duration
    }, 30000)

    return () => clearInterval(interval)
  }, [currentBgImage])

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

  const navigateToFindGame = () => {
    setCurrentPage('find-game')
  }

  const navigateToContact = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home')
      setTimeout(() => {
        const element = document.getElementById('contact')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.getElementById('contact')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navigateToHistory = () => {
    setCurrentPage('history')
  }

  const navigateToTransaction = () => {
    setCurrentPage('transaction')
  }

  const navigateToAdmin = () => {
    setCurrentPage('admin')
  }

  const navigateToNews = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home')
      setTimeout(() => {
        const element = document.getElementById('news')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.getElementById('news')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const navigateToHome = () => {
    setCurrentPage('home')
    // Scroll to top setelah navigasi
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem)
    setCurrentPage('news-detail')
  }

  const navigateFromNewsDetail = () => {
    setCurrentPage('home')
    setTimeout(() => {
      const element = document.getElementById('news')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
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
          onHistoryClick={navigateToHistory}
          onTransactionClick={navigateToTransaction}
          onAdminClick={navigateToAdmin}
          onNewsClick={navigateToNews}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <FindAGame 
          onBack={navigateToHome} 
          currentUser={currentUser}
          onLoginClick={() => setIsLoginOpen(true)}
          backgroundImage={backgroundImages[currentBgImage]}
        />
        <LoginModal 
          key="login-modal"
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (currentPage === 'history') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          onHistoryClick={navigateToHistory}
          onTransactionClick={navigateToTransaction}
          onAdminClick={navigateToAdmin}
          onNewsClick={navigateToNews}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <History 
          onBack={navigateToHome}
          currentUser={currentUser}
          backgroundImage={backgroundImages[currentBgImage]}
        />
        <LoginModal 
          key="login-modal"
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (currentPage === 'transaction') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          onHistoryClick={navigateToHistory}
          onTransactionClick={navigateToTransaction}
          onAdminClick={navigateToAdmin}
          onNewsClick={navigateToNews}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Transaction 
          onBack={navigateToHome}
          currentUser={currentUser}
          backgroundImage={backgroundImages[currentBgImage]}
        />
        <LoginModal 
          key="login-modal"
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (currentPage === 'admin') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          onHistoryClick={navigateToHistory}
          onTransactionClick={navigateToTransaction}
          onAdminClick={navigateToAdmin}
          onNewsClick={navigateToNews}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Admin 
          currentUser={currentUser}
          backgroundImage={backgroundImages[currentBgImage]}
        />
        <LoginModal 
          key="login-modal"
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  if (currentPage === 'news-detail') {
    return (
      <div className="app">
        <Navbar 
          onLoginClick={() => setIsLoginOpen(true)} 
          onFindGameClick={navigateToFindGame}
          onHomeClick={navigateToHome}
          onContactClick={navigateToContact}
          onHistoryClick={navigateToHistory}
          onTransactionClick={navigateToTransaction}
          onAdminClick={navigateToAdmin}
          onNewsClick={navigateToNews}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <NewsDetail 
          newsItem={selectedNews}
          onBack={navigateFromNewsDetail}
          backgroundImage={backgroundImages[currentBgImage]}
        />
        <LoginModal 
          key="login-modal"
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-background-wrapper">
        <div 
          className="app-background app-background-base"
          style={{ backgroundImage: `url(${backgroundImages[currentBgImage]})` }}
        />
        {nextBgImage !== null && (
          <div 
            className={`app-background app-background-next ${isTransitioning ? 'active' : ''}`}
            style={{ backgroundImage: `url(${backgroundImages[nextBgImage]})` }}
          />
        )}
        <div className="app-overlay" />
      </div>
      
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)} 
        onFindGameClick={navigateToFindGame}
        onHomeClick={navigateToHome}
        onContactClick={() => {
          const element = document.getElementById('contact')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        onHistoryClick={navigateToHistory}
        onTransactionClick={navigateToTransaction}
        onAdminClick={navigateToAdmin}
        onNewsClick={() => {
          const element = document.getElementById('news')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <Hero 
        onBookNowClick={navigateToFindGame}
      />
      <AboutFacilities />
      <News onNewsClick={handleNewsClick} />
      <OurContact asSection={true} />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default App
