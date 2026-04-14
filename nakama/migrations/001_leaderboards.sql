CREATE TABLE IF NOT EXISTS leaderboard_bootstrap (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now()
);