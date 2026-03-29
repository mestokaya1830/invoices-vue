<template>
  <div v-if="invoice && auth">
    <router-link to="/invoices" class="btn btn-secondary btn-back">
      <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
    </router-link>
    <section>
      <div class="printable">
        <HeaderSidePreview :title="title" :auth="auth" />

        <div v-if="invoice" class="recipient">
          <div class="recipient-address">
            <div class="recipient-title">
              <i class="bi bi-person-badge icons" aria-hidden="true"></i>Empfänger
            </div>
            <div class="company-name-subtitle">
              {{ invoice.customer.company_name }}
            </div>
            <div class="meta-label">{{ invoice.customer.address }}</div>
            <div class="meta-label">
              {{ invoice.customer.postal_code }}
              {{ invoice.customer.city }}<br />
              {{ invoice.customer.country }}
            </div>
          </div>

          <div class="recipient-details">
            <div class="recipient-title">
              <i class="bi bi-file-earmark-text icons" aria-hidden="true"></i>Rechnungsdetails
            </div>

            <dl class="recipient-row">
              <dt class="meta-label">Rechnung-Nr.:</dt>
              <dd class="meta-value">{{ formatInvoiceId(invoice.id) }}</dd>
            </dl>

            <dl v-if="invoice.service_date" class="recipient-row">
              <dt class="meta-label">Leistungsdatum:</dt>
              <dd class="meta-value">{{ formatDate(invoice.service_date) }}</dd>
            </dl>

            <dl class="recipient-row">
              <dt class="meta-label">Datum:</dt>
              <dd class="meta-value">{{ formatDate(invoice.date) }}</dd>
            </dl>

            <dl class="recipient-row">
              <dt class="meta-label">Fälligkeitsdatum:</dt>
              <dd class="meta-value">{{ formatDate(invoice.due_date) }}</dd>
            </dl>

            <dl class="recipient-row">
              <dt class="meta-label">Kunden-Nr.:</dt>
              <dd class="meta-value">{{ formatCustomerId(invoice.customer.id) }}</dd>
            </dl>

            <dl v-if="invoice.country === 'Germany' && invoice.tax_number" class="recipient-row">
              <dt class="meta-label">Steuer-Nr.:</dt>
              <dd class="meta-value">{{ invoice.tax_number }}</dd>
            </dl>
            <dl v-else-if="invoice.vat_id" class="recipient-row">
              <dt class="meta-label">USt-IdNr.:</dt>
              <dd class="meta-value">{{ invoice.vat_id }}</dd>
            </dl>
          </div>
        </div>

        <div class="intro-text">
          Sehr geehrter Kunde,<br />
          für die erbrachten Leistungen erlauben wir uns, Ihnen wie folgt in Rechnung zu stellen:
        </div>

        <table class="positions-table">
          <thead>
            <tr>
              <th style="width: 5%">Pos.</th>
              <th style="width: 40%">Bezeichnung</th>
              <th class="center" style="width: 8%">Menge</th>
              <th class="center" style="width: 10%">Einheit</th>
              <th class="right" style="width: 12%">Einzelpreis</th>
              <th class="right" style="width: 10%">MwSt.</th>
              <th class="right" style="width: 15%">Gesamtpreis</th>
            </tr>
          </thead>
          <tbody v-if="invoice.positions && invoice.positions.length > 0">
            <tr v-for="(item, index) in invoice.positions" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <div class="position-title">{{ item.title }}</div>
                <div v-if="item.description" class="position-description">
                  {{ item.description }}
                </div>
              </td>
              <td class="center">{{ item.quantity }}</td>
              <td class="center">{{ item.unit }}</td>
              <td class="right">{{ formatCurrency(item.price, invoice.currency) }}</td>
              <td class="right">
                {{ invoice.is_reverse_charge ? '0%' : item.vat + '%' }}
              </td>
              <td class="right">
                {{ formatCurrency(item.unit_total, invoice.currency) }}
              </td>
            </tr>
          </tbody>
        </table>

        <section class="summary-section">
          <dl class="total-row">
            <dt class="total-label">Zwischensumme (netto):</dt>
            <dd class="total-value">{{ formatCurrency(invoice.net_total, invoice.currency) }}</dd>
          </dl>

          <dl class="total-row">
            <dt class="total-label">MwSt.:</dt>
            <dd class="total-value">{{ formatCurrency(invoice.vat_total, invoice.currency) }}</dd>
          </dl>

          <dl class="total-row subtotal">
            <dt class="total-label">Rechnungsbetrag (brutto):</dt>
            <dd class="total-value">{{ formatCurrency(invoice.gross_total, invoice.currency) }}</dd>
          </dl>

          <div class="preview-section">
            <div v-if="invoice.is_small_company" class="tax-note small-company">
              <i class="bi bi-exclamation-triangle-fill icons" aria-hidden="true"></i> Gemäß
              <span>§19 UStG</span> wird keine Umsatzsteuer berechnet.
            </div>
            <div v-else-if="invoice.is_reverse_charge" class="tax-note">
              <i class="bi bi-info-circle-fill icons" aria-hidden="true"></i>
              Reverse-Charge-Verfahren – Steuerschuldnerschaft des Leistungsempfängers (<span
                >§13b UStG</span
              >)
            </div>
            <div v-else-if="invoice.is_eu_delivery" class="tax-note">
              <i class="bi bi-globe icons" aria-hidden="true"></i> Innergemeinschaftliche Lieferung
              – steuerfrei gemäß
              <span>§4 Nr.1b UStG</span>
            </div>
          </div>
        </section>

        <section class="preview-box">
          <div class="preview-box-title">
            <i class="bi bi-credit-card-fill icons" aria-hidden="true"></i>Zahlungsbedingungen
          </div>
          <div class="preview-box-contentt">
            <div v-if="invoice.payment_terms" class="payment-term-item">
              <strong>Zahlungsziel:</strong> {{ invoice.payment_terms }} Tage (bis
              {{ formatDate(invoice.due_date) }})
            </div>
            <div v-if="invoice.early_payment_offer" class="payment-term-item skonto-highlight">
              <strong
                ><i class="bi bi-piggy-bank-fill icons" aria-hidden="true"></i> Skonto:</strong
              >
              {{ invoice.early_payment_percentage }}% Skonto bis
              {{ formatDate(invoice.early_payment_deadline) }}
            </div>
          </div>
        </section>

        <ContactPersonPreview :contactData="auth.contact_person" />

        <section class="preview-box">
          <div class="preview-box-title">
            <i class="bi bi-bank2 icons" aria-hidden="true"></i>Bankverbindung
          </div>
          <dl class="preview-box-content">
            <dt class="preview-box-label">Bank:</dt>
            <dd class="preview-box-value">{{ auth.bank_name }}</dd>
            <dt class="preview-box-label">IBAN:</dt>
            <dd class="preview-box-value">{{ auth.iban }}</dd>
            <dt class="preview-box-label">BIC:</dt>
            <dd class="preview-box-value">{{ auth.bic }}</dd>
          </dl>
        </section>
      </div>

      <InvoiceActions v-if="invoice" :tableData="invoice" :fileName="actionFileName" />

      <section v-if="payments && payments.length" class="report-table-container">
        <h4 class="mb-3">
          <i class="bi bi-cash-stack icons" aria-hidden="true"></i>Zahlungshistorie
        </h4>
        <table class="report-table">
          <thead>
            <tr>
              <th>Zahlungs-ID</th>
              <th>Zahlungsdatum</th>
              <th>Summe</th>
              <th>Gezahlter Betrag</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in payments" :key="item.id">
              <td>{{ formatPaymentId(item.id) }}</td>
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ formatCurrency(item.invoice.gross_total, item.invoice.currency) }}</td>
              <td>{{ formatCurrency(item.payment_amount, item.invoice.currency) }}</td>
              <td>
                <router-link
                  :to="'/payments/details/' + item.id"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="bi bi-eye-fill" aria-hidden="true"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <router-link :to="`/reminders/create/${invoice.id}`" class="btn btn-reminder">
          <i class="bi bi-bell-fill icons" aria-hidden="true"></i> Mahnung erstellen
        </router-link>
      </section>

      <section v-if="reminders && reminders.length">
        <h4 class="mb-3">
          <i class="bi bi-exclamation-octagon-fill btn-reminder" aria-hidden="true"></i>Mahnungen
        </h4>
        <table class="table-auto w-full border">
          <thead>
            <tr>
              <th class="payment-head">Mahnungs-ID</th>
              <th class="payment-head">Mahnungsdatum</th>
              <th class="payment-head">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reminders" :key="item.id">
              <td class="payment-row">{{ formatReminderId(item.id) }}</td>
              <td class="payment-row">{{ formatDate(item.date) }}</td>
              <td class="payment-row">
                <router-link
                  :to="'/reminders/details/' + item.id"
                  class="btn btn-sm btn-outline-secondary"
                >
                  <i class="bi bi-search icons" aria-hidden="true"></i> Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <button @click="exportDATEV" class="btn btn-datev">
        <i class="bi bi-file-earmark-spreadsheet btn-icons" aria-hidden="true"></i>
        <span>DATEV Export</span>
      </button>
    </section>
  </div>
</template>

<script>
import store from '../../store/index.js'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'
import InvoiceActions from '../../components/preview/InvoiceActions.vue'
import DATEVExport from '../../assets/js/DatevExport.js'

export default {
  name: 'InvoicesDetails',
  components: {
    HeaderSidePreview,
    ContactPersonPreview,
    InvoiceActions
  },
  inject: [
    'formatPaymentId',
    'formatInvoiceId',
    'formatCustomerId',
    'formatReminderId',
    'formatDate',
    'formatCurrency'
  ],
  data() {
    return {
      title: 'Rechnungdetails',
      invoice: null,
      payments: [],
      reminders: [],
      payment_total: 0,
      auth: null
    }
  },
  computed: {
    actionFileName() {
      if (!this.invoice) return
      return this.formatInvoiceId(this.invoice.id)
    }
  },
  mounted() {
    this.getInvoice()
    this.getAuth()
  },
  methods: {
    async getInvoice() {
      const id = this.$route.params.id
      if (!id) return
      try {
        const data = {
          id: id,
          table_name: 'invoices'
        }
        const result = await window.api.getInvoiceById(data)
        if (!result.success) return
        this.invoice = {
          ...result.rows,
          customer: JSON.parse(result.rows.customer),
          positions: JSON.parse(result.rows.positions)
        }
        this.payments = result.payments.map((item) => {
          return {
            ...item,
            invoice: JSON.parse(item.invoice)
          }
        })
        this.payment_total = result.payment_total
        this.reminders = result.reminders
      } catch (error) {
        console.error(error)
      }
    },
    getAuth() {
      if (store.state.auth) {
        this.auth = store.state.auth
      } else {
        console.warn('No auth data in store')
      }
    },
    async exportDATEV() {
      if (!this.invoice || !this.auth) {
        alert('⚠️ Keine Rechnungsdaten vorhanden')
        return
      }

      try {
        const datevConfig = {
          beraternummer: this.auth.datev_beraternummer || '1000',
          mandantennummer: this.auth.datev_mandantennummer || '1',
          sachkontenrahmen: this.auth.datev_skr || '04',
          wirtschaftsjahr: new Date(this.invoice.date).getFullYear(),
          name: `Rechnung ${this.formatInvoiceId(this.invoice.id)}`
        }

        const invoiceForDATEV = this.prepareInvoiceForDATEV()

        const exporter = new DATEVExport(datevConfig)

        const csvContent = exporter.exportInvoices([invoiceForDATEV])

        const invoiceNumber = this.formatInvoiceId(this.invoice.id)
        const filename = `EXTF_${invoiceNumber.replace(/\//g, '-')}.csv`

        exporter.saveToFile(csvContent, filename)

        alert(`✅ DATEV Export erfolgreich!\n\nDatei: ${filename}`)
      } catch (error) {
        console.error('DATEV Export Error:', error)
        alert('❌ Fehler beim DATEV Export!\n\nBitte versuchen Sie es erneut.')
      }
    },
    prepareInvoiceForDATEV() {
      return {
        number: this.formatInvoiceId(this.invoice.id),

        date: this.invoice.date,
        service_date: this.invoice.service_date || this.invoice.date,
        due_date: this.invoice.due_date,

        customer: {
          customer_number: this.formatCustomerId(this.invoice.customer.id),
          company_name: this.invoice.customer.company_name || '',
          first_name: this.invoice.customer.first_name || '',
          last_name: this.invoice.customer.last_name || ''
        },

        positions: this.invoice.positions.map((pos) => ({
          title: pos.title,
          description: pos.description || '',
          quantity: pos.quantity,
          price: pos.price,
          vat: this.getVatRate(pos),
          unit: pos.unit || 'Stk',
          service_period_start: pos.service_period_start || '',
          service_period_end: pos.service_period_end || ''
        })),

        payment: {
          payment_reference:
            this.invoice.payment_reference || this.invoice.positions[0]?.title || 'Rechnung'
        },

        is_small_company: this.invoice.is_small_company || false,
        is_reverse_charge: this.invoice.is_reverse_charge || false,
        is_eu_delivery: this.invoice.is_eu_delivery || false
      }
    },

    getVatRate(position) {
      if (
        this.invoice.is_small_company ||
        this.invoice.is_reverse_charge ||
        this.invoice.is_eu_delivery
      ) {
        return 0
      }
      return position.vat || 19
    }
  }
}
</script>
