-- Add GIN index for full-text search on user profiles
-- This enables efficient searching across first_name, last_name, and username

CREATE INDEX CONCURRENTLY idx_users_search_vector
ON users
USING GIN (
  to_tsvector('english',
    COALESCE((SELECT ua.first_name FROM user_attributes ua WHERE ua.user_id = users.id), '') || ' ' ||
    COALESCE((SELECT ua.last_name FROM user_attributes ua WHERE ua.user_id = users.id), '') || ' ' ||
    users.username
  )
);