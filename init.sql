-- =============================================
-- Spinwheel Database Init
-- PostgreSQL 16
-- =============================================

CREATE TABLE IF NOT EXISTS spinwheel_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spinwheel_prizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    percentage INTEGER NOT NULL DEFAULT 10,
    color TEXT NOT NULL DEFAULT '#ef4444',
    stock INTEGER NOT NULL DEFAULT 10,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spinwheel_logs (
    id TEXT PRIMARY KEY,
    prize_id TEXT NOT NULL,
    prize_name TEXT NOT NULL,
    prize_color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spinwheel_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default admin user (password: dupoin123)
INSERT INTO spinwheel_users (username, password_hash) VALUES
    ('dupoin', '$2b$10$PodT4Mpug6WzvRv.7KhQgO8SX.XeNOAT/Rg9dAGfPQIeaGdytPFe6')
ON CONFLICT (username) DO NOTHING;

-- Default prizes
INSERT INTO spinwheel_prizes (id, name, percentage, color, stock, sort_order) VALUES
    ('1', 'IPhone 15', 1, '#ef4444', 1, 0),
    ('2', 'Voucher 100k', 15, '#3b82f6', 10, 1),
    ('3', 'Mug Cantik', 25, '#10b981', 50, 2),
    ('4', 'Kaos', 20, '#f59e0b', 20, 3),
    ('5', 'Zonk', 25, '#6b7280', 999, 4),
    ('6', 'Voucher 50k', 14, '#8b5cf6', 20, 5)
ON CONFLICT (id) DO NOTHING;

-- Default settings
INSERT INTO spinwheel_settings (key, value) VALUES
    ('background', '{"type": "color", "value": "#0f172a"}'),
    ('audio', '{"enabled": true}')
ON CONFLICT (key) DO NOTHING;
