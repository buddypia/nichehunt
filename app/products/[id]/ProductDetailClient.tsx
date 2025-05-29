'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, MessageCircle, ExternalLink, Share2, Calendar, Tag, Github, Play, Globe, Trash2, Image as ImageIconLucide } from 'lucide-react'; // Added ImageIconLucide for clarity if needed
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SaveToCollectionPopover } from '@/components/SaveToCollectionPopover';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi, // Import CarouselApi type
} from "@/components/ui/carousel"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { ProductWithRelations, CommentWithRelations } from '@/lib/types/database';
import { voteProduct } from '@/lib/api/products-client';
import { fetchComments, createComment, deleteComment } from '@/lib/api/comments-product';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

interface ProductDetailClientProps {
  initialProduct: ProductWithRelations;
}

interface CommentItemProps {
  comment: CommentWithRelations;
  depth?: number;
  currentUser: any;
  isReplying: boolean;
  replyText: string;
  onReplyToggle: () => void;
  onReplyTextChange: (text: string) => void;
  onReplySubmit: (e: React.FormEvent) => void;
  onReplyCancel: () => void;
  isSubmittingComment: boolean;
  onDelete: (commentId: number) => void;
  parentComment?: CommentWithRelations;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  depth = 0, 
  currentUser,
  isReplying,
  replyText,
  onReplyToggle,
  onReplyTextChange,
  onReplySubmit,
  onReplyCancel,
  isSubmittingComment,
  onDelete,
  parentComment
}) => {
  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="flex space-x-3">
        <Link href={`/profile?id=${comment.profile?.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profile?.avatar_url || ''} />
            <AvatarFallback>{comment.profile?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Link href={`/profile?id=${comment.profile?.id}`} className="font-medium hover:underline">
              {comment.profile?.username}
            </Link>
            {parentComment && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">→</span>
                <Link href={`/profile?id=${parentComment.profile?.id}`} className="text-sm text-blue-600 hover:underline">
                  @{parentComment.profile?.username}
                </Link>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ja })}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-gray-400">(編集済み)</span>
            )}
          </div>
          <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          <div className="mt-2 flex items-center space-x-4">
            {currentUser && (
              <button
                onClick={onReplyToggle}
                className="text-sm text-blue-600 hover:underline"
              >
                {isReplying ? 'キャンセル' : '返信'}
              </button>
            )}
            {currentUser && currentUser.id === comment.user_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>削除</span>
              </button>
            )}
          </div>
          
          {/* インライン返信フォーム */}
          {isReplying && currentUser && (
            <form onSubmit={onReplySubmit} className="mt-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {currentUser.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => onReplyTextChange(e.target.value)}
                    placeholder={`@${comment.profile?.username} への返信を入力...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all duration-200"
                    rows={3}
                    autoFocus
                  />
                  <div className="mt-2 flex space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingComment || !replyText.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          投稿中...
                        </>
                      ) : (
                        '返信を投稿'
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onReplyCancel}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* 返信は renderCommentWithReplies で表示するため、ここでは表示しない */}
    </div>
  );
};

export function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const [product, setProduct] = useState(initialProduct);
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State for Carousel API and slide tracking
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideCount, setSlideCount] = useState(0)

  useEffect(() => {
    loadCurrentUser();
    loadComments();
  }, []);

  useEffect(() => {
    if (!carouselApi) {
      return
    }

    setSlideCount(carouselApi.scrollSnapList().length)
    setCurrentSlide(carouselApi.selectedScrollSnap())

    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user) {
      checkUserVote(user.id);
    }
  };

  const checkUserVote = async (userId: string) => {
    try {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .single();
      
      if (existingVote) {
        setProduct(prev => ({
          ...prev,
          has_voted: true,
        }));
      }
    } catch (error) {
      // エラーが発生した場合（レコードが存在しない場合も含む）は何もしない
      console.log('No existing vote or error:', error);
    }
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

  const handleCommentSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('コメントを投稿するにはログインが必要です');
      return;
    }

    const content = parentId ? replyTexts[parentId] : newComment;
    if (!content?.trim()) return;

    setIsSubmittingComment(true);
    try {
      const result = await createComment({
        productId: product.id.toString(),
        content,
        parentId,
      });

      if (result) {
        await loadComments();
        if (parentId) {
          setReplyTexts(prev => ({ ...prev, [parentId]: '' }));
          setReplyToId(null);
        } else {
          setNewComment('');
        }
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

  const handleDeleteClick = (commentId: number) => {
    setDeletingCommentId(commentId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCommentId) return;

    try {
      const success = await deleteComment(deletingCommentId);
      if (success) {
        await loadComments();
        setProduct(prev => ({
          ...prev,
          comment_count: Math.max(0, prev.comment_count - 1),
        }));
        toast.success('コメントを削除しました');
      } else {
        toast.error('コメントの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('コメントの削除に失敗しました');
    } finally {
      setShowDeleteDialog(false);
      setDeletingCommentId(null);
    }
  };

  const renderCommentWithReplies = (comment: CommentWithRelations, depth: number = 0, parentComment?: CommentWithRelations) => {
    const isReplying = replyToId === comment.id;
    const replyText = replyTexts[comment.id] || '';

    return (
      <React.Fragment key={comment.id}>
        <CommentItem
          comment={comment}
          depth={depth}
          currentUser={currentUser}
          isReplying={isReplying}
          replyText={replyText}
          onReplyToggle={() => setReplyToId(isReplying ? null : comment.id)}
          onReplyTextChange={(text) => setReplyTexts(prev => ({ ...prev, [comment.id]: text }))}
          onReplySubmit={(e) => handleCommentSubmit(e, comment.id)}
          onReplyCancel={() => {
            setReplyToId(null);
            setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
          }}
          isSubmittingComment={isSubmittingComment}
          onDelete={handleDeleteClick}
          parentComment={parentComment}
        />
        {comment.replies && comment.replies.map(reply => renderCommentWithReplies(reply, depth + 1, comment))}
      </React.Fragment>
    );
  };

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
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 896px"
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
                {currentUser && (
                  <SaveToCollectionPopover productId={product.id} />
                )}
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
              <Link href={`/profile?id=${product.profile?.id}`} className="flex items-center space-x-2 hover:text-gray-900">
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
                <Badge variant="secondary">{product.category.name}</Badge>
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

          </div>
        </div>

        {/* Image Carousel Section - No Card, Sized to Fit Layout */}
        {product.images && product.images.length > 0 && (
          <div className="mt-8 w-full"> {/* Full width within parent, margin top for separation */}
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: product.images.length > 1,
              }}
              className="w-full relative" 
            >
              <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4"> {/* Adjust negative margin based on item padding */}
                {product.images.map((image, index) => (
                  // Adjust basis to show multiple images, e.g., main image larger, peeks of others
                  <CarouselItem key={image.id || index} className="pl-1 sm:pl-2 md:pl-4 basis-full sm:basis-5/6 md:basis-4/5 lg:basis-3/4 xl:basis-2/3">
                    <div className="p-1">
                      {/* Maintain aspect ratio for images, e.g., 16:9 or 4:3 or 16:10 */}
                      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                        <Image
                          src={image.image_url}
                          alt={image.caption || `${product.name} - 画像 ${index + 1}`}
                          fill
                          // Adjust sizes for better responsive behavior
                          sizes="(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, (max-width: 1280px) 60vw, 800px"
                          className="object-contain"
                        />
                      </div>
                      {image.caption && (
                        <p className="mt-2 text-xs text-center text-gray-500">{image.caption}</p>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  {/* Adjust button positioning if they are outside the main image area */}
                  <CarouselPrevious className="absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 p-0 disabled:opacity-50" />
                  <CarouselNext className="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 p-0 disabled:opacity-50" />
                </>
              )}
            </Carousel>
            {/* Dot Indicators */}
            {slideCount > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: slideCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      ${index === currentSlide ? 'bg-purple-600 w-4' : 'bg-gray-300 hover:bg-gray-400'}`} // Active dot wider
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 説明セクション */}
        <Card className="mt-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              詳細説明
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">{product.description}</p>
            </div>
            {/* Carousel has been moved out of this CardContent */}
          </CardContent>
        </Card>

        {/* コメントセクション */}
        <Card className="mt-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                ディスカッション
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {product.comment_count} コメント
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* コメント投稿フォーム */}
            {currentUser ? (
              <form onSubmit={(e) => handleCommentSubmit(e)} className="mb-10">
                <div className="flex space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {currentUser.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="あなたの考えを共有してください..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={4}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          投稿中...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          コメントを投稿
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-10 p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4 text-lg">ディスカッションに参加するにはログインが必要です</p>
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    ログインして参加
                  </Button>
                </Link>
              </div>
            )}

            <Separator className="mb-8" />

            {/* コメント一覧 */}
            <div className="space-y-8">
              {isLoadingComments ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">コメントを読み込み中...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">まだコメントはありません</p>
                  <p className="text-gray-400 mt-2">最初にコメントを投稿してみましょう！</p>
                </div>
              ) : (
                comments
                  .filter(comment => !comment.parent_id)
                  .map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      {renderCommentWithReplies(comment)}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。このコメントに対する返信も全て削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCommentId(null)}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
