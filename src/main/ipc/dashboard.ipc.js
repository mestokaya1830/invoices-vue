import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const dashboard = () => {
  ipcMain.handle('get-dashboard-chart', (event, payload) => {
    // Better-sqlite3 sync query
    function queryDatabase(query) {
      try {
        return db.prepare(query).all()
      } catch (err) {
        console.error('DB query error:', err.message)
        return []
      }
    }

    // Format monthly/weekly data, 0 değerleri önceki değere doldurur
    function formatMonthlyData(data, monthCount) {
      const monthNames = [
        'Jan',
        'Feb',
        'Mär',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez'
      ]
      const labels = [],
        values = []
      const dataMap = {}

      data.forEach((row) => {
        dataMap[row.month_key] = row.revenue ? parseFloat(row.revenue.toFixed(2)) : 0
      })

      const now = new Date()
      let lastValue = 0
      for (let i = monthCount - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthLabel = monthNames[date.getMonth()]
        labels.push(monthLabel)

        let val = dataMap[monthKey] || 0
        if (val === 0) val = lastValue // eksik ayları önceki değer ile doldur
        values.push(val)
        lastValue = val
      }

      return { labels, values }
    }
    try {
      const period = payload
      let query,
        labels = [],
        values = []
      let data, result

      switch (period) {
        case '1M':
          query = `
          WITH weeks AS (
            SELECT 
              CAST((julianday('now') - julianday(date)) / 7 AS INTEGER) AS week_ago,
              SUM(gross_total) AS revenue
            FROM invoices
            WHERE is_active = 1
              AND date >= date('now', '-1 month')
              AND payment_status IN ('paid', 'partially_paid')
            GROUP BY week_ago
            ORDER BY week_ago DESC
          )
          SELECT * FROM weeks WHERE week_ago < 4
        `
          data = queryDatabase(query)
          labels = ['1. Woche', '2. Woche', '3. Woche', '4. Woche']
          values = [0, 0, 0, 0]
          data.forEach((row) => {
            const index = 3 - row.week_ago
            if (index >= 0 && index < 4)
              values[index] = row.revenue ? parseFloat(row.revenue.toFixed(2)) : 0
          })
          break

        case '3M':
          query = `
          SELECT strftime('%Y-%m', date) AS month_key, SUM(gross_total) AS revenue
          FROM invoices
          WHERE is_active = 1
            AND date >= date('now', '-3 months')
            AND payment_status IN ('paid', 'partially_paid')
          GROUP BY month_key
          ORDER BY month_key ASC
        `
          data = queryDatabase(query)
          result = formatMonthlyData(data, 3)
          labels = result.labels
          values = result.values
          break

        case '6M':
          query = `
          SELECT strftime('%Y-%m', date) AS month_key, SUM(gross_total) AS revenue
          FROM invoices
          WHERE is_active = 1
            AND date >= date('now', '-6 months')
            AND payment_status IN ('paid', 'partially_paid')
          GROUP BY month_key
          ORDER BY month_key ASC
        `
          data = queryDatabase(query)
          result = formatMonthlyData(data, 6)
          labels = result.labels
          values = result.values
          break

        case '1J':
          query = `
          SELECT strftime('%Y-%m', date) AS month_key, SUM(gross_total) AS revenue
          FROM invoices
          WHERE is_active = 1
            AND date >= date('now', '-1 year')
            AND payment_status IN ('paid', 'partially_paid')
          GROUP BY month_key
          ORDER BY month_key ASC
        `
          data = queryDatabase(query)
          result = formatMonthlyData(data, 12)
          labels = result.labels
          values = result.values
          break

        default:
          return { success: false, message: 'Ungültiger Zeitraum' }
      }

      // --- Status counts hesapla ---
      const statusCountsQuery = `
      SELECT
        SUM(CASE WHEN payment_status='paid' THEN 1 ELSE 0 END) AS paid_count,
        SUM(CASE WHEN payment_status='partially_paid' THEN 1 ELSE 0 END) AS partially_paid_count,
        SUM(CASE WHEN payment_status='unpaid' THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN payment_status='overdue' THEN 1 ELSE 0 END) AS overdue_count
      FROM invoices
      WHERE is_active = 1
    `
      const counts = queryDatabase(statusCountsQuery)[0] || {
        paid_count: 0,
        partially_paid_count: 0,
        unpaid_count: 0,
        overdue_count: 0
      }

      // --- Sonuçları frontend’e döndür ---
      return {
        success: true,
        rows: {
          labels,
          values,
          paid_count: counts.paid_count,
          partially_paid_count: counts.partially_paid_count,
          unpaid_count: counts.unpaid_count,
          overdue_count: counts.overdue_count
        }
      }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-dashboard', async () => {
    try {
      const rows = db.transaction(() => {
        return {
          customers: db
            .prepare('SELECT COUNT(id) AS count FROM customers WHERE is_active = 1')
            .get().count,
          invoices: db.prepare('SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1').get()
            .count,
          offers: db.prepare('SELECT COUNT(id) AS count FROM offers WHERE is_active = 1').get()
            .count,
          orders: db.prepare('SELECT COUNT(id) AS count FROM orders  WHERE is_active = 1').get()
            .count,
          paid_count: db
            .prepare(
              "SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1 AND payment_status = 'paid'"
            )
            .get().count,
          unpaid_count: db
            .prepare(
              "SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1 AND payment_status = 'unpaid'"
            )
            .get().count,
          partially_paid_count: db
            .prepare(
              "SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1 AND payment_status = 'partially_paid'"
            )
            .get().count,
          overdue_count: db
            .prepare(
              "SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1 AND payment_status = 'overdue'"
            )
            .get().count
        }
      })()

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-latest-activities', async () => {
    try {
      const lastCustomer = db
        .prepare(
          `
        SELECT created_at, company_name, full_name, email, phone
        FROM customers WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1
    `
        )
        .get()
      const lastInvoice = db
        .prepare(
          `
        SELECT created_at, id, customer_id
        FROM invoices WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1
    `
        )
        .get()
      const lastPaidInvoice = db
        .prepare(
          `
        SELECT created_at, id, customer_id
            FROM invoices WHERE is_active = 1 AND payment_status IN ('paid', 'partially_paid')
            ORDER BY id DESC
        LIMIT 1 
    `
        )
        .get()
      const lastOverdueInvoice = db
        .prepare(
          `
        SELECT created_at, id, customer_id, due_date
        FROM invoices WHERE is_active = 1 AND payment_status = 'unpaid'
        ORDER BY id DESC
        LIMIT 1
    `
        )
        .get()
      const lastOffer = db
        .prepare(
          `
        SELECT created_at, id, customer_id
        FROM offers WHERE is_active = 1 AND status = 'open'
        ORDER BY id DESC
        LIMIT 1
    `
        )
        .get()
      const lastOrder = db
        .prepare(
          `
        SELECT created_at, id, customer_id
        FROM orders WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1
    `
        )
        .get()

      const rows = {
        lastCustomer,
        lastInvoice,
        lastPaidInvoice,
        lastOverdueInvoice,
        lastOffer,
        lastOrder
      }
      return { success: true, rows }
    } catch (err) {
      return { success: false, message: err.message }
    }
  })
}

export default dashboard