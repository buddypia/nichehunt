import { supabase } from './supabase-client';
import { CommentWithRelations } from './types/database';

// Export types for backward compatibility
export type CommentWithReplies = CommentWithRelations;

// Import product comment functions
import * as productComments from './api/comments-product';

// Re-export with new names to avoid conflicts
export const updateComment = productComments.updateComment;

// Backward compatibility wrapper functions for business model ID
export async function fetchComments(businessModelId: string): Promise<CommentWithRelations[]> {
  return productComments.fetchComments(businessModelId);
}

export async function createComment(
  businessModelId: string,
  content: string,
  userId: string,
  parentCommentId?: string
): Promise<CommentWithRelations | null> {
  return productComments.createComment({
    productId: businessModelId,
    content,
    parentId: parentCommentId ? parseInt(parentCommentId) : undefined
  });
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  return productComments.deleteComment(parseInt(commentId));
}

export async function updateCommentCount(businessModelId: string) {
  // This function is no longer needed as comment counts are handled by the products_with_stats view
  // Kept for backward compatibility
  return;
}
