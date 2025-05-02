import { useState } from 'react'
import './App.css'
import usePageStore from './store/PageStore'
//import ImageInformation from './components/ImageInformation'
import ImageComparison from './components/ImageComparison'
import PageHome from './components/PageHome'
function App() {
  const { pageIndicator, setPageIndicator } = usePageStore();
  const { pages } = usePageStore();

  return (
    <div className="app-container">
      <div className="header">
        <h2>Demo of Grounded Chart Generation</h2>
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
        {pageIndicator == "Image Information" && (
        <div key="1" className="page">
          <h2>pages[1]</h2>
        </div>
        )}
        {pageIndicator == "Image Comparison" && (
          <div key="2" className="page">
            <h2>pages[2]</h2>
            <ImageComparison />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
