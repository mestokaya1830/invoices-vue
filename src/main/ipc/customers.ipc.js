import 'dotenv/config'
import { ipcMain } from 'electron'
import db from '../../db/sqliteConn.js'

const customers = () => {
  ipcMain.handle('add-customer', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const { customer } = payload
      const info = db
        .prepare(
          `
      INSERT INTO customers (
        is_active,
        date,
        company_type, company_name,
        first_name, last_name, full_name, email, phone, website,
        address, postal_code, city, country,
        tax_number, vat_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
        )
        .run(
          customer.is_active ? 1 : 0,
          new Date().toISOString().split('T')[0],

          customer.company_type,
          customer.company_name,

          customer.first_name,
          customer.last_name,
          customer.first_name + ' ' + customer.last_name,

          customer.email,
          customer.phone,
          customer.website,
          customer.address,
          customer.postal_code,
          customer.city,
          customer.country,

          customer.tax_number,
          customer.vat_id
        )

      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-customers', async () => {
    try {
      const limit = 50
      const rows = db
        .prepare(
          `
        SELECT id, company_type, company_name, first_name, last_name, is_active FROM customers WHERE is_active = 1 ORDER BY id DESC LIMIT ?
      `
        )
        .all(limit)

      const total = db.prepare(`SELECT COUNT(id) as count FROM customers`).get().count

      return { success: true, rows, total }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('get-customer-by-id', async (event, payload) => {
    const { id, table_name } = payload
    if (!id) {
      return { success: false, message: 'No id provided' }
    }
    try {
      const rows = db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id)
      const last_id =
        db.prepare(`SELECT id AS last_id FROM ${table_name} ORDER BY id DESC LIMIT 1`).get()
          .last_id || 0
      return { success: true, rows, last_id }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('update-customer-by-id', async (event, payload) => {
    console.log(payload)
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      const customer = payload
      const info = db
        .prepare(
          'UPDATE customers SET company_type = ?, company_name = ?, first_name = ?, last_name = ?, address = ?, postal_code = ?, city = ?, country = ?, email = ?, phone = ?, tax_number = ?, vat_id = ?, is_active = ?  WHERE id = ?'
        )
        .run(
          customer.company_type,
          customer.company_name,
          customer.first_name,
          customer.last_name,
          customer.address,
          customer.postal_code,
          customer.city,
          customer.country,
          customer.email,
          customer.phone,
          customer.tax_number,
          customer.vat_id,
          customer.is_active,
          customer.id
        )
      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('customer-details', async (event, id) => {
    if (!id) {
      return { success: false, message: 'No id provided' }
    }
    try {
      const customer = db
        .prepare(
          `
          SELECT * FROM customers WHERE id = ?
        `
        )
        .get(id)
      //get all counts for customer
      const counts = db
        .prepare(
          `
          SELECT
            COALESCE((SELECT COUNT(id) FROM invoices 
                      WHERE json_extract(customer, '$.id') = CAST(:id AS TEXT)), 0) AS invoice_count,
            COALESCE((SELECT COUNT(id) FROM offers    WHERE customer_id = :id), 0) AS offer_count,
            COALESCE((SELECT COUNT(id) FROM orders    WHERE customer_id = :id), 0) AS order_count,
            COALESCE((SELECT COUNT(id) FROM reminders WHERE customer_id = :id), 0) AS reminder_count,
            COALESCE((SELECT COUNT(id) FROM payments  WHERE customer_id = :id), 0) AS payment_count
        `
        )
        .get({ id })

      const data = {
        customer,
        counts
      }
      return { success: true, data }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('cancel-customer-by-id', async (event, payload) => {
    const { id, status } = payload
    if (!id) {
      return { success: false, message: 'No id provided' }
    }
    try {
      const info = db.prepare('UPDATE customers SET is_active = ? WHERE id = ?').run(status, id)
      return { success: true, lastInsertId: info.lastInsertRowid }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('flter-customers-categories', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }

    try {
      let query = ''
      let rows = []
      const limit = 50

      const total_count = db.prepare(`SELECT COUNT(id) as total FROM customers`).get().total

      switch (payload) {
        case 'all':
          query = `SELECT * FROM customers ORDER BY id DESC LIMIT ?`
          break

        case 'active':
          query = `SELECT * FROM customers WHERE is_active = 1 ORDER BY id DESC LIMIT ?`
          break

        case 'canceled':
          query = `SELECT * FROM customers WHERE is_active = 0 ORDER BY id DESC LIMIT ?`
          break

        case 'first_10':
          query = `SELECT * FROM customers ORDER BY id ASC LIMIT 10`
          break

        case 'last_10':
          query = `SELECT * FROM customers ORDER BY id DESC LIMIT 10`
          break

        default:
          return { success: false, message: `Unknown category: ${payload}` }
      }
      rows = db.prepare(query).all(...(query.includes('?') ? [limit] : []))
      return { success: true, rows, total_count }
    } catch (err) {
      console.error('DB error:', err.message)
      return { success: false, message: err.message }
    }
  })

  ipcMain.handle('search-customers', async (event, term) => {
    if (!term) {
      return { success: false, message: 'No data provided' }
    }
    let limit = 50
    const total_count = db.prepare(`SELECT COUNT(id) as total FROM customers`).get().total
    if (isNaN(term) && !term.includes('-')) {
      try {
        const rows = db
          .prepare(
            `SELECT id, company_name, first_name, last_name, is_active FROM customers
           WHERE company_type LIKE '${term}%' 
           OR company_name LIKE '%${term}%' 
           OR first_name LIKE '${term}%' 
           OR last_name LIKE '${term}%' 
           OR full_name LIKE '${term}%' 
           ORDER BY id DESC LIMIT ?`
          )
          .all(limit)
        return { success: true, rows, total_count }
      } catch (err) {
        console.error('DB error:', err.message)
        return { success: false, message: err.message }
      }
    } else {
      try {
        if (isNaN(term) && term.includes('-')) {
          const [start, end] = term.split('-').map((item) => parseInt(item.replace(/\D/g, ''), 10))
          const rows = db
            .prepare(
              `SELECT id, company_name, first_name, last_name, is_active FROM customers 
            WHERE id BETWEEN ? AND ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(start, end, limit)
          return { success: true, rows, total_count }
        } else {
          const rows = db
            .prepare(
              `SELECT id, company_name, first_name, last_name, is_active FROM customers 
            WHERE id + 0 LIKE ?
            ORDER BY id DESC LIMIT ?`
            )
            .all(term, limit)
          return { success: true, rows, total_count }
        }
      } catch (err) {
        console.error('DB error:', err.message)
        return { success: false, message: err.message }
      }
    }
  })

  ipcMain.handle('filter-customers-date', async (event, payload) => {
    if (!payload) {
      return { success: false, message: 'No data provided' }
    }
    try {
      let limit = 50
      const { start, end } = payload
      let rows = []
      const total_count = db.prepare(`SELECT COUNT(id) as total FROM customers`).get().total
      rows = db
        .prepare(
          `SELECT *
        FROM customers
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

export default customers
