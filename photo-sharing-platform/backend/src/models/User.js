const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { username, email, password, role, full_name } = userData;
    const password_hash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password_hash, role, full_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role, full_name, created_at
    `;

    const result = await pool.query(query, [username, email, password_hash, role, full_name]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, username, email, role, full_name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (admin function)
  static async getAll() {
    const query = 'SELECT id, username, email, role, full_name, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Update user
  static async update(id, updates) {
    const { full_name } = updates;
    const query = `
      UPDATE users
      SET full_name = COALESCE($1, full_name)
      WHERE id = $2
      RETURNING id, username, email, role, full_name, updated_at
    `;

    const result = await pool.query(query, [full_name, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;
