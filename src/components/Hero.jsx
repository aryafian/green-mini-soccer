import { useEffect, useState } from 'react'
import './Hero.css'

function Hero({ backgroundImage, onBookNowClick }) {
  const [currentBg, setCurrentBg] = useState(backgroundImage)
  const [nextBg, setNextBg] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (backgroundImage !== currentBg) {
      // Preload next image
      const img = new Image()
      img.src = backgroundImage
      img.onload = () => {
        setNextBg(backgroundImage)
        setIsTransitioning(true)
        
        // After transition completes, swap layers
        setTimeout(() => {
          setCurrentBg(backgroundImage)
          setNextBg(null)
          setIsTransitioning(false)
        }, 5000) // Match CSS transition duration (5s)
      }
    }
  }, [backgroundImage, currentBg])

  return (
    <section className="hero">
      <div 
        className="hero-background hero-background-base"
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      {nextBg && (
        <div 
          className={`hero-background hero-background-next ${isTransitioning ? 'active' : ''}`}
          style={{ backgroundImage: `url(${nextBg})` }}
        />
      )}
      <div className="hero-overlay" />
      
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-line">Green</span>
          <span className="title-line">Mini</span>
          <span className="title-line">Soccer</span>
        </h1>
        
        <div className="hero-tagline">
          <p>Temukan, jadwalkan, dan mulai</p>
          <p>olahraga tanpa ribet.</p>
          <h2 className="brand">LETS GO!</h2>
          <button className="book-now-btn" onClick={onBookNowClick}>Book Now</button>
        </div>
      </div>
    </section>
  )
}

export default Hero
