import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const payments = () => {
  ipcMain.handle('add-payment', async (event, payload) => {
    if (!payload) return { success: false, message: 'No data provided' }

    try {
      const payment = payload

      const info = db
        .prepare(
          `
        INSERT INTO payments (
          is_active,
          date,

          invoice_id,
          customer_id,

          payment_amount,
          payment_method,
          payment_reference,

          counterparty_name,
          counterparty_iban,
          counterparty_bic,
          counterparty_bank,

          cancelled_at,
          cancelled_by,
          cancellation_reason,

          notes,
          images,

          invoice
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `
        )
        .run(
          payment.is_active ? 1 : 0,
          payment.date,

          payment.invoice_id,
          payment.customer_id,

          payment.payment_amount,
          payment.payment_method,
          payment.payment_reference ?? '',

          payment.counterparty_name ?? '',
          payment.counterparty_iban ?? '',
          payment.counterparty_bic ?? '',
          payment.counterparty_bank ?? '',

          payment.cancelled_at ?? '',
          payment.cancelled_by ?? '',
          payment.cancellation_reason ?? '',

          payment.notes ?? '',
          payment.images ?? '',

          JSON.stringify(payment.invoice)
        )
      db.prepare(
        'UPDATE invoices SET payment_status = ?, paid_at = ?, early_paid_discount_applied = ? WHERE id = ?'
      ).run(
        payment.invoice.payment_status,
        payment.date,
        payment.invoice.early_paid_discount_applied ? 1 : 0,
        payment.invoice.id
      )

      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-payments', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
        SELECT * FROM payments ORDER BY id DESC LIMIT ?
      `
        )
        .all(limit)

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-payment-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const rows = db
        .prepare(
          `
          SELECT *
          FROM payments
          WHERE id = ? AND is_active = 1
        `
        )
        .get(id)

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-payment-by-id', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No id provided' }
    }
    try {
      db.transaction(() => {
        const { id, invoice_id, cancelled_at, cancelled_by, cancellation_reason } = payload

        db.prepare(
          `
            UPDATE payments
            SET is_active = 0,
                cancelled_at = ?,
                cancelled_by = ?,
                cancellation_reason = ?
            WHERE id = ?
          `
        ).run(cancelled_at, cancelled_by, cancellation_reason, id)

        const hasActivePayment = db
          .prepare(
            `
            SELECT 1
            FROM payments
            WHERE invoice_id = ?
              AND is_active = 1
              AND id != ?
            LIMIT 1
          `
          )
          .get(invoice_id, id)

        if (!hasActivePayment) {
          db.prepare(
            `
            UPDATE invoices
            SET payment_status = 'unpaid'
            WHERE id = ?
          `
          ).run(invoice_id)
        }
      })()

      return { success: true }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('filter-payments-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const category = payload
      let query = ''
      let rows = []
      const limit = 50
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM payments`).get().total
      switch (category) {
        case 'all':
          query = `
          SELECT *
          FROM payments
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'received':
          query = `
          SELECT *
          FROM payments
          WHERE cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'cancelled':
          query = `
          SELECT *
          FROM payments
          WHERE cancelled_at IS NOT NULL
          ORDER BY cancelled_at DESC
          LIMIT ?
        `
          break

        case 'today':
          query = `
          SELECT *
          FROM payments
          WHERE date = date('now')
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'this_month':
          query = `
          SELECT *
          FROM payments
          WHERE strftime('%Y-%m', date) = strftime('%Y-%m','now')
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'bank_transfer':
          query = `
          SELECT *
          FROM payments
          WHERE payment_method = 'bank_transfer'
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'cash':
          query = `
          SELECT *
          FROM payments
          WHERE payment_method = 'cash'
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'card':
          query = `
          SELECT *
          FROM payments
          WHERE payment_method = 'card'
          ORDER BY date DESC
          LIMIT ?
        `
          break

        default:
          query = `
          SELECT *
          FROM payments
          ORDER BY id DESC
          LIMIT ?
        `
      }

      rows = db.prepare(query).all(limit)

      return { success: true, rows, total_count }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('filter-payments-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      const { start, end } = payload
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM payments`).get().total
      const rows = db
        .prepare(
          `SELECT *
        FROM payments
        WHERE date BETWEEN ? AND ?
        ORDER BY id DESC
        LIMIT ?;`
        )
        .all(start, end, limit)
      return { success: true, rows, total_count }
    } catch (error) {
      console.error('dateFilter error:', error)
      return { success: false, message: error.message }
    }
  })

  ipcMain.handle('search-payments', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM payments`).get().total
      if (isNaN(term) && !term.includes('-')) {
        rows = db
          .prepare(
            `SELECT *
          FROM payments
          WHERE(
                  json_extract(customer, '$.first_name') LIKE '${term}%'
                  OR json_extract(customer, '$.last_name') LIKE '${term}%'
                  OR json_extract(customer, '$.company_name') LIKE '${term}%'
                )
          ORDER BY id DESC
          LIMIT ?`
          )
          .all(limit)
      } else {
        if (isNaN(term) && term.includes('-')) {
          const [start, end] = term.split('-').map((item) => parseInt(item.replace(/\D/g, ''), 10))

          rows = db
            .prepare(
              `SELECT *
            FROM payments
            WHERE id BETWEEN ? AND ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(start, end, limit)
        } else {
          rows = db
            .prepare(
              `SELECT * FROM payments
            WHERE (id = ? OR customer_id = ?)
            ORDER BY id DESC LIMIT ?`
            )
            .all(term, term, limit)
        }
      }
      return { success: true, rows, total_count }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })
}

export default payments
