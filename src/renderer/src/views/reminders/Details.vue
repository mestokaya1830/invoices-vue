<template>
  <div v-if="reminder && auth">
    <header class="page-header">
      <h1 class="main-title">{{ title }}</h1>
      <router-link to="/reminders" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <div class="printable">
      <HeaderSidePreview :title="title" :auth="auth" />
      <div class="recipient" aria-label="Empfänger">
        <div class="recipient-address">
          <div class="recipient-title">Empfänger</div>
          <div class="company-name-subtitle">
            {{ reminder.customer.company_name }}
          </div>
          <div class="meta-label">{{ reminder.customer.address }}</div>
          <div class="meta-label">
            {{ reminder.customer.postal_code }}
            {{ reminder.customer.city }}<br />
            {{ reminder.customer.country }}
          </div>
        </div>
        <!-- recipient details -->
        <div class="recipient-details">
          <div class="recipient-title">Rechnungsdetails</div>

          <dl class="meta-row">
            <dt class="meta-label">Mahnung-Nr.:</dt>
            <dd class="meta-value">{{ formatReminderId(reminder.id) }}</dd>
          </dl>
          <dl class="meta-row">
            <dt class="meta-label">Rechnung-Nr.:</dt>
            <dd class="meta-value">{{ formatInvoiceId(reminder.invoice_id) }}</dd>
          </dl>

          <dl class="meta-row">
            <dt class="meta-label">Datum:</dt>
            <dd class="meta-value">{{ formatDate(reminder.date) }}</dd>
          </dl>

          <dl class="meta-row">
            <dt class="meta-label">Kunden-Nr.:</dt>
            <dd class="meta-value">{{ formatCustomerId(reminder.customer.id) }}</dd>
          </dl>

          <dl class="meta-row">
            <dt class="meta-label">USt-IdNr.:</dt>
            <dd class="meta-value">{{ reminder.customer.vat_id || '' }}</dd>
          </dl>
        </div>
      </div>

      <!-- Content -->
      <div>
        <p class="greeting">Sehr geehrte Damen und Herren,</p>
        <p v-if="reminder?.intro_text">{{ reminder.intro_text }}</p>
      </div>

      <!-- reminders Details -->
      <div class="reminders-card">
        <h3 class="reminders-title"><i class="bi bi-file-text icons"></i>Offene Rechnung(en)</h3>

        <dl class="info-row">
          <dt>Rechnungsnummer</dt>
          <dd>{{ formatInvoiceId(reminder.invoice.id) }}</dd>
        </dl>

        <dl class="info-row">
          <dt>Rechnungsdatum</dt>
          <dd>{{ formatDate(reminder.invoice.date) }}</dd>
        </dl>

        <dl class="info-row">
          <dt>Fälligkeitsdatum</dt>
          <dd>{{ formatDate(reminder.invoice.due_date) }}</dd>
        </dl>

        <dl class="info-row">
          <dt>Betrag</dt>
          <dd>{{ formatCurrency(reminder.invoice.gross_total) }}</dd>
        </dl>

        <dl class="info-row muted">
          <dt>Mahngebühr</dt>
          <dd>{{ formatCurrency(reminder.reminder_fee) }}</dd>
        </dl>

        <dl class="info-row muted">
          <dt>Verzugszinsen</dt>
          <dd>{{ formatCurrency(reminder.late_interest) }}</dd>
        </dl>

        <dl class="info-row total">
          <dt>Offener Gesamtbetrag</dt>
          <dd>
            {{ formatCurrency(setTotalAmount, reminder.invoice.currency) }}
          </dd>
        </dl>
      </div>

      <!-- Bank Info -->
      <div v-if="auth" class="preview-box">
        <div class="preview-box-title"><i class="bi bi-bank2 icons"></i>Bankverbindung</div>
        <dl class="bank-info">
          <dt class="preview-box-label">Bank:</dt>
          <dd class="preview-box-value">{{ auth.bank_name }}</dd>
          <dt class="preview-box-label">IBAN:</dt>
          <dd class="preview-box-value">{{ auth.iban }}</dd>
          <dt class="preview-box-label">BIC:</dt>
          <dd class="preview-box-value">{{ auth.bic }}</dd>
          <dt class="preview-box-value">Zahlungsziel:</dt>
          <dd>{{ reminder.payment_deadline }}</dd>
        </dl>
      </div>

      <!-- Warning Box -->
      <div v-if="reminder?.level >= 2" class="warning-box">
        <div v-if="reminder.level === '2'">
          <strong
            ><i class="bi bi-exclamation-triangle-fill text-warning icons"></i>Wichtiger
            Hinweis:</strong
          ><br />
          <p>{{ reminder.warning_text }}</p>
        </div>
        <div v-if="reminder.level === '3'">
          <strong
            ><i class="bi bi-exclamation-octagon-fill text-danger icons"></i>Letzte Mahnung:</strong
          ><br />
          <p>{{ reminder.warning_text }}</p>
        </div>
      </div>

      <div class="reminder-content">
        <p v-if="reminder?.closing_text">{{ reminder.closing_text }}</p>
      </div>

      <!-- Closing -->
      <div class="closing">
        <p>Mit freundlichen Grüßen</p>
        <br />
        <p v-if="auth">
          <strong>{{ auth.company_name }}</strong>
        </p>
      </div>
      <!-- Contact Person -->
      <ContactPersonPreview :contactData="auth.contact_person" />
    </div>
    <RemiderActions v-if="reminder" :tableData="reminder" :fileName="actionFileName" />
    <router-link
      v-if="reminder"
      :to="`/reminders/create/${reminder.invoice_id}`"
      class="btn back-btn"
    >
      <i class="bi bi-arrow-left icons" aria-hidden="true"></i>Zurück zur Rechnungserstellung
    </router-link>
  </div>
</template>

<script>
import store from '../../store/index.js'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'
import RemiderActions from '../../components/preview/RemiderActions.vue'

export default {
  name: 'ReminderDetails',
  components: {
    HeaderSidePreview,
    ContactPersonPreview,
    RemiderActions
  },
  inject: [
    'formatCustomerId',
    'formatInvoiceId',
    'formatReminderId',
    'formatDate',
    'formatCurrency'
  ],
  data() {
    return {
      title: 'Mahnungsdetails',
      reminder: null,
      auth: null
    }
  },
  computed: {
    setTotalAmount() {
      if (!this.reminder) return
      return (
        this.reminder.invoice.gross_total + this.reminder.reminder_fee + this.reminder.late_interest
      )
    },
    actionFileName() {
      if (!this.reminder) return
      return this.formatReminderId(this.reminder.id)
    }
  },
  mounted() {
    this.getreminder()
    this.getAuth()
  },
  methods: {
    async getreminder() {
      const result = await window.api.getReminderById(this.$route.params.id)
      this.reminder = {
        ...result.rows,
        invoice: JSON.parse(result.rows.invoice),
        customer: JSON.parse(result.rows.customer)
      }
    },
    getAuth() {
      if (!store.state.auth) return
      this.auth = store.state.auth
    }
  }
}
</script>
