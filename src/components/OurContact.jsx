import { useState, useEffect } from 'react'
import './OurContact.css'

function OurContact({ onBack, backgroundImage }) {
  const [currentBg, setCurrentBg] = useState(backgroundImage)
  const [nextBg, setNextBg] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (backgroundImage !== currentBg) {
      const img = new Image()
      img.src = backgroundImage
      img.onload = () => {
        setNextBg(backgroundImage)
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentBg(backgroundImage)
          setNextBg(null)
          setIsTransitioning(false)
        }, 5000) // Match CSS transition duration (5s)
      }
    }
  }, [backgroundImage, currentBg])

  return (
    <div className="our-contact-page">
      <div 
        className="page-background page-background-base"
        style={{ backgroundImage: `url(${currentBg})` }}
      />
      {nextBg && (
        <div 
          className={`page-background page-background-next ${isTransitioning ? 'active' : ''}`}
          style={{ backgroundImage: `url(${nextBg})` }}
        />
      )}
      <div className="page-overlay" />
      <div className="our-contact-content">
        <div className="contact-header">
          <h1 className="contact-title">Our Contact</h1>
          <p className="contact-subtitle">
            Hubungi kami untuk informasi lebih lanjut atau konsultasi.<br />
            Tim kami siap membantu Anda!
          </p>
        </div>

        <div className="contact-info-container">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"></div>
              <h3>Alamat</h3>
              <p>Ngijo, Kecamatan Gunungpati</p>
              <p>Kota Semarang, Jawa Tengah 50228</p>
            </div>

            <div className="info-item">
              <div className="info-icon"></div>
              <h3>Email</h3>
              <p>info@greenminisoccer.com</p>
              <p>support@greenminisoccer.com</p>
            </div>

            <div className="info-item">
              <div className="info-icon"></div>
              <h3>Telepon</h3>
              <p>+62 812 2795 0651</p>
            </div>

            <div className="info-item">
              <div className="info-icon"></div>
              <h3>Jam Operasional</h3>
              <p>Senin - Jumat: 06:00 - 23:00</p>
              <p>Sabtu - Minggu: 06:00 - 23:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OurContact
