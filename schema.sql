-- Cloudflare D1 Schema for Quantum Adventure

-- Users Table: Stores information about registered users
CREATE TABLE Users (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the user
    email TEXT NOT NULL UNIQUE, -- User's email, must be unique
    username TEXT NOT NULL UNIQUE, -- User's chosen username, must be unique
    hashed_password TEXT, -- Hashed password for email/password auth
    auth_provider TEXT DEFAULT 'email', -- To distinguish between email/pass and OAuth users ('email', 'google', 'facebook', 'github')
    provider_id TEXT, -- Unique ID from the OAuth provider, null for email/password users
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of user creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Timestamp of last update
);

-- Courses Table: Stores information about available courses
CREATE TABLE Courses (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the course
    title TEXT NOT NULL, -- Title of the course (e.g., "Quantum Adventure 101")
    description TEXT, -- Detailed description of the course
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of course creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Timestamp of last update
);

-- CourseSections Table: Represents main sections/chapters within a course (maps to top-level MODULES in constants.tsx)
CREATE TABLE CourseSections (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the section
    course_id INTEGER NOT NULL, -- Foreign key referencing the Courses table
    external_id TEXT UNIQUE, -- Optional unique ID for mapping to content files (e.g., 'intro-qubits')
    title TEXT NOT NULL, -- Title of the section (e.g., "The Quantum Leap: Meet the Qubit")
    icon_ref TEXT, -- String reference for the icon (e.g., "AcademicCapIcon", frontend maps to component)
    story_intro TEXT, -- Introductory narrative for the section
    summary TEXT, -- Summary of the section
    section_order INTEGER, -- Defines the sequence of sections within a course
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of section creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of last update
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

-- LearningUnits Table: Stores individual learning units or activities within a CourseSection (maps to concepts in constants.tsx)
CREATE TABLE LearningUnits (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the learning unit
    section_id INTEGER NOT NULL, -- Foreign key referencing the CourseSections table
    external_id TEXT UNIQUE, -- Optional unique ID for mapping to content files (e.g., 'c1-1-classical-vs-qubits')
    title TEXT NOT NULL, -- Title of the learning unit
    explanation TEXT, -- Main content/explanation (can be Markdown/HTML)
    -- unit_type helps the frontend decide how to render the unit and what data to expect
    -- e.g., 'INFO', 'QUBIT_VISUALIZER', 'GATE_APPLICATION', 'QUIZ', 'CIRCUIT_BUILDER', 'BELL_STATE', 'REFLECTION_PROMPT'
    unit_type TEXT NOT NULL,
    -- unit_data stores type-specific configuration as a JSON string
    -- e.g., for 'QUIZ': { "question": "...", "options": [...], "feedbackCorrect": "..." }
    -- e.g., for 'QUBIT_VISUALIZER': { "initialAlpha": 1, "initialBeta": 0 }
    -- e.g., for 'REFLECTION_PROMPT': { "prompt": "What did you learn?" }
    unit_data TEXT, -- JSON blob for storing data specific to the unit_type
    unit_order INTEGER, -- Defines the sequence of learning units within a section
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of unit creation
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of last update
    FOREIGN KEY (section_id) REFERENCES CourseSections(id) ON DELETE CASCADE
);

-- UserProgress Table: Tracks user progress for each learning unit
CREATE TABLE UserProgress (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the progress record
    user_id INTEGER NOT NULL, -- Foreign key referencing the Users table
    learning_unit_id INTEGER NOT NULL, -- Foreign key referencing the LearningUnits table
    -- Status of the learning unit for the user
    status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'attempted')) DEFAULT 'not_started',
    score INTEGER, -- Score obtained by the user (e.g., for quizzes)
    -- progress_data stores user-specific interaction data as a JSON string
    -- e.g., for 'QUIZ': { "answers": [{"option_id": "...", "is_correct": true/false}], "final_score": ... }
    -- e.g., for 'REFLECTION_PROMPT': { "response_text": "User's reflection..." }
    -- e.g., for 'CIRCUIT_BUILDER': { "user_circuit_config": {...} }
    progress_data TEXT, -- JSON blob for storing detailed progress (e.g., quiz answers, reflection text, simulator state)
    started_at DATETIME, -- Timestamp when the user started the learning unit
    completed_at DATETIME, -- Timestamp when the user completed the learning unit
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of last progress update
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (learning_unit_id) REFERENCES LearningUnits(id) ON DELETE CASCADE,
    UNIQUE (user_id, learning_unit_id) -- Ensures one progress record per user per learning unit
);

-- Achievements Table: Defines various achievements or badges users can earn
CREATE TABLE Achievements (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the achievement
    name TEXT NOT NULL UNIQUE, -- Name of the achievement (e.g., "Quantum Leap")
    description TEXT, -- Description of how to earn the achievement
    icon_url TEXT, -- URL or reference to an icon representing the achievement
    -- criteria_type helps in programmatically checking for achievement unlocks
    -- e.g., 'COMPLETE_LEARNING_UNIT', 'COMPLETE_SECTION', 'SCORE_THRESHOLD_QUIZ', 'LOGIN_STREAK'
    criteria_type TEXT NOT NULL,
    -- criteria_value stores the specific value for the criteria
    -- e.g., learning_unit_id for 'COMPLETE_LEARNING_UNIT', section_id for 'COMPLETE_SECTION',
    -- target score for 'SCORE_THRESHOLD_QUIZ', or JSON for more complex criteria
    criteria_value TEXT NOT NULL,
    points_awarded INTEGER DEFAULT 0 -- Points awarded for this achievement
);

-- UserAchievements Table: Tracks achievements earned by users
CREATE TABLE UserAchievements (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the earned achievement record
    user_id INTEGER NOT NULL, -- Foreign key referencing the Users table
    achievement_id INTEGER NOT NULL, -- Foreign key referencing the Achievements table
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the achievement was earned
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES Achievements(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_id) -- Ensures a user earns an achievement only once
);

-- UserPoints Table: Stores gamification points for users, can be used for leaderboards
CREATE TABLE UserPoints (
    user_id INTEGER PRIMARY KEY, -- Foreign key referencing the Users table, also primary key
    total_points INTEGER DEFAULT 0, -- Total points accumulated by the user
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of the last points update
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Sessions Table: Stores user session tokens for authentication
CREATE TABLE Sessions (
    id INTEGER PRIMARY KEY, -- Auto-incrementing ID for the session
    user_id INTEGER NOT NULL, -- Foreign key referencing the Users table
    token TEXT NOT NULL UNIQUE, -- Session token (UUID)
    expires_at DATETIME NOT NULL, -- Expiration timestamp for the session
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of session creation
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
