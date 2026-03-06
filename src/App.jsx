import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EditPage from './pages/EditPage'
import { testConfig } from './config'
import Wall from './components/Wall'

function ExamplePage() {
  return <Wall config={testConfig} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/edit" element={<EditPage />} />
      <Route path="/45example" element={<ExamplePage />} />
    </Routes>
  )
}
