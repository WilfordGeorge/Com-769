const { pool } = require('../config/database');

class Comment {
  // Create a new comment
  static async create(commentData) {
    const { photo_id, user_id, content } = commentData;

    const query = `
      INSERT INTO comments (photo_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [photo_id, user_id, content]);
    return result.rows[0];
  }

  // Get comments for a photo
  static async getByPhoto(photoId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const query = `
      SELECT c.*, u.username, u.full_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.photo_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [photoId, limit, offset]);
    return result.rows;
  }

  // Get comment by ID
  static async findById(id) {
    const query = `
      SELECT c.*, u.username, u.full_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update comment
  static async update(id, userId, content) {
    const query = `
      UPDATE comments
      SET content = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [content, id, userId]);
    return result.rows[0];
  }

  // Delete comment
  static async delete(id, userId) {
    const query = 'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Get comment count for a photo
  static async getCountByPhoto(photoId) {
    const query = 'SELECT COUNT(*) FROM comments WHERE photo_id = $1';
    const result = await pool.query(query, [photoId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Comment;
