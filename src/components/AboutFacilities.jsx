import './AboutFacilities.css'

function AboutFacilities() {
  return (
    <section id="about" className="about-facilities-section">
      <div className="about-container">
        <div className="about-header">
          <h2 className="section-title">Tentang Kami</h2>
          <p className="section-subtitle">
            Green Mini Soccer adalah lapangan futsal modern dengan fasilitas terbaik untuk pengalaman bermain yang maksimal.
          </p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>Mengapa Memilih Kami?</h3>
            <p>
              Kami menyediakan lapangan futsal berkualitas tinggi dengan rumput sintetis terbaik dan pencahayaan LED yang sempurna. 
              Lokasi strategis di Ngijo, Gunungpati, Semarang membuat kami mudah diakses dari berbagai area.
            </p>
            <p>
              Dengan sistem booking online yang mudah, Anda dapat memesan lapangan kapan saja, di mana saja. 
              Tim kami siap melayani Anda dengan profesional dan ramah.
            </p>
          </div>

          <div className="facilities-grid">
            <div className="facility-card">
              <div className="facility-icon">⚽</div>
              <h4>Lapangan Berkualitas</h4>
              <p>Rumput sintetis premium dengan sistem drainase terbaik</p>
            </div>

            <div className="facility-card">
              <div className="facility-icon">💡</div>
              <h4>Pencahayaan LED</h4>
              <p>Lampu LED terang untuk permainan malam yang nyaman</p>
            </div>

            <div className="facility-card">
              <div className="facility-icon">🚿</div>
              <h4>Shower & Locker</h4>
              <p>Fasilitas shower dan locker room yang bersih</p>
            </div>

            <div className="facility-card">
              <div className="facility-icon">🅿️</div>
              <h4>Parkir Luas</h4>
              <p>Area parkir yang aman dan luas untuk kendaraan Anda</p>
            </div>

            <div className="facility-card">
              <div className="facility-icon">🏪</div>
              <h4>Kantin</h4>
              <p>Kantin dengan berbagai pilihan makanan dan minuman</p>
            </div>

            <div className="facility-card">
              <div className="facility-icon">📱</div>
              <h4>Booking Online</h4>
              <p>Sistem booking mudah dan cepat melalui website</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutFacilities
