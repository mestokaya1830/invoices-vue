import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../../src/db/invoices.db')

let db = null
try {
  db = new Database(dbPath, { verbose: console.log })
  console.log('DB Path:', dbPath)
  console.log('Connected to the SQLite3 database.')
} catch (err) {
  console.error('Connection error:', err.message)
}
process.on('exit', () => db.close())

export default db

// try {
//   const rows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`).all()
//   console.log(rows)
// } catch (err) {
//   console.error(err.message)
// }

// try {
//   const result = db.prepare(`SELECT * FROM users LIMIT 1;`).all()
//   console.log(result)
// } catch (err) {
//   console.error(err.message)
// }

// try {
//   db.prepare(`DELETE FROM users;`).run()
//   db.prepare(`DELETE FROM sqlite_sequence WHERE name = 'users';`).run()
// } catch (error) {
//   console.error(error)
// }

// try {
//   const result = db.prepare(`PRAGMA table_info(tokens);`).all()
//   const fields = result.map((r) => r.name)
//   console.log(fields)
// } catch (err) {
//   console.error(err.message)
// }

// try {
//   db.prepare(`Alter table tokens DROP COLUMN  user_id;`).run()
// } catch (error) {
//   console.error(error)
// }

// try {
//   const result = db
//     .prepare(`SELECT COUNT(id) AS total FROM invoices WHERE payment_status = 'unpaid' AND due_date < DATE('now')`)
//     .get()
//   console.log(result.total)

// } catch (error) {
//   console.error(error)
// }

// try {
//   const rows = db.prepare('Select * from users').all()
//   console.log(rows)
// } catch (error) {
//   console.log(error)
// }

// try {
//   db.prepare('drop table payments').run()
// } catch (error) {
//   console.log(error)
// }

// db.exec(`CREATE TABLE IF NOT EXISTS users (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   gender TEXT NOT NULL,
//   first_name TEXT NOT NULL,
//   last_name TEXT NOT NULL,
//   password TEXT NOT NULL,
//   email TEXT UNIQUE NOT NULL,
//   phone TEXT DEFAULT NULL,
//   address TEXT DEFAULT NULL,
//   postal_code TEXT DEFAULT NULL,
//   city TEXT DEFAULT NULL,
//   state TEXT DEFAULT NULL,
//   country TEXT DEFAULT 'Deutschland',
//   website TEXT DEFAULT NULL,

//   company_name TEXT DEFAULT NULL,
//   company_details TEXT DEFAULT '{}',
//   company_signature TEXT DEFAULT NULL,
//   contact_person TEXT DEFAULT '{}',

//   tax_number TEXT DEFAULT NULL,
//   tax_office TEXT DEFAULT NULL,
//   vat_id TEXT DEFAULT NULL,
//   court_registration TEXT DEFAULT NULL,
//   court_location TEXT DEFAULT NULL,

//   logo BLOB DEFAULT NULL,
//   image_type TEXT DEFAULT NULL,

//   bank_name TEXT DEFAULT NULL,
//   bic TEXT DEFAULT NULL,
//   iban TEXT DEFAULT NULL,
//   bank_account_holder TEXT DEFAULT NULL,

//   created_at DATETIME DEFAULT (datetime('now')),
//   updated_at DATETIME DEFAULT (datetime('now'))
// );`)
