import 'dotenv/config'
import { app, ipcMain } from 'electron'
import path from 'path'
import db from '../../db/sqliteConn.js'
import fs from 'fs'
import nodemailer from 'nodemailer'

const reports = () => {
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
}

export default reports