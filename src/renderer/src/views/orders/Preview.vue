<template>
  <div v-if="orderPreview && auth">
    <form @submit.prevent="saveOrder">
      <section class="printable">
        <!-- Header section -->
        <HeaderSidePreview :title="title" :auth="auth" />

        <!-- Intro Text -->
        <div v-if="orderPreview.intro_text" class="intro-text" style="margin-bottom: 20px">
          <p>{{ orderPreview.intro_text }}</p>
        </div>

        <!-- Empfänger und Auftragsdetails -->
        <div v-if="orderPreview.customer" class="recipient">
          <div class="recipient-address">
            <div class="recipient-title">Empfänger</div>
            <div class="company-name-subtitle">{{ orderPreview.customer.company_name }}</div>
            <div>{{ orderPreview.customer.address }}</div>
            <div>
              {{ orderPreview.customer.postal_code }} {{ orderPreview.customer.city }}<br />
              {{ orderPreview.customer.country }}
            </div>
          </div>

          <dl class="recipient-details">
            <div class="recipient-title">Auftragsdetails</div>
            <div class="recipient-row">
              <dt class="meta-label">Auftrags-Nr.:</dt>
              <dd>{{ formatOrderId(orderPreview.id) }}</dd>
            </div>
            <div class="recipient-row">
              <dt class="meta-label">Datum:</dt>
              <dd class="meta-value">{{ formatDate(orderPreview.date) }}</dd>
            </div>
            <div class="recipient-row">
              <dt class="meta-label">Kunden-Nr.:</dt>
              <dd class="meta-value">{{ formatCustomerId(orderPreview.customer.id) }}</dd>
            </div>
            <div v-if="auth.tax_number" class="recipient-row">
              <dt class="meta-label">Steuernummer:</dt>
              <dd class="meta-value">{{ auth.tax_number }}</dd>
            </div>
            <div v-if="auth.vat_id" class="recipient-row">
              <dt class="meta-label">USt-ID:</dt>
              <dd class="meta-value">{{ auth.vat_id }}</dd>
            </div>
            <div v-if="orderPreview.customer_reference" class="recipient-row">
              <dt class="meta-label">Kundenreferenz:</dt>
              <dd class="meta-value">{{ orderPreview.customer_reference }}</dd>
            </div>

            <!-- Leistungszeitraum -->
            <div
              v-if="orderPreview.service_period_start && orderPreview.service_period_end"
              class="recipient-row"
            >
              <span class="meta-label">Leistungszeitraum:</span>
              <span class="meta-value">
                {{ formatDate(orderPreview.service_period_start) }} -
                {{ formatDate(orderPreview.service_period_end) }}
              </span>
            </div>

            <!-- Status, Priorität, Versandinfo -->
            <div class="recipient-row">
              <dt class="meta-label">Status:</dt>
              <dd class="status-badge">
                {{ orderStatus(orderPreview.status).text }}
              </dd>
            </div>
            <div v-if="orderPreview.status_by" class="recipient-row">
              <dt class="meta-label">Bearbeitet von:</dt>
              <dd class="meta-value">{{ orderPreview.status_by }}</dd>
            </div>
            <div v-if="orderPreview.status_date" class="recipient-row">
              <dt class="meta-label">Bearbeitet am:</dt>
              <dd class="meta-value">{{ formatDate(orderPreview.status_date) }}</dd>
            </div>
            <div v-if="orderPreview.status_comments" class="recipient-row">
              <dt class="meta-label">Kommentare:</dt>
              <dd class="meta-value">{{ orderPreview.status_comments }}</dd>
            </div>
            <div v-if="orderPreview.priority" class="recipient-row">
              <dt class="meta-label">Priorität:</dt>
              <dd class="meta-value">{{ orderPreview.priority }}</dd>
            </div>
            <div v-if="orderPreview.sent_at" class="recipient-row">
              <dt class="meta-label">Gesendet am:</dt>
              <dd class="meta-value">{{ formatDate(orderPreview.sent_at) }}</dd>
            </div>
            <div v-if="orderPreview.sent_method" class="recipient-row">
              <dt class="meta-label">Gesendet per:</dt>
              <dd class="meta-value">{{ orderPreview.sent_method }}</dd>
            </div>
          </dl>
        </div>

        <!-- Positions Tabelle -->
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
          <tbody v-if="orderPreview.positions && orderPreview.positions.length > 0">
            <tr v-for="(item, index) in orderPreview.positions" :key="index">
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
                  Leistungszeitraum: {{ formatDate(item.service_period_start) }} -
                  {{ formatDate(item.service_period_end) }}
                </div>
              </td>
              <td class="center">{{ item.quantity }}</td>
              <td class="center">{{ item.unit }}</td>
              <td class="right">{{ formatCurrency(item.price, orderPreview.currency) }}</td>
              <td class="right">{{ item.vat + '%' }}</td>
              <td class="right">{{ formatCurrency(item.unit_total, orderPreview.currency) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Zusammenfassung -->
        <div class="summary-section">
          <div class="total-row">
            <span class="total-label">Zwischensumme (netto):</span>
            <span class="total-value">{{
              formatCurrency(orderPreview.net_total, orderPreview.currency)
            }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">MwSt.:</span>
            <span class="total-value">{{
              formatCurrency(orderPreview.vat_total, orderPreview.currency)
            }}</span>
          </div>
          <div class="total-row subtotal">
            <span class="total-label">Rechnungsbetrag (brutto):</span>
            <span class="total-value">{{
              formatCurrency(orderPreview.gross_total, orderPreview.currency)
            }}</span>
          </div>
        </div>

        <!-- Kundenhinweise -->
        <div v-if="orderPreview.customer_notes" class="customer-notes" style="margin-top: 25px">
          <h2 class="section-title">Kundenhinweis</h2>
          <p>{{ orderPreview.customer_notes }}</p>
        </div>

        <!-- Lieferinformationen -->
        <dl v-if="orderPreview.delivery_address" class="sections">
          <div class="meta-row">
            <dt class="meta-label">Lieferadresse:</dt>
            <dd class="meta-value">
              {{ orderPreview.delivery_address }}<br />
              {{ orderPreview.delivery_postal_code }} {{ orderPreview.delivery_city }}<br />
              {{ orderPreview.delivery_country }}
            </dd>
          </div>
          <div v-if="orderPreview.delivery_date" class="meta-row">
            <dt class="meta-label">Lieferdatum:</dt>
            <dd class="meta-value">{{ formatDate(orderPreview.delivery_date) }}</dd>
          </div>
          <div v-if="orderPreview.delivery_terms" class="meta-row">
            <dt class="meta-label">Lieferbedingungen:</dt>
            <dd class="meta-value">{{ orderPreview.delivery_terms }}</dd>
          </div>
          <div v-if="orderPreview.shipping_method" class="meta-row">
            <dt class="meta-label">Versandart:</dt>
            <dd class="meta-value">{{ orderPreview.shipping_method }}</dd>
          </div>
        </dl>

        <!-- Zahlungsbedingungen -->
        <dl v-if="orderPreview" class="terms-section">
          <div class="section-title">Zahlungsbedingungen</div>
          <div class="terms-grid">
            <div v-if="orderPreview.payment_terms" class="term-item">
              <dt class="term-label">Zahlungsfrist:</dt>
              <dd class="term-value">{{ paymentTermsText }}</dd>
            </div>
            <div v-if="orderPreview.payment_method" class="term-item">
              <dt class="term-label">Zahlungsart:</dt>
              <dd class="term-value">{{ orderPreview.payment_method }}</dd>
            </div>
            <div v-if="orderPreview.payment_reference" class="term-item">
              <dt class="term-label">Zahlungsreferenz:</dt>
              <dd class="term-value">{{ orderPreview.payment_reference }}</dd>
            </div>
            <div v-if="orderPreview.payment_conditions" class="term-item">
              <dt class="term-label">Bedingungen:</dt>
              <dd class="term-value">{{ orderPreview.payment_conditions }}</dd>
            </div>
          </div>
        </dl>

        <!-- Stornierungsinformationen -->
        <dl v-if="orderPreview.status === 'cancelled'" class="cancel-info" style="margin-top: 25px">
          <h3 style="color: red">Storniert</h3>
          <div v-if="orderPreview.cancelled_at" class="meta-row">
            <dt class="meta-label">Storniert am:</dt>
            <dd class="meta-value">{{ formatDate(orderPreview.cancelled_at) }}</dd>
          </div>
          <div v-if="orderPreview.cancelled_by" class="meta-row">
            <dt class="meta-label">Storniert von:</dt>
            <dd class="meta-value">{{ orderPreview.cancelled_by }}</dd>
          </div>
          <div v-if="orderPreview.cancellation_reason" class="meta-row">
            <dt class="meta-label">Grund:</dt>
            <dd class="meta-value">{{ orderPreview.cancellation_reason }}</dd>
          </div>
        </dl>

        <!-- Abschlusstext -->
        <div class="closing-text" aria-label="closing-text">
          {{ orderPreview.closing_text }}
          <p>Mit freundlichen Grüßen,</p>
        </div>

        <!-- Interne Notizen -->
        <div
          aria-label="internal-notes"
          v-if="orderPreview.internal_notes"
          class="internal-notes"
          style="opacity: 0.6; margin-top: 25px; border-left: 4px solid #999; padding-left: 12px"
        >
          <div class="section-title">Interne Notiz (nicht im PDF)</div>
          <p>{{ orderPreview.internal_notes }}</p>
        </div>

        <!-- Kontaktperson -->
        <ContactPersonPreview :contactData="auth.contact_person" />

        <!-- Bankinformationen -->
        <div class="preview-box" aria-label="Bankinformationen">
          <i class="bi bi-bank2 icons" aria-hidden="true"></i>Bankverbindung
          <dl class="preview-box-content">
            <dt class="preview-box-label">Bank:</dt>
            <dd class="preview-box-value">{{ auth.bank_name }}</dd>
            <dt class="preview-box-label">IBAN:</dt>
            <dd class="preview-box-value">{{ auth.iban }}</dd>
            <dt class="preview-box-label">BIC:</dt>
            <dd class="preview-box-value">{{ auth.bic }}</dd>
          </dl>
        </div>

        <!-- Rechtsgültigkeit -->
        <div v-if="orderPreview.is_legal" class="pdf-footer">
          <label for="Rechtsgültigkeit" style="display: flex; align-items: center; gap: 8px">
            <input
              id="Rechtsgültigkeit"
              type="checkbox"
              checked
              disabled
              style="width: 16px; height: 16px"
            />
            Rechtsgültige Unterschrift erforderlich
          </label>
          <div
            class="signature-box"
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px"
          >
            <div class="signature-line">
              <div>_____________________________</div>
              <div class="signature-label">Ort, Datum</div>
            </div>
            <div class="signature-line">
              <div>_____________________________</div>
              <div class="signature-label">Unterschrift</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="sections btn-container">
        <button type="submit" class="btn btn-primary" @click="saveOrder">
          <i class="bi bi-floppy-fill btn-icons" aria-hidden="treu"></i>
          <span>Speichern</span>
        </button>
      </div>
    </form>
    <router-link to="/orders/create" class="btn btn-secondary">
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
  name: 'OrderPreviewPage',
  components: {
    HeaderSidePreview,
    ContactPersonPreview
  },
  inject: ['formatOrderId', 'formatCustomerId', 'formatCurrency', 'formatDate'],
  data() {
    return {
      title: 'Auftragsbestätigung',
      orderPreview: null,
      auth: null,
      STATUS_MAP: {
        draft: { text: 'Entwurf', class: 'status-draft' },
        pending: { text: 'Ausstehend', class: 'status-pending' },
        sent: { text: 'Gesendet', class: 'status-sent' },
        accepted: { text: 'Angenommen', class: 'status-accepted' },
        rejected: { text: 'Abgelehnt', class: 'status-rejected' }
      }
    }
  },
  computed: {
    // Check if payment or delivery terms exist
    hasPaymentOrDeliveryTerms() {
      return (
        (this.orderPreview.payment &&
          (this.orderPreview.payment.payment_terms ||
            this.orderPreview.payment.payment_method ||
            this.orderPreview.payment.payment_conditions)) ||
        this.orderPreview.delivery_terms ||
        this.orderPreview.shipping_method
      )
    },
    // Get readable payment terms text
    paymentTermsText() {
      if (!this.orderPreview.payment?.payment_terms) return ''
      const terms = this.orderPreview.payment.payment_terms
      if (terms === 'vorkasse') return 'Prepayment'
      if (terms === 0) return 'Due immediately'
      return `Due within ${terms} days`
    },
    actionFileName() {
      if (!this.orderPreview) return
      return this.formatOrderId(this.orderPreview.id)
    }
  },
  mounted() {
    this.getOrderPreview()
  },
  methods: {
    getOrderPreview() {
      if (!store.state.order && !store.state.auth) return
      this.orderPreview = store.state.order
      this.auth = store.state.auth
    },
    orderStatus(status) {
      return this.STATUS_MAP[status] || { text: 'Unbekannt', class: 'status-unknown' }
    },
    async saveOrder() {
      if (this.orderPreview) {
        const result = await window.api.addOrder(JSON.parse(JSON.stringify(this.orderPreview)))
        if (!result.success) return
        await store.clearFilters('order')
        this.$router.push('/orders')
      }
    }
  }
}
</script>
