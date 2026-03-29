import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import nodemailer from 'nodemailer'
import fs from 'fs'
import Cryptr from 'cryptr'
import 'dotenv/config'
import db from '../db/sqliteConn.js'

const cryptr = new Cryptr('security')

//elastic
// const transporter = nodeMailer.createTransport({
//   host: 'smtp.elasticemail.com',
//   port: 2525,
//   secure: false,
//   auth: {
//     user: 'no-reply@yourdomain.com',
//     pass: process.env.ELASTIC_SMTP_KEY
//   }
// })

//gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'mesto1830@gmail.com',
    pass: 'ycla bewp jcax ginn' //google gmail unique password
  }
})

let win = null
function createWindow() {
  win = new BrowserWindow({
    width: 1720,
    height: 1020,
    show: false, // Pencereyi gizle
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#ffffff', // Beyaz flaş önler
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.resolve(__dirname, '../preload/preload.js'),
      sandbox: true,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webSecurity: true,
      devTools: is.dev
    }
  })

  // Pencere DOM + paint hazır olduğunda göster
  win.once('ready-to-show', () => {
    win.show()
    win.setTitle('Mes Invoices App')
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

//window control
ipcMain.handle('control-window', (event, data) => {
  if (!win) return
  switch (data) {
    case 'minimize':
      win.minimize()
      break
    // case 'maximize':
    //   win.isMaximized() ? win.unmaximize() : win.maximize()
    //   break
    case 'close':
      win.close()
      break
  }
})

//register
ipcMain.handle('check-register', async () => {
  try {
    const row = db.prepare('SELECT * FROM users').all()
    if (row.length > 0) {
      return { success: true }
    } else {
      return { success: false }
    }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('register', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }
  try {
    const { user, image_file } = payload
    const companyDetailsJSON = JSON.stringify(user.company_details || {})
    const contactPersonJSON = JSON.stringify(user.contact_person || {})
    const encryptPass = cryptr.encrypt(user.password)

    db.prepare(
      `INSERT INTO users (
          gender,
          first_name,
          last_name,
          password,
          email,
          phone,
          address,
          postal_code,
          city,
          state,
          country,
          website,

          company_name,
          company_details,
          company_signature,
          contact_person,

          tax_number,
          tax_office,
          vat_id,
          court_registration,
          court_location,

          logo,

          bank_name,
          bic,
          iban,
          bank_account_holder
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      user.gender,
      user.first_name,
      user.last_name,
      encryptPass,
      user.email,
      user.phone,
      user.address,
      user.postal_code,
      user.city,
      user.state,
      user.country,
      user.website,

      user.company_name,
      companyDetailsJSON,
      user.company_signature,
      contactPersonJSON,

      user.tax_number,
      user.tax_office,
      user.vat_id,
      user.court_registration,
      user.court_location,

      user.logo,

      user.bank_name,
      user.bic,
      user.iban,
      user.bank_account_holder
    )

    if (image_file !== null) {
      const buffer = Buffer.from(image_file)
      console.log(buffer)
      const savePath = path.join(
        app.getAppPath(),
        'src',
        'renderer',
        'public',
        'uploads',
        'user',
        user.logo
      ) // inner app uploads folder
      await fs.promises.writeFile(savePath, buffer)
    }
    return { success: true }
  } catch (error) {
    console.log(error)
  }
})

//user and login
ipcMain.handle('login', async (event, payload) => {
  const { email, password } = payload

  try {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (row) {
      const decryptedPass = cryptr.decrypt(row.password)
      if (decryptedPass === password) {
        row.logo = row.logo.toString('base64')
        return { success: true, user: row }
      } else {
        return { success: false, message: 'Invalid email or password' }
      }
    } else {
      return { success: false, message: 'Invalid email or password' }
    }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('reset-password', async (event, payload) => {
  try {
    db.prepare("DELETE FROM tokens WHERE replace(expires_at, 'T', ' ') < datetime('now')").run()
    const { token, password } = payload
    const tokenRow = db.prepare('SELECT * FROM tokens WHERE token = ?').get(token)
    if (!tokenRow) {
      return { success: false, message: 'Invalid token' }
    } else {
      const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(tokenRow.user_id)
      if (!userRow) {
        return { success: false, message: 'User not found' }
      } else {
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, userRow.id)
        db.prepare('DELETE FROM tokens WHERE token = ?').run(token)
        return { success: true, message: 'Password reset successfully' }
      }
    }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('email-verification', async (event, { email }) => {
  try {
    // Token
    const token = Math.floor(10000000 + Math.random() * 90000000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minuts

    // save to db
    db.prepare(
      `
      INSERT INTO tokens
      (user_id, token, expires_at)
      VALUES (1, ?, ?)
    `
    ).run(token, expiresAt.toISOString())

    // send email by elastic
    // await transporter.sendMail({
    //   from: 'YourApp <no-reply@senindomainin.com>', // elastic domain
    //   to: email, // user email
    //   subject: 'Verify your email',
    //   html: `
    //     <h2>Email Verification</h2>
    //     <p>Click the link below to verify your email:</p>
    //     <h1>Verify Email</h1>
    //     <h2>${token}</h2>
    //     <p>This link expires in 15 minutes.</p>
    //   `
    // })

    //send email by gmail
    await transporter.sendMail({
      from: 'mesto1830@gmail.com>',
      to: email,
      subject: 'Verify your email',
      html: `
      <h2>Email Verification</h2>
      <h1>Verify Email</h1>
      <h1>${token}</h1>
      <p>This token expires in 15 minutes.</p>
    `
    })

    return { success: true }
  } catch (err) {
    console.error('Verification email error:', err)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('get-user', async () => {
  try {
    const rows = db.prepare('SELECT * FROM users').get()
    if (rows && rows.logo) {
      rows.logo = rows.logo.toString('base64')
    }
    return { success: true, rows }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('update-user', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }
  try {
    const { user, image_file } = payload
    db.prepare('DELETE FROM users WHERE id != 1').run()
    const rows = db
      .prepare(
        `UPDATE users SET
          gender = ?,
          first_name = ?,
          last_name = ?,
          password = ?,
          email = ?,
          phone = ?,
          address = ?,
          postal_code = ?,
          city = ?,
          state = ?,
          country = ?,
          website = ?,
          company_name = ?,
          company_details = ?,
          company_signature = ?,
          contact_person = ?,
          tax_number = ?,
          tax_office = ?,
          vat_id = ?,
          court_registration = ?,
          court_location = ?,
          logo = ?,
          bank_name = ?,
          bic = ?,
          iban = ?,
          bank_account_holder = ? WHERE id = 1`
      )
      .run(
        user.gender,
        user.first_name,
        user.last_name,
        user.password,
        user.email,
        user.phone,
        user.address,
        user.postal_code,
        user.city,
        user.state,
        user.country,
        user.website,
        user.company_name,
        JSON.stringify(user.company_details || {}),
        user.company_signature,
        JSON.stringify(user.contact_person || {}),
        user.tax_number,
        user.tax_office,
        user.vat_id,
        user.court_registration,
        user.court_location,
        user.logo,
        user.bank_name,
        user.bic,
        user.iban,
        user.bank_account_holder
      )

    if (rows.changes > 0) {
      if (image_file !== null) {
        const buffer = Buffer.from(image_file)
        console.log(buffer)
        const savePath = path.join(
          app.getAppPath(),
          'src',
          'renderer',
          'public',
          'uploads',
          'user',
          user.logo
        ) // inner app uploads folder
        await fs.promises.writeFile(savePath, buffer)
      }
      return { success: true, message: 'Profil wurde erfolgreich aktualisiert' }
    } else {
      return { success: false, message: 'Profil konnte nicht aktualisiert werden' }
    }
  } catch (error) {
    console.error('updateProfile error:', error)
    return { success: false, message: error.message }
  }
})

//dashbords
ipcMain.handle('get-dashboard', async () => {
  try {
    const rows = db.transaction(() => {
      return {
        customers: db.prepare('SELECT COUNT(id) AS count FROM customers WHERE is_active = 1').get()
          .count,
        invoices: db.prepare('SELECT COUNT(id) AS count FROM invoices WHERE is_active = 1').get()
          .count,
        offers: db.prepare('SELECT COUNT(id) AS count FROM offers WHERE is_active = 1').get().count,
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

//customers
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

//invoices
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

//offers
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

// /orders
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

//payments
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

//reminders
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

//reports
ipcMain.handle('report-customers', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }

  try {
    const { start, end, limit } = payload

    const rows = db
      .prepare(
        `      SELECT 
              c.id,
              c.company_name,
              c.full_name,
              COUNT(i.id) AS invoice_count,
              MAX(i.date) AS last_activity,
              SUM(i.gross_total) AS invoice_total,
              SUM(CASE WHEN i.payment_status = 'paid' THEN 1 ELSE 0 END) AS paid,
              SUM(CASE WHEN i.payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid,
              SUM(CASE WHEN i.payment_status = 'partially_paid' THEN 1 ELSE 0 END) AS partially_paid,
              SUM(CASE WHEN i.due_date < DATE('now') AND i.payment_status != 'paid' THEN 1 ELSE 0 END) AS overdue
          FROM customers c
          LEFT JOIN invoices i ON c.id = i.customer_id
          WHERE c.is_active = 1 AND c.date BETWEEN ? AND ?
          GROUP BY c.id
          ORDER BY c.company_name ASC   -- veya toplam gelire göre DESC
          LIMIT ?`
      )
      .all(start, end, limit)

    return {
      success: true,
      rows: rows
    }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('report-invoices', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }
  try {
    const { start, end } = payload
    const rows = db
      .prepare(
        `SELECT * FROM invoices WHERE is_active = 1 AND date BETWEEN ? AND ? ORDER BY date DESC`
      )
      .all(start, end)

    return { success: true, rows }
  } catch (err) {
    console.error('DB error:', err.message)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('report-taxs', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }

  const { start, end } = payload

  try {
    const rows = db
      .prepare(
        `SELECT * FROM invoices WHERE is_active = 1 AND date BETWEEN ? AND ? ORDER BY date DESC`
      )
      .all(start, end)
    return { success: true, rows }
  } catch (error) {
    console.error('DB error:', error.message)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('report-sales', async (event, payload) => {
  if (!payload) {
    return { success: false, message: 'No data provided' }
  }

  const { start, end } = payload

  try {
    const rows = db
      .prepare(
        `SELECT * FROM invoices WHERE is_active = 1 AND date BETWEEN ? AND ? ORDER BY date DESC`
      )
      .all(start, end)
    return { success: true, rows }
  } catch (error) {
    console.error('DB error:', error.message)
    return { success: false, message: error.message }
  }
})

ipcMain.handle('read-invoice-pdf', (event, { fileName }) => {
  const filePath = path.join(app.getPath('downloads'), 'invoice-pdfs', `${fileName}.pdf`)
  if (!fs.existsSync(filePath)) {
    return { success: false, message: 'PDF file not found' }
  }
  const buffer = fs.readFileSync(filePath)
  return { success: true, buffer: new Uint8Array(buffer) }
})

ipcMain.handle('send-email', async (event, { buffer, fileName }) => {
  try {
    await transporter.sendMail({
      from: 'mesto1830@gmail.com',
      to: 'mesto1830@outlook.com',
      subject: fileName,
      html: `
        <h2>PDF Rapor</h2>
        <p>Ekte PDF dosyanız yer almaktadır.</p>
      `,
      attachments: [
        {
          filename: fileName + '.pdf',
          content: Buffer.from(buffer),
          contentType: 'application/pdf'
        }
      ]
    })

    return { success: true }
  } catch (err) {
    console.error('Mail hatası:', err)
    return { success: false, message: err.message }
  }
})
