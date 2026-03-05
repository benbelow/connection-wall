import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Wall from '../components/Wall'
import { testConfig } from '../config'
import { decodeGameFile } from '../utils/gameFile'
import './HomePage.css'

export default function HomePage() {
  const [config, setConfig] = useState(testConfig)
  const [wallKey, setWallKey] = useState(0)
  const [importError, setImportError] = useState(null)
  const [importedName, setImportedName] = useState(null)
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.txt')) {
      setImportError('Only .txt files exported from the editor are accepted.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = decodeGameFile(ev.target.result)
      if (!result.ok) {
        setImportError(result.error)
        return
      }
      setConfig(result.config)
      setWallKey((k) => k + 1)
      setImportedName(file.name)
      setImportError(null)
    }
    reader.readAsText(file)
  }

  const handleResetToDefault = () => {
    setConfig(testConfig)
    setWallKey((k) => k + 1)
    setImportedName(null)
    setImportError(null)
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="app-title">Connection Wall</h1>
        <div className="import-area">
          {importedName && (
            <span className="imported-badge" title={importedName}>
              {importedName}
              <button className="reset-default-btn" onClick={handleResetToDefault} title="Back to default game">
                ✕
              </button>
            </span>
          )}
          <button className="import-btn" onClick={handleImportClick}>
            Import Game
          </button>
          <Link to="/edit" className="edit-link">
            Create Wall
          </Link>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {importError && (
        <div className="import-error" role="alert">
          {importError}
        </div>
      )}

      <Wall key={wallKey} config={config} />
    </div>
  )
}
