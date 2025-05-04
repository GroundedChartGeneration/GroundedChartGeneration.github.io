import { useState } from 'react'
import './App.css'
import usePageStore from './store/PageStore'
import ChartGallery from './components/ChartGallery'
import ChartComparison from './components/ChartComparison'
import PageHome from './components/PageHome'
function App() {
  const { pageIndicator, setPageIndicator } = usePageStore();
  const { pages } = usePageStore();

  return (
    <div className="app-container">
      <div className="header">
        <h2>Grounded Generation of Embellished Bar Chart Ensuring Chart Integrity</h2>
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
        {pageIndicator == "Chart Gallery" && (
        <div key="1" className="page">
          <ChartGallery />
        </div>
        )}
        {pageIndicator == "Chart Comparison" && (
          <div key="2" className="page">
            <ChartComparison />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
