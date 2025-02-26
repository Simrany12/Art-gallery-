SELECT is_private, views, times_favorited, shares, gallery_name, author, thumbnail, galleries.id
FROM galleries
JOIN users
ON users.id = galleries.user_id
where users.username = $1