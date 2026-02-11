import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SPARRING</h3>
            <p>Platform booking lapangan futsal terpercaya</p>
          </div>
          <div className="footer-section">
            <h4>Kontak</h4>
            <p>Email: info@sparring.com</p>
            <p>Telp: +62 xxx xxxx xxxx</p>
          </div>
          <div className="footer-section">
            <h4>Ikuti Kami</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Twitter">TW</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SPARRING. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
