const { pool } = require('../config/database');

class Photo {
  // Create a new photo
  static async create(photoData) {
    const {
      creator_id,
      title,
      caption,
      location,
      people_present,
      file_path,
      thumbnail_path,
      file_size,
      mime_type,
      width,
      height,
    } = photoData;

    const query = `
      INSERT INTO photos (
        creator_id, title, caption, location, people_present,
        file_path, thumbnail_path, file_size, mime_type, width, height
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await pool.query(query, [
      creator_id,
      title,
      caption,
      location,
      people_present,
      file_path,
      thumbnail_path,
      file_size,
      mime_type,
      width,
      height,
    ]);

    return result.rows[0];
  }

  // Get photo by ID with creator info
  static async findById(id) {
    const query = `
      SELECT p.*, u.username, u.full_name as creator_name
      FROM photos p
      JOIN users u ON p.creator_id = u.id
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get all photos with pagination and search
  static async getAll(options = {}) {
    const {
      limit = 20,
      offset = 0,
      search = '',
      location = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    let query = `
      SELECT p.*, u.username, u.full_name as creator_name
      FROM photos p
      JOIN users u ON p.creator_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      query += ` AND (
        p.title ILIKE $${paramCount} OR
        p.caption ILIKE $${paramCount} OR
        p.location ILIKE $${paramCount} OR
        $${paramCount} = ANY(p.people_present)
      )`;
      params.push(`%${search}%`);
    }

    // Location filter
    if (location) {
      paramCount++;
      query += ` AND p.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    // Sorting
    const validSortFields = ['created_at', 'average_rating', 'view_count', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortField} ${order}`;

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get photos by creator
  static async getByCreator(creatorId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const query = `
      SELECT * FROM photos
      WHERE creator_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [creatorId, limit, offset]);
    return result.rows;
  }

  // Update photo
  static async update(id, creatorId, updates) {
    const { title, caption, location, people_present } = updates;

    const query = `
      UPDATE photos
      SET
        title = COALESCE($1, title),
        caption = COALESCE($2, caption),
        location = COALESCE($3, location),
        people_present = COALESCE($4, people_present)
      WHERE id = $5 AND creator_id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [title, caption, location, people_present, id, creatorId]);
    return result.rows[0];
  }

  // Delete photo
  static async delete(id, creatorId) {
    const query = 'DELETE FROM photos WHERE id = $1 AND creator_id = $2 RETURNING *';
    const result = await pool.query(query, [id, creatorId]);
    return result.rows[0];
  }

  // Increment view count
  static async incrementViewCount(id) {
    const query = 'UPDATE photos SET view_count = view_count + 1 WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Get total count (for pagination)
  static async getTotalCount(search = '', location = '') {
    let query = 'SELECT COUNT(*) FROM photos WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (
        title ILIKE $${paramCount} OR
        caption ILIKE $${paramCount} OR
        location ILIKE $${paramCount} OR
        $${paramCount} = ANY(people_present)
      )`;
      params.push(`%${search}%`);
    }

    if (location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Photo;
