import { useState, useEffect } from 'react'
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
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
    }, (error) => {
      console.error('Error fetching bookings:', error)
      setBookingsError(error.message)
      setIsLoadingBookings(false)
      
      if (error.code === 'permission-denied') {
        alert('Tidak dapat memuat data booking. Pastikan Firestore rules mengizinkan read tanpa autentikasi.')
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

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

    // Open booking modal
    setSelectedSlot({ date, timeIndex, bookingKey })
    setIsBookingModalOpen(true)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    const teamName = e.target.teamName.value
    const duration = parseInt(e.target.duration.value)
    
    try {
      // Create new booking in Firestore
      const newBooking = {
        key: selectedSlot.bookingKey,
        date: selectedSlot.date,
        time: selectedSlot.timeIndex,
        duration: duration,
        name: teamName,
        bookedBy: currentUser.email,
        bookedByName: currentUser.name,
        bookedByUid: currentUser.uid,
        bookedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'bookings'), newBooking)
      
      // Close modal
      setIsBookingModalOpen(false)
      setSelectedSlot(null)
      e.target.reset()
      
      alert('Booking berhasil!')
    } catch (error) {
      console.error('Error adding booking:', error)
      alert('Gagal melakukan booking. Silakan coba lagi.')
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
    const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
    return { timeSlots }
  }

  const getBookingsForDate = (dateObj) => {
    // Filter bookings for the selected date
    return bookings.filter(b => 
      b.date.date === dateObj.date && 
      b.date.month === dateObj.month && 
      b.date.year === dateObj.year
    )
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
                <select id="duration" name="duration" required>
                  <option value="1">1 Jam</option>
                  <option value="2">2 Jam</option>
                  <option value="3">3 Jam</option>
                </select>
              </div>
              <button type="submit" className="submit-booking-btn">Konfirmasi Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FindAGame
