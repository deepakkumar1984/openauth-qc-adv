-- Cloudflare D1 Schema for Quantum Adventure

DROP TABLE IF EXISTS UserAchievements;
DROP TABLE IF EXISTS UserProgress;
DROP TABLE IF EXISTS LearningUnits;
DROP TABLE IF EXISTS Achievements;
DROP TABLE IF EXISTS CourseSections;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS UserPoints;
DROP TABLE IF EXISTS Sessions;

-- Users Table: Stores information about registered users
CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    hashed_password TEXT,
    auth_provider TEXT DEFAULT 'email',
    provider_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table: Stores information about available courses
CREATE TABLE Courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT, -- Course difficulty level (e.g., 'Beginner', 'Intermediate', 'Advanced')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CourseSections Table: Represents main sections/chapters within a course
CREATE TABLE CourseSections (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    icon_ref TEXT,
    story_intro TEXT,
    summary TEXT,
    section_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

-- LearningUnits Table: Stores individual learning units or activities
CREATE TABLE LearningUnits (
    id INTEGER PRIMARY KEY,
    section_id INTEGER NOT NULL,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    explanation TEXT, -- Added explanation column for HTML/Markdown content
    unit_type TEXT NOT NULL,
    unit_data TEXT, -- JSON blob
    unit_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES CourseSections(id) ON DELETE CASCADE
);

-- UserProgress Table: Tracks user progress for each learning unit
CREATE TABLE UserProgress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    learning_unit_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'attempted')) DEFAULT 'not_started',
    score INTEGER,
    progress_data TEXT, -- JSON blob
    started_at DATETIME,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (learning_unit_id) REFERENCES LearningUnits(id) ON DELETE CASCADE,
    UNIQUE (user_id, learning_unit_id)
);

-- Achievements Table: Defines various achievements or badges
CREATE TABLE Achievements (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    criteria_type TEXT NOT NULL,
    criteria_value TEXT NOT NULL,
    points_awarded INTEGER DEFAULT 0
);

-- UserAchievements Table: Tracks achievements earned by users
CREATE TABLE UserAchievements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES Achievements(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_id)
);

-- UserPoints Table: Stores gamification points for users
CREATE TABLE UserPoints (
    user_id INTEGER PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Sessions Table: Stores user session tokens for authentication
CREATE TABLE Sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_progress_status ON UserProgress(status);
CREATE INDEX idx_learning_units_section_id ON LearningUnits(section_id);
CREATE INDEX idx_course_sections_course_id ON CourseSections(course_id);
CREATE INDEX idx_user_points_total_points ON UserPoints(total_points DESC);
CREATE INDEX idx_achievements_criteria ON Achievements(criteria_type);


-- Notes on D1 specifics:
-- 1. `updated_at` timestamps: D1 does not have automatic `ON UPDATE CURRENT_TIMESTAMP`.
--    These need to be set by your application logic whenever a record is updated.
-- 2. JSON Data: `unit_data` and `progress_data` are stored as TEXT. Your application will be
--    responsible for serializing/deserializing this JSON.
-- 3. Enum-like checks (e.g., `status IN (...)`): These are useful for data integrity.

-- Example of how you might populate data (conceptual, actual data insertion would be via your backend):
-- INSERT INTO Courses (title, description) VALUES ('Quantum Computing Fundamentals', 'An interactive journey into the world of quantum mechanics and computation.');
-- INSERT INTO CourseSections (course_id, external_id, title, icon_ref, story_intro, summary, section_order) VALUES
--   (1, 'intro-qubits', 'The Quantum Leap: Meet the Qubit', 'AcademicCapIcon', 'Welcome, brave explorer...', 'You met the qubit...', 0);
-- INSERT INTO LearningUnits (section_id, external_id, title, explanation, unit_type, unit_data, unit_order) VALUES
--   (1, 'c1-1', 'Classical Bits vs. Qubits', '<p>Classical bits...</p>', 'INFO', NULL, 0),
--   (1, 'c1-2', 'Visualizing a Qubit', 'Lets see...', 'QUBIT_VISUALIZER', '{"initialAlpha": 1, "initialBeta": 0}', 1);
