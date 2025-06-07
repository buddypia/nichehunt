"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MessageCircle, ChevronUp, Users, Tag, Zap, Star, Sparkles, TrendingUp, Heart, Bookmark, Trophy, Medal, Award } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, formatDate } from "@/lib/utils"
import { createClient } from '@/lib/supabase/client';
import type { ProductWithRelations } from "@/lib/types/database"
import { SaveToCollectionPopover } from "@/components/SaveToCollectionPopover"
import { useTypedTranslations } from "@/lib/i18n/useTranslations"

interface ProductCardProps {
  product: ProductWithRelations
  onVote?: (productId: number) => void
  className?: string
  rank?: number
}

export function ProductCard({ product, onVote, className, rank }: ProductCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(product.has_voted || false)
  const [voteCount, setVoteCount] = useState(product.vote_count || 0)
  const [isSaved, setIsSaved] = useState(product.is_saved || false)
  const router = useRouter()
  const { language } = useTypedTranslations()

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isVoting) return

    setIsVoting(true)
    
    try {
      const supabase = createClient()
      
      // 認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data, error } = await supabase
        .rpc('toggle_vote', { p_product_id: product.id })
      
      if (error) throw error

      const voted = data as boolean
      setHasVoted(voted)
      setVoteCount(prevCount => voted ? prevCount + 1 : prevCount - 1)
      
      if (onVote) {
        onVote(product.id)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setIsVoting(false)
    }
  }


  const isNew = new Date(product.launch_date).getTime() > Date.now() - 24 * 60 * 60 * 1000
  const isHot = (product.vote_count || 0) > 10 || (product.comment_count || 0) > 5

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:shadow-2xl hover:-translate-y-1",
        "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
        className
      )}
      onClick={(e) => {
        // ボタンやインタラクティブな要素のクリックの場合は何もしない
        const target = e.target as HTMLElement
        const isInteractiveElement = 
          target.closest('button') || 
          target.closest('.bookmark-button') ||
          target.closest('.vote-button')
        
        if (!isInteractiveElement) {
          router.push(`/products/${product.id}`)
        }
      }}
    >
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* ランキングバッジ - 右上に配置 */}
      {rank && rank <= 3 && (
        <div className="absolute top-2 right-2 z-10">
          {rank === 1 && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm">
              <Trophy className="w-4 h-4 text-yellow-600" />
            </div>
          )}
          {rank === 2 && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Medal className="w-4 h-4 text-gray-600" />
            </div>
          )}
          {rank === 3 && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
              <Award className="w-4 h-4 text-orange-600" />
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-4">
          <div className="flex items-start space-x-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              {product.thumbnail_url ? (
                <img 
                  src={product.thumbnail_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary/60">
                    {product.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-20">
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.tagline}
              </p>
            </div>
          </div>
      </CardHeader>

      <CardContent className="pb-4">
          {/* ステータスバッジ - タグの上に表示 */}
          {(product.is_featured || isHot || isNew || (product.comment_count || 0) > 5) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {isHot && (
                <Badge className="text-xs bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
              {isNew && (
                <Badge className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Newest
                </Badge>
              )}
              {(product.comment_count || 0) > 5 && (
                <Badge className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Comments
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          )}

          {/* カテゴリとタグバッジ */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.category && (
              <Badge variant="secondary" className="text-xs bg-primary/10 hover:bg-primary/20 transition-colors">
                {product.category.name}
              </Badge>
            )}
            {product.tags && product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs border-primary/20 hover:border-primary/40 transition-colors">
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
            {product.tags && product.tags.length > 2 && (
              <Badge variant="outline" className="text-xs opacity-60">
                +{product.tags.length - 2}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Calendar className="w-4 h-4 mr-1 text-primary/60" />
              <span className="text-xs font-medium">
                {formatDate(product.launch_date, language, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <MessageCircle className="w-4 h-4 mr-1 text-primary/60" />
              <span className="text-xs font-medium">{product.comment_count || 0}</span>
            </div>
            <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Users className="w-4 h-4 mr-1 text-primary/60" />
              <span className="text-xs font-medium">{voteCount}</span>
            </div>
          </div>
      </CardContent>

      <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {product.profile && (
              <>
                <Avatar className="w-7 h-7 border-2 border-primary/20">
                  <AvatarImage src={product.profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                    {product.profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">
                    @{product.profile.username}
                  </span>
                  {product.profile.bio && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {product.profile.bio}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="relative bookmark-button"
              onClick={(e) => e.stopPropagation()}
            >
              <SaveToCollectionPopover
                productId={product.id}
                onSaveStateChange={setIsSaved}
                isSaved={isSaved}
              />
            </div>
            <div className="vote-button">
              <Button
                variant={hasVoted ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleVote(e)
                }}
                disabled={isVoting}
                className={cn(
                  "transition-all duration-200 relative z-20",
                  hasVoted && "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                )}
              >
              {hasVoted ? (
                <Heart className={cn("w-4 h-4 mr-1 fill-current", isVoting && "animate-pulse")} />
              ) : (
                <ChevronUp className={cn("w-4 h-4 mr-1", isVoting && "animate-pulse")} />
              )}
              <span className="font-semibold">{voteCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
