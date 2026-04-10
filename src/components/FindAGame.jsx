import { useState, useEffect } from 'react'
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db, app, auth } from '../firebase'
import './FindAGame.css'

function FindAGame({ onBack, currentUser, onLoginClick, backgroundImage }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showSchedule, setShowSchedule] = useState(false)
  const [bookings, setBookings] = useState([])
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [currentBg, setCurrentBg] = useState(backgroundImage)
  const [nextBg, setNextBg] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)

  // Pricing from Firestore
  const [pricing, setPricing] = useState({
    fieldMorning: 0,
    fieldEvening: 0,
    photographer: 0,
    shoes: 0,
    vests: 0,
    jerseys: 0
  })

  // Controlled booking form state for price calculation
  const [bookingFormState, setBookingFormState] = useState({
    duration: 1,
    rentPhotographer: false,
    rentShoes: false,
    shoesQty: 0,
    rentVests: false,
    vestsQty: 0,
    rentJerseys: false,
    jerseysQty: 0
  })
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris')

  // Payment methods available
  const paymentMethods = [
    { id: 'qris', label: 'QRIS', value: 'qris' },
    { id: 'bank_transfer', label: 'Transfer Bank', value: 'bank_transfer' },
    { id: 'ewallet', label: 'E-Wallet (GCash, Dana, OVO, LinkAja)', value: 'ewallet' },
    { id: 'credit_card', label: 'Kartu Kredit/Debit', value: 'credit_card' },
  ]

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
        }, 5000) // Match CSS transition duration (5s)
      }
    }
  }, [backgroundImage, currentBg])

  // Listen to Firestore bookings collection in realtime
  useEffect(() => {
    setIsLoadingBookings(true)
    setBookingsError(null)
    
    const q = query(collection(db, 'bookings'), orderBy('bookedAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = []
      querySnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        })
      })
      setBookings(bookingsData)
      setIsLoadingBookings(false)
      console.log('Berhasil memuat', bookingsData.length, 'booking')
      console.log('Booking data structure:', bookingsData.map(b => ({ id: b.id, date: b.date, time: b.time })))
    }, (error) => {
      console.error('Error fetching bookings:', error)
      setBookingsError(error.message)
      setIsLoadingBookings(false)
      
      if (error.code === 'permission-denied') {
        console.warn('Permission denied reading bookings - user may not be authenticated')
        setBookingsError('Silakan login untuk melihat jadwal booking')
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Load pricing from Firestore
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'pricing'))
        if (snap.exists()) {
          const p = snap.data()
          setPricing({
            fieldMorning: p.fieldMorning || 0,
            fieldEvening: p.fieldEvening || 0,
            photographer: p.photographer || 0,
            shoes: p.shoes || 0,
            vests: p.vests || 0,
            jerseys: p.jerseys || 0
          })
        }
      } catch (e) {
        console.error('Error loading pricing:', e)
      }
    }
    fetchPricing()
  }, [])

  // Reset form state when modal closes
  useEffect(() => {
    if (!isBookingModalOpen) {
      setBookingFormState({
        duration: 1,
        rentPhotographer: false,
        rentShoes: false,
        shoesQty: 0,
        rentVests: false,
        vestsQty: 0,
        rentJerseys: false,
        jerseysQty: 0
      })
    }
  }, [isBookingModalOpen])

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedSlot) return 0
    const startHour = 6 + selectedSlot.timeIndex
    const { duration } = bookingFormState

    // Split duration into morning (06-16) and evening (16-24) hours
    const morningHours = Math.max(0, Math.min(duration, 16 - startHour))
    const eveningHours = Math.max(0, duration - morningHours)

    let total = 0
    total += morningHours * (pricing.fieldMorning || 0)
    total += eveningHours * (pricing.fieldEvening || 0)

    if (bookingFormState.rentPhotographer) total += pricing.photographer || 0
    if (bookingFormState.rentShoes) total += (pricing.shoes || 0) * (bookingFormState.shoesQty || 0)
    if (bookingFormState.rentVests) total += (pricing.vests || 0) * (bookingFormState.vestsQty || 0)
    if (bookingFormState.rentJerseys) total += (pricing.jerseys || 0) * (bookingFormState.jerseysQty || 0)

    return total
  }

  const formatRupiah = (num) =>
    'Rp ' + Number(num).toLocaleString('id-ID')

  const handleDateClick = (date) => {
    // Check if date is in the past
    const selectedDateObj = new Date(date.year, date.month, date.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDateObj < today) {
      alert('Tidak dapat memilih tanggal yang sudah lewat!')
      return
    }
    
    setSelectedDate(date)
    setShowSchedule(true)
  }

  const handleSlotClick = (date, timeIndex) => {
    // Check if time slot has passed
    const slotDateTime = new Date(date.year, date.month, date.date, 6 + timeIndex)
    const now = new Date()
    
    if (slotDateTime < now) {
      alert('Tidak dapat booking untuk waktu yang sudah terlewat!')
      return
    }
    
    // Check if user is logged in
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk melakukan booking!')
      onLoginClick()
      return
    }

    // Check if slot is already booked
    const bookingKey = `${date.year}-${date.month}-${date.date}-${timeIndex}`
    const existingBooking = bookings.find(b => b.key === bookingKey)
    
    if (existingBooking) {
      alert('Slot ini sudah dibooking!')
      return
    }

    // Open booking modal and reset payment method
    setSelectedSlot({ date, timeIndex, bookingKey })
    setSelectedPaymentMethod('qris')
    setIsBookingModalOpen(true)
  }

  // Load Midtrans Snap.js dynamically
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY
    if (!clientKey) return
    if (document.getElementById('midtrans-snap-js')) return
    const script = document.createElement('script')
    script.id = 'midtrans-snap-js'
    script.src = 'https://app.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('midtrans-snap-js')
      if (el) el.remove()
    }
  }, [])

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    const teamName = e.target.teamName.value
    const { duration, rentPhotographer, rentShoes, shoesQty, rentVests, vestsQty, rentJerseys, jerseysQty } = bookingFormState
    
    // Extract selectedSlot values early (before closing modal)
    const timeIndex = selectedSlot.timeIndex
    const slotDate = selectedSlot.date
    const bookingKey = selectedSlot.bookingKey
    
    // Validasi: cek apakah booking melebihi jam tutup (24:00)
    const maxTimeIndex = 18
    if (timeIndex + duration > maxTimeIndex) {
      alert(`Tidak bisa booking! Waktu booking akan melebihi jam tutup (24:00). Silakan pilih durasi yang lebih pendek atau waktu yang lebih awal.`)
      return
    }
    
    setPaymentLoading(true)
    let bookingId = null
    try {
      // Step 1: Get Firebase ID token first
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      const idToken = await auth.currentUser.getIdToken()

      // Step 2: Prepare booking data
      const totalPrice = calculateTotal()
      const newBooking = {
        key: bookingKey,
        date: slotDate,
        time: timeIndex,
        duration: duration,
        name: teamName,
        bookedBy: currentUser.email,
        bookedByName: currentUser.name,
        bookedByUid: currentUser.uid,
        bookedAt: new Date().toISOString(),
        totalPrice,
        paymentStatus: 'pending',
        paymentMethod: selectedPaymentMethod,
        rentals: {
          photographer: rentPhotographer,
          shoes: rentShoes ? shoesQty : 0,
          vests: rentVests ? vestsQty : 0,
          jerseys: rentJerseys ? jerseysQty : 0
        }
      }

      // Step 3: Save booking to Firestore FIRST
      const docRef = await addDoc(collection(db, 'bookings'), newBooking)
      bookingId = docRef.id

      // Step 4: Get payment token from backend using real booking ID
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'
      
      const response = await fetch(`${backendUrl}/api/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          duration,
          startHour: 6 + timeIndex,
          rentals: newBooking.rentals
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Payment API error: ${response.status}`)
      }

      const { token } = await response.json()

      // Step 5: Close modal before opening Snap
      setIsBookingModalOpen(false)
      setSelectedSlot(null)
      setPaymentLoading(false)

      // Open Midtrans payment popup
      window.snap.pay(token, {
        onSuccess: () => {
          alert('Pembayaran berhasil! Booking Anda telah dikonfirmasi.')
        },
        onPending: () => {
          alert('Pembayaran sedang diproses. Booking Anda menunggu konfirmasi pembayaran.')
        },
        onError: () => {
          alert('Pembayaran gagal. Booking telah dibatalkan. Silakan coba booking ulang.')
        },
        onClose: () => {
          alert('Anda menutup halaman pembayaran. Booking perlu dibayar untuk dikonfirmasi.')
        }
      })
    } catch (error) {
      console.error('Error submitting booking:', error)
      setPaymentLoading(false)
      
      // If booking was saved but payment failed, delete it
      if (bookingId) {
        try {
          await deleteDoc(doc(db, 'bookings', bookingId))
          console.log('Booking deleted due to payment error')
        } catch (deleteError) {
          console.error('Failed to delete booking:', deleteError)
        }
      }
      
      // Re-open modal if booking failed, so user can try again
      setIsBookingModalOpen(true)
      alert(`Gagal melakukan booking: ${error.message}. Silakan coba lagi.`)
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Generate calendar
  const generateCalendar = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    
    return { year: currentYear, month: monthNames[currentMonth], monthIndex: currentMonth, firstDay, daysInMonth, dayNames }
  }

  // Generate schedule data from bookings
  const generateScheduleData = () => {
    const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
    return { timeSlots }
  }

  const getBookingsForDate = (dateObj) => {
    // Filter bookings for the selected date
    const filtered = bookings.filter(b => {
      // Check if b.date is an object with the expected properties
      if (!b.date || typeof b.date !== 'object') {
        console.log('Invalid booking date format:', b)
        return false
      }
      
      const matches = b.date.date === dateObj.date && 
                     b.date.month === dateObj.month && 
                     b.date.year === dateObj.year
      
      if (matches) {
        console.log('Found matching booking:', b, 'for date:', dateObj)
      }
      
      return matches
    })
    
    console.log(`Filtered bookings for ${dateObj.date}/${dateObj.month + 1}/${dateObj.year}:`, filtered.length)
    return filtered
  }

  const getDayInfo = (dateObj) => {
    const date = new Date(dateObj.year, dateObj.month, dateObj.date)
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const dayOfWeek = date.getDay()
    const dayName = dayNames[dayOfWeek]
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthName = monthNames[dateObj.month]
    
    return { dayName, dayOfWeek, dateStr: `${dateObj.date} ${monthName} ${dateObj.year}` }
  }

  const calendar = generateCalendar()
  const scheduleData = generateScheduleData()
  const today = new Date().getDate()
  const todayMonth = new Date().getMonth()
  const todayYear = new Date().getFullYear()

  return (
    <div className="find-a-game-page">
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
      <div className="find-a-game-content">
        <div className="find-header">
          <h1 className="find-title">Book Now</h1>
          <p className="find-subtitle">
            Atur filter, temukan partner sesuai level, lokasi, juga langsung join.<br />
            Main jadi gampang, nggak perlu nunggu temen lagi!
          </p>
        </div>

        <div className="filter-section">
          <div className="filter-content">
            <div className="calendar-widget">
              <div className="calendar-header">
                <button className="month-nav-btn" onClick={handlePrevMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <h3>{calendar.month} {calendar.year}</h3>
                <button className="month-nav-btn" onClick={handleNextMonth}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div className="calendar-body">
                <div className="calendar-days-header">
                  {calendar.dayNames.map(day => (
                    <div key={day} className="calendar-day-name">{day}</div>
                  ))}
                </div>
                <div className="calendar-dates">
                  {Array.from({ length: calendar.firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-date empty"></div>
                  ))}
                  {Array.from({ length: calendar.daysInMonth }).map((_, i) => {
                    const date = i + 1
                    const isToday = date === today && currentMonth === todayMonth && currentYear === todayYear
                    const isSelected = selectedDate && selectedDate.date === date && selectedDate.month === currentMonth && selectedDate.year === currentYear
                    
                    // Check if date is in the past
                    const dateObj = new Date(currentYear, currentMonth, date)
                    const todayObj = new Date()
                    todayObj.setHours(0, 0, 0, 0)
                    const isPast = dateObj < todayObj
                    
                    return (
                      <div 
                        key={date} 
                        className={`calendar-date ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                        onClick={() => !isPast && handleDateClick({ date, month: currentMonth, year: currentYear })}
                      >
                        {date}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {showSchedule && selectedDate && (
              <div className="schedule-section">
                {isLoadingBookings ? (
                  <div className="loading-message" style={{textAlign: 'center', padding: '2rem', color: '#667eea'}}>
                    Memuat data booking...
                  </div>
                ) : bookingsError ? (
                  <div className="error-message" style={{textAlign: 'center', padding: '2rem', color: '#e53e3e'}}>
                    Error: {bookingsError}
                  </div>
                ) : (() => {
                  const dayInfo = getDayInfo(selectedDate)
                  const dayBookings = getBookingsForDate(selectedDate)
                  
                  return (
                    <>
                      <div className="schedule-header">
                        <h3>Jadwal {dayInfo.dateStr}</h3>
                      </div>
                      
                      <div className="schedule-table-wrapper">
                        <table className="schedule-table">
                          <thead>
                            <tr>
                              <th className="time-column"></th>
                              <th>
                                <div className="day-header">
                                  <div className="day-name">{dayInfo.dayName}</div>
                                  <div className="day-date">{selectedDate.date}/{selectedDate.month + 1}</div>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheduleData.timeSlots.map((time, timeIndex) => {
                              const booking = dayBookings.find(b => b.time === timeIndex)
                              
                              // Check if this cell is part of a previous booking's rowspan
                              const isPartOfRowspan = dayBookings.some(
                                b => b.time < timeIndex && b.time + b.duration > timeIndex
                              )
                              
                              // Check if this time slot has passed
                              const slotDateTime = new Date(selectedDate.year, selectedDate.month, selectedDate.date, 6 + timeIndex)
                              const now = new Date()
                              const isPastSlot = slotDateTime < now
                              
                              return (
                                <tr key={time}>
                                  <td className="time-cell">{time}</td>
                                  {isPartOfRowspan ? null : booking ? (
                                    <td 
                                      className="booking-cell"
                                      rowSpan={booking.duration}
                                    >
                                      <div className="booking-item">
                                        <div className="booking-name">{booking.name}</div>
                                        <div className="booking-time">
                                          {scheduleData.timeSlots[timeIndex]} - {scheduleData.timeSlots[timeIndex + booking.duration]}
                                        </div>
                                        <div className="booking-user">by {booking.bookedBy}</div>
                                      </div>
                                    </td>
                                  ) : (
                                    <td 
                                      className={`empty-cell ${isPastSlot ? 'past-slot' : ''}`}
                                      onClick={() => !isPastSlot && handleSlotClick(selectedDate, timeIndex)}
                                    >
                                      <div className="empty-slot-hint">{isPastSlot ? '—' : '+'}</div>
                                    </td>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedSlot && (
        <div className="booking-modal-overlay" onClick={() => setIsBookingModalOpen(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setIsBookingModalOpen(false)}>&times;</span>
            <h2>Booking Lapangan</h2>
            <p className="booking-info">
              Tanggal: {getDayInfo(selectedSlot.date).dateStr}<br />
              Waktu Mulai: {scheduleData.timeSlots[selectedSlot.timeIndex]}
            </p>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="teamName">Nama Tim / Group</label>
                <input 
                  type="text" 
                  id="teamName" 
                  name="teamName"
                  placeholder="Masukkan nama tim Anda"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="duration">Durasi (jam)</label>
                <select
                  id="duration"
                  name="duration"
                  required
                  value={bookingFormState.duration}
                  onChange={(e) => setBookingFormState({ ...bookingFormState, duration: parseInt(e.target.value) })}
                >
                  {Array.from(
                    { length: Math.min(5, 18 - (selectedSlot?.timeIndex || 0)) },
                    (_, i) => i + 1
                  ).map(n => (
                    <option key={n} value={n}>{n} Jam</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group rental-section">
                <label className="rental-section-title">Sewa Tambahan (Opsional)</label>
                
                <div className="rental-grid">
                  <label className="rental-item rental-photographer">
                    <input 
                      type="checkbox" 
                      name="rentPhotographer"
                      className="rental-checkbox"
                      checked={bookingFormState.rentPhotographer}
                      onChange={(e) => setBookingFormState({ ...bookingFormState, rentPhotographer: e.target.checked })}
                    />
                    <span className="rental-label">Sewa Fotografer</span>
                  </label>

                  <div className="rental-item rental-with-qty">
                    <label className="rental-item-header">
                      <input 
                        type="checkbox" 
                        name="rentShoes"
                        className="rental-checkbox"
                        checked={bookingFormState.rentShoes}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, rentShoes: e.target.checked, shoesQty: e.target.checked ? (bookingFormState.shoesQty || 1) : 0 })}
                      />
                      <span className="rental-label">Sewa Sepatu</span>
                    </label>
                    <div className="rental-qty-input">
                      <span className="qty-label">Jumlah:</span>
                      <input 
                        type="number" 
                        name="shoesQty"
                        min="0"
                        className="qty-input"
                        value={bookingFormState.shoesQty}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, shoesQty: parseInt(e.target.value) || 0 })}
                      />
                      <span className="qty-unit">pasang</span>
                    </div>
                  </div>

                  <div className="rental-item rental-with-qty">
                    <label className="rental-item-header">
                      <input 
                        type="checkbox" 
                        name="rentVests"
                        className="rental-checkbox"
                        checked={bookingFormState.rentVests}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, rentVests: e.target.checked, vestsQty: e.target.checked ? (bookingFormState.vestsQty || 1) : 0 })}
                      />
                      <span className="rental-label">Sewa Rompi</span>
                    </label>
                    <div className="rental-qty-input">
                      <span className="qty-label">Jumlah:</span>
                      <input 
                        type="number" 
                        name="vestsQty"
                        min="0"
                        className="qty-input"
                        value={bookingFormState.vestsQty}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, vestsQty: parseInt(e.target.value) || 0 })}
                      />
                      <span className="qty-unit">buah</span>
                    </div>
                  </div>

                  <div className="rental-item rental-with-qty">
                    <label className="rental-item-header">
                      <input 
                        type="checkbox" 
                        name="rentJerseys"
                        className="rental-checkbox"
                        checked={bookingFormState.rentJerseys}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, rentJerseys: e.target.checked, jerseysQty: e.target.checked ? (bookingFormState.jerseysQty || 1) : 0 })}
                      />
                      <span className="rental-label">Sewa Kaos Tim</span>
                    </label>
                    <div className="rental-qty-input">
                      <span className="qty-label">Jumlah:</span>
                      <input 
                        type="number" 
                        name="jerseysQty"
                        min="0"
                        className="qty-input"
                        value={bookingFormState.jerseysQty}
                        onChange={(e) => setBookingFormState({ ...bookingFormState, jerseysQty: parseInt(e.target.value) || 0 })}
                      />
                      <span className="qty-unit">buah</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Harga */}
              <div className="booking-total-section">
                <div className="booking-total-breakdown">
                  <div className="breakdown-row">
                    <span>Sewa Lapangan ({bookingFormState.duration} jam)</span>
                    <span>{formatRupiah((() => {
                      const startHour = 6 + (selectedSlot?.timeIndex || 0)
                      const morningHours = Math.max(0, Math.min(bookingFormState.duration, 16 - startHour))
                      const eveningHours = Math.max(0, bookingFormState.duration - morningHours)
                      return morningHours * pricing.fieldMorning + eveningHours * pricing.fieldEvening
                    })())}</span>
                  </div>
                  {bookingFormState.rentPhotographer && (
                    <div className="breakdown-row">
                      <span>Fotografer</span>
                      <span>{formatRupiah(pricing.photographer)}</span>
                    </div>
                  )}
                  {bookingFormState.rentShoes && bookingFormState.shoesQty > 0 && (
                    <div className="breakdown-row">
                      <span>Sepatu × {bookingFormState.shoesQty}</span>
                      <span>{formatRupiah(pricing.shoes * bookingFormState.shoesQty)}</span>
                    </div>
                  )}
                  {bookingFormState.rentVests && bookingFormState.vestsQty > 0 && (
                    <div className="breakdown-row">
                      <span>Rompi × {bookingFormState.vestsQty}</span>
                      <span>{formatRupiah(pricing.vests * bookingFormState.vestsQty)}</span>
                    </div>
                  )}
                  {bookingFormState.rentJerseys && bookingFormState.jerseysQty > 0 && (
                    <div className="breakdown-row">
                      <span>Kaos Tim × {bookingFormState.jerseysQty}</span>
                      <span>{formatRupiah(pricing.jerseys * bookingFormState.jerseysQty)}</span>
                    </div>
                  )}
                </div>
                <div className="booking-total-row">
                  <span className="booking-total-label">Total Harga</span>
                  <span className="booking-total-amount">{formatRupiah(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Payment Method Selection */}
              <div className="booking-payment-method-section">
                <label htmlFor="payment-method" className="payment-method-label">
                  <span>💳 Pilih Metode Pembayaran:</span>
                </label>
                <select 
                  id="payment-method"
                  className="payment-method-select"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  disabled={paymentLoading}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="submit-booking-btn" disabled={paymentLoading}>
                {paymentLoading ? 'Memproses...' : 'Konfirmasi & Bayar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FindAGame
