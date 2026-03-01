'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const PixelGame = dynamic(() => import('./PixelGame'), { ssr: false })

type State = 'idle' | 'working' | 'delegating' | 'waiting'

interface StatusData {
  state: State
  message: string
  updatedAt: string
}

const STATE_INFO: Record<State, { title: string; desc: string; color: string; badge: string }> = {
  idle:        { title: '休息中',           desc: '在休息室溜达，抽根烟等命令',       color: 'border-gray-600',   badge: 'bg-gray-700 text-gray-300' },
  working:     { title: '工作中',           desc: '坐在电脑前死磕代码',              color: 'border-blue-600',   badge: 'bg-blue-900 text-blue-300' },
  delegating:  { title: 'Claude Code 干活', desc: '让 CC 写代码，我站旁边盯着',      color: 'border-purple-600', badge: 'bg-purple-900 text-purple-300' },
  waiting:     { title: '等待中',           desc: '盯着屏幕等执行结果',              color: 'border-amber-600',  badge: 'bg-amber-900 text-amber-300' },
}

export default function WorkspacePage() {
  const [status, setStatus] = useState<StatusData>({
    state: 'idle', message: '等待命令...', updatedAt: new Date().toISOString()
  })
  const [blink, setBlink] = useState(true)
  const iRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const r = await fetch('/status', { cache: 'no-store' })
        if (r.ok) setStatus(await r.json())
      } catch {}
    }
    fetch_()
    iRef.current = setInterval(fetch_, 5000)
    return () => { if (iRef.current) clearInterval(iRef.current) }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(t)
  }, [])

  const info = STATE_INFO[status.state]

  const timeAgo = () => {
    const d = Math.floor((Date.now() - new Date(status.updatedAt).getTime()) / 1000)
    if (d < 60) return `${d}s ago`
    if (d < 3600) return `${Math.floor(d/60)}m ago`
    return `${Math.floor(d/3600)}h ago`
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Eden<span className="text-emerald-400">Lab</span>
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <Link href="/tokens" className="hover:text-white transition">信号</Link>
          <Link href="/workspace" className="text-white">工作状态</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">🕹️ Dean 的工作状态</h1>
          <p className="text-gray-500 text-sm">实时追踪你的 AI 助手在干什么</p>
        </div>

        {/* 主卡片 */}
        <div className={`rounded-2xl border-2 ${info.color} bg-gray-900 overflow-hidden mb-4`}>
          {/* 像素游戏区域 */}
          <div className="bg-black flex justify-center p-2">
            <PixelGame state={status.state} message={status.message} />
          </div>

          {/* 状态信息栏 */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono px-2 py-1 rounded ${info.badge} flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${blink ? 'opacity-100' : 'opacity-20'} bg-current`} />
                {status.state.toUpperCase()}
              </span>
              <div>
                <div className="font-semibold text-sm">{info.title}</div>
                <div className="text-gray-400 text-xs">{info.desc}</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 text-right">
              <div>{timeAgo()}</div>
              <div>5s 刷新</div>
            </div>
          </div>

          {/* 消息栏 */}
          {status.message && (
            <div className="px-4 py-2 bg-black/40 border-t border-gray-800">
              <span className="text-emerald-400 font-mono text-xs">{'> '}</span>
              <span className="text-gray-300 text-xs font-mono">{status.message}</span>
            </div>
          )}
        </div>

        {/* 状态切换说明 */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(STATE_INFO) as [State, typeof STATE_INFO[State]][]).map(([key, val]) => (
            <div
              key={key}
              className={`rounded-xl border p-3 text-xs transition-all ${
                status.state === key
                  ? `${val.color} bg-gray-800`
                  : 'border-gray-800 bg-gray-900/40 opacity-50'
              }`}
            >
              <div className="font-semibold text-white mb-0.5">{val.title}</div>
              <div className="text-gray-400">{val.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
