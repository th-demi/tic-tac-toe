CREATE TABLE IF NOT EXISTS player_stats_bootstrap (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now()
);