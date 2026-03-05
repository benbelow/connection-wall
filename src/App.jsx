import Wall from './components/Wall'
import { testConfig } from './config'

export default function App() {
  return (
    <div className="app">
      <h1 className="app-title">Connection Wall</h1>
      <Wall config={testConfig} />
    </div>
  )
}
