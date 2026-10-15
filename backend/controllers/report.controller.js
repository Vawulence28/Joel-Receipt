const pool = require('../config/db');

exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let invoiceWhere = "status != 'Cancelled'";
    let paymentWhere = "1=1";
    let queryParams = [];

    if (startDate && endDate) {
      invoiceWhere = "status != 'Cancelled' AND created_at BETWEEN $1 AND $2";
      paymentWhere = "created_at BETWEEN $1 AND $2";
      queryParams.push(startDate, endDate);
    }

    const summaryRes = await pool.query(
      `SELECT 
         (SELECT COALESCE(SUM(total_amount), 0) FROM jcir_invoices WHERE ${invoiceWhere}) as total_invoiced,
         (SELECT COALESCE(SUM(amount_paid), 0) FROM jcir_payments WHERE ${paymentWhere}) as total_received,
         (SELECT COALESCE(SUM(outstanding_balance), 0) FROM jcir_invoices WHERE status IN ('Issued', 'Partially Paid', 'Overdue')) as total_outstanding,
         (SELECT COUNT(*) FROM jcir_clients) as total_clients`,
      queryParams
    );

    const clientReportsRes = await pool.query(
      `SELECT c.id, c.company_name, c.email,
              COUNT(DISTINCT i.id) as invoice_count,
              COALESCE(SUM(i.total_amount), 0) as total_invoiced,
              COALESCE(SUM(i.amount_paid), 0) as total_paid,
              COALESCE(SUM(i.outstanding_balance), 0) as total_outstanding
       FROM jcir_clients c
       LEFT JOIN jcir_invoices i ON c.id = i.client_id AND i.status != 'Cancelled'
       GROUP BY c.id, c.company_name, c.email
       ORDER BY total_invoiced DESC`
    );

    res.json({
      summary: summaryRes.rows[0],
      clientReports: clientReportsRes.rows,
    });
  } catch (err) {
    console.error('Financial report error:', err);
    res.status(500).json({ error: 'Failed to generate financial report.' });
  }
};