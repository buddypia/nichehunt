-- Drop existing view if exists
DROP VIEW IF EXISTS products_with_stats;

-- Create view with is_saved field
CREATE OR REPLACE VIEW products_with_stats AS
SELECT 
  p.*,
  COUNT(DISTINCT v.user_id) AS vote_count,
  COUNT(DISTINCT c.id) AS comment_count,
  EXISTS (
    SELECT 1 
    FROM votes v2 
    WHERE v2.product_id = p.id 
    AND v2.user_id = auth.uid()
  ) AS has_voted,
  EXISTS (
    SELECT 1 
    FROM collection_products cp
    JOIN collections col ON col.id = cp.collection_id
    WHERE cp.product_id = p.id 
    AND col.user_id = auth.uid()
  ) AS is_saved
FROM products p
LEFT JOIN votes v ON v.product_id = p.id
LEFT JOIN comments c ON c.product_id = p.id
GROUP BY p.id;

-- Grant permissions
GRANT SELECT ON products_with_stats TO authenticated;
GRANT SELECT ON products_with_stats TO anon;
