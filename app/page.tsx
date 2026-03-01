import Link from "next/link";

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
    icon: "🔍",
    title: "Smart Money Tracker",
    desc: "实时追踪 Solana 聪明钱钱包动向",
    href: "/smart-money",
    ready: false,
    badge: null,
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
    href: "/news",
    ready: false,
    badge: null,
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

      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className={`relative rounded-2xl border p-6 transition group ${
                tool.ready
                  ? "border-emerald-800 bg-gray-900 hover:border-emerald-500 cursor-pointer"
                  : "border-gray-800 bg-gray-900/50 opacity-60"
              }`}
            >
              {tool.ready ? <Link href={tool.href} className="absolute inset-0" /> : null}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{tool.icon}</span>
                {tool.badge && (
                  <span className="text-xs bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-full px-2 py-0.5 font-mono">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
              <p className="text-gray-400 text-sm">{tool.desc}</p>
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
        © 2026 EdenLab · Built by 东之伊甸
      </footer>
    </main>
  );
}
