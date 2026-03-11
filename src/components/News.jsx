import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { sampleNews } from '../sampleData'
import './News.css'

function News({ asSection = false, onNewsClick }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    // Listen to Firestore news collection
    const q = query(collection(db, 'news'), orderBy('date', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('News snapshot received, docs count:', snapshot.docs.length)
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('News data loaded:', newsData.length, 'items')
      
      // If Firestore has data, use it; otherwise use sample data
      if (newsData.length > 0) {
        setNews(newsData)
      } else {
        console.log('No Firestore data, using sample news')
        setNews(sampleNews)
      }
      setLoading(false)
    }, (error) => {
      console.error('Error fetching news:', error)
      // Fallback to sample news on error
      setNews(sampleNews)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getCategoryColor = (category) => {
    const colors = {
      'Promo': '#48bb78',
      'Update': '#4299e1',
      'Event': '#ed8936',
      'Fasilitas': '#9f7aea',
      'Membership': '#38b2ac'
    }
    return colors[category] || '#48bb78'
  }

  return (
    <section id="news" className="news-section">
      <div className="news-container">
        <div className="news-header">
          <h1 className="news-title">What's New</h1>
          <p className="news-subtitle">Berita terbaru dan update dari Green Mini Soccer</p>
        </div>

        {loading ? (
          <div className="loading-message">Memuat berita...</div>
        ) : (
          <>
            <div className="news-grid">
              {news.slice(0, visibleCount).map((item) => (
                <div 
                  key={item.id} 
                  className="news-card"
                  onClick={() => onNewsClick && onNewsClick(item)}
                >
                  <div className="news-image-wrapper">
                    <img src={item.image} alt={item.title} className="news-image" />
                    <span 
                      className="news-category"
                      style={{ background: getCategoryColor(item.category) }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div className="news-content">
                    <div className="news-date">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <h3 className="news-item-title">{item.title}</h3>
                    <p className="news-description">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {news.length > 3 && (
              <div className="news-load-more">
                <button 
                  className="load-more-btn"
                  onClick={() => setVisibleCount(visibleCount === 3 ? news.length : 3)}
                >
                  {visibleCount === 3 ? 'Load More' : 'Show Less'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default News
