'use client'

import { useEffect } from 'react'

export default function BookCover() {
  useEffect(() => {
    async function fetchBookCover(title: string, author: string, element: HTMLElement) {
      try {
        const searchQuery = encodeURIComponent(`${title} ${author}`.trim())
        
        const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`
        const response = await fetch(googleBooksUrl)
        const data = await response.json()
        
        if (data.items && data.items[0] && data.items[0].volumeInfo && data.items[0].volumeInfo.imageLinks) {
          const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail || 
                         data.items[0].volumeInfo.imageLinks.smallThumbnail
          if (coverUrl) {
            element.style.backgroundImage = `url(${coverUrl.replace('http://', 'https://')})`
            return
          }
        }
        
        const openLibraryUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author || '')}&limit=1`
        const olResponse = await fetch(openLibraryUrl)
        const olData = await olResponse.json()
        
        if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
          const coverId = olData.docs[0].cover_i
          const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          element.style.backgroundImage = `url(${coverUrl})`
          return
        }
      } catch (error) {
        console.log(`Could not fetch cover for ${title}:`, error)
      }
    }

    const bookCovers = document.querySelectorAll('.book-cover[data-title]')
    bookCovers.forEach(cover => {
      const title = cover.getAttribute('data-title')
      const authors = cover.getAttribute('data-authors') || ''
      if (title) {
        fetchBookCover(title, authors, cover as HTMLElement)
      }
    })
  }, [])

  return null
}
