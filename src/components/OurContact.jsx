import { useState, useEffect } from 'react'
import './OurContact.css'

function OurContact({ onBack, backgroundImage, asSection = false }) {
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

  if (asSection) {
    return (
      <section id="contact" className="our-contact-section-inline">
        <div className="our-contact-content">
          <div className="contact-header">
            <h2 className="contact-title">Our Contact</h2>
            <p className="contact-subtitle">
              Hubungi kami untuk informasi lebih lanjut.<br />
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
                  <h3>Social Media</h3>
                  <div className="social-links">
                    <a href="https://instagram.com/greenminisoccer" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span>@greenminisoccer</span>
                    </a>
                    <a href="https://www.tiktok.com/@anwarsinyo12?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span>@greenminisoccer</span>
                    </a>
                  </div>
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
      </section>
    )
  }

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
            Hubungi kami untuk informasi lebih lanjut.<br />
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
                <h3>Social Media</h3>
                <div className="social-links">
                  <a href="https://instagram.com/greenminisoccer" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>@greenminisoccer</span>
                  </a>
                  <a href="https://www.tiktok.com/@anwarsinyo12?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span>@greenminisoccer</span>
                  </a>
                </div>
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
