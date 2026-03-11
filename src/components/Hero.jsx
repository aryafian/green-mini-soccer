import './Hero.css'

function Hero({ onBookNowClick }) {
  return (
    <section className="hero">
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
