-- Create Business Letters Table
CREATE TABLE IF NOT EXISTS jcir_letters (
    id SERIAL PRIMARY KEY,
    letter_number VARCHAR(50) UNIQUE NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_address TEXT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    salutation VARCHAR(100) NOT NULL,
    letter_body TEXT NOT NULL,
    closing_statement VARCHAR(100) NOT NULL,
    signatory_name VARCHAR(255) NOT NULL,
    signatory_position VARCHAR(255) NOT NULL,
    letter_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Finalized, Archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Letter Revisions History Table
CREATE TABLE IF NOT EXISTS jcir_letter_revisions (
    id SERIAL PRIMARY KEY,
    letter_id INT REFERENCES jcir_letters(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and searching
CREATE INDEX IF NOT EXISTS idx_jcir_letters_status ON jcir_letters(status);
CREATE INDEX IF NOT EXISTS idx_jcir_letters_recipient ON jcir_letters(recipient_name);
CREATE INDEX IF NOT EXISTS idx_jcir_letters_subject ON jcir_letters(subject);
