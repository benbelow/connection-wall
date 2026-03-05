import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { encodeGameFile } from '../utils/gameFile'
import './EditPage.css'

const DEFAULT_X = 4

function emptyBucket(x) {
  return { name: '', items: Array(x).fill('') }
}

function validate(x, buckets) {
  const errors = []

  if (buckets.length !== x) {
    errors.push(`You have ${buckets.length} bucket(s) but need exactly ${x}.`)
  }

  buckets.forEach((b, i) => {
    if (!b.name.trim()) errors.push(`Bucket ${i + 1}: category name is empty.`)
    b.items.forEach((item, j) => {
      if (!item.trim()) errors.push(`Bucket ${i + 1}, item ${j + 1}: empty.`)
    })
  })

  return errors
}

export default function EditPage() {
  const [x, setX] = useState(DEFAULT_X)
  const [buckets, setBuckets] = useState([])
  const [saveErrors, setSaveErrors] = useState([])

  // ── X change ──────────────────────────────────────────────────
  const handleXChange = (newX) => {
    const n = Math.max(2, Math.min(10, Number(newX)))
    setX(n)
    // Resize existing buckets' item arrays
    setBuckets((prev) =>
      prev.map((b) => ({
        ...b,
        items: Array(n)
          .fill('')
          .map((_, i) => b.items[i] ?? ''),
      }))
    )
    setSaveErrors([])
  }

  // ── Bucket ops ────────────────────────────────────────────────
  const addBucket = () => {
    setBuckets((prev) => [...prev, emptyBucket(x)])
    setSaveErrors([])
  }

  const removeBucket = (idx) => {
    setBuckets((prev) => prev.filter((_, i) => i !== idx))
    setSaveErrors([])
  }

  const updateBucketName = useCallback((idx, value) => {
    setBuckets((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, name: value } : b))
    )
  }, [])

  const updateItem = useCallback((bucketIdx, itemIdx, value) => {
    setBuckets((prev) =>
      prev.map((b, i) =>
        i === bucketIdx
          ? { ...b, items: b.items.map((it, j) => (j === itemIdx ? value : it)) }
          : b
      )
    )
  }, [])

  // ── Save / Download ───────────────────────────────────────────
  const handleSave = () => {
    const errors = validate(x, buckets)
    if (errors.length > 0) {
      setSaveErrors(errors)
      return
    }

    const config = {
      groups: buckets.map((b, i) => ({
        id: `group-${i}`,
        name: b.name.trim(),
        items: b.items.map((it) => it.trim()),
      })),
    }

    const content = encodeGameFile(config)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'connection-wall.txt'
    a.click()
    URL.revokeObjectURL(url)
    setSaveErrors([])
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <Link to="/" className="back-link">← Play</Link>
        <h1 className="edit-title">Create a Wall</h1>
      </div>

      {/* ── Global settings ── */}
      <div className="edit-settings">
        <label className="setting-label">
          Number of buckets (= items per bucket)
          <input
            type="number"
            className="setting-input"
            min={2}
            max={10}
            value={x}
            onChange={(e) => handleXChange(e.target.value)}
          />
        </label>
      </div>

      {/* ── Bucket list ── */}
      <div className="bucket-list">
        {buckets.map((bucket, bi) => (
          <div key={bi} className="bucket-card">
            <div className="bucket-header">
              <span className="bucket-number">Bucket {bi + 1}</span>
              <button
                className="remove-btn"
                onClick={() => removeBucket(bi)}
                title="Remove bucket"
              >
                ✕
              </button>
            </div>

            <label className="field-label">
              Category name
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Types of Tea"
                value={bucket.name}
                onChange={(e) => updateBucketName(bi, e.target.value)}
              />
            </label>

            <div className="items-grid" style={{ '--item-cols': Math.min(x, 4) }}>
              {bucket.items.map((item, ii) => (
                <input
                  key={ii}
                  type="text"
                  className="item-input"
                  placeholder={`Item ${ii + 1}`}
                  value={item}
                  onChange={(e) => updateItem(bi, ii, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="edit-actions">
        <button className="add-btn" onClick={addBucket}>
          + Add Bucket
        </button>
        <button className="save-btn" onClick={handleSave}>
          Save &amp; Download
        </button>
      </div>

      {/* ── Validation errors ── */}
      {saveErrors.length > 0 && (
        <div className="error-panel" role="alert">
          <strong>Please fix the following before saving:</strong>
          <ul>
            {saveErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
