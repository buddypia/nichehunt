'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowUp, 
  MessageCircle, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  Star,
  Users,
  DollarSign
} from 'lucide-react';
import { BusinessModel } from '@/types/BusinessModel';
import { cn } from '@/lib/utils';

interface BusinessModelCardProps {
  model: BusinessModel;
  rank?: number;
  compact?: boolean;
}

export function BusinessModelCard({ model, rank, compact = false }: BusinessModelCardProps) {
  const router = useRouter();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(model.upvotes);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  const handleCardClick = () => {
    router.push(`/models/${model.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRankBadge = () => {
    if (!rank || rank > 3) return null;
    
    const badges = {
      1: { emoji: '🥇', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: '1位' },
      2: { emoji: '🥈', color: 'bg-gradient-to-r from-gray-300 to-gray-500', text: '2位' },
      3: { emoji: '🥉', color: 'bg-gradient-to-r from-amber-600 to-amber-800', text: '3位' }
    };

    const badge = badges[rank as keyof typeof badges];
    
    return (
      <div className={cn(
        "absolute -top-2 -left-2 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg z-10",
        badge.color
      )}>
        <span className="mr-1">{badge.emoji}</span>
        {badge.text}
      </div>
    );
  };

  if (compact) {
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 relative cursor-pointer"
        onClick={handleCardClick}
      >
        {getRankBadge()}
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {model.category}
                </Badge>
                {model.featured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    注目
                  </Badge>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {model.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {model.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(model.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{model.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUpvote}
                    className={cn(
                      "flex items-center space-x-1 transition-all",
                      isUpvoted 
                        ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    <ArrowUp className={cn("w-4 h-4", isUpvoted && "fill-current")} />
                    <span className="font-medium">{upvoteCount}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      {getRankBadge()}
      
      {/* グラデーションボーダー */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
           style={{ padding: '2px' }}>
        <div className="bg-white h-full w-full rounded-lg" />
      </div>

      <div className="relative bg-white rounded-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0"
                >
                  {model.category}
                </Badge>
                {model.featured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    注目
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  #{rank}
                </Badge>
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {model.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {model.description}
              </p>

              {/* タグ */}
              <div className="flex flex-wrap gap-2 mb-4">
                {model.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>ユーザー数: {model.userCount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>収益: {model.revenue || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* アップボートボタン */}
            <div className="ml-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleUpvote}
                className={cn(
                  "flex flex-col items-center space-y-1 h-auto py-3 px-4 rounded-xl transition-all",
                  isUpvoted 
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-lg scale-105" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
                )}
              >
                <ArrowUp className={cn("w-6 h-6", isUpvoted && "fill-current")} />
                <span className="font-bold text-lg">{upvoteCount}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 投稿者情報 */}
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={model.author.avatar} alt={model.author.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                    {model.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">{model.author.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(model.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* コメント数 */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{model.comments}</span>
              </Button>

              {/* 外部リンク */}
              {model.website && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(model.website, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">サイト</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
