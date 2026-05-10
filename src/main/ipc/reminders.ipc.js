import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const reminers = () => {
  ipcMain.handle('add-reminder', async (event, payload) => {
    const data = payload
    if (!payload) return { success: false, message: 'No data provided' }

    try {
      const info = db
        .prepare(
          `
        INSERT INTO reminders (
          is_active,
          date,
          invoice_id,
          customer_id,

          customer,
          invoice,

          level,
          sent_method,
          proof_type,

          reminder_fee,
          late_interest,

          payment_deadline,

          intro_text,
          warning_text,
          closing_text,
          
          cancelled_at,
          cancelled_by,
          cancellation_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          data.is_active ? 1 : 0,
          data.date,

          data.invoice_id,
          data.customer_id,

          JSON.stringify(data.customer),
          JSON.stringify(data.invoice),

          data.level,
          data.sent_method,
          data.proof_type,

          data.reminder_fee,
          data.late_interest,

          data.payment_deadline,

          data.intro_text,
          data.warning_text,
          data.closing_text,

          data.cancelled_at,
          data.cancelled_by,
          data.cancellation_reason
        )

      if (info.lastInsertRowid) {
        db.prepare('UPDATE invoices SET is_reminded = 1 WHERE id = ?').run(data.invoice_id)
      }
      return { success: true, last_id: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-reminders', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
        SELECT * FROM reminders ORDER BY id DESC LIMIT ?
      `
        )
        .all(limit)

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-reminder-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const rows = db
        .prepare(
          `
          SELECT *
          FROM reminders
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

  ipcMain.handle('cancel-reminder-by-id', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No id provided' }
    }
    try {
      db.transaction(() => {
        const { id, invoice_id, cancelled_at, cancelled_by, cancellation_reason } = payload

        db.prepare(
          `
            UPDATE reminders
            SET is_active = 0,
                cancelled_at = ?,
                cancelled_by = ?,
                cancellation_reason = ?
            WHERE id = ?
          `
        ).run(cancelled_at, cancelled_by, cancellation_reason, id)

        const hasActiveReminder = db
          .prepare(
            `
            SELECT 1
            FROM reminders
            WHERE invoice_id = ?
              AND is_active = 1
              AND id != ?
            LIMIT 1
          `
          )
          .get(invoice_id, id)

        if (!hasActiveReminder) {
          db.prepare(
            `
            UPDATE invoices
            SET is_reminded = 0
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

  ipcMain.handle('filter-reminders-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const category = payload
      let query = ''
      let rows = []
      const limit = 50
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM reminders`).get().total
      switch (category) {
        case 'all':
          query = `
          SELECT *
          FROM reminders
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'pending':
          query = `
          SELECT *
          FROM reminders
          WHERE sent_method IS NULL
          AND cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'sent':
          query = `
          SELECT *
          FROM reminders
          WHERE sent_method IS NOT NULL
          AND cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'cancelled':
          query = `
          SELECT *
          FROM reminders
          WHERE cancelled_at IS NOT NULL
          ORDER BY cancelled_at DESC
          LIMIT ?
        `
          break

        case 'level_1':
          query = `
          SELECT *
          FROM reminders
          WHERE level = 1
          AND cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'level_2':
          query = `
          SELECT *
          FROM reminders
          WHERE level = 2
          AND cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'level_3':
          query = `
          SELECT *
          FROM reminders
          WHERE level = 3
          AND cancelled_at IS NULL
          ORDER BY date DESC
          LIMIT ?
        `
          break

        case 'overdue':
          query = `
          SELECT *
          FROM reminders
          WHERE payment_deadline < date('now')
          AND cancelled_at IS NULL
          ORDER BY payment_deadline ASC
          LIMIT ?
        `
          break

        default:
          query = `
          SELECT *
          FROM reminders
          ORDER BY date DESC
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

  ipcMain.handle('filter-reminders-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      const { start, end } = payload
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM reminders`).get().total
      const rows = db
        .prepare(
          `SELECT *
        FROM reminders
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

  ipcMain.handle('search-reminders', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM reminders`).get().total
      if (isNaN(term) && !term.includes('-')) {
        rows = db
          .prepare(
            `SELECT *
          FROM reminders
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
            FROM reminders
            WHERE id BETWEEN ? AND ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(start, end, limit)
        } else {
          rows = db
            .prepare(
              `SELECT * FROM reminders
            WHERE is_active = 1 AND (id = ? OR customer_id = ?)
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

export default reminers