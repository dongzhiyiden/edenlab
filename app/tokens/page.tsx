'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Token {
  mint: string
  symbol: string
  buySol: number
  sellSol: number
  pnlSol: number
  pnlPct: number
  buyCount: number
  sellCount: number
  status: 'holding' | 'sold' | 'partial'
  firstTrade: string
  lastTrade: string
}

interface Summary {
  totalTokens: number
  totalBuySol: number
  totalSellSol: number
  netPnlSol: number
  totalTrades: number
}

interface StatsData {
  tokens: Token[]
  summary: Summary
  updatedAt: string
}

const GIST_URL = 'https://gist.githubusercontent.com/dongzhiyiden/aff20d889e83475d47272e1467a278b4/raw/token-stats.json'

const STATUS_STYLE = {
  holding: 'bg-blue-900/50 text-blue-300 border-blue-700',
  sold: 'bg-gray-800 text-gray-400 border-gray-700',
  partial: 'bg-amber-900/50 text-amber-300 border-amber-700',
}

const STATUS_LABEL = {
  holding: '持仓中',
  sold: '已清仓',
  partial: '部分卖出',
}

export default function TokensPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'holding' | 'sold'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(GIST_URL + '?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) setData(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchData()
    const t = setInterval(fetchData, 60000)
    return () => clearInterval(t)
  }, [])

  const tokens = data?.tokens.filter(t =>
    filter === 'all' ? true :
    filter === 'holding' ? t.status === 'holding' :
    t.status !== 'holding'
  ) ?? []

  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return diff + '秒前'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    return Math.floor(diff / 86400) + '天前'
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Eden<span className="text-emerald-400">Lab</span>
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <Link href="/tokens" className="text-white">代币分析</Link>
          <Link href="/workspace" className="hover:text-white transition">工作状态</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">📊 跟单代币分析</h1>
          <p className="text-gray-400 text-sm">实时跟踪每个 Pump.fun 代币的买卖记录和盈亏</p>
        </div>

        {/* 汇总卡片 */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">跟单代币数</div>
              <div className="text-2xl font-bold">{data.summary.totalTokens}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">总买入</div>
              <div className="text-2xl font-bold text-red-400">-{data.summary.totalBuySol} SOL</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">总卖出(已结算)</div>
              <div className="text-2xl font-bold text-emerald-400">+{data.summary.totalSellSol} SOL</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">交易次数</div>
              <div className="text-2xl font-bold">{data.summary.totalTrades}</div>
            </div>
          </div>
        )}

        {/* 过滤器 */}
        <div className="flex gap-2 mb-4">
          {(['all', 'holding', 'sold'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                filter === f
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {f === 'all' ? '全部' : f === 'holding' ? '持仓中' : '已卖出'}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-600 self-center">
            {data ? '更新于 ' + timeAgo(data.updatedAt) : '加载中...'}
          </span>
        </div>

        {/* 代币列表 */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">加载中...</div>
        ) : (
          <div className="space-y-2">
            {tokens.map(token => (
              <div
                key={token.mint}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-white">
                          {token.mint.slice(0, 8)}...{token.mint.slice(-4)}
                        </span>
                        <span className={`text-xs border rounded-full px-2 py-0.5 ${STATUS_STYLE[token.status]}`}>
                          {STATUS_LABEL[token.status]}
                        </span>
                      </div>
                      <a
                        href={`https://solscan.io/token/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-emerald-400 transition font-mono"
                      >
                        {token.mint}
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${token.pnlSol >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {token.pnlSol >= 0 ? '+' : ''}{token.pnlSol} SOL
                    </div>
                    {token.sellCount > 0 && (
                      <div className={`text-xs ${token.pnlPct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {token.pnlPct >= 0 ? '+' : ''}{token.pnlPct}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-gray-500">
                  <div>
                    <span className="text-red-400">买入</span>
                    <span className="ml-1 text-white">{token.buySol} SOL × {token.buyCount}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">卖出</span>
                    <span className="ml-1 text-white">{token.sellSol} SOL × {token.sellCount}</span>
                  </div>
                  <div className="text-right">
                    <span>{timeAgo(token.lastTrade)}</span>
                  </div>
                </div>
              </div>
            ))}
            {tokens.length === 0 && (
              <div className="text-center text-gray-600 py-10">暂无数据</div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
