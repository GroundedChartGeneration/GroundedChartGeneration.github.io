import { useState } from 'react'
import './App.css'
import usePageStore from './store/PageStore'
import ImageSelector from './components/ImageSelector'
import PageHome from './components/PageHome'
function App() {
  const { pageIndicator, setPageIndicator } = usePageStore();
  const { pages } = usePageStore();

  return (
    <div className="app-container">
      <div className="header">
        <h2>Page Navigation Demo</h2>
        <div className="navigation">
          {pages.map((page, index) => (
            <button
              key={index}
              className={`nav-button ${page == pageIndicator ? 'active' : ''}`}
              onClick={() => setPageIndicator(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
      <main>
        {pageIndicator == "Home" && (
          <div key="0" className="page">
            <PageHome />
          </div>
        )}
        {pageIndicator == "Basic Table" && (
        <div key="1" className="page">
          <h2>pages[1]</h2>
          <ImageSelector />
          <div className="image-display">
            <div className="comparison-container">
              <div className="comparison-left">
                <h3>4 Data Points</h3>
                <div className="image-grid">
                  {/* Images will be dynamically loaded based on selector parameters */}
                </div>
              </div>
              <div className="comparison-right">
                <h3>6 Data Points</h3>
                <div className="image-grid">
                  {/* Images will be dynamically loaded based on selector parameters */}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
        {pageIndicator == "Image Comparison" && (
          <div key="2" className="page">pages[2]</div>
        )}
      </main>
    </div>
  )
}

export default App
