class DATEVExport {
  constructor(config = {}) {
    this.config = {
      beraternummer: config.beraternummer || '1000', // Steuerberater-Nr
      mandantennummer: config.mandantennummer || '1', // Mandanten-Nr
      wirtschaftsjahr: config.wirtschaftsjahr || new Date().getFullYear(),
      sachkontenrahmen: config.sachkontenrahmen || '04', // SKR04 (Standard)
      sachkontenlaenge: config.sachkontenlaenge || 4,
      name: config.name || 'Buchungsstapel',
      ...config
    }
  }

  /**
   * Haupt-Export-Funktion
   * @param {Array} invoices - Array von Rechnungen
   * @returns {string} DATEV CSV String
   */
  exportInvoices(invoices) {
    const lines = []

    // 1. Header (Zeile 1)
    lines.push(this.generateHeader())

    // 2. Spalten-Namen (Zeile 2)
    lines.push(this.generateColumnHeaders())

    // 3. Buchungszeilen (ab Zeile 3)
    invoices.forEach((invoice) => {
      const bookingLines = this.invoiceToBookingLines(invoice)
      lines.push(...bookingLines)
    })

    return lines.join('\n')
  }

  generateHeader() {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0]

    const year = this.config.wirtschaftsjahr
    const firstDay = `${year}0101`
    const lastDay = `${year}1231`

    const header = [
      'EXTF', // 1. Kennzeichen
      '700', // 2. Versionsnummer (7.0)
      '21', // 3. Datenkategorie (21 = Buchungsstapel)
      'Buchungsstapel', // 4. Formatname
      '13', // 5. Formatversion
      timestamp, // 6. Erzeugt am
      '', // 7. Importiert
      'RE', // 8. Herkunft (RE = Rechnungswesen)
      '', // 9. Exportiert von
      '', // 10. Importiert von
      this.config.beraternummer, // 11. Beraternummer
      this.config.mandantennummer, // 12. Mandantennummer
      firstDay, // 13. WJ-Beginn
      this.config.sachkontenlaenge, // 14. Sachkontenlänge
      firstDay, // 15. Datum von
      lastDay, // 16. Datum bis
      this.config.name, // 17. Bezeichnung
      'WD', // 18. Diktatkürzel
      '1', // 19. Buchungstyp (1 = Finanzbuchhaltung)
      '0', // 20. Rechnungslegungszweck
      '0', // 21. Festschreibung
      'EUR', // 22. Währung
      '', // 23. reserviert
      '', // 24. Derivatskennzeichen
      '', // 25. reserviert
      '', // 26. reserviert
      this.config.sachkontenrahmen, // 27. SKR (z.B. "04" für SKR04)
      '', // 28. Branchen-Lösungs-ID
      '', // 29. reserviert
      '', // 30. reserviert
      '', // 31. Anwendungsinformation
      '' // 32. reserviert
    ]

    return header.map((v) => `"${v}"`).join(';')
  }

  generateColumnHeaders() {
    return [
      'Umsatz (ohne Soll/Haben-Kz)',
      'Soll/Haben-Kennzeichen',
      'WKZ Umsatz',
      'Kurs',
      'Basis-Umsatz',
      'WKZ Basis-Umsatz',
      'Konto',
      'Gegenkonto (ohne BU-Schlüssel)',
      'BU-Schlüssel',
      'Belegdatum',
      'Belegfeld 1',
      'Belegfeld 2',
      'Skonto',
      'Buchungstext',
      'Postensperre',
      'Diverse Adressnummer',
      'Geschäftspartnerbank',
      'Sachverhalt',
      'Zinssperre',
      'Beleglink',
      'Beleginfo - Art 1',
      'Beleginfo - Inhalt 1',
      'Beleginfo - Art 2',
      'Beleginfo - Inhalt 2',
      'Beleginfo - Art 3',
      'Beleginfo - Inhalt 3',
      'Beleginfo - Art 4',
      'Beleginfo - Inhalt 4',
      'Beleginfo - Art 5',
      'Beleginfo - Inhalt 5',
      'Beleginfo - Art 6',
      'Beleginfo - Inhalt 6',
      'Beleginfo - Art 7',
      'Beleginfo - Inhalt 7',
      'Beleginfo - Art 8',
      'Beleginfo - Inhalt 8',
      'KOST1 - Kostenstelle',
      'KOST2 - Kostenstelle',
      'Kost-Menge',
      'EU-Land u. UStID',
      'EU-Steuersatz',
      'Abw. Versteuerungsart',
      'Sachverhalt L+L',
      'Funktionsergänzung L+L',
      'BU 49 Hauptfunktionstyp',
      'BU 49 Hauptfunktionsnummer',
      'BU 49 Funktionsergänzung',
      'Zusatzinformation - Art 1',
      'Zusatzinformation - Inhalt 1',
      'Zusatzinformation - Art 2',
      'Zusatzinformation - Inhalt 2',
      'Zusatzinformation - Art 3',
      'Zusatzinformation - Inhalt 3',
      'Zusatzinformation - Art 4',
      'Zusatzinformation - Inhalt 4',
      'Zusatzinformation - Art 5',
      'Zusatzinformation - Inhalt 5',
      'Zusatzinformation - Art 6',
      'Zusatzinformation - Inhalt 6',
      'Zusatzinformation - Art 7',
      'Zusatzinformation - Inhalt 7',
      'Zusatzinformation - Art 8',
      'Zusatzinformation - Inhalt 8',
      'Zusatzinformation - Art 9',
      'Zusatzinformation - Inhalt 9',
      'Zusatzinformation - Art 10',
      'Zusatzinformation - Inhalt 10',
      'Zusatzinformation - Art 11',
      'Zusatzinformation - Inhalt 11',
      'Zusatzinformation - Art 12',
      'Zusatzinformation - Inhalt 12',
      'Zusatzinformation - Art 13',
      'Zusatzinformation - Inhalt 13',
      'Zusatzinformation - Art 14',
      'Zusatzinformation - Inhalt 14',
      'Zusatzinformation - Art 15',
      'Zusatzinformation - Inhalt 15',
      'Zusatzinformation - Art 16',
      'Zusatzinformation - Inhalt 16',
      'Zusatzinformation - Art 17',
      'Zusatzinformation - Inhalt 17',
      'Zusatzinformation - Art 18',
      'Zusatzinformation - Inhalt 18',
      'Zusatzinformation - Art 19',
      'Zusatzinformation - Inhalt 19',
      'Zusatzinformation - Art 20',
      'Zusatzinformation - Inhalt 20',
      'Stück',
      'Gewicht',
      'Zahlweise',
      'Forderungsart',
      'Veranlagungsjahr',
      'Zugeordnete Fälligkeit',
      'Skontotyp',
      'Auftragsnummer',
      'Buchungstyp',
      'Ust-Schlüssel (Anzahlungen)',
      'EU-Land (Anzahlungen)',
      'Sachverhalt L+L (Anzahlungen)',
      'EU-Steuersatz (Anzahlungen)',
      'Erlöskonto (Anzahlungen)',
      'Herkunft-Kz',
      'Buchungs GUID',
      'KOST-Datum',
      'SEPA-Mandatsreferenz',
      'Skontosperre',
      'Gesellschaftername',
      'Beteiligtennummer',
      'Identifikationsnummer',
      'Zeichnernummer',
      'Postensperre bis',
      'Bezeichnung SoBil-Sachverhalt',
      'Kennzeichen SoBil-Buchung',
      'Festschreibung',
      'Leistungsdatum',
      'Datum Zuord. Steuerperiode'
    ]
      .map((col) => `"${col}"`)
      .join(';')
  }

  /**
   * Konvertiert Rechnung zu DATEV Buchungszeilen
   * @param {Object} invoice - Rechnung Objekt
   */
  invoiceToBookingLines(invoice) {
    const lines = []

    // Formatiere Datum (DDMM format für DATEV)
    const belegdatum = this.formatDateDATEV(invoice.date)
    const leistungsdatum = this.formatDateDATEV(invoice.service_date || invoice.date)

    // Berechne Beträge
    const netto = this.calculateNetto(invoice)
    const mwst = this.calculateMwst(invoice)
    const brutto = netto + mwst

    // Hauptbuchung: Debitor an Erlöskonto
    const mainBooking = this.createBookingLine({
      umsatz: brutto.toFixed(2),
      sollHaben: 'S', // Soll
      konto: '10000', // Debitorenkonto (Forderungen)
      gegenkonto: '8400', // Erlöskonto (Standard für Dienstleistungen)
      belegdatum: belegdatum,
      belegfeld1: invoice.number,
      belegfeld2: invoice.customer?.customer_number || '',
      buchungstext: invoice.payment?.payment_reference || 'Rechnung',
      leistungsdatum: leistungsdatum
    })

    lines.push(mainBooking)

    return lines
  }

  createBookingLine(data) {
    const line = new Array(116).fill('')
    line[0] = data.umsatz || ''
    line[1] = data.sollHaben || 'S'
    line[2] = 'EUR'
    line[6] = data.konto || ''
    line[7] = data.gegenkonto || ''
    line[9] = data.belegdatum || ''
    line[10] = data.belegfeld1 || ''
    line[11] = data.belegfeld2 || ''
    line[13] = data.buchungstext || ''
    line[113] = data.leistungsdatum || ''

    return line.map((v) => `"${v}"`).join(';')
  }

  formatDateDATEV(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}${month}`
  }

  calculateNetto(invoice) {
    return invoice.positions.reduce((sum, pos) => {
      return sum + pos.quantity * pos.price
    }, 0)
  }

  calculateMwst(invoice) {
    return invoice.positions.reduce((sum, pos) => {
      const base = pos.quantity * pos.price
      const vat = pos.vat || 19
      return sum + base * (vat / 100)
    }, 0)
  }

  saveToFile(csvContent, filename = null) {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const fname = filename || `EXTF_Buchungsstapel_${timestamp}.csv`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fname
    link.click()

    setTimeout(() => URL.revokeObjectURL(link.href), 100)
  }
}

export default DATEVExport
