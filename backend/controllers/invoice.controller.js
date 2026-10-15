const pool = require('../config/db');

const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JC-INV-${dateStr}-${randomSuffix}`;
};

const generatePaymentReceiptNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `JC-RCP-${dateStr}-${randomSuffix}`;
};

const generateReferenceNumber = (method) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'TRF';
  if (method === 'Cash') prefix = 'CSH';
  if (method === 'POS') prefix = 'POS';
  if (method === 'Cheque') prefix = 'CHQ';
  return `${prefix}-${dateStr}-${randomSuffix}`;
};

exports.getInvoices = async (req, res) => {
  try {
    await pool.query(
      `UPDATE jcir_invoices 
       SET status = 'Overdue' 
       WHERE due_date < CURRENT_DATE AND status IN ('Issued', 'Partially Paid')`
    );

    const result = await pool.query(
      `SELECT i.*, c.company_name, c.email as client_email 
       FROM jcir_invoices i 
       JOIN jcir_clients c ON i.client_id = c.id 
       ORDER BY i.created_at DESC`
    );
    res.json({ invoices: result.rows });
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invRes = await pool.query(
      `SELECT i.*, c.company_name, c.contact_person, c.email as client_email, c.phone, c.address
       FROM jcir_invoices i 
       JOIN jcir_clients c ON i.client_id = c.id 
       WHERE i.id = $1`,
      [id]
    );

    if (invRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const itemsRes = await pool.query(
      'SELECT * FROM jcir_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC',
      [id]
    );

    const paymentsRes = await pool.query(
      'SELECT * FROM jcir_payments WHERE invoice_id = $1 ORDER BY payment_date DESC',
      [id]
    );

    res.json({ invoice: invRes.rows[0], items: itemsRes.rows, payments: paymentsRes.rows });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ error: 'Failed to fetch invoice.' });
  }
};

exports.createInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { client_id, quotation_id, issue_date, due_date, items, discount_amount = 0, additional_charges = 0, notes, terms_conditions, status = 'Issued' } = req.body;

    if (!client_id || !due_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Client, due date, and line items are required.' });
    }

    let subtotal = 0;
    const computedItems = items.map((item, index) => {
      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const totalPrice = qty * unitPrice;
      subtotal += totalPrice;
      return {
        description: item.description,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        sort_order: index,
      };
    });

    const disc = parseFloat(discount_amount) || 0;
    const addCharges = parseFloat(additional_charges) || 0;
    const totalAmount = subtotal - disc + addCharges;
    const invoiceNumber = generateInvoiceNumber();

    const invRes = await client.query(
      `INSERT INTO jcir_invoices 
       (invoice_number, quotation_id, client_id, status, issue_date, due_date, subtotal, discount_amount, additional_charges, total_amount, amount_paid, outstanding_balance, notes, terms_conditions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0.00, $10, $11, $12) RETURNING *`,
      [invoiceNumber, quotation_id || null, client_id, status, issue_date || new Date(), due_date, subtotal, disc, addCharges, totalAmount, notes, terms_conditions]
    );

    const newInvoice = invRes.rows[0];

    for (const item of computedItems) {
      await client.query(
        `INSERT INTO jcir_invoice_items (invoice_id, description, quantity, unit_price, total_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newInvoice.id, item.description, item.quantity, item.unit_price, item.total_price, item.sort_order]
      );
    }

    if (quotation_id) {
      await client.query("UPDATE jcir_quotations SET status = 'Converted' WHERE id = $1", [quotation_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ invoice: newInvoice, message: 'Invoice issued successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice.' });
  } finally {
    client.release();
  }
};

exports.addPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { amount_paid, payment_date, payment_method, reference_number, notes } = req.body;

    const paymentVal = parseFloat(amount_paid);
    if (isNaN(paymentVal) || paymentVal <= 0) {
      return res.status(400).json({ error: 'Valid positive payment amount required.' });
    }

    const invRes = await client.query('SELECT * FROM jcir_invoices WHERE id = $1 FOR UPDATE', [id]);
    if (invRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const invoice = invRes.rows[0];
    if (invoice.status === 'Cancelled' || invoice.status === 'Paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Cannot record payment for an invoice with status '${invoice.status}'.` });
    }

    const newAmountPaid = parseFloat(invoice.amount_paid) + paymentVal;
    const newOutstanding = parseFloat(invoice.total_amount) - newAmountPaid;
    const newStatus = newOutstanding <= 0 ? 'Paid' : 'Partially Paid';

    const method = payment_method || 'Bank Transfer';
    const refNo = reference_number && reference_number.trim() !== '' ? reference_number : generateReferenceNumber(method);

    // 1. Record payment with auto-generated reference
    const paymentInsertRes = await client.query(
      `INSERT INTO jcir_payments (invoice_id, amount_paid, payment_date, payment_method, reference_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, paymentVal, payment_date || new Date(), method, refNo, notes]
    );
    const newPaymentId = paymentInsertRes.rows[0].id;

    // 2. Automatically generate receipt linked to payment and invoice
    await client.query(
      `INSERT INTO jcir_receipts 
       (receipt_number, payment_id, client_id, invoice_id, amount_received, payment_method, reference_number, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Issued')`,
      [
        generatePaymentReceiptNumber(),
        newPaymentId,
        invoice.client_id,
        id,
        paymentVal,
        method,
        refNo,
        `Payment received for Invoice #${invoice.invoice_number}`
      ]
    );

    // 3. Update invoice financial state
    const updatedInv = await client.query(
      `UPDATE jcir_invoices
       SET amount_paid = $1, outstanding_balance = $2, status = $3
       WHERE id = $4 RETURNING *`,
      [newAmountPaid, newOutstanding < 0 ? 0 : newOutstanding, newStatus, id]
    );

    await client.query('COMMIT');
    res.json({ invoice: updatedInv.rows[0], message: 'Payment recorded and official receipt generated successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment.' });
  } finally {
    client.release();
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE jcir_invoices SET status = 'Cancelled' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }
    res.json({ invoice: result.rows[0], message: 'Invoice marked as cancelled.' });
  } catch (err) {
    console.error('Cancel invoice error:', err);
    res.status(500).json({ error: 'Failed to cancel invoice.' });
  }
};