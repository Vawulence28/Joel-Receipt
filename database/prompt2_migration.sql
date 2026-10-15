-- Prompt 2 Migration: Business Documents & Management

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS jcir_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jcir_clients_email ON jcir_clients(email);
CREATE INDEX IF NOT EXISTS idx_jcir_clients_name ON jcir_clients(company_name);

-- 2. Quotations Table
CREATE TABLE IF NOT EXISTS jcir_quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES jcir_clients(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Rejected', 'Converted', 'Expired')),
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    additional_charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    terms_conditions TEXT,
    public_token_hash VARCHAR(255),
    is_public_active BOOLEAN DEFAULT FALSE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jcir_quotations_client_id ON jcir_quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_jcir_quotations_number ON jcir_quotations(quotation_number);

-- 3. Quotation Line Items Table
CREATE TABLE IF NOT EXISTS jcir_quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES jcir_quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    sort_order INT DEFAULT 0
);

-- 4. Quotation Revision History
CREATE TABLE IF NOT EXISTS jcir_quotation_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES jcir_quotations(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_by UUID REFERENCES jcir_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS jcir_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES jcir_quotations(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES jcir_clients(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    additional_charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jcir_invoices_client_id ON jcir_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_jcir_invoices_number ON jcir_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_jcir_invoices_status ON jcir_invoices(status);

-- 6. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS jcir_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES jcir_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    sort_order INT DEFAULT 0
);

-- 7. Invoice Payments Table
CREATE TABLE IF NOT EXISTS jcir_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES jcir_invoices(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
CREATE TRIGGER update_jcir_clients_updated_at BEFORE UPDATE ON jcir_clients FOR EACH ROW EXECUTE FUNCTION update_jcir_updated_at_column();
CREATE TRIGGER update_jcir_quotations_updated_at BEFORE UPDATE ON jcir_quotations FOR EACH ROW EXECUTE FUNCTION update_jcir_updated_at_column();
CREATE TRIGGER update_jcir_invoices_updated_at BEFORE UPDATE ON jcir_invoices FOR EACH ROW EXECUTE FUNCTION update_jcir_updated_at_column();