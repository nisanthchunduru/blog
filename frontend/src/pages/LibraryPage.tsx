import { useLoaderData } from 'react-router-dom'
import { Book } from '../types'
import '../library.css'

export default function LibraryPage() {
  const books = useLoaderData() as Book[]
  return (
    <>
      <h1 className="text-center text-5xl font-light mt-8 md:mt-16 mb-16 text-gray-900 dark:text-gray-100">Library</h1>
      <div className="container mx-auto px-4 max-w-7xl pb-24 md:pb-0" style={{ flex: 1 }}>
        <div className="books-grid mb-16 pt-8">
          {books.map((book, index) => (
            <div key={index} className="book-container">
              <div className="book">
                <div className="book-cover" data-title={book.title} data-authors={book.authors || ''}>
                  {book.authors ? (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${book.title} by ${book.authors}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-cover-link"
                    />
                  ) : (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(book.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-cover-link"
                    />
                  )}
                  <div className="book-spine"></div>
                </div>
              </div>
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                {book.authors && <p className="book-author">{book.authors}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
