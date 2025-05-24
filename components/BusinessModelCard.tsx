import { BusinessModel } from '@/types/BusinessModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, MessageCircle, Calendar, DollarSign, Clock, Target, BarChart3, Trophy, Medal, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';

interface BusinessModelCardProps {
  model: BusinessModel;
  rank?: number;
}

export function BusinessModelCard({ model, rank }: BusinessModelCardProps) {
  const isTopThree = rank && rank <= 3;
  
  const getRankStyles = () => {
    if (!rank) return {};
    
    switch (rank) {
      case 1:
        return {
          card: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-300 border-2 shadow-xl',
          badge: 'bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500',
          icon: Trophy,
          iconColor: 'text-yellow-600',
          glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]'
        };
      case 2:
        return {
          card: 'bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-gray-300 border-2 shadow-lg',
          badge: 'bg-gradient-to-br from-gray-400 via-slate-400 to-gray-500',
          icon: Medal,
          iconColor: 'text-gray-600',
          glow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]'
        };
      case 3:
        return {
          card: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-300 border-2 shadow-lg',
          badge: 'bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600',
          icon: Award,
          iconColor: 'text-orange-600',
          glow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]'
        };
      default:
        return {
          card: '',
          badge: 'bg-gradient-to-br from-blue-400 to-indigo-500',
          icon: null,
          iconColor: '',
          glow: ''
        };
    }
  };

  const rankStyles = getRankStyles();
  const RankIcon = rankStyles.icon;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 relative overflow-hidden ${isTopThree ? rankStyles.card + ' ' + rankStyles.glow : ''}`}>
      {rank && (
        <div className="absolute -top-1 -right-8 z-10">
          <div className="relative">
            <div className={`${rankStyles.badge} text-white font-bold text-lg w-24 h-24 flex items-center justify-center transform rotate-45 shadow-lg`}>
              <span className="transform -rotate-45 flex items-center gap-1">
                {RankIcon && <RankIcon className="w-5 h-5" />}
                {rank}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {isTopThree && (
        <div className="absolute top-2 left-2">
          <div className={`p-2 rounded-full bg-white/80 backdrop-blur-sm ${rankStyles.glow}`}>
            {RankIcon && <RankIcon className={`w-5 h-5 ${rankStyles.iconColor}`} />}
          </div>
        </div>
      )}
      
      <Link href={`/models/${model.id}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant={model.featured ? "default" : "secondary"} className="text-xs">
              {model.category}
            </Badge>
          </div>
          
          <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            {model.title}
          </CardTitle>
          
          <CardDescription className="line-clamp-3 mt-2">
            {model.description}
          </CardDescription>
        </CardHeader>
      </Link>

      <CardContent className="space-y-4">
        {model.image && (
          <Link href={`/models/${model.id}`}>
            <div className="relative h-48 w-full overflow-hidden rounded-lg cursor-pointer">
              <img 
                src={model.image} 
                alt={model.title}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}

        <div className="flex flex-wrap gap-2">
          {model.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {model.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{model.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="truncate">{model.revenue}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{model.difficulty}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{model.timeToMarket}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span className="truncate">{model.targetMarket}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Link href={`/profiles/${model.author.name}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarImage src={model.author.avatar} alt={model.author.name} />
              <AvatarFallback>{model.author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{model.author.name}</span>
              {model.author.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4" />
              <span>{model.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{model.comments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
