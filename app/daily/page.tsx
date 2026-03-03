'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NewsItem {
  title: string
  summary: string
  source: string
  url: string
  score?: number
  meme_score?: number
  signal: 'bullish' | 'bearish' | 'neutral'
  category?: string
  tags?: string[]
}

interface NewsData {
  date: string
  updatedAt: string
  news: NewsItem[]
}

const signalConfig = {
  bullish: { label: '看涨 📈', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  bearish: { label: '看跌 📉', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  neutral: { label: '中性 ➡️', color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
}

const tabs = [
  { key: 'web3', label: '🌐 Web3 要闻', endpoint: '/news', desc: '每日05:00自动更新' },
  { key: 'openclaw', label: '🦞 OpenClaw 动态', endpoint: '/news-openclaw', desc: '每日23:00自动更新' },
  { key: 'meme', label: '🎭 Meme 雷达', endpoint: '/news-meme', desc: '迪恩人工精选' },
]

export default function DailyPage() {
  const [dataMap, setDataMap] = useState<Record<string, NewsData | null>>({})
  const [activeTab, setActiveTab] = useState('web3')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = Date.now()
    Promise.all(
      tabs.map(tab => fetch(`${tab.endpoint}?t=${t}`).then(r => r.json()).catch(() => null))
    ).then(results => {
      const map: Record<string, NewsData | null> = {}
      tabs.forEach((tab, i) => { map[tab.key] = results[i] })
      setDataMap(map)
      setLoading(false)
    })
  }, [])

  const currentTab = tabs.find(t => t.key === activeTab)!
  const currentData = dataMap[activeTab]
  const newsList = currentData?.news || []
  const updatedTime = currentData?.updatedAt
    ? new Date(currentData.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    : ''

  return (
    <div style={{ minHeight: '100svh', background: '#0f0f1a', color: '#e5e7eb', fontFamily: "'Courier New', monospace", padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ color: '#ffd700', textDecoration: 'none', fontSize: 14, border: '1px solid #e94560', padding: '6px 12px', borderRadius: 4 }}>← 主页</Link>
        <h1 style={{ fontSize: 20, color: '#ffd700', letterSpacing: 2, margin: 0 }}>🗞️ 每日简报</h1>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{currentData?.date || '—'}</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Tab 栏 */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 0, borderBottom: '1px solid #2c2f3a' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? '#e94560' : '#1a1a2e',
              color: activeTab === tab.key ? '#fff' : '#9ca3af',
              border: '1px solid ' + (activeTab === tab.key ? '#e94560' : '#2c2f3a'),
              borderBottom: 'none',
              padding: '8px 16px', borderRadius: '6px 6px 0 0',
              cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 13,
              fontWeight: activeTab === tab.key ? 'bold' : 'normal', transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* 更新时间 */}
        <div style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 20px', textAlign: 'center' }}>
          {updatedTime ? `迪恩整理于 ${updatedTime} · ${currentTab.desc}` : currentTab.desc}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>加载中...</div>}

        {!loading && newsList.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: '#1a1a2e', borderRadius: 12, border: '1px solid #2c2f3a', color: '#6b7280' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 14 }}>暂无内容，{currentTab.desc}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {newsList.map((item, i) => {
            const sig = signalConfig[item.signal] || signalConfig.neutral
            const isMeme = activeTab === 'meme'
            return (
              <div key={i} style={{
                background: '#1a1a2e', borderRadius: 10,
                border: '1px solid #2c2f3a', padding: '16px 20px',
                borderLeft: `4px solid ${isMeme ? '#a855f7' : sig.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: 15, fontWeight: 'bold', lineHeight: 1.4, flex: 1 }}>
                    {item.title}
                  </a>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span style={{ background: sig.bg, color: sig.color, border: `1px solid ${sig.color}`, padding: '2px 8px', borderRadius: 4, fontSize: 11, whiteSpace: 'nowrap' }}>{sig.label}</span>
                    {isMeme && item.meme_score !== undefined && (
                      <span style={{
                        background: item.meme_score >= 85 ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.1)',
                        color: item.meme_score >= 85 ? '#c084fc' : '#a855f7',
                        border: '1px solid #a855f7',
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, whiteSpace: 'nowrap'
                      }}>🎭 Meme {item.meme_score}</span>
                    )}
                    {!isMeme && item.score !== undefined && (
                      <span style={{ background: '#2c2f3a', color: item.score >= 80 ? '#4ade80' : item.score >= 60 ? '#facc15' : '#9ca3af', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>AI {item.score}</span>
                    )}
                  </div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>{item.summary}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#4b5563' }}>来源：{item.source}</span>
                  {isMeme && item.tags && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.tags.map((tag, ti) => (
                        <span key={ti} style={{ background: '#2c2f3a', color: '#6b7280', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {newsList.length > 0 && (
          <div style={{ marginTop: 32, textAlign: 'center', fontSize: 12, color: '#4b5563' }}>
            共 {newsList.length} 条 · 由迪恩·温彻斯特整理 🚗 · 仅供参考，不构成投资建议
          </div>
        )}
      </div>
    </div>
  )
}
