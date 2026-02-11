import { useEffect, useState } from 'react'
import './Hero.css'

function Hero({ backgroundImage, onChangeBackground }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const img = new Image()
    img.src = backgroundImage
    img.onload = () => setLoaded(true)
  }, [backgroundImage])

  return (
    <section className="hero">
      <div 
        className={`hero-background ${loaded ? 'loaded' : ''}`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="hero-overlay" />
      
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-line">Match</span>
          <span className="title-line">Play</span>
          <span className="title-line">Repeat</span>
        </h1>
        
        <div className="hero-tagline">
          <p>Temukan, jadwalkan, dan mulai</p>
          <p>olahraga tanpa ribet.</p>
          <h2 className="brand">SPARRING</h2>
          <button className="book-now-btn">Book Now</button>
        </div>
      </div>

      <button className="bg-change-btn" onClick={onChangeBackground} title="Ganti Background">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </button>

      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  )
}

export default Hero
