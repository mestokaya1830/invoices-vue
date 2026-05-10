import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const offers = () => {
  ipcMain.handle('add-offer', async (event, data) => {
    if (!data) return { success: false, message: 'No data provided' }

    try {
      const info = db
        .prepare(
          `
        INSERT INTO offers (
          customer_id,

          date,
          valid_until,

          customer,

          subject,
          currency,
          payment_terms,
          delivery_terms,
          delivery_time,

          positions,
          net_total,
          vat_total,
          gross_total,

          status,
          is_active,
          is_legal,

          introduction_text,
          closing_text,
          notes,
          
          internal_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          data.customer_id,

          data.date,
          data.valid_until || null,

          JSON.stringify(data.customer || {}),

          data.subject,
          data.currency,
          data.payment_terms || '',
          data.delivery_terms || '',
          data.delivery_time || '',

          JSON.stringify(data.positions || []),
          data.net_total || 0,
          data.vat_total || 0,
          data.gross_total || 0,

          data.status || 'draft',
          data.is_active ? 1 : 0,
          data.is_legal ? 1 : 0,

          data.introduction_text || '',
          data.closing_text || '',
          data.notes || '',

          data.internal_notes || ''
        )

      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-offers', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
          SELECT id, date, valid_until, status, customer, is_active
          FROM offers
          WHERE is_active = 1
          ORDER BY id DESC
          LIMIT ?
        `
        )
        .all(limit)
      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-offer-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const rows = db
        .prepare(
          `
          SELECT *
          FROM offers
          WHERE id = ?
        `
        )
        .get(id)

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-offer-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No id provided' }
    }
    try {
      const info = db.prepare('UPDATE offers SET is_active = 0 WHERE id = ?').run(id)
      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-offer-by-status', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const rows = db
        .prepare(
          `
          SELECT id, date, status, status_by, status_comments
          FROM offers
          WHERE id = ?
        `
        )
        .get(id)

      return { success: true, rows }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-offer', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const { id, is_active, cancelled_at, cancellation_reason, cancelled_by } = payload
      db.prepare(
        `Update offers Set is_active = ?, cancelled_at =?, cancellation_reason = ?, cancelled_by = ? WHERE id = ?`
      ).run(is_active, cancelled_at, cancellation_reason, cancelled_by, id)
      return { success: true }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('flter-offers-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const category = payload
      let query = ''
      let rows = []
      const limit = 50
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM offers`).get().total
      switch (category) {
        case 'all':
          query = `
          SELECT *
          FROM offers
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'draft':
          query = `
          SELECT *
          FROM offers
          WHERE status = 'draft'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'sent':
          query = `
          SELECT *
          FROM offers
          WHERE status = 'sent'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'accepted':
          query = `
          SELECT *
          FROM offers
          WHERE status = 'accepted'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'rejected':
          query = `
          SELECT *
          FROM offers
          WHERE status = 'rejected'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'cancelled':
          query = `
          SELECT *
          FROM offers
          WHERE status = 'cancelled'
          ORDER BY cancelled_at DESC
          LIMIT ?
        `
          break

        case 'expired':
          query = `
          SELECT *
          FROM offers
          WHERE valid_until < date('now')
          AND status NOT IN ('accepted','rejected','cancelled')
          ORDER BY valid_until DESC
          LIMIT ?
        `
          break

        case 'legal':
          query = `
          SELECT *
          FROM offers
          WHERE is_legal = 1
          ORDER BY id DESC
          LIMIT ?
        `
          break

        default:
          query = `
          SELECT *
          FROM offers
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

  ipcMain.handle('filter-offers-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      const { start, end } = payload
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM offers`).get().total
      const rows = db
        .prepare(
          `SELECT *
        FROM offers
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

  ipcMain.handle('search-offers', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM offers`).get().total
      if (isNaN(term) && !term.includes('-')) {
        rows = db
          .prepare(
            `SELECT *
          FROM offers
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
            FROM offers
            WHERE id BETWEEN ? AND ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(start, end, limit)
        } else {
          rows = db
            .prepare(
              `SELECT * FROM offers
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

export default offers
