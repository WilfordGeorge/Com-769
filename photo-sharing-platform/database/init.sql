-- Photo Sharing Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('creator', 'consumer');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    caption TEXT,
    location VARCHAR(255),
    people_present TEXT[], -- Array of people's names
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    view_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(photo_id, user_id) -- One rating per user per photo
);

-- Indexes for performance
CREATE INDEX idx_photos_creator ON photos(creator_id);
CREATE INDEX idx_photos_created ON photos(created_at DESC);
CREATE INDEX idx_photos_rating ON photos(average_rating DESC);
CREATE INDEX idx_comments_photo ON comments(photo_id);
CREATE INDEX idx_ratings_photo ON ratings(photo_id);
CREATE INDEX idx_photos_location ON photos(location);

-- Full-text search index for photos
CREATE INDEX idx_photos_search ON photos USING gin(to_tsvector('english', title || ' ' || COALESCE(caption, '') || ' ' || COALESCE(location, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update photo rating statistics
CREATE OR REPLACE FUNCTION update_photo_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE photos
    SET
        average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM ratings WHERE photo_id = NEW.photo_id),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE photo_id = NEW.photo_id)
    WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update photo ratings when a rating is added or updated
CREATE TRIGGER update_rating_stats AFTER INSERT OR UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_photo_rating_stats();

-- Insert sample users (password is 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
('creator1', 'creator1@example.com', '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK', 'creator', 'John Creator'),
('creator2', 'creator2@example.com', '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK', 'creator', 'Jane Artist'),
('consumer1', 'consumer1@example.com', '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK', 'consumer', 'Bob Viewer'),
('consumer2', 'consumer2@example.com', '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK', 'consumer', 'Alice Browser');

-- Grant permissions (adjust as needed for your PostgreSQL setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
