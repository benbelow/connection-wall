import { useState } from 'react'
import './Wall.css'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildInitialTiles(config) {
  const tiles = config.groups.flatMap((group) =>
    group.items.map((item, i) => ({
      id: `${group.id}-${i}`,
      items: [item],
      groupId: group.id,
      completed: false,
      hidden: false,
    }))
  )
  return shuffle(tiles)
}

// A stable colour per group index so completed tiles match their group
const GROUP_COLOURS = [
  '#e8a838', // amber
  '#6aaa64', // green
  '#4a90d9', // blue
  '#9b59b6', // purple
  '#e74c3c', // red
  '#1abc9c', // teal
  '#e67e22', // orange
  '#2c3e50', // dark
]

export default function Wall({ config }) {
  const x = config.groups.length

  const [tiles, setTiles] = useState(() => buildInitialTiles(config))
  const [selected, setSelected] = useState(null) // tile id
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [shake, setShake] = useState(false)

  const groupIndexMap = Object.fromEntries(
    config.groups.map((g, i) => [g.id, i])
  )

  const handleClick = (tileId) => {
    const tile = tiles.find((t) => t.id === tileId)
    if (!tile || tile.hidden || tile.completed) return

    if (selected === tileId) {
      setSelected(null)
      return
    }

    if (selected === null) {
      setSelected(tileId)
      return
    }

    const selTile = tiles.find((t) => t.id === selected)

    if (selTile.groupId === tile.groupId) {
      const mergedItems = [...selTile.items, ...tile.items]
      const group = config.groups.find((g) => g.id === tile.groupId)
      const isComplete = mergedItems.length === group.items.length

      const newTiles = tiles.map((t) => {
        if (t.id === selected) return { ...t, hidden: true }
        if (t.id === tileId) return { ...t, items: mergedItems, completed: isComplete }
        return t
      })

      setTiles(newTiles)
      setScore((s) => s + 1)
      setSelected(null)

      const completedCount = newTiles.filter((t) => !t.hidden && t.completed).length
      if (completedCount === x) setShowWin(true)
    } else {
      setMistakes((m) => m + 1)
      setSelected(null)
      triggerShake()
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const resetGame = () => {
    setTiles(buildInitialTiles(config))
    setSelected(null)
    setScore(0)
    setMistakes(0)
    setShowWin(false)
    setShake(false)
  }

  const getTileContent = (tile) => {
    if (tile.completed) {
      const group = config.groups.find((g) => g.id === tile.groupId)
      return { primary: group.name, count: null, isComplete: true }
    }
    if (tile.items.length === 1) {
      return { primary: tile.items[0], count: null, isComplete: false }
    }
    const preview = tile.items.slice(0, 2).join(', ') + (tile.items.length > 2 ? '…' : '')
    return {
      primary: preview,
      count: tile.items.length,
      isComplete: false,
    }
  }

  return (
    <div className="wall-wrapper">
      {/* Scoreboard — fixed against both scroll axes */}
      <div className="scoreboard">
        <div className="score-block">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-block">
          <span className="score-label">Mistakes</span>
          <span className="score-value mistakes-value">{mistakes}</span>
        </div>
        <button
          className="clear-btn"
          onClick={() => setSelected(null)}
          disabled={selected === null}
        >
          Clear
        </button>
        <button className="reset-btn" onClick={resetGame}>
          Reset
        </button>
      </div>

      {/* Scrollable grid container */}
      <div className="grid-scroll">
        <div
          className={`wall-grid${shake ? ' shake' : ''}`}
          style={{ '--cols': x }}
        >
          {tiles.map((tile) => {
            if (tile.hidden) return null

            const content = getTileContent(tile)
            const isSelected = selected === tile.id
            const colourIndex = groupIndexMap[tile.groupId]
            const colour = GROUP_COLOURS[colourIndex % GROUP_COLOURS.length]

            return (
              <div
                key={tile.id}
                className={[
                  'tile',
                  isSelected ? 'tile--selected' : '',
                  content.isComplete ? 'tile--complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={content.isComplete
                  ? { '--group-colour': colour }
                  : { '--group-progress': (tile.items.length / x).toFixed(2) }
                }
                onClick={() => handleClick(tile.id)}
                role="button"
                tabIndex={content.isComplete ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(tile.id)}
                aria-pressed={isSelected}
              >
                <span className="tile-primary">{content.primary}</span>
                {content.count !== null && (
                  <span className="tile-count">({content.count})</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Win modal */}
      {showWin && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal-title">You Win!</h2>
            <p className="modal-stat">
              Correct combinations: <strong>{score}</strong>
            </p>
            <p className="modal-stat">
              Mistakes: <strong>{mistakes}</strong>
            </p>
            <button className="modal-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
