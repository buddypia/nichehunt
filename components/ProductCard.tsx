"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MessageCircle, ChevronUp, Users, Tag, Zap, Star, Sparkles, TrendingUp, Heart } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-client"
import type { ProductWithRelations } from "@/lib/types/database"

interface ProductCardProps {
  product: ProductWithRelations
  onVote?: (productId: number) => void
  className?: string
}

export function ProductCard({ product, onVote, className }: ProductCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(product.has_voted || false)
  const [voteCount, setVoteCount] = useState(product.vote_count || 0)
  const supabase = createClient()

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isVoting) return

    setIsVoting(true)
    
    try {
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
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "hover:shadow-2xl hover:-translate-y-1",
      "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
      className
    )}>
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* ステータスバッジ */}
      {(isNew || isHot || product.is_featured) && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
          {isHot && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md">
              <TrendingUp className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
        </div>
      )}

      <Link href={`/products/${product.id}`}>
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
              {product.status === 'published' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
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
                {new Date(product.launch_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
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
      </Link>

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
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVote}
            disabled={isVoting}
            className={cn(
              "ml-auto transition-all duration-200",
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
      </CardFooter>
    </Card>
  )
}
