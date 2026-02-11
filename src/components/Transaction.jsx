import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import './Transaction.css'

function Transaction({ onBack, currentUser, backgroundImage }) {
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

  // Listen to all bookings from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'bookings'),
      orderBy('bookedAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = []
      querySnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        })
      })
      setBookings(bookingsData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching bookings:', error)
      alert('Gagal memuat data transaksi: ' + error.message)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const formatDate = (dateObj) => {
    if (!dateObj) return '-'
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${dateObj.date} ${monthNames[dateObj.month]} ${dateObj.year}`
  }

  const formatTime = (timeIndex, duration) => {
    if (timeIndex === undefined || !duration) return '-'
    const hours = 6 + timeIndex
    const endHours = hours + duration
    return `${hours.toString().padStart(2, '0')}:00 - ${endHours.toString().padStart(2, '0')}:00`
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBookingStatus = (booking) => {
    if (!booking.date || booking.time === undefined) return 'unknown'
    const bookingEndTime = new Date(booking.date.year, booking.date.month, booking.date.date, 6 + booking.time + booking.duration)
    return bookingEndTime < new Date() ? 'completed' : 'upcoming'
  }

  return (
    <div className="transaction-page">
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
      
      <div className="transaction-content">
        <div className="transaction-header">
          <h1 className="transaction-title">Transaction</h1>
          <p className="transaction-subtitle">
            Kelola semua transaksi booking lapangan.<br />
            Data booking dari semua pengguna.
          </p>
        </div>

        <div className="transaction-section">
          {loading ? (
            <div className="loading-message">Memuat data transaksi...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-transaction">
              <div className="empty-icon">📋</div>
              <h3>Belum Ada Transaksi</h3>
              <p>Belum ada transaksi booking yang tercatat.</p>
            </div>
          ) : (
            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Tim</th>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Durasi</th>
                    <th>Pemesan</th>
                    <th>Email</th>
                    <th>Waktu Booking</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => {
                    const status = getBookingStatus(booking)
                    return (
                      <tr key={booking.id}>
                        <td>{index + 1}</td>
                        <td className="team-name">{booking.name}</td>
                        <td>{formatDate(booking.date)}</td>
                        <td>{formatTime(booking.time, booking.duration)}</td>
                        <td>{booking.duration} Jam</td>
                        <td>{booking.bookedByName}</td>
                        <td className="email">{booking.bookedBy}</td>
                        <td>{formatTimestamp(booking.bookedAt)}</td>
                        <td>
                          <span className={`status-badge ${status}`}>
                            {status === 'completed' ? 'Selesai' : 'Akan Datang'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transaction
