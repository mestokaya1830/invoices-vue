<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link :to="`/orders/details/${$route.params.id}`" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <form @submit.prevent="updateOrder">
      <section class="printable">
        <h2>{{ title }}</h2>

        <section class="sections">
          <!-- Status -->
          <div class="form-group">
            <div v-if="order.status === 'accepted' || order.status === 'rejected'">
              <h4>Status:</h4>
              <div class="inputs disabled">
                {{
                  order.status === 'accepted'
                    ? 'Angenommen'
                    : order.status === 'rejected'
                      ? 'Abgelehnt'
                      : order.status
                }}
                <small class="text-muted d-block">Status kann nicht mehr geändert werden.</small>
              </div>
            </div>
            <div v-else>
              <label for="Status" class="form-label">Status<span class="stars">*</span></label>
              <select id="Status" v-model="order.status" class="inputs" required>
                <option value="" disabled>Status auswählen</option>
                <option value="draft" :disabled="order.status !== 'sent' ? true : true">
                  Entwurf
                </option>
                <option value="sent" :disabled="order.status !== 'draft'">Gesendet</option>
                <option value="accepted" :disabled="order.status !== 'sent'">Angenommen</option>
                <option value="rejected" :disabled="order.status !== 'sent'">Abgelehnt</option>
              </select>
            </div>
          </div>

          <!-- Status by -->
          <div class="form-group">
            <label for="Bearbeitet von" class="form-label"
              >Bearbeitet von:<span class="stars">*</span></label
            >
            <input
              id="Bearbeitet von"
              v-model="order.status_by"
              type="text"
              class="inputs"
              placeholder="Name der bearbeitenden Person eingeben"
              required
            />
          </div>

          <!-- Status date -->
          <div class="form-group">
            <label for="Bearbeitet am" class="form-label"
              >Bearbeitet am:<span class="stars">*</span></label
            >
            <input
              id="Bearbeitet am"
              v-model="order.status_date"
              type="date"
              class="inputs date"
              required
            />
          </div>

          <!-- Status comments -->
          <div class="form-group">
            <label for="Kommentare" class="form-label">Kommentare:</label>
            <textarea
              id="Kommentare"
              v-model="order.status_comments"
              class="inputs"
              placeholder="Kommentare oder Notizen hier eingeben"
            ></textarea>
          </div>

          <!-- Subject -->
          <div class="form-group">
            <label for="Betreff / Subject" class="form-label">Betreff / Subject:</label>
            <input id="Betreff / Subject" v-model="order.subject" type="text" class="inputs" />
          </div>

          <!-- Lieferdaten + Versand -->
          <div class="sections" aria-label="Lieferung & Versand">
            <div class="sections-title">📦 Lieferung & Versand</div>
            <div class="form-row">
              <div class="form-group">
                <label for="Gesendet am" class="form-label">Gesendet am</label>
                <input id="Gesendet am" v-model="order.sent_at" type="date" class="inputs date" />
              </div>
              <div class="form-group">
                <label for="Liefertermin" class="form-label"
                  >Liefertermin<span class="stars">*</span></label
                >
                <input
                  id="Liefertermin"
                  v-model="order.delivery_date"
                  type="date"
                  class="inputs date"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="Lieferadresse" class="form-label"
                  >Lieferadresse<span class="stars">*</span></label
                >
                <input
                  id="Lieferadresse"
                  v-model="order.delivery_address"
                  type="text"
                  class="inputs"
                  required
                />
              </div>
              <div class="form-group">
                <label for="PLZ" class="form-label">PLZ<span class="stars">*</span></label>
                <input
                  id="PLZ"
                  v-model="order.delivery_postal_code"
                  type="text"
                  class="inputs"
                  required
                />
              </div>
              <div class="form-group">
                <label for="Stadt" class="form-label">Stadt<span class="stars">*</span></label>
                <input
                  id="Stadt"
                  v-model="order.delivery_city"
                  type="text"
                  class="inputs"
                  required
                />
              </div>
              <div class="form-group">
                <label for="Land" class="form-label">Land<span class="stars">*</span></label>
                <input
                  id="Land"
                  v-model="order.delivery_country"
                  type="text"
                  class="inputs"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="Versandart" class="form-label"
                  >Versandart:<span class="stars">*</span></label
                >
                <select id="Versandart" v-model="order.shipping_method" class="inputs" required>
                  <option value="" disabled>Bitte auswählen</option>
                  <option value="dhl">DHL</option>
                  <option value="hermes">Hermes</option>
                  <option value="ups">UPS</option>
                  <option value="dpd">DPD</option>
                  <option value="gls">GLS</option>
                  <option value="email">E-Mail</option>
                  <option value="pickup">Selbstabholung</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payment details -->
          <div class="form-group">
            <label for="Zahlungsbedingungen" class="form-label"
              >Zahlungsbedingungen (Tage):<span class="stars">*</span></label
            >
            <input
              id="Zahlungsbedingungen"
              v-model="order.payment_terms"
              type="number"
              class="inputs"
              required
            />
          </div>
          <div class="form-group">
            <label for="Zahlungsart" class="form-label"
              >Zahlungsart<span class="stars">*</span></label
            >
            <select id="Zahlungsart" v-model="order.payment_method" class="inputs" required>
              <option value="" disabled>Bitte auswählen</option>
              <option>Überweisung</option>
              <option>Bar</option>
              <option>PayPal</option>
              <option>Kreditkarte</option>
              <option>Lastschrift</option>
              <option>Scheck</option>
            </select>
          </div>
          <div class="form-group">
            <label for="Zahlungsreferenz" class="form-label">Zahlungsreferenz:</label>
            <input
              id="Zahlungsreferenz"
              v-model="order.payment_reference"
              type="text"
              class="inputs"
            />
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="Kundenhinweise" class="form-label">Kundenhinweise:</label>
            <textarea id="Kundenhinweise" v-model="order.customer_notes" class="inputs"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Interne Hinweise:</label>
            <textarea v-model="order.internal_notes" class="inputs"></textarea>
          </div>
        </section>
      </section>

      <button
        type="submit"
        :disabled="original_status == 'accepted' || original_status == 'rejected'"
        class="btn btn-update"
        @click="updateOrder"
      >
        <i class="bi bi-save btn-icons" aria-hidden="true"></i>
        Aktualisieren
      </button>
    </form>

    <router-link :to="`/orders/details/${$route.params.id}`" class="btn back-btn">
      ← Zurück zu den Bestelldetails
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'OrderEdit',
  data() {
    return {
      title: 'Auftrag bearbeiten',
      order: {
        status: '',
        status_by: '',
        status_date: '',
        status_comments: '',
        subject: '',
        delivery_address: '',
        delivery_postal_code: '',
        delivery_city: '',
        delivery_country: '',
        shipping_method: '',
        payment_terms: 14,
        payment_method: '',
        payment_reference: '',
        customer_notes: '',
        internal_notes: ''
      },
      original_status: ''
    }
  },
  mounted() {
    this.getOrder()
  },
  methods: {
    async getOrder() {
      const result = await window.api.getOrderById(this.$route.params.id)
      if (!result.success) return
      const o = result.rows
      this.order.status = o.status
      this.order.status_by = o.status_by
      this.order.status_date = o.status_date
      this.order.status_comments = o.status_comments
      this.order.subject = o.subject
      this.order.delivery_address = o.delivery_address
      this.order.delivery_postal_code = o.delivery_postal_code
      this.order.delivery_city = o.delivery_city
      this.order.delivery_country = o.delivery_country
      this.order.shipping_method = o.shipping_method
      this.order.payment_terms = o.payment_terms
      this.order.payment_method = o.payment_method
      this.order.payment_reference = o.payment_reference
      this.order.customer_notes = o.customer_notes
      this.order.internal_notes = o.internal_notes
      this.original_status = o.status
    },

    async updateOrder() {
      const data = { id: this.$route.params.id, ...this.order }
      const result = await window.api.updateOrderById(data)
      if (result.success) {
        this.$router.push('/orders/details/' + this.$route.params.id)
      }
    }
  }
}
</script>
