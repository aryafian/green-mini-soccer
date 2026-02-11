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
          <div className="contact-grid">
            <div className="info-section">
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

            <div className="map-section">
              <h3 className="map-title"></h3>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12125.9289778068!2d110.36662804999999!3d-7.0693934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7089007517809b%3A0x421fce06070c6ddb!2sGREEN%20MINI%20SOCCER!5e1!3m2!1sid!2sid!4v1770825268269!5m2!1sid!2sid"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Green Mini Soccer Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OurContact
