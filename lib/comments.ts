import { supabase, Comment } from './supabase';

// Comment型を拡張してrepliesを含む
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export async function fetchComments(businessModelId: string): Promise<CommentWithReplies[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('business_model_id', businessModelId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Fetch replies for each comment
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('parent_comment_id', comment.id)
        .order('created_at', { ascending: true });

      return {
        ...comment,
        replies: replies || []
      };
    })
  );

  return commentsWithReplies;
}

export async function createComment(
  businessModelId: string,
  content: string,
  userId: string,
  parentCommentId?: string
): Promise<CommentWithReplies | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      business_model_id: businessModelId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId
    })
    .select(`
      *,
      profiles:user_id (
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

  // Update comment count
  await updateCommentCount(businessModelId);

  return data;
}

export async function updateCommentCount(businessModelId: string) {
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('business_model_id', businessModelId);

  if (count !== null) {
    await supabase
      .from('business_models')
      .update({ comment_count: count })
      .eq('id', businessModelId);
  }
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }

  return true;
}
