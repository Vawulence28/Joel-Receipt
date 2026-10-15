const pool = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalInvoicedRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM jcir_invoices WHERE status != 'Cancelled'");
    const totalReceivedRes = await pool.query("SELECT COALESCE(SUM(amount_paid), 0) as total FROM jcir_invoices WHERE status != 'Cancelled'");
    const outstandingRes = await pool.query("SELECT COALESCE(SUM(outstanding_balance), 0) as total FROM jcir_invoices WHERE status IN ('Issued', 'Partially Paid', 'Overdue')");
    const overdueRes = await pool.query("SELECT COALESCE(SUM(outstanding_balance), 0) as total FROM jcir_invoices WHERE status = 'Overdue' OR (due_date < CURRENT_DATE AND status IN ('Issued', 'Partially Paid'))");
    const clientCountRes = await pool.query("SELECT COUNT(*) as count FROM jcir_clients");

    const recentInvoicesRes = await pool.query(
      `SELECT i.id, i.invoice_number, i.total_amount, i.outstanding_balance, i.status, i.due_date, c.company_name
       FROM jcir_invoices i
       JOIN jcir_clients c ON i.client_id = c.id
       ORDER BY i.created_at DESC LIMIT 5`
    );

    res.json({
      summary: {
        totalInvoiced: parseFloat(totalInvoicedRes.rows[0].total),
        totalReceived: parseFloat(totalReceivedRes.rows[0].total),
        outstandingBalance: parseFloat(outstandingRes.rows[0].total),
        overdueAmount: parseFloat(overdueRes.rows[0].total),
        totalClients: parseInt(clientCountRes.rows[0].count),
      },
      recentInvoices: recentInvoicesRes.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary.' });
  }
};