-- Prompt 3 Migration: Receipts, Business Settings, and Reversals

-- 1. Business Profile Settings Table
CREATE TABLE IF NOT EXISTS jcir_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Joel Consult Hub',
    tagline VARCHAR(255) DEFAULT 'AI Automation & Technology Consultancy',
    email VARCHAR(255) NOT NULL DEFAULT 'info@joelconsult.com',
    phone VARCHAR(50) DEFAULT '+234 800 000 0000',
    address TEXT DEFAULT 'Lagos, Nigeria',
    currency_symbol VARCHAR(10) DEFAULT '₦',
    currency_code VARCHAR(10) DEFAULT 'NGN',
    default_payment_terms TEXT DEFAULT 'Payment terms: 70% advance, 30% upon completion.',
    bank_details TEXT DEFAULT 'Bank: Moniepoint MFB | Account No: 0000000000 | Account Name: Joel Consult',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings row if none exists
INSERT INTO jcir_settings (company_name) 
SELECT 'Joel Consult Hub' 
WHERE NOT EXISTS (SELECT 1 FROM jcir_settings);

-- 2. Receipts Table (Supports payment-linked and standalone receipts)
CREATE TABLE IF NOT EXISTS jcir_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_id UUID REFERENCES jcir_payments(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES jcir_clients(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES jcir_invoices(id) ON DELETE SET NULL,
    amount_received NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
    reference_number VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Cancelled', 'Replaced')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jcir_receipts_number ON jcir_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_jcir_receipts_client ON jcir_receipts(client_id);

-- 3. Payment Reversal / Correction Logs
CREATE TABLE IF NOT EXISTS jcir_payment_reversals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES jcir_payments(id) ON DELETE RESTRICT,
    reversed_by UUID REFERENCES jcir_users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_jcir_settings_updated_at ON jcir_settings;
CREATE TRIGGER update_jcir_settings_updated_at BEFORE UPDATE ON jcir_settings FOR EACH ROW EXECUTE FUNCTION update_jcir_updated_at_column();

DROP TRIGGER IF EXISTS update_jcir_receipts_updated_at ON jcir_receipts;
CREATE TRIGGER update_jcir_receipts_updated_at BEFORE UPDATE ON jcir_receipts FOR EACH ROW EXECUTE FUNCTION update_jcir_updated_at_column();
