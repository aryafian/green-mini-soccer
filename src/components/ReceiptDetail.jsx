import { useState, useEffect } from 'react'
import './ReceiptDetail.css'

function ReceiptDetail({ bookingId, onBack }) {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!bookingId) {
      setError('ID booking tidak ditemukan')
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'
        const response = await fetch(`${backendUrl}/api/booking/${bookingId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Booking tidak ditemukan')
          }
          throw new Error('Gagal memuat data booking')
        }

        const data = await response.json()
        setBooking(data)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const formatDate = (dateObj) => {
    if (!dateObj) return '-'
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const d = new Date(dateObj.year, dateObj.month, dateObj.date)
    return `${dayNames[d.getDay()]}, ${dateObj.date} ${monthNames[dateObj.month]} ${dateObj.year}`
  }

  const formatTime = (timeIndex, duration) => {
    if (timeIndex === undefined || !duration) return '-'
    const hours = 6 + timeIndex
    const endHours = hours + duration
    return `${hours.toString().padStart(2, '0')}:00 - ${endHours.toString().padStart(2, '0')}:00`
  }

  const formatRupiah = (num) =>
    'Rp ' + Number(num || 0).toLocaleString('id-ID')

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

  const getStatusInfo = (status) => {
    const info = {
      paid: { label: '✅ LUNAS', class: 'paid', desc: 'Pembayaran telah dikonfirmasi' },
      pending: { label: '⏳ MENUNGGU', class: 'pending', desc: 'Menunggu konfirmasi pembayaran' },
      failed: { label: '❌ GAGAL', class: 'failed', desc: 'Pembayaran gagal atau dibatalkan' },
      fraud: { label: '🚫 DITOLAK', class: 'failed', desc: 'Transaksi ditolak' },
      fraud_challenge: { label: '⚠️ REVIEW', class: 'pending', desc: 'Sedang dalam review' },
    }
    return info[status] || { label: '❓ TIDAK DIKETAHUI', class: 'unknown', desc: '-' }
  }

  if (loading) {
    return (
      <div className="receipt-detail-page">
        <div className="receipt-detail-bg" />
        <div className="receipt-detail-container">
          <div className="receipt-detail-loading">
            <div className="rd-spinner"></div>
            <p>Memuat detail transaksi...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="receipt-detail-page">
        <div className="receipt-detail-bg" />
        <div className="receipt-detail-container">
          <div className="receipt-detail-error">
            <div className="rd-error-icon">📋</div>
            <h2>Transaksi Tidak Ditemukan</h2>
            <p>{error || 'Data booking tidak tersedia'}</p>
            <button onClick={onBack} className="rd-back-btn">
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(booking.paymentStatus)

  return (
    <div className="receipt-detail-page">
      <div className="receipt-detail-bg" />
      <div className="receipt-detail-overlay" />
      
      <div className="receipt-detail-container">
        <div className="rd-header">
          <button onClick={onBack} className="rd-nav-back">← Beranda</button>
          <h1 className="rd-title">Detail Transaksi</h1>
          <p className="rd-subtitle">Green Mini Soccer</p>
        </div>

        <div className="rd-card">
          {/* Status Banner */}
          <div className={`rd-status-banner ${statusInfo.class}`}>
            <div className="rd-status-label">{statusInfo.label}</div>
            <div className="rd-status-desc">{statusInfo.desc}</div>
          </div>

          {/* Receipt Code */}
          {booking.receiptCode && (
            <div className="rd-receipt-code">
              <span className="rd-code-label">Nomor Struk</span>
              <span className="rd-code-value">{booking.receiptCode}</span>
            </div>
          )}

          {/* Booking Info Section */}
          <div className="rd-section">
            <h3 className="rd-section-title">
              <span className="rd-section-icon">📅</span> 
              Informasi Booking
            </h3>
            <div className="rd-info-grid">
              <div className="rd-info-item">
                <span className="rd-info-label">Nama Tim</span>
                <span className="rd-info-value highlight">{booking.name}</span>
              </div>
              <div className="rd-info-item">
                <span className="rd-info-label">Tanggal</span>
                <span className="rd-info-value">{formatDate(booking.date)}</span>
              </div>
              <div className="rd-info-item">
                <span className="rd-info-label">Waktu</span>
                <span className="rd-info-value">{formatTime(booking.time, booking.duration)}</span>
              </div>
              <div className="rd-info-item">
                <span className="rd-info-label">Durasi</span>
                <span className="rd-info-value">{booking.duration} Jam</span>
              </div>
              <div className="rd-info-item">
                <span className="rd-info-label">Pemesan</span>
                <span className="rd-info-value">{booking.bookedByName}</span>
              </div>
            </div>
          </div>

          {/* Rentals Section */}
          {booking.rentals && (booking.rentals.photographer || booking.rentals.shoes > 0 || booking.rentals.vests > 0 || booking.rentals.jerseys > 0) && (
            <div className="rd-section">
              <h3 className="rd-section-title">
                <span className="rd-section-icon">🎽</span>
                Sewa Tambahan
              </h3>
              <div className="rd-rentals-list">
                {booking.rentals.photographer && (
                  <div className="rd-rental-badge">📸 Fotografer</div>
                )}
                {booking.rentals.shoes > 0 && (
                  <div className="rd-rental-badge">👟 Sepatu × {booking.rentals.shoes}</div>
                )}
                {booking.rentals.vests > 0 && (
                  <div className="rd-rental-badge">🦺 Rompi × {booking.rentals.vests}</div>
                )}
                {booking.rentals.jerseys > 0 && (
                  <div className="rd-rental-badge">👕 Kaos Tim × {booking.rentals.jerseys}</div>
                )}
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="rd-section">
            <h3 className="rd-section-title">
              <span className="rd-section-icon">💳</span>
              Detail Pembayaran
            </h3>
            
            {booking.itemDetails && booking.itemDetails.length > 0 && (
              <div className="rd-payment-breakdown">
                {booking.itemDetails.map((item, i) => (
                  <div className="rd-breakdown-row" key={i}>
                    <span>{item.name}</span>
                    <span>{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="rd-total-row">
              <span>Total Pembayaran</span>
              <span className="rd-total-amount">{formatRupiah(booking.totalPrice)}</span>
            </div>

            <div className="rd-payment-meta">
              <div className="rd-meta-item">
                <span className="rd-meta-label">Metode Pembayaran</span>
                <span className="rd-meta-value">{(booking.paymentMethod || '-').toUpperCase()}</span>
              </div>
              <div className="rd-meta-item">
                <span className="rd-meta-label">Waktu Booking</span>
                <span className="rd-meta-value">{formatTimestamp(booking.bookedAt)}</span>
              </div>
              {booking.paidAt && (
                <div className="rd-meta-item">
                  <span className="rd-meta-label">Waktu Pembayaran</span>
                  <span className="rd-meta-value">{formatTimestamp(booking.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="rd-footer">
            <div className="rd-footer-brand">⚽ Green Mini Soccer</div>
            <p>Match • Play • Repeat</p>
          </div>
        </div>

        <button onClick={onBack} className="rd-back-btn-bottom">
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}

export default ReceiptDetail
