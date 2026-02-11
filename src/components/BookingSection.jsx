import { useState } from 'react'
import './BookingSection.css'

function BookingSection() {
  const [formData, setFormData] = useState({
    venue: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const venueNames = {
      'lapangan-a': 'Lapangan A - Indoor',
      'lapangan-b': 'Lapangan B - Outdoor',
      'lapangan-c': 'Lapangan C - Indoor Premium'
    }

    const formatDate = (dateString) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('id-ID', options)
    }

    alert(`Booking berhasil!\n\nDetail booking:\nLapangan: ${venueNames[formData.venue]}\nTanggal: ${formatDate(formData.date)}\nWaktu: ${formData.time}\n\nKonfirmasi akan dikirim ke ${formData.email}`)
    
    setFormData({
      venue: '',
      date: '',
      time: '',
      name: '',
      phone: '',
      email: ''
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <section className="booking-section">
      <div className="container">
        <h2 className="section-title">Booking Lapangan</h2>
        <div className="booking-form-wrapper">
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="venue">Pilih Lapangan</label>
              <select 
                id="venue" 
                name="venue" 
                value={formData.venue}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Lapangan --</option>
                <option value="lapangan-a">Lapangan A - Indoor</option>
                <option value="lapangan-b">Lapangan B - Outdoor</option>
                <option value="lapangan-c">Lapangan C - Indoor Premium</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Tanggal</label>
              <input 
                type="date" 
                id="date" 
                name="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Waktu</label>
              <select 
                id="time" 
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Waktu --</option>
                <option value="08:00">08:00 - 09:00</option>
                <option value="09:00">09:00 - 10:00</option>
                <option value="10:00">10:00 - 11:00</option>
                <option value="14:00">14:00 - 15:00</option>
                <option value="15:00">15:00 - 16:00</option>
                <option value="16:00">16:00 - 17:00</option>
                <option value="18:00">18:00 - 19:00</option>
                <option value="19:00">19:00 - 20:00</option>
                <option value="20:00">20:00 - 21:00</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name"               
                placeholder="Nama lengkap"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">No. Telepon</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                placeholder="08xx xxxx xxxx"
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="email@contoh.com"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="submit-btn">Book Now</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default BookingSection
