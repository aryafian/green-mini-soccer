import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { sampleNews, sampleBackgrounds, sampleSchedules } from '../sampleData'
import './Admin.css'

function Admin({ currentUser, backgroundImage }) {
  const [activeTab, setActiveTab] = useState('news')
  const [news, setNews] = useState([])
  const [schedules, setSchedules] = useState([])
  const [backgrounds, setBackgrounds] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  
  // News form states
  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    date: '',
    content: '',
    image: '',
    category: 'Promo',
    article: [{ heading: '', paragraphs: [''] }],
    benefits: [''],
    terms: ['']
  })
  const [editingNews, setEditingNews] = useState(null)
  
  // Schedule form states
  const [scheduleForm, setScheduleForm] = useState({
    day: '',
    openTime: '06:00',
    closeTime: '24:00',
    isOpen: true
  })
  
  // Background form states
  const [backgroundForm, setBackgroundForm] = useState({
    url: '',
    name: ''
  })

  // Booking form states
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: 0,
    duration: 1,
    name: '',
    rentPhotographer: false,
    rentShoes: 0,
    rentVests: 0,
    rentJerseys: 0
  })
  const [editingBooking, setEditingBooking] = useState(null)

  // Pricing state
  const [pricingForm, setPricingForm] = useState({
    fieldMorning: '',
    fieldEvening: '',
    photographer: '',
    shoes: '',
    vests: '',
    jerseys: ''
  })
  const [savingPricing, setSavingPricing] = useState(false)
  const [pricingSaved, setPricingSaved] = useState(false)

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email === 'aryafian232@gmail.com'

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  // Real-time listener for bookings
  useEffect(() => {
    if (!isAdmin) return

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
    }, (error) => {
      console.error('Error loading bookings:', error)
      setBookings([])
    })

    return () => unsubscribe()
  }, [isAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load news
      const newsSnapshot = await getDocs(collection(db, 'news'))
      let newsData = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Load schedules
      const schedulesSnapshot = await getDocs(collection(db, 'schedules'))
      let schedulesData = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Load backgrounds
      const backgroundsSnapshot = await getDocs(collection(db, 'backgrounds'))
      let backgroundsData = backgroundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Auto-seed if database is empty
      if (newsData.length === 0 && schedulesData.length === 0 && backgroundsData.length === 0) {
        console.log('Database empty, auto-seeding data...')
        await autoSeedData()
        // Reload after seeding
        const newsSnapshot2 = await getDocs(collection(db, 'news'))
        newsData = newsSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const schedulesSnapshot2 = await getDocs(collection(db, 'schedules'))
        schedulesData = schedulesSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const backgroundsSnapshot2 = await getDocs(collection(db, 'backgrounds'))
        backgroundsData = backgroundsSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }

      // Use Firestore data if available, otherwise fallback to sample data
      setNews(newsData.length > 0 ? newsData : sampleNews.map((item, index) => ({ ...item, id: `sample-${index}` })))
      setSchedules(schedulesData.length > 0 ? schedulesData : sampleSchedules.map((item, index) => ({ ...item, id: `sample-${index}` })))
      setBackgrounds(backgroundsData.length > 0 ? backgroundsData : sampleBackgrounds.map((item, index) => ({ ...item, id: `sample-${index}` })))

      // Load pricing
      try {
        const pricingDoc = await getDocs(collection(db, 'settings'))
        const pricingData = pricingDoc.docs.find(d => d.id === 'pricing')
        if (pricingData) {
          const p = pricingData.data()
          setPricingForm({
            fieldMorning: p.fieldMorning || '',
            fieldEvening: p.fieldEvening || '',
            photographer: p.photographer || '',
            shoes: p.shoes || '',
            vests: p.vests || '',
            jerseys: p.jerseys || ''
          })
        }
      } catch (e) {
        console.error('Error loading pricing:', e)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to sample data on error
      setNews(sampleNews.map((item, index) => ({ ...item, id: `sample-${index}` })))
      setSchedules(sampleSchedules.map((item, index) => ({ ...item, id: `sample-${index}` })))
      setBackgrounds(sampleBackgrounds.map((item, index) => ({ ...item, id: `sample-${index}` })))
    }
    setLoading(false)
  }

  // Auto-seed data function (called automatically if DB is empty)
  const autoSeedData = async () => {
    try {
      // Seed News
      for (const newsItem of sampleNews) {
        await addDoc(collection(db, 'news'), newsItem)
      }

      // Seed Backgrounds
      for (const bg of sampleBackgrounds) {
        await addDoc(collection(db, 'backgrounds'), bg)
      }

      // Seed Schedules
      for (const schedule of sampleSchedules) {
        const scheduleId = schedule.day.toLowerCase()
        await setDoc(doc(db, 'schedules', scheduleId), schedule)
      }

      console.log('Auto-seed completed successfully')
    } catch (error) {
      console.error('Error auto-seeding data:', error)
    }
  }

  // NEWS MANAGEMENT
  const handleNewsInputChange = (field, value) => {
    setNewsForm({ ...newsForm, [field]: value })
  }

  const handleArticleSectionChange = (sectionIndex, field, value) => {
    const updatedArticle = [...newsForm.article]
    updatedArticle[sectionIndex][field] = value
    setNewsForm({ ...newsForm, article: updatedArticle })
  }

  const handleArticleParagraphChange = (sectionIndex, paragraphIndex, value) => {
    const updatedArticle = [...newsForm.article]
    updatedArticle[sectionIndex].paragraphs[paragraphIndex] = value
    setNewsForm({ ...newsForm, article: updatedArticle })
  }

  const addArticleSection = () => {
    setNewsForm({
      ...newsForm,
      article: [...newsForm.article, { heading: '', paragraphs: [''] }]
    })
  }

  const removeArticleSection = (index) => {
    const updatedArticle = newsForm.article.filter((_, i) => i !== index)
    setNewsForm({ ...newsForm, article: updatedArticle })
  }

  const addParagraph = (sectionIndex) => {
    const updatedArticle = [...newsForm.article]
    updatedArticle[sectionIndex].paragraphs.push('')
    setNewsForm({ ...newsForm, article: updatedArticle })
  }

  const removeParagraph = (sectionIndex, paragraphIndex) => {
    const updatedArticle = [...newsForm.article]
    updatedArticle[sectionIndex].paragraphs = updatedArticle[sectionIndex].paragraphs.filter((_, i) => i !== paragraphIndex)
    setNewsForm({ ...newsForm, article: updatedArticle })
  }

  const handleArrayInputChange = (field, index, value) => {
    const updatedArray = [...newsForm[field]]
    updatedArray[index] = value
    setNewsForm({ ...newsForm, [field]: updatedArray })
  }

  const addArrayItem = (field) => {
    setNewsForm({ ...newsForm, [field]: [...newsForm[field], ''] })
  }

  const removeArrayItem = (field, index) => {
    const updatedArray = newsForm[field].filter((_, i) => i !== index)
    setNewsForm({ ...newsForm, [field]: updatedArray })
  }

  const saveNews = async () => {
    try {
      // Clean up empty fields
      const cleanedNews = {
        ...newsForm,
        article: newsForm.article.filter(section => section.heading.trim() !== ''),
        benefits: newsForm.benefits.filter(b => b.trim() !== ''),
        terms: newsForm.terms.filter(t => t.trim() !== '')
      }

      if (editingNews) {
        // Update existing news
        await updateDoc(doc(db, 'news', editingNews.id), cleanedNews)
      } else {
        // Add new news
        await addDoc(collection(db, 'news'), cleanedNews)
      }
      
      resetNewsForm()
      loadData()
      alert('Berita berhasil disimpan!')
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Gagal menyimpan berita: ' + error.message)
    }
  }

  const editNews = (newsItem) => {
    setNewsForm({
      title: newsItem.title || '',
      date: newsItem.date || '',
      content: newsItem.content || '',
      image: newsItem.image || '',
      category: newsItem.category || 'Promo',
      article: newsItem.article || [{ heading: '', paragraphs: [''] }],
      benefits: newsItem.benefits || [''],
      terms: newsItem.terms || ['']
    })
    setEditingNews(newsItem)
  }

  const deleteNews = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await deleteDoc(doc(db, 'news', id))
        loadData()
        alert('Berita berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting news:', error)
        alert('Gagal menghapus berita: ' + error.message)
      }
    }
  }

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      date: '',
      content: '',
      image: '',
      category: 'Promo',
      article: [{ heading: '', paragraphs: [''] }],
      benefits: [''],
      terms: ['']
    })
    setEditingNews(null)
  }

  // SCHEDULE MANAGEMENT
  const saveSchedule = async () => {
    try {
      const scheduleId = scheduleForm.day.toLowerCase()
      await setDoc(doc(db, 'schedules', scheduleId), scheduleForm)
      resetScheduleForm()
      loadData()
      alert('Jadwal berhasil disimpan!')
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Gagal menyimpan jadwal: ' + error.message)
    }
  }

  const deleteSchedule = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        await deleteDoc(doc(db, 'schedules', id))
        loadData()
        alert('Jadwal berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting schedule:', error)
        alert('Gagal menghapus jadwal: ' + error.message)
      }
    }
  }

  const resetScheduleForm = () => {
    setScheduleForm({
      day: '',
      openTime: '06:00',
      closeTime: '23:00',
      isOpen: true
    })
  }

  // BACKGROUND MANAGEMENT
  const saveBackground = async () => {
    try {
      await addDoc(collection(db, 'backgrounds'), backgroundForm)
      resetBackgroundForm()
      loadData()
      alert('Background berhasil ditambahkan!')
    } catch (error) {
      console.error('Error saving background:', error)
      alert('Gagal menambahkan background: ' + error.message)
    }
  }

  const deleteBackground = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus background ini?')) {
      try {
        await deleteDoc(doc(db, 'backgrounds', id))
        loadData()
        alert('Background berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting background:', error)
        alert('Gagal menghapus background: ' + error.message)
      }
    }
  }

  const resetBackgroundForm = () => {
    setBackgroundForm({
      url: '',
      name: ''
    })
  }

  // BOOKING MANAGEMENT
  const editBooking = (booking) => {
    // Convert date object to ISO string for date input
    let dateString = ''
    if (typeof booking.date === 'string') {
      dateString = booking.date
    } else if (booking.date && typeof booking.date === 'object') {
      // Convert {date, month, year} to "YYYY-MM-DD"
      const year = booking.date.year
      const month = String(booking.date.month + 1).padStart(2, '0') // month is 0-indexed
      const day = String(booking.date.date).padStart(2, '0')
      dateString = `${year}-${month}-${day}`
    }
    
    const rentals = booking.rentals || {}
    
    setBookingForm({
      date: dateString,
      time: booking.time,
      duration: booking.duration,
      name: booking.name,
      rentPhotographer: rentals.photographer || false,
      rentShoes: rentals.shoes || 0,
      rentVests: rentals.vests || 0,
      rentJerseys: rentals.jerseys || 0
    })
    setEditingBooking(booking)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateBooking = async () => {
    if (!editingBooking) return

    // Validate form
    if (!bookingForm.date || !bookingForm.name) {
      alert('Harap isi tanggal dan nama tim!')
      return
    }

    try {
      // Convert date string to date object format
      const dateObj = new Date(bookingForm.date)
      const dateFormatted = {
        date: dateObj.getDate(),
        month: dateObj.getMonth(),
        year: dateObj.getFullYear()
      }
      
      console.log('Updating booking with date:', dateFormatted)
      console.log('Original date string:', bookingForm.date)
      
      const bookingKey = `${dateFormatted.year}-${dateFormatted.month}-${dateFormatted.date}-${bookingForm.time}`
      
      const updatedData = {
        date: dateFormatted,
        time: bookingForm.time,
        duration: bookingForm.duration,
        name: bookingForm.name,
        rentals: {
          photographer: bookingForm.rentPhotographer,
          shoes: bookingForm.rentShoes,
          vests: bookingForm.rentVests,
          jerseys: bookingForm.rentJerseys
        },
        // Keep original booking info
        bookedBy: editingBooking.bookedBy,
        bookedByName: editingBooking.bookedByName,
        bookedByUid: editingBooking.bookedByUid,
        bookedAt: editingBooking.bookedAt,
        key: bookingKey
      }
      
      console.log('Final data to save:', updatedData)
      
      await updateDoc(doc(db, 'bookings', editingBooking.id), updatedData)
      
      resetBookingForm()
      alert('Booking berhasil diupdate!')
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Gagal mengupdate booking: ' + error.message)
    }
  }

  const resetBookingForm = () => {
    setBookingForm({
      date: '',
      time: 0,
      duration: 1,
      name: '',
      rentPhotographer: false,
      rentShoes: 0,
      rentVests: 0,
      rentJerseys: 0
    })
    setEditingBooking(null)
  }

  const savePricing = async () => {
    setSavingPricing(true)
    setPricingSaved(false)
    try {
      const data = {
        fieldMorning: Number(pricingForm.fieldMorning) || 0,
        fieldEvening: Number(pricingForm.fieldEvening) || 0,
        photographer: Number(pricingForm.photographer) || 0,
        shoes: Number(pricingForm.shoes) || 0,
        vests: Number(pricingForm.vests) || 0,
        jerseys: Number(pricingForm.jerseys) || 0,
        updatedAt: new Date().toISOString()
      }
      await setDoc(doc(db, 'settings', 'pricing'), data)
      setPricingSaved(true)
      setTimeout(() => setPricingSaved(false), 3000)
    } catch (error) {
      console.error('Error saving pricing:', error)
      alert('Gagal menyimpan harga: ' + error.message)
    }
    setSavingPricing(false)
  }

  const deleteBooking = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus booking ini?')) {
      try {
        await deleteDoc(doc(db, 'bookings', id))
        alert('Booking berhasil dihapus!')
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert('Gagal menghapus booking: ' + error.message)
      }
    }
  }

  const formatDate = (dateValue) => {
    let date
    if (typeof dateValue === 'string') {
      // Handle ISO string format
      date = new Date(dateValue)
    } else if (dateValue && typeof dateValue === 'object') {
      // Handle {date, month, year} format
      date = new Date(dateValue.year, dateValue.month, dateValue.date)
    } else {
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeIndex) => {
    const hour = timeIndex + 6
    return `${hour.toString().padStart(2, '0')}:00`
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div 
        className="admin-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="admin-overlay" />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Kelola konten website Green Mini Soccer</p>
          
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{news.length}</div>
              <div className="stat-label">Berita</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{schedules.length}</div>
              <div className="stat-label">Jadwal</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{backgrounds.length}</div>
              <div className="stat-label">Background</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{bookings.length}</div>
              <div className="stat-label">Booking</div>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            Berita
          </button>
          <button 
            className={`admin-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Jadwal & Booking
          </button>
          <button 
            className={`admin-tab ${activeTab === 'background' ? 'active' : ''}`}
            onClick={() => setActiveTab('background')}
          >
            Background
          </button>
          <button 
            className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Setting Harga
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <div className="admin-tab-content">
            {activeTab === 'news' && (
              <div className="news-management">
                <div className="management-section">
                  <h2>{editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Judul</label>
                      <input
                        type="text"
                        value={newsForm.title}
                        onChange={(e) => handleNewsInputChange('title', e.target.value)}
                        placeholder="Judul berita"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tanggal</label>
                      <input
                        type="date"
                        value={newsForm.date}
                        onChange={(e) => handleNewsInputChange('date', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Kategori</label>
                      <select
                        value={newsForm.category}
                        onChange={(e) => handleNewsInputChange('category', e.target.value)}
                      >
                        <option value="Promo">Promo</option>
                        <option value="Update">Update</option>
                        <option value="Event">Event</option>
                        <option value="Fasilitas">Fasilitas</option>
                        <option value="Membership">Membership</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>URL Gambar</label>
                      <input
                        type="text"
                        value={newsForm.image}
                        onChange={(e) => handleNewsInputChange('image', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Konten Singkat (untuk card)</label>
                      <textarea
                        value={newsForm.content}
                        onChange={(e) => handleNewsInputChange('content', e.target.value)}
                        placeholder="Deskripsi singkat berita"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="article-sections">
                    <h3>Artikel Detail (untuk halaman detail)</h3>
                    {newsForm.article.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="article-section-form">
                        <div className="section-header">
                          <h4>Section {sectionIndex + 1}</h4>
                          {newsForm.article.length > 1 && (
                            <button 
                              onClick={() => removeArticleSection(sectionIndex)}
                              className="btn-remove-small"
                            >
                              Hapus Section
                            </button>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Heading Section</label>
                          <input
                            type="text"
                            value={section.heading}
                            onChange={(e) => handleArticleSectionChange(sectionIndex, 'heading', e.target.value)}
                            placeholder="Judul section"
                          />
                        </div>
                        <div className="paragraphs-container">
                          <label>Paragraphs</label>
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <div key={paragraphIndex} className="paragraph-input-group">
                              <textarea
                                value={paragraph}
                                onChange={(e) => handleArticleParagraphChange(sectionIndex, paragraphIndex, e.target.value)}
                                placeholder={`Paragraf ${paragraphIndex + 1}`}
                                rows="4"
                              />
                              {section.paragraphs.length > 1 && (
                                <button 
                                  onClick={() => removeParagraph(sectionIndex, paragraphIndex)}
                                  className="btn-remove-tiny"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          <button 
                            onClick={() => addParagraph(sectionIndex)}
                            className="btn-add-small"
                          >
                            + Tambah Paragraf
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addArticleSection} className="btn-add">
                      + Tambah Section Artikel
                    </button>
                  </div>

                  <div className="benefits-terms-container">
                    <div className="form-list">
                      <h3>Keuntungan/Benefits</h3>
                      {newsForm.benefits.map((benefit, index) => (
                        <div key={index} className="list-input-group">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleArrayInputChange('benefits', index, e.target.value)}
                            placeholder={`Benefit ${index + 1}`}
                          />
                          {newsForm.benefits.length > 1 && (
                            <button 
                              onClick={() => removeArrayItem('benefits', index)}
                              className="btn-remove-tiny"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addArrayItem('benefits')} className="btn-add-small">
                        + Tambah Benefit
                      </button>
                    </div>

                    <div className="form-list">
                      <h3>Syarat & Ketentuan</h3>
                      {newsForm.terms.map((term, index) => (
                        <div key={index} className="list-input-group">
                          <input
                            type="text"
                            value={term}
                            onChange={(e) => handleArrayInputChange('terms', index, e.target.value)}
                            placeholder={`Syarat ${index + 1}`}
                          />
                          {newsForm.terms.length > 1 && (
                            <button 
                              onClick={() => removeArrayItem('terms', index)}
                              className="btn-remove-tiny"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addArrayItem('terms')} className="btn-add-small">
                        + Tambah Syarat
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    {editingNews && (
                      <button onClick={resetNewsForm} className="btn-secondary">
                        Batal Edit
                      </button>
                    )}
                    <button onClick={saveNews} className="btn-primary">
                      {editingNews ? 'Update Berita' : 'Simpan Berita'}
                    </button>
                  </div>
                </div>

                <div className="management-section">
                  <h2>Daftar Berita</h2>
                  <div className="news-list">
                    {news.length === 0 ? (
                      <p className="empty-message">Belum ada berita</p>
                    ) : (
                      news.map((item) => (
                        <div key={item.id} className="news-item-admin">
                          <img src={item.image} alt={item.title} />
                          <div className="news-item-info">
                            <span className="news-category">{item.category}</span>
                            <h3>{item.title}</h3>
                            <p className="news-date">{item.date}</p>
                          </div>
                          <div className="news-item-actions">
                            <button onClick={() => editNews(item)} className="btn-edit">
                              Edit
                            </button>
                            <button onClick={() => deleteNews(item.id)} className="btn-delete">
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="schedule-management">
                <div className="management-section">
                  <h2>Tambah/Edit Jadwal</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Hari</label>
                      <select
                        value={scheduleForm.day}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                      >
                        <option value="">Pilih Hari</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Jam Buka</label>
                      <input
                        type="time"
                        value={scheduleForm.openTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, openTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Jam Tutup</label>
                      <input
                        type="time"
                        value={scheduleForm.closeTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, closeTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={scheduleForm.isOpen}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, isOpen: e.target.value === 'true' })}
                      >
                        <option value="true">Buka</option>
                        <option value="false">Tutup</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button onClick={saveSchedule} className="btn-primary">
                      Simpan Jadwal
                    </button>
                  </div>
                </div>

                <div className="management-section">
                  <h2>Jadwal Operasional</h2>
                  <div className="schedule-list">
                    {schedules.length === 0 ? (
                      <p className="empty-message">Belum ada jadwal</p>
                    ) : (
                      schedules.map((schedule) => (
                        <div key={schedule.id} className="schedule-item">
                          <div className="schedule-info">
                            <h3>{schedule.day}</h3>
                            <p>{schedule.openTime} - {schedule.closeTime}</p>
                            <span className={`status ${schedule.isOpen ? 'open' : 'closed'}`}>
                              {schedule.isOpen ? 'Buka' : 'Tutup'}
                            </span>
                          </div>
                          <button onClick={() => deleteSchedule(schedule.id)} className="btn-delete">
                            Hapus
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Booking Management Section */}
                {editingBooking && (
                  <div className="management-section edit-booking-section">
                    <h2>Edit Booking Pelanggan</h2>
                    <p className="section-description">
                      Ubah jadwal booking pelanggan. Booking oleh: <strong>{editingBooking.bookedByName}</strong> ({editingBooking.bookedBy})
                    </p>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Tanggal Booking</label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Waktu Mulai</label>
                        <select
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: parseInt(e.target.value) })}
                        >
                          {Array.from({ length: 19 }, (_, i) => {
                            const hour = i + 6
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`
                            // Batasi pilihan waktu agar tidak melebihi jam tutup (24:00)
                            const endTime = i + bookingForm.duration
                            if (endTime > 18) return null // 18 = jam 24:00 (6 + 18 = 24)
                            return <option key={i} value={i}>{timeStr}</option>
                          }).filter(Boolean)}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Durasi (jam)</label>
                        <select
                          value={bookingForm.duration}
                          onChange={(e) => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) })}
                        >
                          <option value={1}>1 jam</option>
                          <option value={2}>2 jam</option>
                          <option value={3}>3 jam</option>
                          <option value={4}>4 jam</option>
                          <option value={5}>5 jam</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Nama Tim</label>
                        <input
                          type="text"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                          placeholder="Nama tim"
                        />
                      </div>
                      
                      <div className="form-group full-width admin-rental-section">
                        <label className="admin-rental-title">Sewa Tambahan</label>
                        
                        <div className="admin-rental-grid">
                          <label className="admin-rental-item admin-rental-photographer admin-rental-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={bookingForm.rentPhotographer}
                              onChange={(e) => setBookingForm({ ...bookingForm, rentPhotographer: e.target.checked })}
                              className="admin-rental-checkbox"
                            />
                            <span className="admin-rental-label">Sewa Fotografer</span>
                          </label>

                          <div className="admin-rental-item admin-rental-with-qty">
                            <label className="admin-rental-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={bookingForm.rentShoes > 0}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentShoes: e.target.checked ? 1 : 0 })}
                                className="admin-rental-checkbox"
                              />
                              <span className="admin-rental-label">Sewa Sepatu</span>
                            </label>
                            <div className="admin-rental-qty-wrapper">
                              <span className="admin-rental-qty-label">Jumlah:</span>
                              <input 
                                type="number" 
                                value={bookingForm.rentShoes}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentShoes: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="admin-rental-qty-input"
                                placeholder="0"
                              />
                              <span className="admin-rental-qty-unit">pasang</span>
                            </div>
                          </div>

                          <div className="admin-rental-item admin-rental-with-qty">
                            <label className="admin-rental-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={bookingForm.rentVests > 0}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentVests: e.target.checked ? 1 : 0 })}
                                className="admin-rental-checkbox"
                              />
                              <span className="admin-rental-label">Sewa Rompi</span>
                            </label>
                            <div className="admin-rental-qty-wrapper">
                              <span className="admin-rental-qty-label">Jumlah:</span>
                              <input 
                                type="number" 
                                value={bookingForm.rentVests}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentVests: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="admin-rental-qty-input"
                                placeholder="0"
                              />
                              <span className="admin-rental-qty-unit">buah</span>
                            </div>
                          </div>

                          <div className="admin-rental-item admin-rental-with-qty">
                            <label className="admin-rental-checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={bookingForm.rentJerseys > 0}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentJerseys: e.target.checked ? 1 : 0 })}
                                className="admin-rental-checkbox"
                              />
                              <span className="admin-rental-label">Sewa Kaos Tim</span>
                            </label>
                            <div className="admin-rental-qty-wrapper">
                              <span className="admin-rental-qty-label">Jumlah:</span>
                              <input 
                                type="number" 
                                value={bookingForm.rentJerseys}
                                onChange={(e) => setBookingForm({ ...bookingForm, rentJerseys: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="admin-rental-qty-input"
                                placeholder="0"
                              />
                              <span className="admin-rental-qty-unit">buah</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button onClick={updateBooking} className="btn-primary">
                        Update Booking
                      </button>
                      <button onClick={resetBookingForm} className="btn-cancel">
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                <div className="management-section">
                  <h2>Daftar Booking Pelanggan</h2>
                  <p className="section-description">
                    Kelola reservasi lapangan dari pelanggan. Data booking diperbarui secara real-time.
                  </p>
                  
                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-message">Belum ada booking</p>
                      <p className="empty-description">Booking dari pelanggan akan muncul di sini</p>
                    </div>
                  ) : (
                    <div className="booking-table-container">
                      <table className="booking-table">
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Waktu</th>
                            <th>Durasi</th>
                            <th>Nama Tim</th>
                            <th>Sewa Tambahan</th>
                            <th>Booking Oleh</th>
                            <th>Email</th>
                            <th>Waktu Booking</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => {
                            const rentals = booking.rentals || {}
                            const rentalItems = []
                            if (rentals.photographer) rentalItems.push('Fotografer')
                            if (rentals.shoes > 0) rentalItems.push(`Sepatu (${rentals.shoes})`)
                            if (rentals.vests > 0) rentalItems.push(`Rompi (${rentals.vests})`)
                            if (rentals.jerseys > 0) rentalItems.push(`Kaos (${rentals.jerseys})`)
                            const rentalText = rentalItems.length > 0 ? rentalItems.join(', ') : '-'
                            
                            return (
                            <tr key={booking.id} className={editingBooking?.id === booking.id ? 'editing-row' : ''}>
                              <td>{formatDate(booking.date)}</td>
                              <td>{formatTime(booking.time)}</td>
                              <td>{booking.duration} jam</td>
                              <td className="team-name">{booking.name}</td>
                              <td style={{ fontSize: '12px', lineHeight: '1.4' }}>{rentalText}</td>
                              <td>{booking.bookedByName}</td>
                              <td>{booking.bookedBy}</td>
                              <td className="booking-time">
                                {new Date(booking.bookedAt).toLocaleString('id-ID', {
                                  dateStyle: 'short',
                                  timeStyle: 'short'
                                })}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    onClick={() => editBooking(booking)} 
                                    className="btn-edit-small"
                                    title="Edit booking"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => deleteBooking(booking.id)} 
                                    className="btn-delete-small"
                                    title="Hapus booking"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="background-management">
                <div className="management-section">
                  <h2>Tambah Background Baru</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nama Background</label>
                      <input
                        type="text"
                        value={backgroundForm.name}
                        onChange={(e) => setBackgroundForm({ ...backgroundForm, name: e.target.value })}
                        placeholder="Contoh: Futsal Field 1"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>URL Background</label>
                      <input
                        type="text"
                        value={backgroundForm.url}
                        onChange={(e) => setBackgroundForm({ ...backgroundForm, url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button onClick={saveBackground} className="btn-primary">
                      Tambah Background
                    </button>
                  </div>
                </div>

                <div className="management-section">
                  <h2>Daftar Background</h2>
                  <div className="background-list">
                    {backgrounds.length === 0 ? (
                      <p className="empty-message">Belum ada background</p>
                    ) : (
                      backgrounds.map((bg) => (
                        <div key={bg.id} className="background-item">
                          <img src={bg.url} alt={bg.name} />
                          <div className="background-info">
                            <h3>{bg.name}</h3>
                            <p className="bg-url">{bg.url}</p>
                          </div>
                          <button onClick={() => deleteBackground(bg.id)} className="btn-delete">
                            Hapus
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="pricing-management">
                <div className="management-section">
                  <h2>Setting Harga</h2>
                  <p className="pricing-description">Atur harga sewa lapangan dan layanan tambahan.</p>

                  <div className="pricing-form">
                    <div className="pricing-group">
                      <h3 className="pricing-group-title">Sewa Lapangan (per jam)</h3>
                      <div className="pricing-fields">
                        <div className="pricing-field">
                          <label>Pagi (06:00 – 16:00)</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.fieldMorning}
                              onChange={(e) => setPricingForm({ ...pricingForm, fieldMorning: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label>Malam (16:00 – 24:00)</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.fieldEvening}
                              onChange={(e) => setPricingForm({ ...pricingForm, fieldEvening: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pricing-group">
                      <h3 className="pricing-group-title">Sewa Tambahan</h3>
                      <div className="pricing-fields">
                        <div className="pricing-field">
                          <label>Fotografer</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.photographer}
                              onChange={(e) => setPricingForm({ ...pricingForm, photographer: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label>Sewa Sepatu (per pasang)</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.shoes}
                              onChange={(e) => setPricingForm({ ...pricingForm, shoes: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label>Sewa Rompi (per buah)</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.vests}
                              onChange={(e) => setPricingForm({ ...pricingForm, vests: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                        <div className="pricing-field">
                          <label>Sewa Kaos Tim (per buah)</label>
                          <div className="pricing-input-wrapper">
                            <span className="pricing-prefix">Rp</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={pricingForm.jerseys}
                              onChange={(e) => setPricingForm({ ...pricingForm, jerseys: e.target.value })}
                              placeholder="0"
                              className="pricing-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pricing-actions">
                      <button
                        className={`btn-save-pricing ${pricingSaved ? 'saved' : ''}`}
                        onClick={savePricing}
                        disabled={savingPricing}
                      >
                        {savingPricing ? 'Menyimpan...' : pricingSaved ? 'Tersimpan!' : 'Simpan Harga'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
