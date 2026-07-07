import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage   from './pages/LandingPage.jsx'
import VideoAdPage   from './pages/VideoAdPage.jsx'
import ImagePostPage from './pages/ImagePostPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/video-ad"  element={<VideoAdPage />} />
      <Route path="/image-post" element={<ImagePostPage />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}
