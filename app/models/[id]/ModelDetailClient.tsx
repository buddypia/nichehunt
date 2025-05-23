'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  ArrowUp, 
  MessageCircle, 
  ExternalLink, 
  Calendar,
  Star,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Share2,
  Bookmark,
  Heart,
  Send,
  MoreVertical,
  Reply,
  ThumbsUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubmitModal } from '@/components/SubmitModal';
import { BusinessModel } from '@/types/BusinessModel';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
}

interface ModelDetailClientProps {
  model: BusinessModel | undefined;
}

export default function ModelDetailClient({ model }: ModelDetailClientProps) {
  const router = useRouter();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(model?.upvotes || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // サンプルコメントデータ
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: '田中太郎',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        verified: true
      },
      content: 'このビジネスモデルは非常に興味深いですね。特に初期投資が少なくて済む点が魅力的です。実際に始めてみようと思います！',
      createdAt: '2024-01-15T10:00:00Z',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          author: {
            name: '佐藤花子',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          content: '私も同感です！すでに準備を始めています。',
          createdAt: '2024-01-15T11:30:00Z',
          likes: 3,
          isLiked: false
        }
      ]
    },
    {
      id: '2',
      author: {
        name: '山田次郎',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      content: 'ターゲット市場の分析が的確で参考になりました。競合他社との差別化ポイントをもう少し詳しく知りたいです。',
      createdAt: '2024-01-14T15:00:00Z',
      likes: 8,
      isLiked: true
    }
  ]);

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ビジネスモデルが見つかりません</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        return `${diffMinutes}分前`;
      }
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: {
          name: 'ゲストユーザー',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        content: commentText,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const handleReplySubmit = (parentId: string) => {
    if (replyText.trim()) {
      const newReply: Comment = {
        id: `${parentId}-${Date.now()}`,
        author: {
          name: 'ゲストユーザー',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        content: replyText,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));
      
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked
                };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        return comment;
      }));
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={cn("flex space-x-3", isReply && "ml-12 mt-4")}>
      <Avatar className={cn("flex-shrink-0", isReply ? "w-8 h-8" : "w-10 h-10")}>
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className={cn("font-semibold", isReply && "text-sm")}>
            {comment.author.name}
          </span>
          {comment.author.verified && (
            <Badge variant="secondary" className="text-xs">
              認証済み
            </Badge>
          )}
          <span className="text-sm text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className={cn("text-gray-700 mb-2", isReply && "text-sm")}>
          {comment.content}
        </p>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLikeComment(comment.id, isReply, parentId)}
            className={cn(
              "flex items-center space-x-1 text-sm transition-colors",
              comment.isLiked ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", comment.isLiked && "fill-current")} />
            <span>{comment.likes}</span>
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>返信</span>
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        {/* 返信フォーム */}
        {replyingTo === comment.id && (
          <div className="mt-4 flex space-x-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="返信を入力..."
              className="flex-1 min-h-[80px] resize-none"
            />
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                onClick={() => handleReplySubmit(comment.id)}
                disabled={!replyText.trim()}
              >
                送信
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
        
        {/* 返信の表示 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                isReply 
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onSubmitClick={() => setIsSubmitModalOpen(true)} />
      
      {/* 戻るボタン */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* ヘッダー画像 */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={model.image} 
                alt={model.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className="bg-white/90 text-gray-900">
                    {model.category}
                  </Badge>
                  {model.featured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      注目
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{model.title}</h1>
                <p className="text-white/90 text-lg">{model.description}</p>
              </div>
            </div>

            {/* タブコンテンツ */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="details">詳細情報</TabsTrigger>
                <TabsTrigger value="comments">コメント</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* ビジネスモデルの特徴 */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      このビジネスモデルの特徴
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">ターゲット市場</h3>
                        <p className="text-gray-600">{model.targetMarket}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">収益モデル</h3>
                        <p className="text-gray-600">{model.revenue}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">初期投資</h3>
                        <p className="text-gray-600">{model.initialInvestment}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">市場投入までの期間</h3>
                        <p className="text-gray-600">{model.timeToMarket}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 実装の難易度 */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">実装の難易度</h2>
                    <div className="flex items-center space-x-4">
                      <Badge 
                        className={cn(
                          "text-lg px-4 py-2",
                          model.difficulty === 'Easy' && "bg-green-100 text-green-800",
                          model.difficulty === 'Medium' && "bg-yellow-100 text-yellow-800",
                          model.difficulty === 'Hard' && "bg-red-100 text-red-800"
                        )}
                      >
                        {model.difficulty === 'Easy' && '簡単'}
                        {model.difficulty === 'Medium' && '普通'}
                        {model.difficulty === 'Hard' && '難しい'}
                      </Badge>
                      <p className="text-gray-600">
                        {model.difficulty === 'Easy' && '基本的な技術スキルで実装可能'}
                        {model.difficulty === 'Medium' && '中級レベルの技術スキルが必要'}
                        {model.difficulty === 'Hard' && '高度な技術スキルと経験が必要'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* タグ */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">関連タグ</h2>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">詳細な分析</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-500" />
                          市場機会
                        </h3>
                        <p className="text-gray-600">
                          このビジネスモデルは、{model.targetMarket}をターゲットとした新しい市場機会を提供します。
                          特に、既存のソリューションでは満たされていないニーズに焦点を当てています。
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                          成長可能性
                        </h3>
                        <p className="text-gray-600">
                          {model.revenue}の収益モデルにより、スケーラブルな成長が期待できます。
                          初期投資{model.initialInvestment}で始められ、{model.timeToMarket}で市場投入が可能です。
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                          競合優位性
                        </h3>
                        <p className="text-gray-600">
                          ニッチ市場に特化することで、大手企業との直接競合を避けながら、
                          特定のユーザーセグメントに深い価値を提供できます。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6">コメント ({comments.length})</h2>
                    
                    {/* コメント投稿フォーム */}
                    <div className="mb-8">
                      <div className="flex space-x-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150" />
                          <AvatarFallback>G</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="コメントを入力..."
                            className="min-h-[100px] resize-none mb-2"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handleCommentSubmit}
                              disabled={!commentText.trim()}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              投稿
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* コメント一覧 */}
                    {comments.length > 0 ? (
                      <div className="space-y-6">
                        {comments.map(comment => (
                          <CommentItem key={comment.id} comment={comment} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>まだコメントはありません</p>
                        <p className="text-sm mt-2">最初のコメントを投稿してみましょう！</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アクションボタン */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button
                  onClick={handleUpvote}
                  className={cn(
                    "w-full h-16 text-lg font-bold transition-all",
                    isUpvoted 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <ArrowUp className={cn("w-6 h-6 mr-2", isUpvoted && "fill-current")} />
                  {upvoteCount} アップボート
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={cn(isBookmarked && "bg-blue-50 border-blue-300 text-blue-600")}
                  >
                    <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(isLiked && "bg-red-50 border-red-300 text-red-600")}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {model.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={model.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      ウェブサイトを見る
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 投稿者情報 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">投稿者</h3>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={model.author.avatar} alt={model.author.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {model.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center">
                      {model.author.name}
                      {model.author.verified && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          認証済み
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(model.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 統計情報 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">統計情報</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-2" />
                      アップボート
                    </span>
                    <span className="font-semibold">{upvoteCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      コメント
                    </span>
                    <span className="font-semibold">{comments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      ユーザー数
                    </span>
                    <span className="font-semibold">{model.userCount?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
