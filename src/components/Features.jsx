import { useEffect, useRef } from 'react'
import './Features.css'

function Features() {
  const featuresRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    featuresRef.current.forEach(card => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      id: 'find-game',
      icon: '🎮',
      title: 'Find A Game',
      description: 'Temukan pertandingan futsal sesuai dengan lokasi dan jadwal Anda'
    },
    {
      id: 'book-venue',
      icon: '⚽',
      title: 'Book A Venue',
      description: 'Booking lapangan futsal favorit Anda dengan mudah dan cepat'
    },
    {
      id: 'join-community',
      icon: '👥',
      title: 'Join Community',
      description: 'Bergabung dengan komunitas pemain futsal dan perluas jaringan Anda'
    }
  ]

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">Fitur Kami</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              id={feature.id}
              className="feature-card"
              ref={el => featuresRef.current[index] = el}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
