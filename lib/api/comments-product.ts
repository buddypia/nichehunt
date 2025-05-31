import { createClient } from '@/lib/supabase/client';
import type { CommentWithRelations } from '@/lib/types/database';

export async function fetchComments(productId: string): Promise<CommentWithRelations[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('product_id', parseInt(productId))
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // 階層構造を構築
  const comments = data || [];
  const commentMap = new Map<number, CommentWithRelations>();
  const rootComments: CommentWithRelations[] = [];

  // すべてのコメントをマップに格納
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: []
    });
  });

  // 親子関係を構築
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return rootComments;
}

export async function createComment({
  productId,
  content,
  parentId
}: {
  productId: string;
  content: string;
  parentId?: number | null;
}): Promise<CommentWithRelations | null> {
  const supabase = createClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      product_id: parseInt(productId),
      user_id: user.id,
      content,
      parent_id: parentId || null
    })
    .select(`
      *,
      profile:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  return {
    ...data,
    replies: []
  };
}

export async function deleteComment(commentId: number): Promise<boolean> {
  const supabase = createClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }

  return true;
}

export async function updateComment(commentId: number, content: string): Promise<boolean> {
  const supabase = createClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return false;
  }

  const { error } = await supabase
    .from('comments')
    .update({ 
      content,
      is_edited: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating comment:', error);
    return false;
  }

  return true;
}
