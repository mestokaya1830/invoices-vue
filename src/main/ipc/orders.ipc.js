import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const orders = () => {
  ipcMain.handle('add-order', async (event, payload) => {
    if (!payload) return { success: false, message: 'No data provided' }

    try {
      const data = payload

      const info = db
        .prepare(
          `
        INSERT INTO orders (
          id,
          customer_id,
          customer,

          subject,

          date,
          validity_date,
          service_period_start,
          service_period_end,
          delivery_date,

          status,
          status_by,
          status_comments,

          is_active,
          cancelled_at,
          cancelled_by,
          cancellation_reason,

          delivery_address,
          delivery_postal_code,
          delivery_city,
          delivery_country,

          payment_terms,
          payment_method,
          payment_conditions,
          payment_reference,

          delivery_terms,
          shipping_method,

          positions,
          currency,
          net_total,
          vat_total,
          gross_total,

          intro_text,
          customer_notes,
          internal_notes,
          closing_text,

          sent_at,
          sent_method,

          created_at,
          updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?
        )
      `
        )
        .run(
          null, // id (AUTOINCREMENT)

          data.customer_id,
          JSON.stringify(data.customer || {}),

          data.subject,

          data.date,
          data.validity_date,
          data.service_period_start,
          data.service_period_end,
          data.delivery_date,

          data.status ?? 'pending',
          data.status_by,
          data.status_comments,

          data.is_active ? 1 : 0,
          data.cancelled_at,
          data.cancelled_by,
          data.cancellation_reason,

          data.delivery_address,
          data.delivery_postal_code,
          data.delivery_city,
          data.delivery_country,

          data.payment_terms,
          data.payment_method,
          data.payment_conditions,
          data.payment_reference,

          data.delivery_terms,
          data.shipping_method,

          JSON.stringify(data.positions || []),
          data.currency,
          data.net_total,
          data.vat_total,
          data.gross_total,

          data.intro_text,
          data.customer_notes,
          data.internal_notes,
          data.closing_text,

          data.sent_at,
          data.sent_method,

          data.created_at ?? new Date().toISOString(),
          data.updated_at ?? new Date().toISOString()
        )

      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-order-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const rows = db
        .prepare(
          `
          SELECT *
          FROM orders
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

  ipcMain.handle('get-orders', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
          SELECT id, date, status, customer, is_active
          FROM orders
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

  ipcMain.handle('update-order-by-id', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const {
        id,
        status,
        status_by,
        status_date,
        status_comments,
        subject,
        delivery_address,
        delivery_postal_code,
        delivery_city,
        delivery_country,
        shipping_method,
        payment_terms,
        payment_method,
        payment_reference,
        customer_notes,
        internal_notes
      } = payload

      const info = db
        .prepare(
          `
        UPDATE orders
        SET
          status = ?,
          status_by = ?,
          status_date = ?,
          status_comments = ?,
          subject = ?,
          delivery_address = ?,
          delivery_postal_code = ?,
          delivery_city = ?,
          delivery_country = ?,
          shipping_method = ?,
          payment_terms = ?,
          payment_method = ?,
          payment_reference = ?,
          customer_notes = ?,
          internal_notes = ?,
          updated_at = datetime('now')
        WHERE id = ?
        `
        )
        .run(
          status,
          status_by,
          status_date,
          status_comments,
          subject,
          delivery_address,
          delivery_postal_code,
          delivery_city,
          delivery_country,
          shipping_method,
          payment_terms,
          payment_method,
          payment_reference,
          customer_notes,
          internal_notes,
          id
        )

      return { success: true, changes: info.changes }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-order-by-id', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No id provided' }
    }
    try {
      const info = db.prepare('UPDATE orders SET is_active = 0 WHERE id = ?').run(id)
      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-order', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const { id, is_active, cancelled_at, cancellation_reason, cancelled_by } = payload
      db.prepare(
        `Update orders Set is_active = ?, cancelled_at = ?, cancellation_reason = ?, cancelled_by = ? WHERE id = ?`
      ).run(is_active, cancelled_at, cancellation_reason, cancelled_by, id)
      return { success: true }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('flter-orders-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      const category = payload
      let query = ''
      let rows = []
      const limit = 50
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM orders`).get().total
      switch (category) {
        case 'all':
          query = `
          SELECT *
          FROM orders
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'pending':
          query = `
          SELECT *
          FROM orders
          WHERE status = 'pending'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'confirmed':
          query = `
          SELECT *
          FROM orders
          WHERE status = 'confirmed'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'in_progress':
          query = `
          SELECT *
          FROM orders
          WHERE status = 'in_progress'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'completed':
          query = `
          SELECT *
          FROM orders
          WHERE status = 'completed'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'delivery_pending':
          query = `
          SELECT *
          FROM orders
          WHERE delivery_status = 'pending'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'shipped':
          query = `
          SELECT *
          FROM orders
          WHERE delivery_status = 'shipped'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'delivered':
          query = `
          SELECT *
          FROM orders
          WHERE delivery_status = 'delivered'
          ORDER BY id DESC
          LIMIT ?
        `
          break

        case 'sent':
          query = `
          SELECT *
          FROM orders
          WHERE sent_at IS NOT NULL
          ORDER BY sent_at DESC
          LIMIT ?
        `
          break

        case 'cancelled':
          query = `
          SELECT *
          FROM orders
          WHERE cancelled_at IS NOT NULL
          ORDER BY cancelled_at DESC
          LIMIT ?
        `
          break

        default:
          query = `
          SELECT *
          FROM orders
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

  ipcMain.handle('filter-orders-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      const { start, end } = payload
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM orders`).get().total
      const rows = db
        .prepare(
          `SELECT *
        FROM orders
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

  ipcMain.handle('search-orders', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM orders`).get().total
      if (isNaN(term) && !term.includes('-')) {
        rows = db
          .prepare(
            `SELECT *
          FROM orders
          WHERE (
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
            FROM orders
            WHERE id BETWEEN ? AND ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(start, end, limit)
        } else {
          rows = db
            .prepare(
              `SELECT * FROM orders
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

export default orders
