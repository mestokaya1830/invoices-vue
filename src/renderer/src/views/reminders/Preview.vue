<template>
  <div v-if="reminderPreview && auth">
    <form @submit.prevent="saveReminder">
      <div class="printable">
        <HeaderSidePreview :title="title" :auth="auth" />
        <div class="recipient">
          <div class="recipient-address">
            <div class="recipient-title">Empfänger</div>
            <div class="company-name-subtitle">
              {{ reminderPreview.customer.company_name }}
            </div>
            <div class="meta-label">{{ reminderPreview.customer.address }}</div>
            <div class="meta-label">
              {{ reminderPreview.customer.postal_code }}
              {{ reminderPreview.customer.city }}<br />
              {{ reminderPreview.customer.country }}
            </div>
          </div>
          <!-- recipient details -->
          <div class="recipient-details">
            <div class="recipient-title">Rechnungsdetails</div>

            <dl class="meta-row">
              <dt class="meta-label">Mahnung-Nr.:</dt>
              <defined class="meta-value">{{ formatReminderId(reminderPreview.id) }}</defined>
            </dl>
            <dl class="meta-row">
              <dt class="meta-label">Rechnung-Nr.:</dt>
              <dd class="meta-value">{{ formatInvoiceId(reminderPreview.invoice_id) }}</dd>
            </dl>

            <dl class="meta-row">
              <dt class="meta-label">Datum:</dt>
              <dd class="meta-value">{{ formatDate(reminderPreview.date) }}</dd>
            </dl>

            <dl class="meta-row">
              <dt class="meta-label">Kunden-Nr.:</dt>
              <dd class="meta-value">{{ formatCustomerId(reminderPreview.customer.id) }}</dd>
            </dl>

            <dl class="meta-row">
              <dt class="meta-label">USt-IdNr.:</dt>
              <dd class="meta-value">{{ reminderPreview.customer.vat_id || '' }}</dd>
            </dl>
          </div>
        </div>

        <!-- Content -->
        <div>
          <p class="greeting">Sehr geehrte Damen und Herren,</p>
          <p v-if="reminderPreview?.intro_text">{{ reminderPreview.intro_text }}</p>
        </div>

        <!-- reminders Details -->
        <div class="reminders-card">
          <h3 class="reminders-title">
            <i class="bi bi-file-text icons" aria-hidden="true"></i>Offene Rechnung(en)
          </h3>

          <dl class="info-row">
            <dt>Rechnungsnummer</dt>
            <dd>{{ formatInvoiceId(reminderPreview.invoice.id) }}</dd>
          </dl>

          <dl class="info-row">
            <dt>Rechnungsdatum</dt>
            <dd>{{ formatDate(reminderPreview.invoice.date) }}</dd>
          </dl>

          <dl class="info-row">
            <dt>Fälligkeitsdatum</dt>
            <dd>{{ formatDate(reminderPreview.invoice.due_date) }}</dd>
          </dl>

          <dl class="info-row">
            <dt>Betrag</dt>
            <dd>{{ formatCurrency(reminderPreview.invoice.gross_total) }}</dd>
          </dl>

          <dl class="info-row muted">
            <dt>Mahngebühr</dt>
            <dd>{{ formatCurrency(reminderPreview.reminder_fee) }}</dd>
          </dl>

          <dl class="info-row muted">
            <dt>Verzugszinsen</dt>
            <dd>{{ formatCurrency(reminderPreview.late_interest) }}</dd>
          </dl>

          <dl class="info-row total">
            <dt>Offener Gesamtbetrag</dt>
            <dd>
              {{ formatCurrency(setTotalAmount, reminderPreview.invoice.currency) }}
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
            <dd>{{ reminderPreview.payment_deadline }}</dd>
          </dl>
        </div>

        <!-- Warning Box -->
        <div v-if="reminderPreview?.level >= 2" class="warning-box">
          <div v-if="reminderPreview.level === '2'">
            <strong
              ><i class="bi bi-exclamation-triangle-fill text-warning icons" aria-hidden="true"></i
              >Wichtiger Hinweis:</strong
            ><br />
            <p>{{ reminderPreview.warning_text }}</p>
          </div>
          <div v-if="reminderPreview.level === '3'">
            <strong
              ><i class="bi bi-exclamation-octagon-fill text-danger icons" aria-hidden="true"></i
              >Letzte Mahnung:</strong
            ><br />
            <p>{{ reminderPreview.warning_text }}</p>
          </div>
        </div>

        <div class="reminderPreview-content">
          <p v-if="reminderPreview?.closing_text">{{ reminderPreview.closing_text }}</p>
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
      <div class="sections btn-container">
        <button type="submit" class="btn btn-primary" @click="saveReminder">
          <i class="bi bi-floppy-fill btn-icons" aria-hidden="true"></i>
          Speichern
        </button>
      </div>
    </form>
    <router-link to="/reminders/create" class="btn btn-secondary">
      <i class="bi bi-arrow-left-circle icons" aria-hidden="true"></i> Zurück zur
      Rechnungserstellung
    </router-link>
  </div>
</template>

<script>
import store from '../../store/index.js'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'

export default {
  name: 'ReminderPreview',
  components: {
    HeaderSidePreview,
    ContactPersonPreview
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
      title: 'Mahnungs Vorschau',
      reminderPreview: null,
      auth: null
    }
  },
  computed: {
    setTotalAmount() {
      if (!this.reminderPreview) return
      return (
        this.reminderPreview.invoice.gross_total +
        this.reminderPreview.reminder_fee +
        this.reminderPreview.late_interest
      )
    },
    actionFileName() {
      if (!this.reminderPreview) return
      return this.formatReminderId(this.reminderPreview.id)
    }
  },
  mounted() {
    this.getReminderPreview()
  },
  methods: {
    getReminderPreview() {
      if (!store.state.reminder && !store.state.auth) return
      this.reminderPreview = store.state.reminder
      this.auth = store.state.auth
    },
    async saveReminder() {
      if (this.reminderPreview) {
        const result = await window.api.addReminder(
          JSON.parse(JSON.stringify(this.reminderPreview))
        )
        if (!result.success) return
        await store.clearFilters('reminder')
        this.$router.push('/invoices/details/' + this.reminderPreview.invoice_id)
      }
    }
  }
}
</script>
