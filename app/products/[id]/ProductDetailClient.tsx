'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, ExternalLink, Share2, Calendar, Tag, Github, Play, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ProductWithRelations, CommentWithRelations } from '@/lib/types/database';
import { voteProduct } from '@/lib/api/products-client';
import { fetchComments, createComment } from '@/lib/api/comments-product';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  initialProduct: ProductWithRelations;
}

export function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const [product, setProduct] = useState(initialProduct);
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadComments();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(product.id.toString());
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleVote = async () => {
    if (!currentUser) {
      toast.error('投票するにはログインが必要です');
      return;
    }

    setIsVoting(true);
    try {
      const { error } = await voteProduct(product.id);
      if (!error) {
        setProduct(prev => ({
          ...prev,
          has_voted: !prev.has_voted,
          vote_count: prev.has_voted ? prev.vote_count - 1 : prev.vote_count + 1,
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('投票に失敗しました');
    } finally {
      setIsVoting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('コメントを投稿するにはログインが必要です');
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const result = await createComment({
        productId: product.id.toString(),
        content: newComment,
        parentId: replyTo,
      });

      if (result) {
        await loadComments();
        setNewComment('');
        setReplyTo(null);
        setProduct(prev => ({
          ...prev,
          comment_count: prev.comment_count + 1,
        }));
        toast.success('コメントを投稿しました');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('コメントの投稿に失敗しました');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.tagline,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('リンクをコピーしました');
    }
  };

  const CommentItem: React.FC<{ comment: CommentWithRelations; depth?: number }> = ({ comment, depth = 0 }) => (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="flex space-x-3">
        <Link href={`/profiles/${comment.profile?.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profile?.avatar_url || ''} />
            <AvatarFallback>{comment.profile?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Link href={`/profiles/${comment.profile?.id}`} className="font-medium hover:underline">
              {comment.profile?.username}
            </Link>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ja })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-gray-400">(編集済み)</span>
            )}
          </div>
          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => setReplyTo(comment.id)}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            返信
          </button>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            プロダクト一覧に戻る
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* サムネイル画像 */}
          {product.thumbnail_url && (
            <div className="relative h-64 md:h-96">
              <Image
                src={product.thumbnail_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* プロダクト情報 */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-xl text-gray-600">{product.tagline}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={product.has_voted ? "default" : "outline"}
                  size="sm"
                  onClick={handleVote}
                  disabled={isVoting}
                  className="flex items-center space-x-1"
                >
                  <Heart className={`w-4 h-4 ${product.has_voted ? 'fill-current' : ''}`} />
                  <span>{product.vote_count}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
              <Link href={`/profiles/${product.profile?.id}`} className="flex items-center space-x-2 hover:text-gray-900">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={product.profile?.avatar_url || ''} />
                  <AvatarFallback>{product.profile?.username?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span>{product.profile?.username}</span>
              </Link>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(product.launch_date).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{product.comment_count} コメント</span>
              </div>
              {product.category && (
                <Link href={`/categories/${product.category.slug}`}>
                  <Badge variant="secondary">{product.category.name}</Badge>
                </Link>
              )}
            </div>

            {/* タグ */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <Link key={tag.id} href={`/products?tag=${tag.slug}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* リンク */}
            <div className="flex flex-wrap gap-3 mb-6">
              {product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="w-4 h-4" />
                  <span>ウェブサイト</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {product.github_url && (
                <a
                  href={product.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {product.demo_url && (
                <a
                  href={product.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                >
                  <Play className="w-4 h-4" />
                  <span>デモ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <Separator className="my-6" />

            {/* タブ */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">説明</TabsTrigger>
                <TabsTrigger value="comments">コメント ({product.comment_count})</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>

                {/* 追加画像があれば表示 */}
                {product.images && product.images.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">画像ギャラリー</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.images.map((image) => (
                        <div key={image.id} className="relative h-48">
                          <Image
                            src={image.image_url}
                            alt={image.caption || ''}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {image.caption && (
                            <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                {/* コメント投稿フォーム */}
                {currentUser ? (
                  <form onSubmit={handleCommentSubmit} className="mb-8">
                    <div className="flex space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatar_url} />
                        <AvatarFallback>{currentUser.username?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {replyTo && (
                          <div className="mb-2 text-sm text-gray-600">
                            返信先のコメントID: {replyTo}
                            <button
                              type="button"
                              onClick={() => setReplyTo(null)}
                              className="ml-2 text-red-600 hover:underline"
                            >
                              キャンセル
                            </button>
                          </div>
                        )}
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="コメントを入力..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <Button
                          type="submit"
                          disabled={isSubmittingComment || !newComment.trim()}
                          className="mt-2"
                        >
                          {isSubmittingComment ? '投稿中...' : 'コメントを投稿'}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-2">コメントを投稿するにはログインが必要です</p>
                    <Link href="/auth/signin">
                      <Button>ログイン</Button>
                    </Link>
                  </div>
                )}

                {/* コメント一覧 */}
                <div className="space-y-6">
                  {isLoadingComments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">まだコメントはありません</p>
                  ) : (
                    comments
                      .filter(comment => !comment.parent_id)
                      .map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
