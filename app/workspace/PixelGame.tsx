'use client'

import { useEffect, useRef, useCallback } from 'react'

export type GameState = 'idle' | 'working' | 'delegating' | 'waiting'

interface Props {
  state: GameState
  message?: string
}

// 调色板
const C = {
  // 背景/墙
  WALL:    '#2d1b69',
  FLOOR:   '#3d2b0f',
  FLOOR2:  '#4a3510',
  RUG:     '#6b2d2d',
  // 家具
  DESK:    '#5c3d1a',
  DESK_L:  '#7a5228',
  MONITOR: '#1a1a2e',
  SCREEN:  '#00ff88',
  SCREEN2: '#00cc66',
  CHAIR:   '#1a3a5c',
  CHAIR_L: '#2a5a8c',
  SOFA:    '#4a1a4a',
  SOFA_L:  '#6a2a6a',
  PLANT:   '#1a5c1a',
  PLANT_L: '#2a8c2a',
  WATER:   '#1a4a6a',
  WATER_L: '#2a6a9a',
  // 角色 Dean（棕发，格子衬衫，深色牛仔裤）
  HAIR:    '#4a2800',
  SKIN:    '#f5c58a',
  SKIN_D:  '#d4a574',
  SHIRT_B: '#4a3a6a',  // 蓝紫格子
  SHIRT_R: '#6a2a2a',  // 红格子
  PANTS:   '#2a3a5a',
  PANTS_D: '#1a2a4a',
  SHOES:   '#2a1a0a',
  // 效果
  SMOKE:   '#aaaaaa',
  CURSOR:  '#ffffff',
  NONE:    'transparent',
}

// 16x16 角色精灵（4方向，每方向4帧行走）
// 格式: 每格是颜色key，'.'=透明
// 面向下(南) - 静止/行走
const DEAN_S: string[][] = [
  // 帧0: 静止
  [
    '....HHHH....',
    '...HHHHHHH..',
    '...HSKKSSH..',
    '...SSSSSSS..',
    '...SSSSSSS..',
    '..BBrBrBBB..',
    '..BBrBrBBB..',
    '..BBBrBBBB..',
    '..PPPpPPPP..',
    '..PPPpPPPP..',
    '...ZZ.ZZZ...',
    '...ZZ.ZZZ...',
  ],
  // 帧1: 左脚前
  [
    '....HHHH....',
    '...HHHHHHH..',
    '...HSKKSSH..',
    '...SSSSSSS..',
    '...SSSSSSS..',
    '..BBrBrBBB..',
    '..BBrBrBBB..',
    '..BBBrBBBB..',
    '..PPPpPPPP..',
    '..PPPpPPPP..',
    '..ZZZ..ZZ...',
    '..ZZZ..ZZ...',
  ],
  // 帧2: 静止
  [
    '....HHHH....',
    '...HHHHHHH..',
    '...HSKKSSH..',
    '...SSSSSSS..',
    '...SSSSSSS..',
    '..BBrBrBBB..',
    '..BBrBrBBB..',
    '..BBBrBBBB..',
    '..PPPpPPPP..',
    '..PPPpPPPP..',
    '...ZZ.ZZZ...',
    '...ZZ.ZZZ...',
  ],
  // 帧3: 右脚前
  [
    '....HHHH....',
    '...HHHHHHH..',
    '...HSKKSSH..',
    '...SSSSSSS..',
    '...SSSSSSS..',
    '..BBrBrBBB..',
    '..BBrBrBBB..',
    '..BBBrBBBB..',
    '..PPPpPPPP..',
    '..PPPpPPPP..',
    '...ZZ.ZZZ...',
    '....ZZ.ZZZ..',
  ],
]

const PALETTE: Record<string, string> = {
  'H': C.HAIR, 'S': C.SKIN, 'K': C.SKIN_D, 's': C.SKIN_D,
  'B': C.SHIRT_B, 'r': C.SHIRT_R,
  'P': C.PANTS, 'p': C.PANTS_D,
  'Z': C.SHOES, '.': C.NONE,
  'D': C.DESK, 'd': C.DESK_L,
  'M': C.MONITOR, 'G': C.SCREEN, 'g': C.SCREEN2,
  'C': C.CHAIR, 'c': C.CHAIR_L,
  'F': C.FLOOR, 'f': C.FLOOR2,
  'W': C.WALL, 'R': C.RUG,
  'O': C.SOFA, 'o': C.SOFA_L,
  'T': C.PLANT, 't': C.PLANT_L,
  'A': C.WATER, 'a': C.WATER_L,
  'w': C.SMOKE, 'e': C.CURSOR,
}

const SCALE = 3  // 每像素放大3倍

function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: string[],
  x: number, y: number,
  scale: number = SCALE
) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const c = sprite[row][col]
      const color = PALETTE[c]
      if (!color || color === 'transparent') continue
      ctx.fillStyle = color
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
    }
  }
}

// 房间场景定义（32x20 tile map，每tile 3px）
function drawIdleRoom(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  // 背景
  ctx.fillStyle = C.WALL
  ctx.fillRect(0, 0, w, h * 0.4)
  ctx.fillStyle = C.FLOOR
  ctx.fillRect(0, h * 0.4, w, h * 0.6)

  // 地毯
  ctx.fillStyle = C.RUG
  ctx.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.35)

  // 沙发
  const sofaX = 20, sofaY = Math.floor(h * 0.45)
  ctx.fillStyle = C.SOFA
  ctx.fillRect(sofaX, sofaY, 80, 30)
  ctx.fillStyle = C.SOFA_L
  ctx.fillRect(sofaX + 4, sofaY + 4, 72, 16)
  // 沙发腿
  ctx.fillStyle = '#3a1a3a'
  ctx.fillRect(sofaX + 4, sofaY + 26, 8, 8)
  ctx.fillRect(sofaX + 68, sofaY + 26, 8, 8)

  // 饮水机
  const waterX = w - 60, waterY = Math.floor(h * 0.25)
  ctx.fillStyle = C.WATER
  ctx.fillRect(waterX, waterY, 28, 50)
  ctx.fillStyle = C.WATER_L
  ctx.fillRect(waterX + 4, waterY + 4, 20, 24)
  // 水桶（蓝色透明）
  ctx.fillStyle = '#4488cc'
  ctx.fillRect(waterX + 6, waterY + 2, 16, 20)
  ctx.fillStyle = '#aaddff'
  ctx.fillRect(waterX + 8, waterY + 4, 12, 14)

  // 植物盆栽
  ctx.fillStyle = C.PLANT
  ctx.fillRect(30, Math.floor(h * 0.3), 16, 24)
  ctx.fillStyle = C.PLANT_L
  ctx.fillRect(34, Math.floor(h * 0.22), 8, 12)
  ctx.fillRect(28, Math.floor(h * 0.26), 8, 10)
  ctx.fillRect(40, Math.floor(h * 0.26), 8, 10)

  // 烟雾动画（idle状态）
  const smokeAlpha = Math.sin(tick * 0.05) * 0.3 + 0.4
  ctx.fillStyle = `rgba(180,180,180,${smokeAlpha})`
  const smokeOffset = Math.sin(tick * 0.03) * 3
  ctx.fillRect(waterX - 8 + smokeOffset, waterY - 12, 4, 4)
  ctx.fillRect(waterX - 6 + smokeOffset * 1.2, waterY - 20, 3, 4)
  ctx.fillRect(waterX - 4 + smokeOffset * 1.5, waterY - 28, 3, 3)
}

function drawWorkRoom(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  // 背景
  ctx.fillStyle = '#1a1a3a'
  ctx.fillRect(0, 0, w, h * 0.45)
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(0, h * 0.45, w, h * 0.55)

  // 桌子
  const deskY = Math.floor(h * 0.4)
  ctx.fillStyle = C.DESK
  ctx.fillRect(w * 0.15, deskY, w * 0.7, 18)
  ctx.fillStyle = C.DESK_L
  ctx.fillRect(w * 0.15, deskY, w * 0.7, 6)

  // 显示器
  const monX = Math.floor(w * 0.35), monY = Math.floor(h * 0.2)
  ctx.fillStyle = '#111122'
  ctx.fillRect(monX, monY, 80, 54)
  // 屏幕内容（代码闪烁）
  const codeColors = ['#00ff88', '#00cc66', '#33ff99', '#00ff44']
  for (let i = 0; i < 6; i++) {
    const lineY = monY + 6 + i * 8
    const lineW = 20 + ((tick + i * 7) % 40)
    ctx.fillStyle = codeColors[(tick + i) % codeColors.length]
    ctx.globalAlpha = i === (Math.floor(tick / 8) % 6) ? 1 : 0.4
    ctx.fillRect(monX + 6, lineY, lineW, 3)
  }
  ctx.globalAlpha = 1
  // 光标闪烁
  if (Math.floor(tick / 15) % 2 === 0) {
    ctx.fillStyle = '#ffffff'
    const curRow = Math.floor(tick / 8) % 6
    ctx.fillRect(monX + 30, monY + 6 + curRow * 8, 3, 5)
  }
  // 显示器支架
  ctx.fillStyle = '#333'
  ctx.fillRect(monX + 36, monY + 54, 8, 8)
  ctx.fillRect(monX + 28, monY + 60, 24, 4)

  // 椅子
  const chairX = Math.floor(w * 0.42), chairY = deskY + 20
  ctx.fillStyle = C.CHAIR
  ctx.fillRect(chairX, chairY, 36, 8)
  ctx.fillStyle = C.CHAIR_L
  ctx.fillRect(chairX + 4, chairY, 28, 6)

  // 键盘
  ctx.fillStyle = '#2a2a3a'
  ctx.fillRect(Math.floor(w * 0.38), deskY + 10, 44, 8)
  // 键盘按键闪烁
  if (Math.floor(tick / 4) % 3 === 0) {
    ctx.fillStyle = '#4a4aaa'
    ctx.fillRect(Math.floor(w * 0.4) + (tick % 30), deskY + 12, 4, 4)
  }
}

function drawDelegateRoom(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  // 同样的办公室但两个工位
  ctx.fillStyle = '#1a1a3a'
  ctx.fillRect(0, 0, w, h * 0.45)
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(0, h * 0.45, w, h * 0.55)

  const deskY = Math.floor(h * 0.4)

  // 左工位（Claude Code 的）
  ctx.fillStyle = '#4a2a0a'
  ctx.fillRect(10, deskY, w * 0.38, 18)
  // Claude Code 显示器
  const monX1 = 20, monY1 = Math.floor(h * 0.2)
  ctx.fillStyle = '#111133'
  ctx.fillRect(monX1, monY1, 70, 50)
  // 屏幕内容（高速代码生成）
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = '#aa88ff'
    ctx.globalAlpha = 0.3 + Math.random() * 0.5
    ctx.fillRect(monX1 + 4, monY1 + 4 + i * 6, 10 + (tick * 3 + i * 13) % 50, 2)
  }
  ctx.globalAlpha = 1
  // CC 标签
  ctx.fillStyle = '#aa88ff'
  ctx.font = 'bold 8px monospace'
  ctx.fillText('CC', monX1 + 28, monY1 - 4)

  // 右工位（空的/Dean 的）
  ctx.fillStyle = '#3d2b0f'
  ctx.fillRect(w * 0.52, deskY, w * 0.38, 18)
  const monX2 = Math.floor(w * 0.58), monY2 = Math.floor(h * 0.22)
  ctx.fillStyle = '#111122'
  ctx.fillRect(monX2, monY2, 60, 44)
  // 屏幕暗（Dean 在监督，没在用电脑）
  ctx.fillStyle = '#001100'
  ctx.fillRect(monX2 + 4, monY2 + 4, 52, 36)

  // 分隔线
  ctx.fillStyle = '#333'
  ctx.fillRect(Math.floor(w * 0.5) - 1, deskY - 20, 2, h - deskY + 20)
}

export default function PixelGame({ state, message }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tickRef = useRef(0)
  const posRef = useRef({ x: 80, y: 120, dir: 1, frame: 0 })
  const animRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const W = canvas.width
    const H = canvas.height
    const tick = tickRef.current
    const pos = posRef.current

    ctx.clearRect(0, 0, W, H)

    // 画房间
    if (state === 'idle') {
      drawIdleRoom(ctx, W, H, tick)
    } else if (state === 'working') {
      drawWorkRoom(ctx, W, H, tick)
    } else if (state === 'delegating') {
      drawDelegateRoom(ctx, W, H, tick)
    } else {
      drawWorkRoom(ctx, W, H, tick)
    }

    // 角色移动逻辑
    if (state === 'idle') {
      // 在饮水机和沙发之间来回走
      pos.x += pos.dir * 1.2
      if (pos.x > W - 80) pos.dir = -1
      if (pos.x < 40) pos.dir = 1
    } else if (state === 'working') {
      // 坐在桌子前，轻微晃动
      pos.x = W * 0.44
      pos.y = H * 0.52
    } else if (state === 'delegating') {
      // 在左工位旁边来回踱步（小范围）
      pos.x = W * 0.32 + Math.sin(tick * 0.02) * 20
      pos.y = H * 0.55
    } else if (state === 'waiting') {
      pos.x = W * 0.44
      pos.y = H * 0.52
    }

    // 行走帧
    if (state === 'idle' || state === 'delegating') {
      pos.frame = Math.floor(tick / 8) % 4
    } else {
      pos.frame = 0
    }

    // 画角色
    const sprite = DEAN_S[pos.frame]
    const spriteW = sprite[0].length * SCALE
    const spriteH = sprite.length * SCALE
    drawSprite(ctx, sprite, Math.floor(pos.x - spriteW / 2), Math.floor(pos.y - spriteH), SCALE)

    // waiting状态：头上显示 zzz
    if (state === 'waiting' && Math.floor(tick / 20) % 2 === 0) {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('z', pos.x - 4, pos.y - spriteH - 8 + Math.sin(tick * 0.05) * 3)
      ctx.fillText('z', pos.x + 2, pos.y - spriteH - 16 + Math.sin(tick * 0.05) * 3)
    }

    // idle状态：头上显示烟
    if (state === 'idle') {
      ctx.fillStyle = `rgba(200,200,200,${0.3 + Math.sin(tick * 0.05) * 0.2})`
      ctx.fillRect(pos.x + 6, pos.y - spriteH - 6, 3, 3)
      ctx.fillRect(pos.x + 7 + Math.sin(tick * 0.03) * 2, pos.y - spriteH - 12, 3, 3)
    }

    // 扫描线效果（复古CRT感）
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1)
    }

    tickRef.current++
    animRef.current = requestAnimationFrame(draw)
  }, [state])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={200}
      className="w-full rounded-lg"
      style={{ imageRendering: 'pixelated', maxWidth: '640px' }}
    />
  )
}
