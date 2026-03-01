import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">
          Eden<span className="text-emerald-400">Lab</span>
        </span>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <Link href="/about" className="hover:text-white transition text-white">关于</Link>
        </div>
      </nav>

      <section className="px-6 py-20 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">关于 EdenLab</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            EdenLab 是东之伊甸的个人工具站，聚焦 <span className="text-emerald-400">Web3</span> 与 <span className="text-emerald-400">AI</span> 的交叉地带。
          </p>
          <p>
            主要方向：Solana 链上聪明钱追踪、Meme 代币数据分析、AI 辅助决策工具。
          </p>
          <p className="text-gray-500 text-sm">
            持续更新中，所有工具均为自用后开放分享。
          </p>
        </div>
      </section>
    </main>
  );
}
