import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import './History.css'

function History({ onBack, currentUser, backgroundImage }) {
  const [currentBg, setCurrentBg] = useState(backgroundImage)
  const [nextBg, setNextBg] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Handle background transitions
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
        }, 5000)
      }
    }
  }, [backgroundImage, currentBg])

  // Listen to user's bookings from Firestore
  useEffect(() => {
    if (!currentUser) {
      setBookings([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'bookings'),
      where('bookedByUid', '==', currentUser.uid)
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = []
      querySnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        })
      })
      // Sort by bookedAt descending on client side
      bookingsData.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
      setBookings(bookingsData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching bookings:', error)
      alert('Gagal memuat riwayat booking: ' + error.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const formatDate = (dateObj) => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${dateObj.date} ${monthNames[dateObj.month]} ${dateObj.year}`
  }

  const formatTime = (timeIndex, duration) => {
    const hours = 6 + timeIndex
    const endHours = hours + duration
    return `${hours.toString().padStart(2, '0')}:00 - ${endHours.toString().padStart(2, '0')}:00`
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="history-page">
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
      
      <div className="history-content">
        <div className="history-header">
          <h1 className="history-title">Riwayat Booking</h1>
          <p className="history-subtitle">
            Lihat semua riwayat booking lapangan Anda.<br />
            Kelola dan pantau jadwal permainan Anda.
          </p>
        </div>

        <div className="history-section">
          {loading ? (
            <div className="loading-message">Memuat riwayat booking...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">📋</div>
              <h3>Belum Ada Riwayat Booking</h3>
              <p>Anda belum memiliki riwayat booking. Mulai booking lapangan sekarang!</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                // Check if booking has passed
                const bookingEndTime = new Date(booking.date.year, booking.date.month, booking.date.date, 6 + booking.time + booking.duration)
                const isPast = bookingEndTime < new Date()
                
                return (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card-header">
                      <h3 className="booking-team-name">{booking.name}</h3>
                      <span className={`booking-status ${isPast ? 'completed' : 'active'}`}>
                        {isPast ? 'Selesai' : 'Akan Datang'}
                      </span>
                    </div>
                  <div className="booking-details">
                    <div className="booking-detail-item">
                      <span className="detail-icon">📅</span>
                      <div className="detail-info">
                        <span className="detail-label">Tanggal</span>
                        <span className="detail-value">{formatDate(booking.date)}</span>
                      </div>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-icon">⏰</span>
                      <div className="detail-info">
                        <span className="detail-label">Waktu</span>
                        <span className="detail-value">{formatTime(booking.time, booking.duration)}</span>
                      </div>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-icon">⏱️</span>
                      <div className="detail-info">
                        <span className="detail-label">Durasi</span>
                        <span className="detail-value">{booking.duration} Jam</span>
                      </div>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-icon">📝</span>
                      <div className="detail-info">
                        <span className="detail-label">Dibooking pada</span>
                        <span className="detail-value">{formatTimestamp(booking.bookedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default History
