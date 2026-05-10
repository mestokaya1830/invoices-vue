import 'dotenv/config'
import { app, ipcMain } from 'electron'
import path from 'path'
import db from '../../db/sqliteConn.js'
import fs from 'fs'

const dashboard = () => {
  ipcMain.handle('add-invoice', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const invoice = payload
      const info = db
        .prepare(
          `
        INSERT INTO invoices (
          customer_id,
          customer,
          is_active,
          service_date,
          date,
          due_date,
          currency,
          payment_terms,
          payment_conditions,
          early_payment_offer,
          early_payment_discount,
          early_payment_percentage,
          early_payment_days,
          early_payment_deadline,
          early_paid_discount_applied,
          paid_at,
          is_small_company,
          is_reverse_charge,
          is_eu_delivery,
          positions,
          net_total,
          vat_total,
          gross_total,
          gross_total_after_discount,
          payment_status,
          cancelled_at,
          cancelled_by,
          cancellation_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          invoice.customer_id,
          JSON.stringify(invoice.customer) || '{}',
          invoice.is_active || 1,
          invoice.service_date,
          invoice.date,
          invoice.due_date,
          invoice.currency,
          invoice.payment_terms,
          invoice.payment_conditions || '',
          invoice.early_payment_offer ? 1 : 0,
          invoice.early_payment_discount || 0,
          invoice.early_payment_percentage || 0,
          invoice.early_payment_days || 0,
          invoice.early_payment_deadline || null,
          invoice.early_paid_discount_applied ? 1 : 0,
          invoice.paid_at || null,
          invoice.is_small_company ? 1 : 0,
          invoice.is_reverse_charge ? 1 : 0,
          invoice.is_eu_delivery ? 1 : 0,
          JSON.stringify(invoice.positions || []),
          invoice.net_total || 0,
          invoice.vat_total || 0,
          invoice.gross_total || 0,
          invoice.gross_total_after_discount || 0,
          invoice.payment_status || 'unpaid',
          invoice.cancelled_at || '',
          invoice.cancelled_by || '',
          invoice.cancellation_reason || ''
        )

      return { success: true, last_id: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('save-invoice-pdf', (event, { buffer, fileName }) => {
    try {
      // const savePath = '/media/username/USB/invoice-pdfs'
      // const savePath = path.join(app.getPath('userData'), 'pdf-storage')// in home->username-> .config folder
      const savePath = path.join(app.getPath('downloads'), `invoice-pdfs`)
      if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true })

      const filePath = path.join(savePath, `${fileName}.pdf`)
      if (fs.existsSync(filePath)) {
        return { success: false, message: 'file already exists' }
      }
      fs.writeFileSync(filePath, Buffer.from(buffer))

      return { success: true, filePath }
    } catch (err) {
      console.error('PDF Error:', err)
    }
  })

  ipcMain.handle('get-invoices', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
          SELECT id, date, due_date, paid_at, gross_total, gross_total_after_discount, is_active, payment_status, customer
          FROM invoices 
          WHERE is_active = 1 AND payment_status != 'paid'
          ORDER BY id DESC
          LIMIT ?
        `
        )
        .all(limit)

      const total = db
        .prepare(
          `SELECT COUNT(id) As total FROM invoices WHERE is_active = 1 AND payment_status != 'paid'`
        )
        .get().total
      return { success: true, rows, total }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-invoice-by-id', async (event, payload) => {
    const { id, table_name } = payload
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      //from invoices details
      if (table_name === 'invoices') {
        const rows = db
          .prepare(
            `
            SELECT *
            FROM invoices
            WHERE id = ?
          `
          )
          .get(id)

        const payments = db
          .prepare(
            `
            SELECT *
            FROM payments
            WHERE invoice_id = ? AND is_active = 1 ORDER BY id DESC
          `
          )
          .all(id)
        const payment_total =
          db
            .prepare(
              `SELECT sum(payment_amount) As total FROM payments WHERE invoice_id = ? AND is_active = 1`
            )
            .get(id)?.total ?? 0

        const reminders = db
          .prepare(
            `
            SELECT id, date, payment_deadline
            FROM reminders
            WHERE invoice_id = ? AND is_active = 1 ORDER BY id DESC
          `
          )
          .all(id)
        return { success: true, rows, payments, payment_total, reminders }
      }

      //from payments create
      if (table_name === 'payments') {
        let rows = db
          .prepare(
            `
            SELECT id, customer_id, date, due_date, gross_total, gross_total_after_discount, early_payment_offer, early_payment_days, early_payment_discount, early_paid_discount_applied, currency, payment_status
            FROM invoices
            WHERE id = ? AND is_active = 1
          `
          )
          .get(id)
        const payment_id =
          db.prepare(`SELECT id FROM payments As id ORDER BY id DESC LIMIT 1;`).get()?.id ?? 0

        const payment_total =
          db
            .prepare(
              `SELECT sum(payment_amount) As total FROM payments WHERE is_active = 1 AND invoice_id = ?`
            )
            .get(id)?.total ?? 0
        return { success: true, rows, payment_id, payment_total }
      }

      //from reminders create
      if (table_name === 'reminders') {
        let rows = db
          .prepare(
            `
            SELECT id, customer_id, date, due_date, paid_at, gross_total, gross_total_after_discount, early_payment_offer, early_payment_days, early_payment_percentage, early_payment_discount, currency, payment_status, customer
            FROM invoices
            WHERE id = ?
          `
          )
          .get(id)
        const reminder_id =
          db.prepare(`SELECT * FROM reminders ORDER BY id DESC LIMIT 1`).get()?.id ?? 0
        return { success: true, rows, reminder_id }
      }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-invoice', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const { id, is_active, cancelled_at, cancellation_reason, cancelled_by } = payload
      db.prepare(
        `Update invoices Set is_active = ?, cancelled_at =?, cancellation_reason = ?, cancelled_by = ? WHERE id = ?`
      ).run(is_active, cancelled_at, cancellation_reason, cancelled_by, id)
      return { success: true }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('flter-invoices-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const category = payload
      let query = ''
      let rows = []
      let limit = 50
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM invoices`).get().total
      switch (category) {
        case 'all':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, gross_total_after_discount,
                 is_active, payment_status, early_payment_offer, early_paid_discount_applied,
                 cancelled_at, customer
          FROM invoices
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'active':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, gross_total_after_discount,
                 is_active, payment_status, early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1 AND payment_status != 'paid'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'canceled':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, gross_total_after_discount,
                 is_active, payment_status, early_payment_offer, early_paid_discount_applied,
                 cancelled_at, customer
          FROM invoices
          WHERE is_active = 0
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'is_paid':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1 AND payment_status = 'paid'
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'is_partially_paid':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1 AND payment_status = 'partially_paid'
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'unpaid':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1 AND payment_status = 'unpaid'
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'overdue':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1
            AND payment_status = 'unpaid'
            AND DATE(due_date, 'localtime') < DATE('now', 'localtime')
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'is_early_paid':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1
            AND payment_status = 'paid'
            AND DATE(paid_at, 'localtime') < DATE(due_date, 'localtime')
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'is_late_paid':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1
            AND payment_status = 'paid'
            AND DATE(paid_at, 'localtime') > DATE(due_date, 'localtime')
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'outstanding':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1
            AND (payment_status = 'unpaid' OR payment_status = 'overdue')
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        case 'is_reminded':
          query = `
          SELECT id, date, due_date, paid_at, gross_total, is_active, payment_status,
                 early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE is_active = 1 AND is_reminded = 1
          ORDER BY updated_at DESC
          LIMIT ?
        `
          break

        default:
          query = `
          SELECT *
          FROM invoices
          WHERE is_active = 1 AND payment_status != 'paid'
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

  ipcMain.handle('search-invoices', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM invoices`).get().total

      if (isNaN(term) && !term.includes('-')) {
        rows = db
          .prepare(
            `SELECT 
            id, date, due_date, paid_at, gross_total, gross_total_after_discount,
            is_active, payment_status, early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE (
            json_extract(customer, '$.first_name') LIKE '${term}%'
            OR json_extract(customer, '$.last_name') LIKE '${term}%'
            OR json_extract(customer, '$.company_name') LIKE '${term}%'
          )
          ORDER BY id DESC
          LIMIT ?`
          )
          .all(limit)
      } else if (isNaN(term) && term.includes('-')) {
        const [start, end] = term.split('-').map((item) => parseInt(item.replace(/\D/g, ''), 10))

        rows = db
          .prepare(
            `SELECT id, date, due_date, gross_total, gross_total_after_discount,
            is_active, payment_status, early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE id BETWEEN ? AND ?
          ORDER BY id DESC LIMIT ?`
          )
          .all(start, end, limit)
      } else {
        rows = db
          .prepare(
            `SELECT id, date, due_date, gross_total, gross_total_after_discount,
            is_active, payment_status, early_payment_offer, early_paid_discount_applied, customer
          FROM invoices
          WHERE id = ? OR customer_id = ?
          ORDER BY id DESC LIMIT ?`
          )
          .all(term, term, limit)
      }

      return { success: true, rows, total_count }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('filter-invoices-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const limit = 50
      const { start, end } = payload

      const total_count = db.prepare(`SELECT COUNT(id) as total FROM invoices`).get().total

      const rows = db
        .prepare(
          `SELECT 
          id,
          date,
          due_date,
          gross_total,
          gross_total_after_discount,
          is_active,
          payment_status,
          early_payment_offer,
          early_paid_discount_applied,
          customer
        FROM invoices
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
}

export default dashboard
