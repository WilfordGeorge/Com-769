const { pool } = require('../config/database');

class Rating {
  // Create or update a rating
  static async upsert(ratingData) {
    const { photo_id, user_id, rating } = ratingData;

    const query = `
      INSERT INTO ratings (photo_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (photo_id, user_id)
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [photo_id, user_id, rating]);
    return result.rows[0];
  }

  // Get user's rating for a photo
  static async getUserRating(photoId, userId) {
    const query = 'SELECT * FROM ratings WHERE photo_id = $1 AND user_id = $2';
    const result = await pool.query(query, [photoId, userId]);
    return result.rows[0];
  }

  // Get all ratings for a photo
  static async getByPhoto(photoId) {
    const query = `
      SELECT r.*, u.username, u.full_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.photo_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [photoId]);
    return result.rows;
  }

  // Get rating statistics for a photo
  static async getPhotoStats(photoId) {
    const query = `
      SELECT
        COUNT(*) as rating_count,
        AVG(rating)::DECIMAL(3,2) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM ratings
      WHERE photo_id = $1
    `;

    const result = await pool.query(query, [photoId]);
    return result.rows[0];
  }

  // Delete rating
  static async delete(photoId, userId) {
    const query = 'DELETE FROM ratings WHERE photo_id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [photoId, userId]);
    return result.rows[0];
  }
}

module.exports = Rating;
