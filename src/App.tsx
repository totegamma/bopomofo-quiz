import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type SymbolCategory = 'initial' | 'final' | 'medial' | 'special'

type ZhuyinSymbol = {
  symbol: string
  pinyin: string
  example: string
  category: SymbolCategory
  note: string
}

type StoredState = {
  completedLevels: number[]
}

const STORAGE_KEY = 'bopomofo-quiz-progress'
const PASSING_POINTS = 100
const REVIEW_START_POINTS = 50
const LEVEL_STEP = 2

const symbols: ZhuyinSymbol[] = [
  { symbol: 'ㄧ', pinyin: 'i / yi', example: '一 yi', category: 'medial', note: '高頻度の母音・介音' },
  { symbol: 'ㄨ', pinyin: 'u / wu', example: '五 wu', category: 'medial', note: '高頻度の母音・介音' },
  { symbol: 'ㄚ', pinyin: 'a', example: '爸 ba', category: 'final', note: 'もっとも基本的な開いた母音' },
  { symbol: 'ㄉ', pinyin: 'd', example: '的 de', category: 'initial', note: '頻出する破裂音' },
  { symbol: 'ㄓ', pinyin: 'zh', example: '中 zhong', category: 'initial', note: 'そり舌音の代表' },
  { symbol: 'ㄥ', pinyin: 'eng', example: '能 neng', category: 'final', note: 'よく出る鼻母音' },
  { symbol: 'ㄕ', pinyin: 'sh', example: '是 shi', category: 'initial', note: 'そり舌摩擦音' },
  { symbol: 'ㄅ', pinyin: 'b', example: '不 bu', category: 'initial', note: '基本の唇音' },
  { symbol: 'ㄢ', pinyin: 'an', example: '看 kan', category: 'final', note: '頻出する前鼻音' },
  { symbol: 'ㄠ', pinyin: 'ao', example: '好 hao', category: 'final', note: '基本的な二重母音' },
  { symbol: 'ㄜ', pinyin: 'e', example: '的 de', category: 'final', note: '軽声にも多い母音' },
  { symbol: 'ㄌ', pinyin: 'l', example: '了 le', category: 'initial', note: '頻出する流音' },
  { symbol: 'ㄍ', pinyin: 'g', example: '個 ge', category: 'initial', note: '基本の軟口蓋音' },
  { symbol: 'ㄤ', pinyin: 'ang', example: '上 shang', category: 'final', note: 'よく出る後鼻音' },
  { symbol: 'ㄐ', pinyin: 'j', example: '就 jiu', category: 'initial', note: '高頻度の歯茎硬口蓋音' },
  { symbol: 'ㄩ', pinyin: 'u / yu', example: '語 yu', category: 'medial', note: '日本語話者が区別したい円唇母音' },
  { symbol: 'ㄋ', pinyin: 'n', example: '你 ni', category: 'initial', note: '基本の鼻音' },
  { symbol: 'ㄣ', pinyin: 'en', example: '很 hen', category: 'final', note: '頻出する前鼻音' },
  { symbol: 'ㄒ', pinyin: 'x', example: '想 xiang', category: 'initial', note: 'j/q/x 系の摩擦音' },
  { symbol: 'ㄞ', pinyin: 'ai', example: '在 zai', category: 'final', note: '基本的な二重母音' },
  { symbol: 'ㄇ', pinyin: 'm', example: '嗎 ma', category: 'initial', note: '基本の鼻音' },
  { symbol: 'ㄑ', pinyin: 'q', example: '去 qu', category: 'initial', note: 'j/q/x 系の有気音' },
  { symbol: 'ㄔ', pinyin: 'ch', example: '吃 chi', category: 'initial', note: 'そり舌有気音' },
  { symbol: 'ㄖ', pinyin: 'r', example: '人 ren', category: 'initial', note: 'そり舌系で重要' },
  { symbol: 'ㄡ', pinyin: 'ou', example: '有 you', category: 'final', note: '頻出する二重母音' },
  { symbol: 'ㄗ', pinyin: 'z', example: '在 zai', category: 'initial', note: '舌尖音の代表' },
  { symbol: 'ㄆ', pinyin: 'p', example: '怕 pa', category: 'initial', note: 'b と対になる有気音' },
  { symbol: 'ㄎ', pinyin: 'k', example: '可 ke', category: 'initial', note: 'g と対になる有気音' },
  { symbol: 'ㄝ', pinyin: 'e / ê', example: '也 ye', category: 'final', note: '単独では少なめだが重要' },
  { symbol: 'ㄘ', pinyin: 'c', example: '次 ci', category: 'initial', note: 'z と対になる有気音' },
  { symbol: 'ㄈ', pinyin: 'f', example: '發 fa', category: 'initial', note: '唇歯音' },
  { symbol: 'ㄛ', pinyin: 'o', example: '我 wo', category: 'final', note: '単独頻度は控えめ' },
  { symbol: 'ㄙ', pinyin: 's', example: '三 san', category: 'initial', note: 'z/c と同じ系列' },
  { symbol: 'ㄊ', pinyin: 't', example: '他 ta', category: 'initial', note: 'd と対になる有気音' },
  { symbol: 'ㄟ', pinyin: 'ei', example: '誰 shei', category: 'final', note: '二重母音' },
  { symbol: 'ㄏ', pinyin: 'h', example: '和 he', category: 'initial', note: '軟口蓋摩擦音' },
  { symbol: 'ㄦ', pinyin: 'er', example: '二 er', category: 'special', note: '最後に扱う特殊な韻母' },
]

const keyboardRows = [
  ['ㄅ', 'ㄉ', 'ˇ', 'ˋ', 'ㄓ', 'ˊ', '˙', 'ㄚ', 'ㄞ', 'ㄢ', 'ㄦ'],
  ['ㄆ', 'ㄊ', 'ㄍ', 'ㄐ', 'ㄔ', 'ㄗ', 'ㄧ', 'ㄛ', 'ㄟ', 'ㄣ', null],
  ['ㄇ', 'ㄋ', 'ㄎ', 'ㄑ', 'ㄕ', 'ㄘ', 'ㄨ', 'ㄜ', 'ㄠ', 'ㄤ', null],
  ['ㄈ', 'ㄌ', 'ㄏ', 'ㄒ', 'ㄖ', 'ㄙ', 'ㄩ', 'ㄝ', 'ㄡ', 'ㄥ', null],
]

const confettiPieces = Array.from({ length: 18 }, (_, index) => index)
const symbolByCharacter = new Map(symbols.map((item) => [item.symbol, item]))

const levels = Array.from({ length: Math.ceil(symbols.length / LEVEL_STEP) }, (_, index) => {
  const size = Math.min((index + 1) * LEVEL_STEP, symbols.length)
  const levelSymbols = symbols.slice(0, size)

  return {
    id: index,
    title: `Level ${index + 1}`,
    size,
    symbols: levelSymbols,
    newSymbols: levelSymbols.slice(Math.max(0, size - LEVEL_STEP)),
  }
})

const createInitialProgress = (levelIndex: number) => {
  const level = levels[levelIndex]

  return Object.fromEntries(
    level.symbols.map((item) => [
      item.symbol,
      level.newSymbols.some((newItem) => newItem.symbol === item.symbol) ? 0 : REVIEW_START_POINTS,
    ]),
  )
}

const normalizeCompletedLevels = (completedLevels: number[]) =>
  Array.from(
    new Set(
      completedLevels.filter((levelIndex) => Number.isInteger(levelIndex) && levelIndex >= 0 && levelIndex < levels.length),
    ),
  ).sort((a, b) => a - b)

const getNextLevelIndex = (completedLevels: number[]) => {
  if (completedLevels.length === 0) {
    return 0
  }

  const maxCompletedLevel = Math.max(...completedLevels)
  return Math.min(maxCompletedLevel + 1, levels.length - 1)
}

const loadStoredState = (): StoredState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { completedLevels: [] }
    }

    const parsed = JSON.parse(raw) as Partial<StoredState> & {
      levels?: Record<string, Record<string, number>>
    }
    if (Array.isArray(parsed.completedLevels)) {
      return { completedLevels: normalizeCompletedLevels(parsed.completedLevels) }
    }

    const migratedCompletedLevels = Object.entries(parsed.levels ?? {})
      .filter(([levelIndex, progress]) => {
        const level = levels[Number(levelIndex)]
        return Boolean(level && level.symbols.every((item) => (progress[item.symbol] ?? 0) >= PASSING_POINTS))
      })
      .map(([levelIndex]) => Number(levelIndex))

    return { completedLevels: normalizeCompletedLevels(migratedCompletedLevels) }
  } catch {
    return { completedLevels: [] }
  }
}

const clampProgress = (value: number) => Math.min(PASSING_POINTS, Math.max(0, value))

const chooseNextTarget = (levelSymbols: ZhuyinSymbol[], progress: Record<string, number>, previous?: string) => {
  const incomplete = levelSymbols.filter((item) => (progress[item.symbol] ?? 0) < PASSING_POINTS)
  const pool = incomplete.length > 0 ? incomplete : levelSymbols
  const weighted = pool.flatMap((item) => {
    const points = progress[item.symbol] ?? 0
    const weight = Math.max(1, Math.ceil((PASSING_POINTS - points) / 20))
    return Array.from({ length: item.symbol === previous && pool.length > 1 ? 1 : weight }, () => item)
  })

  return weighted[Math.floor(Math.random() * weighted.length)] ?? pool[0]
}

const getVoice = () =>
  window.speechSynthesis
    ?.getVoices()
    .find((voice) => voice.lang.toLowerCase().startsWith('zh-tw') || voice.lang.toLowerCase().startsWith('zh'))

function App() {
  const [stored, setStored] = useState<StoredState>(() => loadStoredState())
  const initialLevelIndex = getNextLevelIndex(stored.completedLevels)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialLevelIndex)
  const [sessionProgress, setSessionProgress] = useState<Record<string, Record<string, number>>>({})
  const [showHint, setShowHint] = useState(false)
  const [target, setTarget] = useState<ZhuyinSymbol>(() => levels[initialLevelIndex].symbols[0])
  const [feedback, setFeedback] = useState('再生して、聞こえた注音を選ぶ')
  const [showConfetti, setShowConfetti] = useState(false)
  const [highlightedCorrect, setHighlightedCorrect] = useState<string | null>(null)
  const sessionProgressRef = useRef(sessionProgress)
  const highlightTimerRef = useRef<number | null>(null)

  const level = levels[currentLevelIndex]
  const levelProgress = useMemo(() => {
    return sessionProgress[currentLevelIndex] ?? createInitialProgress(currentLevelIndex)
  }, [currentLevelIndex, sessionProgress])

  const completedCount = level.symbols.filter((item) => (levelProgress[item.symbol] ?? 0) >= PASSING_POINTS).length
  const isLevelClear = completedCount === level.symbols.length
  const totalProgress = Math.round(
    level.symbols.reduce((sum, item) => sum + (levelProgress[item.symbol] ?? 0), 0) / level.symbols.length,
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }, [stored])

  useEffect(() => {
    sessionProgressRef.current = sessionProgress
  }, [sessionProgress])

  useEffect(() => {
    const progress = sessionProgressRef.current[currentLevelIndex] ?? createInitialProgress(currentLevelIndex)
    const next = chooseNextTarget(levels[currentLevelIndex].symbols, progress)
    setTarget(next)
    setFeedback('再生して、聞こえた注音を選ぶ')
    setHighlightedCorrect(null)
  }, [currentLevelIndex])

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const updateLevelProgress = (updater: (progress: Record<string, number>) => Record<string, number>) => {
    setSessionProgress((current) => {
      const base = current[currentLevelIndex] ?? createInitialProgress(currentLevelIndex)
      return {
        ...current,
        [currentLevelIndex]: updater(base),
      }
    })
  }

  const speak = (item = target) => {
    if (!window.speechSynthesis) {
      setFeedback('このブラウザでは音声再生が使えません')
      return
    }

    const utterance = new SpeechSynthesisUtterance(item.symbol)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.72
    utterance.pitch = 1
    const voice = getVoice()
    if (voice) {
      utterance.voice = voice
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleAnswer = (answer: ZhuyinSymbol) => {
    const correct = answer.symbol === target.symbol

    updateLevelProgress((progress) => {
      const nextProgress = { ...progress }
      if (correct) {
        nextProgress[target.symbol] = clampProgress((nextProgress[target.symbol] ?? 0) + 25)
      } else {
        nextProgress[answer.symbol] = clampProgress((nextProgress[answer.symbol] ?? 0) - 10)
        nextProgress[target.symbol] = clampProgress((nextProgress[target.symbol] ?? 0) + 5)
      }
      return nextProgress
    })

    setFeedback(
      correct
        ? `${target.symbol} 正解。${target.pinyin}`
        : `正解は ${target.symbol}。選んだのは ${answer.symbol}`,
    )

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current)
    }

    setHighlightedCorrect(correct ? null : target.symbol)
    if (!correct) {
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedCorrect(null)
        highlightTimerRef.current = null
      }, 1100)
    }

    const nextProgress = {
      ...levelProgress,
      [target.symbol]: clampProgress((levelProgress[target.symbol] ?? 0) + (correct ? 25 : 5)),
      ...(correct ? {} : { [answer.symbol]: clampProgress((levelProgress[answer.symbol] ?? 0) - 10) }),
    }
    const levelWillClear = level.symbols.every((item) => (nextProgress[item.symbol] ?? 0) >= PASSING_POINTS)
    if (levelWillClear) {
      setStored((current) => ({
        completedLevels: normalizeCompletedLevels([...current.completedLevels, currentLevelIndex]),
      }))
      setShowConfetti(true)
      window.setTimeout(() => setShowConfetti(false), 650)
      return
    }

    const nextTarget = chooseNextTarget(level.symbols, nextProgress, target.symbol)
    const nextDelay = correct ? 120 : 650
    window.setTimeout(() => {
      setTarget(nextTarget)
      speak(nextTarget)
    }, nextDelay)
  }

  const goToLevel = (index: number) => {
    setCurrentLevelIndex(index)
  }

  const resetLevel = () => {
    setSessionProgress((current) => ({
      ...current,
      [currentLevelIndex]: createInitialProgress(currentLevelIndex),
    }))
  }

  const startNextLevel = () => {
    const nextIndex = Math.min(currentLevelIndex + 1, levels.length - 1)
    setCurrentLevelIndex(nextIndex)
  }

  return (
    <main className="app-shell">
      <section className="top-bar">
        <div>
          <p className="eyebrow">Bopomofo listening trainer</p>
          <h1>注音を少しずつ聞き分ける</h1>
        </div>
        <div className="level-summary" aria-label="現在のレベル進捗">
          <strong>{totalProgress}%</strong>
          <span>{completedCount} / {level.symbols.length}</span>
        </div>
      </section>

      <section className="study-layout">
        <aside className="level-rail" aria-label="レベル一覧">
          {levels.map((item) => {
            const completed = stored.completedLevels.includes(item.id)

            return (
              <button
                className={`level-pill ${item.id === currentLevelIndex ? 'active' : ''}`}
                key={item.id}
                onClick={() => goToLevel(item.id)}
                type="button"
                aria-label={`${item.title}${completed ? ' クリア済み' : ''}`}
              >
                <span className="level-title-row">
                  <span>{item.title}</span>
                  {completed && <span className="level-check" aria-hidden="true">✓</span>}
                </span>
                <small>{item.newSymbols.map((symbol) => symbol.symbol).join(' ')}</small>
              </button>
            )
          })}
        </aside>

        <section className="quiz-panel" aria-label="クイズ">
          {showConfetti && (
            <div className="confetti-burst" aria-hidden="true">
              {confettiPieces.map((piece) => (
                <span key={piece} />
              ))}
            </div>
          )}

          <div className="quiz-head">
            <div>
              <p className="eyebrow">{level.title} · 候補 {level.size} 字</p>
              <h2>今回増える文字: {level.newSymbols.map((item) => item.symbol).join(' ')}</h2>
            </div>
            <button className="ghost-button" onClick={resetLevel} type="button">
              Reset
            </button>
          </div>

          <div className="new-guide" aria-label="このレベルで新しく増える文字のピンイン">
            {level.newSymbols.map((item) => (
              <button className="guide-item" key={item.symbol} onClick={() => speak(item)} type="button">
                <strong>{item.symbol}</strong>
                <span>{item.pinyin}</span>
                <small>{item.example}</small>
              </button>
            ))}
          </div>

          <div className="listen-area">
            <button className="play-button" onClick={() => speak()} type="button" aria-label="問題の音声を再生">
              <span className="play-icon">▶</span>
              <span>再生</span>
            </button>
            <div className="target-meta">
              <p>{feedback}</p>
              {showHint && (
                <strong>
                  Hint: {target.pinyin} · {target.example}
                </strong>
              )}
            </div>
            <label className="hint-toggle">
              <input checked={showHint} onChange={(event) => setShowHint(event.target.checked)} type="checkbox" />
              <span>ピンインヒント</span>
            </label>
          </div>

          <div className="keyboard-grid" aria-label="注音キーボード">
            {keyboardRows.flatMap((row, rowIndex) =>
              row.map((character) => {
                if (character === null) {
                  return <div className="keyboard-spacer" key={`${rowIndex}-spacer`} />
                }

                const item = symbolByCharacter.get(character)
                const points = item ? (levelProgress[item.symbol] ?? 0) : 0
                const isAvailable = Boolean(item && level.symbols.some((levelItem) => levelItem.symbol === item.symbol))
                const isNew = Boolean(item && level.newSymbols.some((newItem) => newItem.symbol === item.symbol))

                if (!item) {
                  return (
                    <button
                      aria-label={`${character} は声調キーです`}
                      className="answer-key tone-key"
                      disabled
                      key={`${rowIndex}-${character}`}
                      type="button"
                    >
                      <span className="symbol">{character}</span>
                    </button>
                  )
                }

                return (
                  <button
                    className={`answer-key ${isAvailable ? 'available' : 'unavailable'} ${isNew ? 'new-key' : ''} ${
                      highlightedCorrect === item.symbol ? 'correct-highlight' : ''
                    }`}
                    disabled={!isAvailable}
                    key={item.symbol}
                    onClick={() => handleAnswer(item)}
                    type="button"
                  >
                    <span className="symbol">{item.symbol}</span>
                    {isAvailable && (
                      <>
                        <span className="progress-track" aria-label={`${item.symbol} の進捗 ${points}%`}>
                          <span style={{ width: `${points}%` }} />
                        </span>
                        <span className="progress-label">
                          {points}%{isNew ? ' · new' : ''}
                        </span>
                      </>
                    )}
                  </button>
                )
              }),
            )}
          </div>

          {isLevelClear && (
            <div className="clear-strip">
              <div>
                <strong>{level.title} clear</strong>
                <span>次は {levels[Math.min(currentLevelIndex + 1, levels.length - 1)].size} 字の聞き分け</span>
              </div>
              {currentLevelIndex < levels.length - 1 && (
                <button onClick={startNextLevel} type="button">
                  Next
                </button>
              )}
            </div>
          )}
        </section>
      </section>

      <section className="curriculum">
        <div>
          <p className="eyebrow">level design</p>
          <h2>頻度順に累積して、復習は50%から</h2>
        </div>
        <div className="curriculum-grid">
          {symbols.map((item, index) => (
            <div className="rank-item" key={item.symbol}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.symbol}</strong>
              <div>
                <b>{item.pinyin}</b>
                <small>{item.note}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
