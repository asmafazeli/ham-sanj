import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
} from 'react'
import './App.css'
import { extractTextFromImage, isImageFile } from './ocr'
import {
  BIAS_STANDARDS_NOTE,
  EMPATHY_PROMPT,
  SAMPLE_CHATS,
  TONE_BIAS_CATALOG,
  scoreEmpathy,
  type EmpathyResult,
  type HistoryItem,
} from './scoring'

type InputMode = 'text' | 'image'
type LoadPhase = 'idle' | 'ocr' | 'analyze'

function scoreColor(score: number): string {
  if (score <= 3) return '#c45c26'
  if (score <= 6) return '#b8860b'
  return '#2f7d4a'
}

function App() {
  const [mode, setMode] = useState<InputMode>('text')
  const [chat, setChat] = useState<string>(SAMPLE_CHATS[0].text)
  const [activeSample, setActiveSample] = useState<string>(SAMPLE_CHATS[0].id)
  const [result, setResult] = useState<EmpathyResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loadPhase, setLoadPhase] = useState<LoadPhase>('idle')
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [showExtracted, setShowExtracted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copied, setCopied] = useState<'json' | 'prompt' | null>(null)
  const [showStandards, setShowStandards] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const busy = loadPhase !== 'idle'

  useEffect(() => {
    const raw = localStorage.getItem('ham-sanj-history')
    if (!raw) return
    try {
      setHistory(JSON.parse(raw) as HistoryItem[])
    } catch {
      localStorage.removeItem('ham-sanj-history')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ham-sanj-history', JSON.stringify(history.slice(0, 12)))
  }, [history])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const jsonText = useMemo(
    () => (result ? JSON.stringify(result, null, 2) : ''),
    [result],
  )

  const detectedBiases = useMemo(
    () => (result ? result.Biases : []),
    [result],
  )

  const pushHistory = useCallback((next: EmpathyResult, sourceText: string) => {
    setHistory((prev) =>
      [
        {
          ...next,
          id: crypto.randomUUID(),
          preview: sourceText.replace(/\s+/g, ' ').slice(0, 64),
          at: new Date().toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ...prev,
      ].slice(0, 12),
    )
  }, [])

  async function analyzeText() {
    if (!chat.trim() || busy) return
    setLoadPhase('analyze')
    setResult(null)
    setOcrError(null)
    await new Promise((resolve) => setTimeout(resolve, 550))
    const next = scoreEmpathy(chat)
    setResult(next)
    pushHistory(next, chat)
    setLoadPhase('idle')
  }

  async function runScore(sourceText: string) {
    setLoadPhase('analyze')
    setResult(null)
    await new Promise((resolve) => setTimeout(resolve, 350))
    const next = scoreEmpathy(sourceText)
    setResult(next)
    pushHistory(next, sourceText)
    setLoadPhase('idle')
  }

  async function analyzeImage() {
    if (busy) return

    // After OCR, re-score edited extracted text without a second OCR pass
    if (showExtracted && extractedText.trim()) {
      setOcrError(null)
      await runScore(extractedText)
      return
    }

    if (!imageFile) return

    setOcrError(null)
    setResult(null)
    setShowExtracted(false)
    setExtractedText('')
    setLoadPhase('ocr')

    try {
      const text = await extractTextFromImage(imageFile)
      if (!text) {
        setOcrError(
          'متنی از تصویر خوانده نشد. اسکرین‌شات واضح‌تری بگذار یا به حالت متن برو.',
        )
        setLoadPhase('idle')
        return
      }

      setExtractedText(text)
      setShowExtracted(true)
      await runScore(text)
    } catch {
      setOcrError(
        'خواندن تصویر با OCR ناموفق بود. دوباره تلاش کن یا متن را در حالت متن بچسبان.',
      )
      setLoadPhase('idle')
    }
  }

  async function copy(kind: 'json' | 'prompt') {
    const value = kind === 'json' ? jsonText : EMPATHY_PROMPT
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1400)
  }

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setImageFile(null)
  }, [])

  const acceptImage = useCallback(
    (file: File) => {
      if (!isImageFile(file) || busy) return

      setOcrError(null)
      setResult(null)
      setShowExtracted(false)
      setExtractedText('')
      setImageFile(file)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    },
    [busy],
  )

  function switchMode(next: InputMode) {
    if (next === mode || busy) return
    setMode(next)
    setOcrError(null)
    setResult(null)
    if (next === 'text') {
      setShowExtracted(false)
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) acceptImage(file)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) acceptImage(file)
  }

  function onPasteImage(event: ClipboardEvent) {
    if (mode !== 'image') return
    const items = event.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          acceptImage(file)
          return
        }
      }
    }
  }

  const statusLabel =
    loadPhase === 'ocr'
      ? 'در حال خواندن تصویر…'
      : loadPhase === 'analyze'
        ? 'در حال تحلیل…'
        : null

  return (
    <div className="app">
      <header className="brand-row">
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-orb" aria-hidden />
            <h1>
              هم‌سنج <span>HamSanj</span>
            </h1>
          </div>
          <p>ابزار QC برای سنجش همدلی و لحن در چت پشتیبانی.</p>
          <p>
            امتیاز ۰ تا ۹، برچسب لحن، و الگوهای سوگیری شناختی مرتبط با همدلی را
            در JSON بگیر.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="badge linkish"
            onClick={() => setShowStandards((open) => !open)}
            aria-expanded={showStandards}
          >
            درباره استاندارد
          </button>
          <div className="badge">Vibe Coding Demo · QC AI</div>
        </div>
      </header>

      {showStandards ? (
        <aside className="standards-panel" aria-label="درباره استاندارد">
          <h2>درباره استاندارد سوگیری‌ها</h2>
          <p>{BIAS_STANDARDS_NOTE}</p>
          <ul className="standards-list">
            {TONE_BIAS_CATALOG.map((bias) => (
              <li key={bias.id}>
                <strong>{bias.nameFa}</strong>
                <span> · {bias.nameEn}</span>
                <p>{bias.definitionFa}</p>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <main className="workspace">
        <section className="panel">
          <h2>ورودی تحلیل</h2>

          <div className="mode-switch" role="tablist" aria-label="حالت ورودی">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'text'}
              className={`mode-tab${mode === 'text' ? ' active' : ''}`}
              onClick={() => switchMode('text')}
              disabled={busy}
            >
              متن چت
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'image'}
              className={`mode-tab${mode === 'image' ? ' active' : ''}`}
              onClick={() => switchMode('image')}
              disabled={busy}
            >
              اسکرین‌شات
            </button>
          </div>

          {mode === 'text' ? (
            <>
              <div className="samples">
                {SAMPLE_CHATS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className={`chip${activeSample === sample.id ? ' active' : ''}`}
                    onClick={() => {
                      setActiveSample(sample.id)
                      setChat(sample.text)
                      setResult(null)
                      setOcrError(null)
                    }}
                    disabled={busy}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <textarea
                value={chat}
                onChange={(event) => {
                  setActiveSample('')
                  setChat(event.target.value)
                  setOcrError(null)
                }}
                placeholder="گفتگوی پشتیبانی را اینجا بچسبانید یا تایپ کنید..."
                aria-label="متن چت"
                disabled={busy}
              />

              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => void analyzeText()}
                  disabled={!chat.trim() || busy}
                >
                  {loadPhase === 'analyze' ? 'در حال تحلیل…' : 'تحلیل همدلی و لحن'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => void copy('prompt')}
                  disabled={busy}
                >
                  {copied === 'prompt' ? 'کپی شد' : 'کپی پرامپت QC'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setChat('')
                    setResult(null)
                    setActiveSample('')
                    setOcrError(null)
                  }}
                  disabled={busy}
                >
                  پاک کردن
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className={`screenshot-zone${dragOver ? ' drag-over' : ''}${busy ? ' busy' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onPaste={onPasteImage}
                tabIndex={0}
                role="region"
                aria-label="ناحیه آپلود اسکرین‌شات"
              >
                <div className="screenshot-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onFileChange}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className="btn ghost screenshot-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                  >
                    آپلود اسکرین‌شات
                  </button>
                  <span className="screenshot-hint">
                    یا بکش و رها کن · یا Ctrl+V برای پیست تصویر
                  </span>
                  {previewUrl ? (
                    <button
                      type="button"
                      className="btn ghost screenshot-clear"
                      onClick={() => {
                        clearPreview()
                        setOcrError(null)
                        setShowExtracted(false)
                        setExtractedText('')
                        setResult(null)
                      }}
                      disabled={busy}
                    >
                      حذف تصویر
                    </button>
                  ) : null}
                </div>

                {previewUrl ? (
                  <div className="screenshot-preview">
                    <img src={previewUrl} alt="پیش‌نمایش اسکرین‌شات" />
                  </div>
                ) : (
                  <p className="ocr-note">
                    یک اسکرین از چت را بگذار؛ با یک کلیک OCR و تحلیل همدلی انجام
                    می‌شود.
                  </p>
                )}
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => void analyzeImage()}
                  disabled={(!imageFile && !extractedText.trim()) || busy}
                >
                  {busy
                    ? statusLabel
                    : showExtracted
                      ? 'تحلیل مجدد متن'
                      : 'تحلیل تصویر'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => void copy('prompt')}
                  disabled={busy}
                >
                  {copied === 'prompt' ? 'کپی شد' : 'کپی پرامپت QC'}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    clearPreview()
                    setResult(null)
                    setOcrError(null)
                    setShowExtracted(false)
                    setExtractedText('')
                  }}
                  disabled={busy}
                >
                  پاک کردن
                </button>
              </div>

              {showExtracted ? (
                <div className="extracted-block">
                  <label htmlFor="extracted-text">متن استخراج‌شده از تصویر</label>
                  <textarea
                    id="extracted-text"
                    className="extracted-textarea"
                    value={extractedText}
                    onChange={(event) => setExtractedText(event.target.value)}
                    aria-label="متن استخراج‌شده از تصویر"
                    disabled={busy}
                  />
                  <p className="ocr-note">
                    در صورت نیاز ویرایش کن و «تحلیل مجدد متن» را بزن؛ بدون OCR دوباره
                    امتیاز می‌گیرد.
                  </p>
                </div>
              ) : null}
            </>
          )}

          {ocrError ? (
            <p className="ocr-error" role="alert">
              {ocrError}
            </p>
          ) : null}
          {statusLabel ? (
            <p className="ocr-status" role="status">
              {statusLabel}
            </p>
          ) : null}
          {busy ? <div className="analyzing" aria-hidden /> : null}
        </section>

        <section className="panel">
          <div className="result-head">
            <h2>نتیجه QC</h2>
            {result ? (
              <div
                className="score-ring"
                style={{
                  ['--score-pct' as string]: (result.Score / 9) * 100,
                  ['--score-color' as string]: scoreColor(result.Score),
                }}
              >
                <div>
                  <strong>{result.Score}</strong>
                  <small>از ۹</small>
                </div>
              </div>
            ) : null}
          </div>

          {result ? (
            <>
              <div className="tone-row">
                <span className="tone-label">لحن</span>
                <span className="tone-value">{result.Tone}</span>
              </div>
              <p className="reason">{result.Reason}</p>

              <div className="bias-block">
                <h3>سوگیری‌های تشخیص‌داده‌شده</h3>
                {detectedBiases.length === 0 ? (
                  <p className="empty bias-empty">
                    الگوی سوگیری مشخصی در لحن اپراتور دیده نشد.
                  </p>
                ) : (
                  <ul className="bias-chips">
                    {detectedBiases.map((bias) => (
                      <li key={bias.id} title={bias.evidence || bias.nameFa}>
                        <span className="bias-chip">{bias.nameFa}</span>
                        {bias.evidence ? (
                          <span className="bias-evidence">{bias.evidence}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="edu-note">{BIAS_STANDARDS_NOTE}</p>
              </div>

              <pre className="json-box">{jsonText}</pre>
              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => void copy('json')}
                >
                  {copied === 'json' ? 'JSON کپی شد' : 'کپی JSON'}
                </button>
              </div>
            </>
          ) : (
            <p className="empty">
              هنوز تحلیلی نیست. حالت «متن چت» یا «اسکرین‌شات» را انتخاب کن و دکمه
              تحلیل را بزن.
            </p>
          )}

          <div className="history">
            <h2>تاریخچه همین جلسه</h2>
            {history.length === 0 ? (
              <p className="empty">بعد از اولین تحلیل، امتیازها اینجا می‌مانند.</p>
            ) : (
              <ul className="history-list">
                {history.map((item) => (
                  <li key={item.id} className="history-item">
                    <span
                      className="pill"
                      style={{ background: scoreColor(item.Score) }}
                    >
                      {item.Score}
                    </span>
                    <p title={`${item.Tone} — ${item.Reason}`}>{item.preview}</p>
                    <time>{item.at}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
