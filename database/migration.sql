-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Administrators / Users Table (Prefix: jcir_)
CREATE TABLE IF NOT EXISTS jcir_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table for connect-pg-simple
CREATE TABLE IF NOT EXISTS jcir_sessions (
    sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON jcir_sessions ("expire");

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS jcir_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES jcir_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jcir_audit_user_id ON jcir_audit_logs(user_id);

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_jcir_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jcir_users_updated_at ON jcir_users;
CREATE TRIGGER update_jcir_users_updated_at
    BEFORE UPDATE ON jcir_users
    FOR EACH ROW
    EXECUTE FUNCTION update_jcir_updated_at_column();