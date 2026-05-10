import 'dotenv/config'
import { app, ipcMain } from 'electron'
import path from 'path'
import db from '../../db/sqliteConn.js'
import fs from 'fs'
import Cryptr from 'cryptr'

const cryptr = new Cryptr('security')

const auth = () => {
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
}

export default auth
