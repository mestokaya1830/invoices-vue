<template>
  <div v-if="order">
    <header class="page-header-right">
      <router-link to="/orders" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <div class="printable">
      <!-- Header section -->
      <HeaderSidePreview :title="title" :auth="auth" />

      <!-- Intro Text -->
      <div v-if="order.intro_text" class="intro-text" style="margin-bottom: 20px">
        <p>{{ order.intro_text }}</p>
      </div>

      <!-- Empfänger und Auftragsdetails -->
      <div v-if="order.customer" class="recipient">
        <div class="recipient-address">
          <div class="recipient-title">Empfänger</div>
          <div class="company-name-subtitle">{{ order.customer.company_name }}</div>
          <div>{{ order.customer.address }}</div>
          <div>
            {{ order.customer.postal_code }} {{ order.customer.city }}<br />
            {{ order.customer.country }}
          </div>
        </div>

        <div class="recipient-details">
          <div class="recipient-title">Auftragsdetails</div>
          <dl class="recipient-row">
            <dt class="meta-label">Auftrags-Nr.:</dt>
            <dd class="meta-value">{{ formatOrderId(order.id) }}</dd>
          </dl>
          <dl class="recipient-row">
            <dt class="meta-label">Datum:</dt>
            <dd class="meta-value">{{ formatDate(order.date) }}</dd>
          </dl>
          <dl class="recipient-row">
            <dt class="meta-label">Kunden-Nr.:</dt>
            <dd class="meta-value">{{ formatCustomerId(order.customer.id) }}</dd>
          </dl>
          <dl v-if="auth.tax_number" class="recipient-row">
            <dt class="meta-label">Steuernummer:</dt>
            <dd class="meta-value">{{ auth.tax_number }}</dd>
          </dl>
          <dl v-if="auth.vat_id" class="recipient-row">
            <dt class="meta-label">USt-ID:</dt>
            <dd class="meta-value">{{ auth.vat_id }}</dd>
          </dl>
          <dl v-if="order.customer_reference" class="recipient-row">
            <dt class="meta-label">Kundenreferenz:</dt>
            <dd class="meta-value">{{ order.customer_reference }}</dd>
          </dl>

          <!-- Leistungszeitraum -->
          <dl v-if="order.service_period_start && order.service_period_end" class="recipient-row">
            <dt class="meta-label">Leistungszeitraum:</dt>
            <dd class="meta-value">
              {{ formatDate(order.service_period_start) }} -
              {{ formatDate(order.service_period_end) }}
            </dd>
          </dl>

          <!-- Status, Priorität, Versandinfo -->
          <dl class="recipient-row">
            <dt class="meta-label">Status:</dt>
            <dd class="" :class="orderStatus(order.status).class">
              {{ orderStatus(order.status).text }}
            </dd>
          </dl>
          <dl v-if="order.status_by" class="recipient-row">
            <dt class="meta-label">Bearbeitet von:</dt>
            <dd class="meta-value">{{ order.status_by }}</dd>
          </dl>
          <dl v-if="order.status_date" class="recipient-row">
            <dt class="meta-label">Bearbeitet am:</dt>
            <dd class="meta-value">{{ formatDate(order.status_date) }}</dd>
          </dl>
          <dl v-if="order.status_comments" class="recipient-row">
            <dt class="meta-label">Kommentare:</dt>
            <dd class="meta-value">{{ order.status_comments }}</dd>
          </dl>
          <dl v-if="order.priority" class="recipient-row">
            <dt class="meta-label">Priorität:</dt>
            <dd class="meta-value">{{ order.priority }}</dd>
          </dl>
          <dl v-if="order.sent_at" class="recipient-row">
            <dt class="meta-label">Gesendet am:</dt>
            <dd class="meta-value">{{ formatDate(order.sent_at) }}</dd>
          </dl>
          <dl v-if="order.sent_method" class="recipient-row">
            <dt class="meta-label">Gesendet per:</dt>
            <dd class="meta-value">{{ order.sent_method }}</dd>
          </dl>
        </div>
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
        <tbody v-if="order.positions && order.positions.length > 0">
          <tr v-for="(item, index) in order.positions" :key="index">
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
            <td class="right">{{ formatCurrency(item.price, order.currency) }}</td>
            <td class="right">{{ item.vat + '%' }}</td>
            <td class="right">{{ formatCurrency(item.unit_total, order.currency) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Zusammenfassung -->
      <div class="summary-section">
        <dl class="total-row">
          <dt class="total-label">Zwischensumme (netto):</dt>
          <dd class="total-value">{{ formatCurrency(order.net_total, order.currency) }}</dd>
        </dl>
        <dl class="total-row">
          <dt class="total-label">MwSt.:</dt>
          <dd class="total-value">{{ formatCurrency(order.vat_total, order.currency) }}</dd>
        </dl>
        <dl class="total-row subtotal">
          <dt class="total-label">Rechnungsbetrag (brutto):</dt>
          <dd class="total-value">{{ formatCurrency(order.gross_total, order.currency) }}</dd>
        </dl>
      </div>

      <!-- Kundenhinweise -->
      <div v-if="order.customer_notes" class="customer-notes" style="margin-top: 25px">
        <div class="section-title">Kundenhinweis</div>
        <p>{{ order.customer_notes }}</p>
      </div>

      <!-- Lieferinformationen -->
      <div class="sections">
        <dl v-if="order.delivery_address" class="meta-row">
          <dt class="meta-label">Lieferadresse:</dt>
          <dd class="meta-value">
            {{ order.delivery_address }}<br />
            {{ order.delivery_postal_code }} {{ order.delivery_city }}<br />
            {{ order.delivery_country }}
          </dd>
        </dl>
        <dl v-if="order.delivery_date" class="meta-row">
          <dt class="meta-label">Lieferdatum:</dt>
          <dd class="meta-value">{{ formatDate(order.delivery_date) }}</dd>
        </dl>
        <dl v-if="order.delivery_terms" class="meta-row">
          <dt class="meta-label">Lieferbedingungen:</dt>
          <dd class="meta-value">{{ order.delivery_terms }}</dd>
        </dl>
        <dl v-if="order.shipping_method" class="meta-row">
          <dt class="meta-label">Versandart:</dt>
          <dd class="meta-value">{{ order.shipping_method }}</dd>
        </dl>
      </div>

      <!-- Zahlungsbedingungen -->
      <div v-if="order" class="terms-section">
        <div class="section-title">Zahlungsbedingungen</div>
        <div class="terms-grid">
          <dl v-if="order.payment_terms" class="term-item">
            <dt class="term-label">Zahlungsfrist:</dt>
            <dd class="term-value">{{ paymentTermsText }}</dd>
          </dl>
          <dl v-if="order.payment_method" class="term-item">
            <dt class="term-label">Zahlungsart:</dt>
            <dd class="term-value">{{ order.payment_method }}</dd>
          </dl>
          <dl v-if="order.payment_reference" class="term-item">
            <dt class="term-label">Zahlungsreferenz:</dt>
            <dd class="term-value">{{ order.payment_reference }}</dd>
          </dl>
          <dl v-if="order.payment_conditions" class="term-item">
            <dt class="term-label">Bedingungen:</dt>
            <dd class="term-value">{{ order.payment_conditions }}</dd>
          </dl>
        </div>
      </div>

      <!-- Stornierungsinformationen -->
      <div v-if="order.status === 'cancelled'" class="cancel-info" style="margin-top: 25px">
        <h2 style="color: red">Storniert</h2>
        <dl v-if="order.cancelled_at" class="meta-row">
          <dt class="meta-label">Storniert am:</dt>
          <dd class="meta-value">{{ formatDate(order.cancelled_at) }}</dd>
        </dl>
        <dl v-if="order.cancelled_by" class="meta-row">
          <dt class="meta-label">Storniert von:</dt>
          <dd class="meta-value">{{ order.cancelled_by }}</dd>
        </dl>
        <dl v-if="order.cancellation_reason" class="meta-row">
          <dt class="meta-label">Grund:</dt>
          <dd class="meta-value">{{ order.cancellation_reason }}</dd>
        </dl>
      </div>

      <!-- Abschlusstext -->
      <div class="closing-text">
        {{ order.closing_text }}
        <p>Mit freundlichen Grüßen,</p>
      </div>

      <!-- Interne Notizen -->
      <div
        v-if="order.internal_notes"
        class="internal-notes"
        style="opacity: 0.6; margin-top: 25px; border-left: 4px solid #999; padding-left: 12px"
      >
        <div class="section-title">Interne Notiz (nicht im PDF)</div>
        <p>{{ order.internal_notes }}</p>
      </div>

      <!-- Kontaktperson -->
      <ContactPersonPreview :contactData="auth.contact_person" />

      <!-- Bankinformationen -->
      <div class="preview-box">
        <i class="bi bi-bank2 icons" aria-hidden="true"></i>Bankverbindung
        <dl class="bank-info">
          <dt class="preview-box-label">Bank:</dt>
          <dd class="preview-box-value">{{ auth.bank_name }}</dd>
          <dt class="preview-box-label">IBAN:</dt>
          <dd class="preview-box-value">{{ auth.iban }}</dd>
          <dt class="preview-box-label">BIC:</dt>
          <dd class="preview-box-value">{{ auth.bic }}</dd>
        </dl>
      </div>

      <!-- Rechtsgültigkeit -->
      <div v-if="order.is_legal" class="pdf-footer">
        <label style="display: flex; align-items: center; gap: 8px">
          <input type="checkbox" checked disabled style="width: 16px; height: 16px" />
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
    </div>

    <!-- Actions -->
    <OrderActions v-if="order" :tableData="order" :fileName="actionFileName" sourc />

    <router-link to="/orders" class="back-link">← Zurück zur Auftragsliste</router-link>
  </div>
</template>

<script>
import store from '../../store/index.js'
import HeaderSidePreview from '../../components/preview/HeaderSidePreview.vue'
import OrderActions from '../../components/preview/OrderActions.vue'
import ContactPersonPreview from '../../components/preview/ContactPersonPreview.vue'

export default {
  name: 'AuftragDetails',
  components: {
    HeaderSidePreview,
    OrderActions,
    ContactPersonPreview
  },
  inject: ['formatOrderId', 'formatCustomerId', 'formatCurrency', 'formatDate'],
  data() {
    return {
      title: 'Auftrags-Vorschau',
      order: null,
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
    paymentTermsText() {
      if (!this.order?.payment_terms) return ''
      const terms = this.order.payment_terms
      if (terms === 'vorkasse') return 'Prepayment'
      if (terms === 0) return 'Due immediately'
      return `Due within ${terms} days`
    },
    actionFileName() {
      if (!this.order) return
      return this.formatOrderId(this.order.id)
    }
  },
  mounted() {
    this.getOrder()
    this.getAuth()
  },
  methods: {
    async getOrder() {
      const id = this.$route.params.id
      try {
        const result = await window.api.getOrderById(id)
        if (!result.success) return
        this.order = {
          ...result.rows,
          customer: JSON.parse(result.rows.customer),
          positions: JSON.parse(result.rows.positions)
        }
      } catch (error) {
        console.error(error)
      }
    },
    getAuth() {
      if (!store.state.auth) return
      this.auth = store.state.auth
    },
    orderStatus(status) {
      return this.STATUS_MAP[status] || { text: 'Unbekannt', class: 'status-unknown' }
    }
  }
}
</script>
