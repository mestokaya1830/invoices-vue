<template>
  <div v-if="payment && auth">
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/payments" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <div class="printable">
      <!-- Header -->
      <HeaderSidePreview :title="title" :auth="auth" />
      <!-- Modal -->
      <div>
        <div class="modal">
          <h3>Zahlungsdetails</h3>
          <table class="modal-table">
            <tbody>
              <tr>
                <td>ID</td>
                <td>{{ formatPaymentId(payment.id) }}</td>
              </tr>
              <tr>
                <td>Rechnungs-ID</td>
                <td>{{ formatInvoiceId(payment.invoice_id) }}</td>
              </tr>
              <tr>
                <td>Kunden-ID</td>
                <td>{{ formatCustomerId(payment.customer_id) }}</td>
              </tr>
              <tr>
                <td>Rechnungsdatum</td>
                <td>{{ formatDate(payment.invoice.date) }}</td>
              </tr>
              <tr>
                <td>Fälligkeitsdatum</td>
                <td>{{ formatDate(payment.invoice.due_date) }}</td>
              </tr>
              <tr>
                <td>Zahlungsdatum</td>
                <td>{{ formatDate(payment.date) }}</td>
              </tr>
              <tr>
                <td>Währung</td>
                <td>{{ payment.invoice.currency }}</td>
              </tr>

              <tr>
                <td>Rechnungssumme</td>
                <td>
                  {{ formatCurrency(payment.invoice.gross_total, payment.currency) }}
                </td>
              </tr>
              <tr v-if="payment.is_early_paid">
                <td>Rabatt</td>
                <td>
                  {{
                    formatCurrency(payment.invoice.early_payment_discount, payment.invoice.currency)
                  }}
                </td>
              </tr>
              <tr v-if="payment.is_early_paid">
                <td>Gesamtbetrag nach Rabatt</td>
                <td>
                  {{
                    formatCurrency(payment.invoice.total_after_discount, payment.invoice.currency)
                  }}
                </td>
              </tr>

              <tr>
                <td>Gezahlter Betrag</td>
                <td>
                  {{ formatCurrency(payment.payment_amount, payment.invoice.currency) }}
                </td>
              </tr>
              <tr>
                <td>Ausstehender Betrag</td>
                <td>
                  {{
                    formatCurrency(
                      payment.invoice.gross_total - payment.payment_amount,
                      payment.invoice.currency
                    )
                  }}
                </td>
              </tr>
              <tr>
                <td>Zahlungsmethode</td>
                <td>{{ payment.payment_method }}</td>
              </tr>
              <tr>
                <td>Zahlungsreferenz</td>
                <td>{{ payment.payment_reference }}</td>
              </tr>
              <tr>
                <td>Name der Gegenpartei</td>
                <td>{{ payment.counterparty_name }}</td>
              </tr>
              <tr>
                <td>IBAN der Gegenpartei</td>
                <td>{{ payment.counterparty_iban }}</td>
              </tr>
              <tr>
                <td>Notizen</td>
                <td>{{ payment.notes }}</td>
              </tr>
              <tr>
                <td>Zahlungsstatus</td>
                <td>{{ payment.invoice.payment_status }}</td>
              </tr>
              <tr>
                <td>Dateiname</td>
                <td>{{ payment.invoice.file_name }}</td>
              </tr>
              <tr>
                <td>Erstellt am</td>
                <td>{{ payment.created_at }}</td>
              </tr>
              <tr>
                <td>Aktualisiert am</td>
                <td>{{ payment.updated_at }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="payment.file_name" class="download-container">
            <img
              :src="`/uploads/payments/${payment.file_name}`"
              alt="No image"
              class="img"
              aria-hidden="true"
            />
            <a :href="`/uploads/payments/${payment.file_name}`" :download="payment.file_name">
              <button type="button" class="btn-download">Datei herunterladen</button>
            </a>
          </div>
        </div>
      </div>

      <!-- Contact Person -->
      <ContactPersonPreview :contactData="auth.contact_person" />

      <!-- Bank Info -->
      <div class="preview-box">
        <div class="preview-box-title">
          <i class="bi bi-bank2 icons" aria-hidden="true"></i>Bankverbindung
        </div>
        <dl class="bank-info">
          <dt class="preview-box-label">Bank:</dt>
          <dd class="preview-box-value">{{ auth.bank_name }}</dd>
          <dt class="preview-box-label">IBAN:</dt>
          <dd class="preview-box-value">{{ auth.iban }}</dd>
          <dt class="preview-box-label">BIC:</dt>
          <dd class="preview-box-value">{{ auth.bic }}</dd>
        </dl>
      </div>
    </div>

    <!-- Actions Button -->
    <PaymentActions v-if="payment" :tableData="payment" :fileName="actionFileName" />

    <router-link :to="`/invoices/details/${payment.invoice_id}`" class="btn back-btn">
      ← Zurück zur Rechnungsdetails
    </router-link>
  </div>
</template>

<script>
import store from '../../store'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'
import PaymentActions from '../../components/preview/PaymentActions.vue'

export default {
  name: 'PaymentDetails',
  components: {
    HeaderSidePreview,
    ContactPersonPreview,
    PaymentActions
  },
  inject: [
    'formatPaymentId',
    'formatCustomerId',
    'formatDate',
    'formatCurrency',
    'formatInvoiceId'
  ],
  data() {
    return {
      title: 'Zahlungdetails',
      payment: null,
      auth: null
    }
  },
  computed: {
    outstanding() {
      return (
        this.payment.invoice_gross_total -
        (this.payment.payment_amount + Number(this.payment.total_paid_amount))
      ).toFixed(2)
    },
    actionFileName() {
      if (!this.payment) return
      return this.formatPaymentId(this.payment.id)
    }
  },
  mounted() {
    this.getPayment()
    this.getAuth()
  },
  methods: {
    async getPayment() {
      if (!this.$route.params.id) return
      try {
        const result = await window.api.getPaymentById(this.$route.params.id)
        if (!result.success) return
        this.payment = {
          ...result.rows,
          invoice: JSON.parse(result.rows.invoice)
        }
      } catch (error) {
        console.error(error)
      }
    },
    getAuth() {
      if (!store.state.auth) return
      this.auth = store.state.auth
    }
  }
}
</script>
