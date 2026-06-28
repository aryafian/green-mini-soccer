import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import './BookingReceipt.css'

// Simple QR code generator using Canvas (no external dependency)
function generateQRCodeSVG(data, size = 200) {
  // We'll use a simple approach with a QR code API to generate the QR
  // This creates a URL to Google Charts QR API as a fallback
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg`
}

function BookingReceipt({ bookingId, onClose }) {
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const receiptRef = useRef(null)

  // Listen to booking data in realtime (to get receiptCode from webhook)
  useEffect(() => {
    if (!bookingId) return

    const unsubscribe = onSnapshot(
      doc(db, 'bookings', bookingId),
      (docSnap) => {
        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() })
        } else {
          setError('Booking tidak ditemukan')
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching booking:', err)
        setError('Gagal memuat data booking')
        setLoading(false)
      }
    )

    return () => unsubscribe()
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

  const getStatusLabel = (status) => {
    const labels = {
      paid: '✅ LUNAS',
      pending: '⏳ Menunggu Pembayaran',
      failed: '❌ Gagal',
      fraud: '🚫 Ditolak',
      fraud_challenge: '⚠️ Review',
      unknown: '❓ Tidak Diketahui'
    }
    return labels[status] || labels.unknown
  }

  const getReceiptUrl = () => {
    const origin = window.location.origin
    return `${origin}/#/receipt/${bookingId}`
  }

  const handlePrint = () => {
    const printContent = receiptRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk Booking - Green Mini Soccer</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Poppins', sans-serif;
            padding: 20px;
            background: white;
            color: #1a1a2e;
          }
          .receipt-paper {
            max-width: 400px;
            margin: 0 auto;
            padding: 30px 25px;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
          }
          .receipt-logo-section {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #e5e7eb;
          }
          .receipt-brand { font-size: 22px; font-weight: 700; color: #16a34a; }
          .receipt-brand-sub { font-size: 11px; color: #6b7280; margin-top: 4px; }
          .receipt-title { text-align: center; font-size: 16px; font-weight: 700; margin: 15px 0 5px; color: #1a1a2e; }
          .receipt-code { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 15px; }
          .receipt-status { 
            text-align: center; 
            padding: 8px; 
            border-radius: 8px; 
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 15px;
          }
          .receipt-status.paid { background: #dcfce7; color: #16a34a; }
          .receipt-status.pending { background: #fef3c7; color: #d97706; }
          .receipt-status.failed { background: #fce4ec; color: #e53935; }
          .receipt-divider { border: none; border-top: 1px dashed #d1d5db; margin: 12px 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
          .receipt-row .label { color: #6b7280; }
          .receipt-row .value { font-weight: 500; color: #1a1a2e; text-align: right; max-width: 55%; }
          .receipt-section-title { font-size: 12px; font-weight: 600; color: #374151; margin: 10px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }
          .receipt-total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 700; color: #16a34a; border-top: 2px solid #16a34a; margin-top: 8px; }
          .receipt-qr-section { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #e5e7eb; }
          .receipt-qr-section img { width: 160px; height: 160px; }
          .receipt-qr-label { font-size: 10px; color: #9ca3af; margin-top: 8px; }
          .receipt-footer { text-align: center; margin-top: 20px; font-size: 10px; color: #9ca3af; }
          @media print {
            body { padding: 0; }
            .receipt-paper { border: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  if (loading) {
    return (
      <div className="receipt-overlay">
        <div className="receipt-modal">
          <div className="receipt-loading">
            <div className="receipt-spinner"></div>
            <p>Memuat struk...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="receipt-overlay">
        <div className="receipt-modal">
          <div className="receipt-error">
            <p>{error || 'Data booking tidak tersedia'}</p>
            <button onClick={onClose} className="receipt-close-btn">Tutup</button>
          </div>
        </div>
      </div>
    )
  }

  const qrUrl = getReceiptUrl()
  const qrImageUrl = generateQRCodeSVG(qrUrl, 200)

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-modal-close" onClick={onClose}>&times;</button>
        
        <div className="receipt-header-bar">
          <h2>🧾 Struk Pembayaran</h2>
          <p>Pembayaran berhasil! Berikut adalah struk booking Anda.</p>
        </div>

        <div className="receipt-paper" ref={receiptRef}>
          {/* Logo Section */}
          <div className="receipt-logo-section">
            <div className="receipt-brand">⚽ GREEN MINI SOCCER</div>
            <div className="receipt-brand-sub">Match • Play • Repeat</div>
          </div>

          {/* Title */}
          <div className="receipt-title">STRUK BOOKING</div>
          {booking.receiptCode && (
            <div className="receipt-code">No: {booking.receiptCode}</div>
          )}

          {/* Status */}
          <div className={`receipt-status ${booking.paymentStatus || 'pending'}`}>
            {getStatusLabel(booking.paymentStatus)}
          </div>

          <hr className="receipt-divider" />

          {/* Booking Details */}
          <div className="receipt-section-title">Detail Booking</div>
          <div className="receipt-row">
            <span className="label">Nama Tim</span>
            <span className="value">{booking.name}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Tanggal</span>
            <span className="value">{formatDate(booking.date)}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Waktu</span>
            <span className="value">{formatTime(booking.time, booking.duration)}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Durasi</span>
            <span className="value">{booking.duration} Jam</span>
          </div>
          <div className="receipt-row">
            <span className="label">Pemesan</span>
            <span className="value">{booking.bookedByName}</span>
          </div>

          <hr className="receipt-divider" />

          {/* Payment Details */}
          <div className="receipt-section-title">Detail Pembayaran</div>
          
          {booking.itemDetails && booking.itemDetails.length > 0 ? (
            booking.itemDetails.map((item, i) => (
              <div className="receipt-row" key={i}>
                <span className="label">{item.name}</span>
                <span className="value">{formatRupiah(item.price * item.quantity)}</span>
              </div>
            ))
          ) : (
            <>
              <div className="receipt-row">
                <span className="label">Sewa Lapangan ({booking.duration} jam)</span>
                <span className="value">{formatRupiah(booking.totalPrice)}</span>
              </div>
              {booking.rentals?.photographer && (
                <div className="receipt-row">
                  <span className="label">Fotografer</span>
                  <span className="value">Termasuk</span>
                </div>
              )}
              {booking.rentals?.shoes > 0 && (
                <div className="receipt-row">
                  <span className="label">Sepatu × {booking.rentals.shoes}</span>
                  <span className="value">Termasuk</span>
                </div>
              )}
              {booking.rentals?.vests > 0 && (
                <div className="receipt-row">
                  <span className="label">Rompi × {booking.rentals.vests}</span>
                  <span className="value">Termasuk</span>
                </div>
              )}
              {booking.rentals?.jerseys > 0 && (
                <div className="receipt-row">
                  <span className="label">Kaos Tim × {booking.rentals.jerseys}</span>
                  <span className="value">Termasuk</span>
                </div>
              )}
            </>
          )}

          <div className="receipt-total-row">
            <span>TOTAL</span>
            <span>{formatRupiah(booking.totalPrice)}</span>
          </div>

          <hr className="receipt-divider" />

          <div className="receipt-row">
            <span className="label">Metode Bayar</span>
            <span className="value">{(booking.paymentMethod || '-').toUpperCase()}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Waktu Booking</span>
            <span className="value">{formatTimestamp(booking.bookedAt)}</span>
          </div>
          {booking.paidAt && (
            <div className="receipt-row">
              <span className="label">Waktu Bayar</span>
              <span className="value">{formatTimestamp(booking.paidAt)}</span>
            </div>
          )}

          {/* QR Code Section */}
          <div className="receipt-qr-section">
            <img src={qrImageUrl} alt="QR Code Struk" crossOrigin="anonymous" />
            <div className="receipt-qr-label">
              Scan QR code untuk melihat detail transaksi
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p>Terima kasih telah bermain di Green Mini Soccer!</p>
            <p>Tunjukkan struk ini saat datang ke lapangan.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button className="receipt-print-btn" onClick={handlePrint}>
            🖨️ Cetak Struk
          </button>
          <button className="receipt-close-btn" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingReceipt
