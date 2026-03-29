<template>
  <div v-if="invoicePreview && auth">
    <div class="printable">
      <HeaderSidePreview :title="title" :auth="auth" />

      <div v-if="invoicePreview.customer" class="recipient">
        <div class="recipient-address">
          <div class="recipient-title">
            <i class="bi bi-person-fill icons" aria-hidden="true"></i>Empfänger
          </div>
          <div class="company-name-subtitle">
            {{ invoicePreview.customer.company_name }}
          </div>
          <div class="meta-label">{{ invoicePreview.customer.address }}</div>
          <div class="meta-label">
            {{ invoicePreview.customer.postal_code }}
            {{ invoicePreview.customer.city }}<br />
            {{ invoicePreview.customer.country }}
          </div>
        </div>
        <div class="recipient-details">
          <div class="recipient-title">
            <i class="bi bi-info-circle-fill icons" aria-hidden="true"></i>Rechnungsdetails
          </div>

          <div class="recipient-row">
            <span class="meta-label">Rechnung-Nr.:</span>
            <span class="meta-value">{{ formatInvoiceId(invoicePreview.id) }}</span>
          </div>

          <div v-if="invoicePreview.service_date" class="recipient-row">
            <span class="meta-label">Leistungsdatum:</span>
            <span class="meta-value">{{ formatDate(invoicePreview.service_date) }}</span>
          </div>

          <div class="recipient-row">
            <span class="meta-label">Datum:</span>
            <span class="meta-value">{{ formatDate(invoicePreview.date) }}</span>
          </div>

          <div class="recipient-row">
            <span class="meta-label">Fälligkeitsdatum:</span>
            <span class="meta-value">{{ formatDate(invoicePreview.due_date) }}</span>
          </div>

          <div class="recipient-row">
            <span class="meta-label">Kunden-Nr.:</span>
            <span class="meta-value">{{ formatCustomerId(invoicePreview.customer.id) }}</span>
          </div>

          <div
            v-if="
              invoicePreview.customer.country === 'Germany' && invoicePreview.customer.tax_number
            "
            class="recipient-row"
          >
            <span class="meta-label">Steuer-Nr.:</span>
            <span class="meta-value">{{ invoicePreview.customer.tax_number }}</span>
          </div>

          <div v-else-if="invoicePreview.customer.vat_id" class="recipient-row">
            <span class="meta-label">USt-IdNr.:</span>
            <span class="meta-value">{{ invoicePreview.customer.vat_id }}</span>
          </div>
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

        <tbody v-if="invoicePreview.positions">
          <tr v-for="(item, index) in invoicePreview.positions" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="position-title">{{ item.title }}</div>
              <div v-if="item.description" class="position-description">
                {{ item.description }}
              </div>
              <div
                v-if="item.service_period_start && item.service_period_end"
                class="position-service-period"
              >
                <i class="bi bi-calendar3 me-1"></i> {{ formatDate(item.service_period_start) }} -
                {{ formatDate(item.service_period_end) }}
              </div>
            </td>
            <td class="center">{{ item.quantity }}</td>
            <td class="center">{{ item.unit }}</td>
            <td class="right">{{ formatCurrency(item.price, invoicePreview.currency) }}</td>
            <td class="right">
              {{ invoicePreview.is_reverse_charge ? '0%' : item.vat + '%' }}
            </td>
            <td class="right">
              {{ formatCurrency(item.unit_total, invoicePreview.currency) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="summary-section">
        <div class="total-row">
          <span class="total-label">Zwischensumme (netto):</span>
          <span class="total-value">{{
            formatCurrency(invoicePreview.net_total, invoicePreview.currency)
          }}</span>
        </div>

        <div class="total-row">
          <span class="total-label">MwSt.:</span>
          <span class="total-value">{{
            formatCurrency(invoicePreview.vat_total, invoicePreview.currency)
          }}</span>
        </div>

        <div class="total-row subtotal">
          <span class="total-label">Rechnungsbetrag (brutto):</span>
          <span class="total-value">{{
            formatCurrency(invoicePreview.gross_total, invoicePreview.currency)
          }}</span>
        </div>

        <div class="currently-paid">
          <span><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Bereits bezahlt:</span>
          <span> - {{ formatCurrency(0, invoicePreview.currency) }} </span>
        </div>

        <div class="outstanding-amount">
          <span
            ><i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i> Offener Betrag:</span
          >
          <span>{{ formatCurrency(invoicePreview.gross_total, invoicePreview.currency) }}</span>
        </div>

        <div class="preview-section">
          <div v-if="invoicePreview.is_small_company" class="tax-note small-company">
            <i class="bi bi-info-square-fill" aria-hidden="true"></i> Gemäß
            <span>§19 UStG</span> wird keine Umsatzsteuer berechnet.
          </div>

          <div v-else-if="invoicePreview.is_reverse_charge" class="tax-note">
            <i class="bi bi-arrow-repeat" aria-hidden="true"></i> Reverse-Charge-Verfahren –
            Steuerschuldnerschaft des Leistungsempfängers (<span>§13b UStG</span>)
          </div>

          <div v-else-if="invoicePreview.is_eu_delivery" class="tax-note">
            <i class="bi bi-globe-europe-africa" aria-hidden="true"></i> Innergemeinschaftliche
            Lieferung – steuerfrei gemäß <span>§4 Nr.1b UStG</span>
          </div>
        </div>
      </div>

      <div class="preview-box">
        <div class="preview-box-title">
          <i class="bi bi-credit-card-2-back-fill icons" aria-hidden="true"></i>Zahlungsbedingungen
        </div>
        <div class="preview-box-contentt">
          <div v-if="invoicePreview.payment_terms" class="payment-term-item">
            <strong>Zahlungsziel:</strong> {{ invoicePreview.payment_terms }} Tage (bis
            {{ formatDate(invoicePreview.due_date) }})
          </div>

          <div v-if="invoicePreview.early_payment_offer" class="payment-term-item skonto-highlight">
            <strong><i class="bi bi-lightning-charge-fill" aria-hidden="true"></i> Skonto:</strong>
            {{ invoicePreview.early_payment_percentage }}% Skonto bis
            {{ formatDate(invoicePreview.early_payment_deadline) }}
          </div>
        </div>
      </div>

      <!-- Kontaktperson -->
      <ContactPersonPreview :contactData="auth.contact_person" />

      <!-- Bankinformationen -->
      <div class="preview-box">
        <div class="preview-box-title">
          <i class="bi bi-bank icons" aria-hidden="true"></i>Bankverbindung
        </div>
        <div class="preview-box-content">
          <span class="preview-box-label">Bank:</span>
          <span class="preview-box-value">{{ auth.bank_name }}</span>
          <span class="preview-box-label">IBAN:</span>
          <span class="preview-box-value">{{ auth.iban }}</span>
          <span class="preview-box-label">BIC:</span>
          <span class="preview-box-value">{{ auth.bic }}</span>
        </div>
      </div>
    </div>

    <div class="sections btn-container">
      <button class="btn btn-primary" @click="saveInvoice">
        <i class="bi bi-floppy-fill btn-icons" aria-hidden="treu"></i>
        <span>Speichern</span>
      </button>
    </div>

    <router-link to="/invoices/create" class="btn btn-secondary">
      <i class="bi bi-arrow-left-circle icons" aria-hidden="true"></i> Zurück zur
      Rechnungserstellung
    </router-link>
  </div>
</template>

<script>
import store from '../../store/index.js'
import html2pdf from 'html2pdf.js'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'

export default {
  name: 'InvoicePreview',
  components: {
    HeaderSidePreview,
    ContactPersonPreview
  },
  inject: ['formatCustomerId', 'formatDate', 'formatCurrency', 'formatInvoiceId'],
  data() {
    return {
      title: 'Rechnungbestätigung',
      invoicePreview: null,
      auth: null
    }
  },
  computed: {
    actionFileName() {
      if (!this.invoicePreview) return
      return this.formatInvoiceId(this.invoicePreview.id)
    }
  },
  mounted() {
    this.getInvoicePreview()
  },
  methods: {
    getInvoicePreview() {
      if (!store.state.invoice || !store.state.auth) return
      this.invoicePreview = store.state.invoice
      this.auth = store.state.auth
    },
    async saveInvoice() {
      if (this.invoicePreview) {
        const result = await window.api.addInvoice(JSON.parse(JSON.stringify(this.invoicePreview)))
        if (!result.success) return
        this.savePdf()
        this.$router.push('/invoices')
      }
    },
    async savePdf() {
      await this.$nextTick()
      const element = document.querySelector('.printable')
      if (!element) return

      const fileName = this.formatInvoiceId(this.invoicePreview.id)
      const options = {
        margin: 16,
        filename: fileName + '.jpeg',
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: { scale: 1, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      try {
        const pdf = await html2pdf().set(options).from(element).toPdf().output('blob')
        if (!pdf) return

        const result = await window.api.saveInvoicePDF(pdf, fileName)
        if (result.success) {
          await store.clearFilters('invoice')
          return
        }
      } catch (err) {
        console.error('PDF save error:', err)
      }
    }
  }
}
</script>
