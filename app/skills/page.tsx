'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Skill {
  id?: string; name: string; description: string; author?: string
  github?: string; installCmd?: string; clawhub?: string | null; stars?: number; views?: number
  category: string; tags: string[]
  securityScore: number; securityNotes: string; securityLevel: 'safe' | 'caution' | 'danger'
  recommended?: boolean; installed?: boolean
  updatedAt: string
}
interface Review { id: number; name: string; text: string; rating: number; time: string }

const SEC = {
  safe:    { label: '安全', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: '#4ade80' },
  caution: { label: '注意', color: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: '#facc15' },
  danger:  { label: '高风险', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: '#f87171' },
}

const CATS = ['全部', 'Web3 / 金融', 'AI 增强', '效率工具', '开发工具', '搜索工具', '内容处理', '自动化', '系统维护']

function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return <span style={{ fontSize: size }}>{[1,2,3,4,5].map(i => (
    <span key={i} style={{ color: i <= n ? '#facc15' : '#374151' }}>★</span>
  ))}</span>
}

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const sec = SEC[skill.securityLevel]
  return (
    <div onClick={onClick} style={{
      background: '#1a1a2e', border: '1px solid #2c2f3a',
      borderLeft: `4px solid ${sec.border}`,
      borderRadius: 10, padding: '16px', cursor: 'pointer',
      transition: 'transform .15s, border-color .15s',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 'bold', fontSize: 15, color: '#e5e7eb' }}>{skill.name}</span>
            {(() => { const h = Date.now() - new Date(skill.updatedAt).getTime(); return h < 86400000 ? <span style={{ background: 'rgba(234,179,8,0.2)', color: '#fbbf24', fontSize: 10, padding: '1px 6px', borderRadius: 3, border: '1px solid #fbbf24', fontWeight: 'bold' }}>🆕 最近更新</span> : h < 86400000*7 ? <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 10, padding: '1px 6px', borderRadius: 3, border: '1px solid #818cf8' }}>本周新增</span> : null })()}
            {skill.recommended && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 10, padding: '1px 6px', borderRadius: 3, border: '1px solid #f87171' }}>👍 推荐</span>}
            {skill.installed && <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 10, padding: '1px 6px', borderRadius: 3, border: '1px solid #4ade80' }}>✓ 已安装</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#2c2f3a', color: '#60a5fa', fontSize: 11, padding: '2px 7px', borderRadius: 10 }}>{skill.category}</span>
            {skill.tags.slice(0,2).map(t => (
              <span key={t} style={{ background: '#1f2937', color: '#9ca3af', fontSize: 11, padding: '2px 7px', borderRadius: 10 }}>#{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {skill.views && <div style={{ color: '#9ca3af', fontSize: 11 }}>👁 {skill.views > 1000 ? (skill.views/1000).toFixed(1)+'k' : skill.views}</div>}
          {skill.stars ? <div style={{ color: '#facc15', fontSize: 12 }}>⭐ {skill.stars}</div> : null}
          {skill.author && <div style={{ fontSize: 11, color: '#6b7280' }}>by {skill.author}</div>}
        </div>
      </div>

      {/* 描述 */}
      <div style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        flexGrow: 1 }}>
        {skill.description}
      </div>

      {/* 安全评级 */}
      <div style={{ background: sec.bg, border: `1px solid ${sec.border}40`, borderRadius: 6, padding: '8px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: sec.color, fontSize: 13, fontWeight: 'bold' }}>🔐 {sec.label}</span>
          <span style={{ color: sec.color, fontSize: 13, fontWeight: 'bold' }}>{skill.securityScore}/100</span>
        </div>
        {/* 进度条 */}
        <div style={{ marginTop: 5, height: 4, background: '#2c2f3a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${skill.securityScore}%`, background: sec.color, borderRadius: 2 }} />
        </div>
      </div>

      {/* 底部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#4b5563', fontSize: 11 }}>点击查看详情 →</span>
        <a href={skill.github || skill.clawhub || "#"} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none',
            border: '1px solid #374151', padding: '3px 8px', borderRadius: 4 }}>
          GitHub ↗
        </a>
      </div>
    </div>
  )
}

function Modal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(4)
  const [submitting, setSubmitting] = useState(false)
  const [showSec, setShowSec] = useState(false)
  const sec = SEC[skill.securityLevel]

  useEffect(() => {
    fetch(`/api/skill-reviews?id=${skill.id}&t=${Date.now()}`)
      .then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {})
  }, [skill.id])

  async function submitReview() {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/skill-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill.id, name, text, rating })
      })
      const d = await res.json()
      if (d.ok) { setReviews(prev => [d.review, ...prev]); setText(''); setName('') }
    } finally { setSubmitting(false) }
  }

  const installCmd = skill.installCmd || (skill.id ? `openclaw skill install ${skill.id}` : "")

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      overflow: 'hidden'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111827', border: '1px solid #2c2f3a', borderRadius: 14,
        width: '100%', maxWidth: 620, maxHeight: '85vh', overflowY: 'scroll', overflowX: 'hidden',
        scrollbarWidth: 'thin', scrollbarColor: '#2c2f3a #111827',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
        fontFamily: "'Courier New', monospace"
      }}>
        {/* 头部 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#e5e7eb', margin: 0, fontSize: 20 }}>{skill.name}</h2>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>by {skill.author} · ⭐ {skill.stars} · {skill.category}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* 描述 */}
        <div style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.8, borderTop: '1px solid #2c2f3a', paddingTop: 14 }}>
          {skill.description}
        </div>

        {/* 安全分析（可折叠） */}
        <div style={{ background: SEC[skill.securityLevel].bg, border: `1px solid ${sec.border}50`, borderRadius: 8, padding: 12 }}>
          <div onClick={() => setShowSec(!showSec)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ color: sec.color, fontWeight: 'bold', fontSize: 14 }}>🔐 安全评级：{sec.label} {skill.securityScore}/100</span>
            <span style={{ color: sec.color }}>{showSec ? '▲' : '▼'}</span>
          </div>
          {showSec && (
            <div style={{ color: '#d1d5db', fontSize: 13, marginTop: 10, lineHeight: 1.7 }}>{skill.securityNotes}</div>
          )}
        </div>

        {/* 安装 */}
        <div style={{ borderTop: '1px solid #2c2f3a', paddingTop: 14 }}>
          <div style={{ color: '#ffd700', fontSize: 13, marginBottom: 8 }}>📦 安装方式</div>
          <div style={{ background: '#0f0f1a', border: '1px solid #374151', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <code style={{ color: '#4ade80', fontSize: 13 }}>{installCmd}</code>
            <button onClick={() => navigator.clipboard?.writeText(installCmd)} style={{
              background: '#2c2f3a', border: 'none', color: '#9ca3af', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12, flexShrink: 0
            }}>复制</button>
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 6 }}>或手动放到 ~/.openclaw/skills/ 目录下</div>
          <a href={skill.github || skill.clawhub || "#"} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', marginTop: 10, color: '#60a5fa', fontSize: 13,
            border: '1px solid #374151', padding: '6px 14px', borderRadius: 6, textDecoration: 'none'
          }}>在 GitHub 查看源码 ↗</a>
        </div>

        {/* 评论区 */}
        <div style={{ borderTop: '1px solid #2c2f3a', paddingTop: 14 }}>
          <div style={{ color: '#ffd700', fontSize: 13, marginBottom: 12 }}>💬 用户评论（{reviews.length}）</div>

          {/* 提交评论 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16,
            background: '#1a1a2e', padding: 12, borderRadius: 8, border: '1px solid #2c2f3a' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={name} onChange={e => setName(e.target.value)} maxLength={20}
                placeholder="你的名字（选填）" style={{
                  flex: 1, background: '#0f0f1a', border: '1px solid #374151', borderRadius: 4,
                  color: '#e5e7eb', padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none'
                }} />
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} onClick={() => setRating(n)} style={{
                    cursor: 'pointer', fontSize: 18, color: n <= rating ? '#facc15' : '#374151'
                  }}>★</span>
                ))}
              </div>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} maxLength={300}
              placeholder="写下你的使用体验或安全建议..." rows={3} style={{
                background: '#0f0f1a', border: '1px solid #374151', borderRadius: 4,
                color: '#e5e7eb', padding: '7px 10px', fontSize: 13, fontFamily: 'inherit',
                resize: 'none', outline: 'none'
              }} />
            <button onClick={submitReview} disabled={submitting || !text.trim()} style={{
              background: submitting ? '#374151' : '#e94560', border: 'none', color: '#fff',
              borderRadius: 4, padding: '8px 16px', cursor: submitting ? 'default' : 'pointer',
              fontSize: 13, fontFamily: 'inherit', alignSelf: 'flex-end'
            }}>{submitting ? '提交中...' : '发表评论 →'}</button>
          </div>

          {/* 评论列表 */}
          {reviews.length === 0 ? (
            <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: 20 }}>还没有评论，来第一个吧~</div>
          ) : reviews.map(r => (
            <div key={r.id} style={{ background: '#1a1a2e', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid #2c2f3a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#ffd700', fontSize: 13 }}>{r.name || '匿名'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars n={r.rating} size={13} />
                  <span style={{ color: '#4b5563', fontSize: 11 }}>{new Date(r.time).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
              <div style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.6 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('全部')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Skill | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 12

  useEffect(() => {
    fetch('/api/skills?t=' + Date.now())
      .then(r => r.json())
      .then(d => { setSkills(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = skills.filter(s => {
    const matchCat = cat === '全部' || s.category === cat
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.includes(q))
    return matchCat && matchSearch
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#e5e7eb', fontFamily: "'Courier New', monospace", paddingBottom: 100, WebkitOverflowScrolling: 'touch' as any }}>
      <style>{`
        .skills-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media (min-width: 641px) { .skills-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1025px) { .skills-grid { grid-template-columns: repeat(3, 1fr); } }
        .skills-tabs { scrollbar-width: none; }
        .skills-tabs::-webkit-scrollbar { display: none; }
      `}</style>
      {selected && <Modal skill={selected} onClose={() => setSelected(null)} />}

      {/* 顶部导航 */}
      <div style={{ borderBottom: '1px solid #1f2937', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13, border: '1px solid #4b5563', padding: '6px 12px', borderRadius: 4, flexShrink: 0 }}>← 主页</Link>
        <h1 style={{ fontSize: 18, color: '#ffd700', letterSpacing: 2, margin: 0, textAlign: 'center' }}>🛠️ Web3 Skills 推荐</h1>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="搜索 Skill..." style={{
            background: '#1a1a2e', border: '1px solid #2c2f3a', borderRadius: 6,
            color: '#e5e7eb', padding: '7px 12px', fontSize: 13, fontFamily: 'inherit',
            outline: 'none', width: 180
          }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {/* 分类 tabs */}
        <div className="skills-tabs" style={{ display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'nowrap', marginBottom: 24, paddingBottom: 4 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => { setCat(c); setPage(0) }} style={{
              background: cat === c ? '#e94560' : '#1a1a2e',
              border: `1px solid ${cat === c ? '#e94560' : '#2c2f3a'}`,
              color: cat === c ? '#fff' : '#9ca3af',
              borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
              fontSize: 13, fontFamily: 'inherit', transition: 'all .15s'
            }}>{c}</button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#4b5563', fontSize: 13, alignSelf: 'center' }}>{filtered.length} 个 Skill</span>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>加载中...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div>没找到匹配的 Skill</div>
          </div>
        )}

        {/* 卡片网格 */}
        <div className="skills-grid">
          {paged.map((s, i) => <SkillCard key={s.name + i} skill={s} onClick={() => setSelected(s)} />)}
        </div>
      </div>

      {/* 翻页 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 8 }}>
          <button onClick={() => setPage(0)} disabled={page === 0} style={{
            background: page === 0 ? '#1a1a2e' : '#2c2f3a', color: page === 0 ? '#4b5563' : '#e5e7eb',
            border: '1px solid #2c2f3a', borderRadius: 6, padding: '6px 10px', cursor: page === 0 ? 'default' : 'pointer', fontSize: 13
          }}>«</button>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
            background: page === 0 ? '#1a1a2e' : '#2c2f3a', color: page === 0 ? '#4b5563' : '#e5e7eb',
            border: '1px solid #2c2f3a', borderRadius: 6, padding: '6px 12px', cursor: page === 0 ? 'default' : 'pointer', fontSize: 13
          }}>‹ 上一页</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              background: i === page ? '#e94560' : '#1a1a2e',
              color: i === page ? '#fff' : '#9ca3af',
              border: '1px solid ' + (i === page ? '#e94560' : '#2c2f3a'),
              borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: i === page ? 'bold' : 'normal'
            }}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{
            background: page === totalPages - 1 ? '#1a1a2e' : '#2c2f3a', color: page === totalPages - 1 ? '#4b5563' : '#e5e7eb',
            border: '1px solid #2c2f3a', borderRadius: 6, padding: '6px 12px', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: 13
          }}>下一页 ›</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} style={{
            background: page === totalPages - 1 ? '#1a1a2e' : '#2c2f3a', color: page === totalPages - 1 ? '#4b5563' : '#e5e7eb',
            border: '1px solid #2c2f3a', borderRadius: 6, padding: '6px 10px', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: 13
          }}>»</button>
          <span style={{ color: '#4b5563', fontSize: 12, marginLeft: 4 }}>第 {page+1} / {totalPages} 页 · 共 {filtered.length} 个</span>
        </div>
      )}

      {/* 免责声明 */}
      <div style={{
        borderTop: '1px solid #1f2937', marginTop: 32,
        padding: '16px 20px', textAlign: 'center',
        fontSize: 11, color: '#4b5563',
      }}>
        ⚠️ 以上 Skill 均为第三方开源项目，EdenLab 不对其安全性负责。安全评级仅供参考，使用前请自行审查源码。涉及资金操作的 Skill 请务必先用测试账户验证，后果自负。
      </div>
    </div>
  )
}
