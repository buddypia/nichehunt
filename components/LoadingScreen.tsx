'use client'

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Sparkles, Zap, Rocket, Heart, ThumbsUp, Flame, Diamond, Target, Lightbulb, TrendingUp } from "lucide-react"

interface LoadingScreenProps {
  loadingProgress: number
  loadingMessage: string
}

export function LoadingScreen({ loadingProgress, loadingMessage }: LoadingScreenProps) {
  // 動的な背景カラー
  const backgroundColors = [
    "from-purple-400/20 to-pink-400/20",
    "from-blue-400/20 to-cyan-400/20",
    "from-green-400/20 to-emerald-400/20",
    "from-orange-400/20 to-red-400/20",
  ]

  // ウィンドウサイズのデフォルト値（SSR対応）
  const defaultWidth = 1200
  const defaultHeight = 800

  // アイコンの配列と事前計算された位置
  const floatingIcons = [Rocket, Star, Diamond, Target, Lightbulb, TrendingUp, Flame].map((Icon, i) => ({
    Icon,
    initialX: (i * 150) % defaultWidth,
    targetX: ((i * 150) + 300) % defaultWidth,
    duration: 15 + (i * 2),
    delay: i * 0.7,
  }))

  // パーティクルの事前計算された位置
  const particles = [...Array(50)].map((_, i) => ({
    initialX: (i * 24) % defaultWidth,
    initialY: (i * 16) % defaultHeight,
    targetX: ((i * 24) + 200) % defaultWidth,
    targetY: ((i * 16) + 150) % defaultHeight,
    duration: 10 + (i % 10) * 2,
  }))

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* アニメーション背景レイヤー */}
      <div className="fixed inset-0 -z-10">
        {/* 波紋エフェクト */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: [0, 3],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* フローティングアイコン */}
        <div className="absolute inset-0">
          {floatingIcons.map((item, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: item.initialX,
                y: defaultHeight + 100,
              }}
              animate={{
                y: -100,
                x: item.targetX,
                rotate: 360,
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: "linear",
                delay: item.delay,
              }}
            >
              <item.Icon className={`w-8 h-8 text-primary/20`} />
            </motion.div>
          ))}
        </div>

        {/* 動的グラデーションメッシュ */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop
                offset="0%"
                animate={{
                  stopColor: ["#8b5cf6", "#ec4899", "#f59e0b", "#8b5cf6"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                stopOpacity="0.1"
              />
              <motion.stop
                offset="100%"
                animate={{
                  stopColor: ["#ec4899", "#f59e0b", "#8b5cf6", "#ec4899"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                stopOpacity="0.1"
              />
            </linearGradient>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#mesh-gradient)"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* パーティクルフィールド */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              initial={{
                x: particle.initialX,
                y: particle.initialY,
              }}
              animate={{
                x: particle.targetX,
                y: particle.targetY,
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* ヘッダー */}
      <motion.div 
        className="border-b backdrop-blur-md bg-white/60 dark:bg-gray-900/60"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-8 h-8 text-primary" />
                <motion.div
                  className="absolute inset-0 w-8 h-8"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0.4)",
                      "0 0 0 20px rgba(139, 92, 246, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  style={{ borderRadius: "50%" }}
                />
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="overflow-hidden"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  NicheHunt
                </h1>
              </motion.div>
            </div>
            <div className="flex items-center gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 shimmer-advanced" />
              ))}
              <Skeleton className="h-8 w-8 rounded-full shimmer-advanced" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* メインローディングエリア */}
      <div className="container mx-auto px-4 py-16">
        {/* 中央の3Dローディングアニメーション */}
        <motion.div
          className="relative w-64 h-64 mx-auto mb-16"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* 外側のリング */}
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* 中間のリング */}
          <motion.div
            className="absolute inset-4 border-4 border-transparent border-t-primary/40 border-r-primary/40 rounded-full"
            animate={{ rotate: -720 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          
          {/* 内側のリング */}
          <motion.div
            className="absolute inset-8 border-4 border-transparent border-b-primary/60 border-l-primary/60 rounded-full"
            animate={{ rotate: 1080 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* 中央のロゴ */}
          <motion.div
            className="absolute inset-12 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            }}
          >
            <div className="relative">
              <Rocket className="w-24 h-24 text-primary" />
            </div>
          </motion.div>

          {/* オービットアイテム */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) * Math.PI / 180
            const radius = 100
            return (
              <motion.div
                key={i}
                className="absolute w-4 h-4"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [
                    Math.cos(angle) * radius,
                    Math.cos(angle + Math.PI) * radius,
                    Math.cos(angle) * radius,
                  ],
                  y: [
                    Math.sin(angle) * radius,
                    Math.sin(angle + Math.PI) * radius,
                    Math.sin(angle) * radius,
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className={`w-full h-full rounded-full bg-gradient-to-r ${backgroundColors[i % backgroundColors.length]}`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* ローディングメッセージ */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.h2
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200%",
            }}
          >
            {loadingMessage}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            素晴らしいアイデアをお届けする準備をしています
          </motion.p>
        </motion.div>

        {/* プログレスバー */}
        <motion.div
          className="max-w-md mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="relative">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full relative"
                style={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-10 text-sm font-bold text-primary"
              style={{ left: `${loadingProgress}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(loadingProgress)}%
            </motion.div>
          </div>
        </motion.div>

        {/* コンテンツプレビュー */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          {[
            { icon: Trophy, title: "トップランキング", color: "text-purple-500" },
            { icon: Star, title: "注目のアイデア", color: "text-pink-500" },
            { icon: Flame, title: "トレンディング", color: "text-orange-500" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.6 + i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Card className="overflow-hidden border-2 border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </motion.div>
                    <Skeleton className="h-6 w-32 shimmer-advanced" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full shimmer-advanced" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full shimmer-advanced" />
                          <Skeleton className="h-3 w-3/4 shimmer-advanced" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* カスタムCSS */}
      <style jsx global>{`
        .shimmer-advanced {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0)
          );
          background-size: 200% 100%;
          animation: shimmer-advanced 2s infinite;
        }
        
        .dark .shimmer-advanced {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 20%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0)
          );
        }
        
        @keyframes shimmer-advanced {
          0% {
            transform: translateX(-200%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </motion.div>
  )
}
