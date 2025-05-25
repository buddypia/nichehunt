-- Create RLS policies for notifications table

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: System can insert notifications (using service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);
