import { Routes, Route } from 'react-router-dom'
import { ListingPage } from './pages/ListingPage'
import { DetailPage } from './pages/DetailPage'
import { MapPage } from './pages/MapPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ListingPage />} />
      <Route path="/cafe/:id" element={<DetailPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  )
}

export default App
