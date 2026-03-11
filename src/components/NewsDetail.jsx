import { useEffect } from 'react'
import './NewsDetail.css'

function NewsDetail({ newsItem, onBack, backgroundImage }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // SEO Meta Tags
  useEffect(() => {
    if (!newsItem) return

    // Save original title
    const originalTitle = document.title

    // Update document title
    document.title = `${newsItem.title} - Mini Soccer`

    // Helper function to update or create meta tag
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${property}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, property)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    // Set meta description - use first paragraph of article if available
    let description = newsItem.content.substring(0, 160) + '...'
    if (newsItem.article && newsItem.article.length > 0 && newsItem.article[0].paragraphs && newsItem.article[0].paragraphs.length > 0) {
      const firstParagraph = newsItem.article[0].paragraphs[0]
      description = firstParagraph.substring(0, 160) + (firstParagraph.length > 160 ? '...' : '')
    }
    updateMetaTag('description', description)

    // Set Open Graph tags for social sharing
    updateMetaTag('og:title', newsItem.title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', newsItem.image, true)
    updateMetaTag('og:type', 'article', true)
    updateMetaTag('og:url', window.location.href, true)

    // Set Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', newsItem.title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', newsItem.image)

    // Cleanup: restore original title on unmount
    return () => {
      document.title = originalTitle
    }
  }, [newsItem])

  if (!newsItem) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-content">
          <h2>Berita tidak ditemukan</h2>
          <button onClick={onBack} className="back-btn">Kembali</button>
        </div>
      </div>
    )
  }

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
    <div className="news-detail-page">
      <div 
        className="page-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="page-overlay" />
      
      <div className="news-detail-content">
        <button onClick={onBack} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </button>

        <article className="news-detail-article">
          <div className="article-header">
            <span 
              className="article-category"
              style={{ background: getCategoryColor(newsItem.category) }}
            >
              {newsItem.category}
            </span>
            <h1 className="article-title">{newsItem.title}</h1>
            <div className="article-meta">
              <span className="article-date">
                {new Date(newsItem.date).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="article-image-wrapper">
            <img 
              src={newsItem.image} 
              alt={newsItem.title} 
              className="article-image"
            />
          </div>

          <div className="article-content">
            {/* Article Sections */}
            {newsItem.article && newsItem.article.map((section, sectionIndex) => (
              <div key={sectionIndex} className="article-section">
                <h2 className="section-heading">{section.heading}</h2>
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="section-paragraph">{paragraph}</p>
                ))}
              </div>
            ))}
            
            {/* Fallback to old content if article field doesn't exist */}
            {!newsItem.article && (
              <p className="article-text">{newsItem.content}</p>
            )}

            {newsItem.benefits && (
              <div className="article-benefits">
                <h3>Keuntungan</h3>
                <ul>
                  {newsItem.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {newsItem.terms && (
              <div className="article-terms">
                <h3>Syarat & Ketentuan</h3>
                <ul>
                  {newsItem.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

export default NewsDetail
