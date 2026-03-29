<template>
  <div v-if="offerPreview && auth">
    <div class="printable">
      <!-- Header -->
      <HeaderSidePreview :title="title" :auth="auth" />

      <!-- customers -->
      <section class="recipient">
        <div class="recipient-section">
          <div class="recipient-address">
            <div class="section-title">Empfänger</div>
            <div class="company-name-subtitle">
              {{ offerPreview.customer.company_name }}
            </div>
            <div class="meta-label">{{ offerPreview.customer.address }}</div>
            <div class="meta-label">
              {{ offerPreview.customer.postal_code }}
              {{ offerPreview.customer.city }}<br />
              {{ offerPreview.customer.country }}
            </div>
          </div>
        </div>
        <div class="recipient-details">
          <div class="section-title">Angebotsdetails</div>

          <dl class="recipient-row">
            <dt class="meta-label">Angebots-Nr.:</dt>
            <dd class="meta-value">{{ formatOfferId(offerPreview.id) }}</dd>
          </dl>

          <dl class="recipient-row">
            <dt class="meta-label">Datum:</dt>
            <dd class="meta-value">{{ formatDate(offerPreview.date) }}</dd>
          </dl>

          <dl class="recipient-row">
            <dt class="meta-label">Kunden-Nr.:</dt>
            <dd class="meta-value">{{ formatCustomerId(offerPreview.customer.id) }}</dd>
          </dl>

          <dl
            v-if="offerPreview.customer.country === 'Germany' && offerPreview.customer.tax_number"
            class="recipient-row"
          >
            <dt class="meta-label">Steuer-Nr.:</dt>
            <dd class="meta-value">{{ offerPreview.customer.tax_number }}</dd>
          </dl>

          <dl
            v-else-if="offerPreview.customer.is_in_eu && offerPreview.customer.vat_id"
            class="recipient-row"
          >
            <dt class="meta-label">USt-IdNr.:</dt>
            <dd class="meta-value">{{ offerPreview.customer.vat_id }}</dd>
          </dl>

          <dl
            v-else-if="!offerPreview.customer.is_in_eu && offerPreview.customer.vat_id"
            class="recipient-row"
          >
            <dt class="meta-label">VAT ID:</dt>
            <dd class="meta-value">{{ offerPreview.customer.vat_id }}</dd>
          </dl>

          <dl v-if="offerPreview.valid_until" class="recipient-row">
            <dt class="meta-label">Gültig bis:</dt>
            <dd class="meta-value">{{ formatDate(offerPreview.valid_until) }}</dd>
          </dl>

          <dl v-if="offerPreview.status" class="recipient-row">
            <dt class="meta-label">Status:</dt>
            <dd class="meta-value">{{ getStatusText(offerPreview.status) }}</dd>
          </dl>
        </div>
      </section>

      <!-- Subject / Description -->
      <section v-if="offerPreview.subject" aria-label="Betreff / Beschreibung" class="form-group">
        <label class="form-label">Betreff / Beschreibung</label>
        <div class="intro-text">
          {{ offerPreview.subject }}
        </div>
      </section>

      <!-- Introduction Text -->
      <section class="intro-text" aria-label="Intro text">
        <span v-if="offerPreview.introduction_text">
          {{ offerPreview.introduction_text }}
        </span>
        <span v-else>
          Sehr geehrte Damen und Herren,<br /><br />
          vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgendes Angebot:
        </span>
      </section>

      <!-- Contact Person -->
      <section v-if="offerPreview.contact_person" class="contact-person-section">
        <strong>Ihr Ansprechpartner:</strong> {{ offerPreview.contact_person }}
      </section>

      <!-- Positions Table -->
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

        <tbody v-if="offerPreview.positions && offerPreview.positions.length > 0">
          <tr v-for="(item, index) in offerPreview.positions" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="position-title">{{ item.title }}</div>
              <div v-if="item.description" class="position-description">
                {{ item.description }}
              </div>
            </td>
            <td class="center">{{ item.quantity }}</td>
            <td class="center">{{ item.unit }}</td>
            <td class="right">{{ formatCurrency(item.price, offerPreview.currency) }}</td>
            <td class="right">{{ item.vat }}%</td>
            <td class="right">
              {{ formatCurrency(item.unit_total, offerPreview.currency) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Section -->
      <section class="summary-section">
        <div class="total-row">
          <span class="total-label">Zwischensumme (netto):</span>
          <span class="total-value">{{
            formatCurrency(offerPreview.net_total || 0, offerPreview.currency)
          }}</span>
        </div>

        <div class="total-row">
          <span class="total-label">MwSt. Gesamt:</span>
          <span class="total-value">{{
            formatCurrency(offerPreview.vat_total || 0, offerPreview.currency)
          }}</span>
        </div>

        <div class="total-row subtotal">
          <span class="total-label">Gesamtbetrag (brutto):</span>
          <span class="total-value">{{
            formatCurrency(offerPreview.gross_total || 0, offerPreview.currency)
          }}</span>
        </div>
      </section>

      <!-- Payment Terms -->
      <section v-if="offerPreview.payment_terms" class="payment-section">
        <div class="section-heading">Zahlungsbedingungen</div>
        <div class="payment-content">
          <p>{{ offerPreview.payment_terms }}</p>
        </div>
      </section>

      <!-- Delivery Terms -->
      <section v-if="offerPreview.delivery_terms" class="delivery-section">
        <div class="section-heading">Lieferbedingungen</div>
        <div class="delivery-content">
          <p>{{ offerPreview.delivery_terms }}</p>
        </div>
      </section>

      <!-- Delivery Time -->
      <section v-if="offerPreview.delivery_time" class="delivery-time-section">
        <div class="section-heading">Lieferzeit</div>
        <div class="delivery-time-content">
          <p>{{ offerPreview.delivery_time }}</p>
        </div>
      </section>

      <!-- Notes (Customer visible) -->
      <section v-if="offerPreview.notes" class="notes-section">
        <div class="section-heading">Hinweise</div>
        <div class="notes-content">
          <p>{{ offerPreview.notes }}</p>
        </div>
      </section>

      <!-- Bank Details -->
      <section v-if="auth.bank || offerPreview.bank" class="bank-section">
        <div class="section-heading">Bankverbindung</div>
        <div class="bank-details">
          <div v-if="auth.bank?.bank_name || offerPreview.bank?.bank_name">
            Kreditinstitut: {{ auth.bank?.bank_name || offerPreview.bank?.bank_name }}
          </div>
          <div v-if="auth.bank?.iban || offerPreview.bank?.iban">
            IBAN: {{ auth.bank?.iban || offerPreview.bank?.iban }}
          </div>
          <div v-if="auth.bank?.bic || offerPreview.bank?.bic">
            BIC: {{ auth.bank?.bic || offerPreview.bank?.bic }}
          </div>
        </div>
      </section>

      <!-- Closing Text -->
      <section class="closing">
        <span v-if="offerPreview.closing_text">
          {{ offerPreview.closing_text }}
        </span>
        <span v-else>
          Wir freuen uns auf Ihre Rückmeldung und stehen für Rückfragen gerne zur Verfügung.<br /><br />
          Mit freundlichen Grüßen
        </span>
      </section>

      <!-- Contact Person -->
      <ContactPersonPreview v-if="auth.contact_person" :contactData="auth.contact_person" />

      <!-- Legal Validity Signature -->
      <section v-if="offerPreview.is_legal" class="pdf-footer">
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
      </section>

      <!-- Internal Notes (only visible in preview, not in PDF) -->
      <section v-if="offerPreview.internal_notes" class="internal-notes-section no-print">
        <div class="section-heading" style="color: #e74c3c">
          Interne Notizen (nicht für Kunden sichtbar)
        </div>
        <div
          class="internal-notes-content"
          style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107"
        >
          <p>{{ offerPreview.internal_notes }}</p>
        </div>
      </section>
    </div>

    <!-- Action Buttons -->
    <div class="sections btn-container">
      <button type="submit" class="btn btn-primary" @click="saveOffer">
        <i class="bi bi-floppy-fill btn-icons" aria-hidden="treu"></i>
        Speichern
      </button>
    </div>

    <router-link to="/offers/create" class="btn btn-secondary">
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
  name: 'OfferPreview',
  components: {
    HeaderSidePreview,
    ContactPersonPreview
  },
  inject: ['formatCustomerId', 'formatOfferId', 'formatDate', 'formatValidDays', 'formatCurrency'],
  data() {
    return {
      title: 'Angebot',
      offerPreview: null,
      auth: null
    }
  },
  computed: {
    actionFileName() {
      if (!this.offerPreview) return
      return this.formatOfferId(this.offerPreview.id)
    }
  },
  mounted() {
    this.getOfferPreview()
  },
  methods: {
    getOfferPreview() {
      if (!store.state.offer && !store.state.auth) return
      this.offerPreview = store.state.offer
      this.auth = store.state.auth
    },
    getStatusText(status) {
      const statusMap = {
        draft: 'Entwurf',
        sent: 'Versendet',
        accepted: 'Akzeptiert',
        rejected: 'Abgelehnt',
        expired: 'Abgelaufen'
      }
      return statusMap[status] || status
    },
    async saveOffer() {
      if (this.offerPreview) {
        const result = await window.api.addOffer(JSON.parse(JSON.stringify(this.offerPreview)))
        if (!result.success) return
        await store.clearFilters()
        this.$router.push('/offers')
      }
    }
  }
}
</script>
