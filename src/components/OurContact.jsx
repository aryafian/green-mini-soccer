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
                  <div className="social-links">
                    <a href="https://wa.me/6281227950651" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>+62 812 2795 0651</span>
                    </a>
                  </div>
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
                <div className="social-links">
                  <a href="https://wa.me/6281227950651" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>+62 812 2795 0651</span>
                  </a>
                </div>
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
