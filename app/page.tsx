"use client"
import Link from "next/link"
import { useState, useEffect } from "react"

const tools = [
  {
    icon: "🤖",
    title: "Dean 的工作状态",
    desc: "实时查看 AI 助手在干什么 — 像素画像素风",
    href: "/workspace",
    ready: true,
    badge: "LIVE",
  },
  {
    icon: "🛠️",
    title: "Web3 Skills",
    desc: "精选 OpenClaw Skill，含安全评级、用户评论，每6小时自动更新",
    href: "/skills",
    ready: true,
    badge: "UPDATED",
  },
  {
    icon: "📊",
    title: "Token Analytics",
    desc: "Pump.fun 毕业代币数据分析",
    href: "/tokens",
    ready: true,
    badge: null,
  },
  {
    icon: "📰",
    title: "Web3 Daily",
    desc: "每日 Web3 要闻摘要",
    href: "/daily",
    ready: true,
    badge: "NEW",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">
          Eden<span className="text-emerald-400">Lab</span>
        </span>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <Link href="/about" className="hover:text-white transition">关于</Link>
        </div>
      </nav>

      <section className="px-6 py-12 md:py-20 text-center">
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
          东之伊甸的{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            AI & Web3
          </span>{" "}
          工具站
        </h1>
        <p className="text-gray-400 text-lg mt-4 max-w-xl mx-auto">
          聪明钱追踪 · 链上分析 · AI 工具集合
        </p>
      </section>

      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-6">工具集</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className={`relative rounded-2xl border p-6 transition group flex flex-col ${
                tool.ready
                  ? "border-emerald-800 bg-gray-900 hover:border-emerald-500 cursor-pointer"
                  : "border-gray-800 bg-gray-900/50 opacity-60"
              }`}
            >
              {tool.ready ? <Link href={tool.href} className="absolute inset-0" /> : null}
              <div className="flex items-center gap-3 mb-3 min-h-[28px]">
                <span className="text-3xl">{tool.icon}</span>
                {tool.badge ? (
                  <span className="text-xs bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-full px-2 py-0.5 font-mono">
                    {tool.badge}
                  </span>
                ) : (
                  <span className="invisible text-xs px-2 py-0.5">占位</span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
              <p className="text-gray-400 text-sm">{tool.desc}</p>
              {tool.href === '/skills' && <SkillUpdateTime />}
              {!tool.ready && (
                <span className="mt-3 inline-block text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">
                  即将上线
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 py-6 text-center text-gray-600 text-sm">
        <OnlineStats />
        <div style={{ marginTop: 8 }}>© 2026 EdenLab · Built by 东之伊甸</div>
      </footer>
    </main>
  );
}

function SkillUpdateTime() {
  const [info, setInfo] = useState<{count: number; updatedAt: string} | null>(null)
  useEffect(() => {
    fetch('/api/skills?t=' + Date.now())
      .then(r => r.json())
      .then((data: Array<{updatedAt?: string}>) => {
        if (!data?.length) return
        const latest = data.reduce((max: string, s) => s.updatedAt && s.updatedAt > max ? s.updatedAt : max, '')
        setInfo({ count: data.length, updatedAt: latest })
      }).catch(() => {})
  }, [])
  if (!info) return null
  const d = new Date(info.updatedAt)
  const dateStr = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  const timeStr = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs text-emerald-400">共 {info.count} 个 Skill</span>
      <span className="text-xs text-gray-600">·</span>
      <span className="text-xs text-gray-500">最近更新 {dateStr} {timeStr}</span>
    </div>
  )
}

function OnlineStats() {
  const [stats, setStats] = useState<{ online: number; peak: number; total: number } | null>(null)
  const [sid] = useState(() => Math.random().toString(36).slice(2))

  useEffect(() => {
    const ping = () =>
      fetch('/online', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }) })
        .then(r => r.json()).then(setStats).catch(() => {})
    ping()
    const t = setInterval(ping, 60000) // 每分钟心跳
    return () => clearInterval(t)
  }, [sid])

  if (!stats) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, fontSize: 13, flexWrap: 'wrap' }}>
      <span>🟢 当前在线 <strong style={{ color: '#4ade80' }}>{stats.online}</strong> 人</span>
      <span>🏆 历史最高 <strong style={{ color: '#ffd700' }}>{stats.peak}</strong> 人</span>
      <span style={{ color: '#4b5563' }}>累计访问 {stats.total} 次</span>
    </div>
  )
}
