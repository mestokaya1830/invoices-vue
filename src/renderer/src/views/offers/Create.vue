<template>
  <div v-if="offer">
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/customers" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>

    <form @submit.prevent="submitPreview">
      <!-- Grunddaten -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-pin-angle-fill" aria-hidden="true"></i>Grunddaten
        </div>
        <div class="form-group">
          <label for="angebot-id" class="form-label"
            >Angebotsnummer <span class="stars">*</span></label
          >
          <input id="angebot-id" v-model="offer.id" type="text" class="inputs" readonly />
          <small class="hint">Format: AN-YYYY-XXXX (automatisch generiert)</small>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="angebot-datum" class="form-label"
              >Angebotsdatum <span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="angebot-datum"
                ref="date"
                v-model="offer.date"
                type="date"
                class="inputs date"
                required
                @input="error.date = ''"
              />
            </div>
            <div v-if="error.date" class="error">{{ error.date }}</div>
          </div>
          <div class="form-group">
            <label for="gueltig-bis" class="form-label"
              >Gültigkeitsdatum <span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="gueltig-bis"
                ref="valid_until"
                v-model="offer.valid_until"
                type="date"
                class="inputs date"
                required
                @input="error.valid_until = ''"
              />
            </div>
            <div v-if="error.valid_until" class="error">{{ error.valid_until }}</div>
          </div>
        </div>
        <div class="form-group">
          <label for="angebot-subject" class="form-label">Betreff / Beschreibung</label>
          <input
            id="angebot-subject"
            v-model="offer.subject"
            type="text"
            class="inputs"
            placeholder="z.B. Webentwicklung Projekt XYZ"
          />
        </div>
      </section>

      <!-- Kundendaten -->
      <section v-if="offer.customer" class="sections">
        <div class="sections-title">
          <i class="bi bi-person-fill icons" aria-hidden="true"></i>Kundendaten
        </div>
        <div v-if="offer.customer?.id" class="customer-details">
          <div class="form-group">
            <label for="kunde-id" class="form-label">Kunden-Nr. <span class="stars">*</span></label>
            <input id="kunde-id" v-model="offer.customer.id" type="text" class="inputs" readonly />
          </div>
          <div class="form-group">
            <label for="firma-name" class="form-label">Firmname <span class="stars">*</span></label>
            <input
              id="firma-name"
              v-model="offer.customer.company_name"
              type="text"
              class="inputs"
              readonly
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="kunde-vorname" class="form-label"
                >Vorname <span class="stars">*</span></label
              >
              <input
                id="kunde-vorname"
                v-model="offer.customer.first_name"
                type="text"
                class="inputs"
                readonly
              />
            </div>
            <div class="form-group">
              <label for="kunde-nachname" class="form-label"
                >Nachname <span class="stars">*</span></label
              >
              <input
                id="kunde-nachname"
                v-model="offer.customer.last_name"
                type="text"
                class="inputs"
                readonly
              />
            </div>
          </div>
          <div class="form-group">
            <label for="kunde-adresse" class="form-label"
              >Adresse <span class="stars">*</span></label
            >
            <input
              id="kunde-adresse"
              v-model="offer.customer.address"
              type="text"
              class="inputs"
              readonly
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="kunde-plz" class="form-label">PLZ <span class="stars">*</span></label>
              <input
                id="kunde-plz"
                v-model="offer.customer.postal_code"
                type="text"
                class="inputs"
                readonly
              />
            </div>
            <div class="form-group">
              <label for="kunde-stadt" class="form-label">Stadt <span class="stars">*</span></label>
              <input
                id="kunde-stadt"
                v-model="offer.customer.city"
                type="text"
                class="inputs"
                readonly
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Status -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-info-circle icons" aria-hidden="true"></i>Status
        </div>

        <div class="form-group">
          <label for="status" class="form-label">Status</label>
          <select id="status" v-model="offer.status" class="inputs">
            <option value="draft">Entwurf</option>
            <option value="sent">Gesendet</option>
            <option value="accepted">Angenommen</option>
            <option value="rejected">Abgelehnt</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status-by" class="form-label">Status geändert von</label>
          <input
            id="status-by"
            v-model="offer.status_by"
            type="text"
            class="inputs"
            placeholder="z. B. Max Mustermann"
          />
        </div>

        <div class="form-group">
          <label for="status-comments" class="form-label">Statuskommentar</label>
          <textarea
            id="status-comments"
            v-model="offer.status_comments"
            class="inputs"
            rows="2"
            placeholder="Interne Anmerkung zum Status"
          ></textarea>
        </div>
      </section>

      <!-- Währung -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-currency-exchange icons" aria-hidden="true"></i>Währung
        </div>
        <div class="form-group">
          <label for="waehrung" class="form-label">Währung</label>
          <select id="waehrung" v-model="offer.currency" class="inputs">
            <option value="EUR.de-DE">EUR</option>
            <option value="USD.en-US">USD</option>
            <option value="GBP.en-GB">GBP</option>
            <option value="CHF.ch-CH">CHF</option>
            <option value="JPY.ja-JP">JPY</option>
            <option value="AUD.en-AU">AUD</option>
            <option value="CAD.en-CA">CAD</option>
            <option value="CNY.zh-CN">CNY</option>
            <option value="SEK.sv-SE">SEK</option>
            <option value="NZD.en-NZ">NZD</option>
          </select>
        </div>
      </section>

      <!-- Positions -->
      <section class="sections positions-error">
        <div class="sections-title">
          <i class="bi bi-box-seam icons" aria-hidden="true"></i>
          Positionen <span class="stars">*</span>
        </div>

        <div v-if="offer.positions && offer.positions.length === 0">Keine Positionen vorhanden</div>
        <div v-if="error.positions" class="error">{{ error.positions }}</div>

        <div v-else class="positions-editor">
          <div v-for="(item, index) in offer.positions" :key="index" class="position-item">
            <div class="sections">
              <div class="positions-header">
                <span class="position-number"> Position {{ index + 1 }} </span>
                <button type="button" @click="deletePosition(index)">
                  <i class="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </div>

              <!-- FORM FIELDS -->
              <div class="form-row">
                <div class="form-group">
                  <label :for="`leistungsdatum-von-${index}`" class="form-label"
                    >Leistungsdatum Von <span class="stars">*</span></label
                  >
                  <input
                    :id="`leistungsdatum-von-${index}`"
                    :ref="`service_period_start_${index}`"
                    v-model="item.service_period_start"
                    type="date"
                    class="inputs date"
                    required
                    @input="error.service_period_start = ''"
                  />
                </div>
                <div class="form-group">
                  <label :for="`leistungsdatum-bis-${index}`" class="form-label"
                    >Leistungsdatum Bis <span class="stars">*</span></label
                  >
                  <input
                    :id="`leistungsdatum-bis-${index}`"
                    :ref="`service_period_end_${index}`"
                    v-model="item.service_period_end"
                    type="date"
                    class="inputs date"
                    required
                    @input="error.service_period_end = ''"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label :for="`bezeichnung-${index}`" class="form-label">Bezeichnung</label>
                  <input
                    :id="`bezeichnung-${index}`"
                    v-model="item.title"
                    type="text"
                    class="inputs"
                    placeholder="Produkt / Leistung"
                  />
                </div>
                <div class="form-group">
                  <label :for="`beschreibung-${index}`" class="form-label">Beschreibung</label>
                  <input
                    :id="`beschreibung-${index}`"
                    v-model="item.description"
                    type="text"
                    class="inputs"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label :for="`menge-${index}`" class="form-label">Menge</label>
                  <input
                    :id="`menge-${index}`"
                    v-model.number="item.quantity"
                    type="number"
                    class="inputs"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label :for="`einzelpreis-${index}`" class="form-label">Einzelpreis</label>
                  <input
                    :id="`einzelpreis-${index}`"
                    v-model.number="item.price"
                    type="number"
                    class="inputs"
                    step="0.01"
                  />
                </div>
                <div class="form-group">
                  <label :for="`mwst-${index}`" class="form-label">MwSt %</label>
                  <select :id="`mwst-${index}`" v-model.number="item.vat" class="inputs">
                    <option :value="0">0 %</option>
                    <option :value="7">7 %</option>
                    <option :value="19">19 %</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="gesamt" class="form-label">Gesamt</label>
                  <input
                    id="gesamt"
                    type="text"
                    class="inputs"
                    :value="positionTotal(item)"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-add-position" @click="addPosition">
          <i class="bi bi-plus-circle btn-icons" aria-hidden="true"></i>Position hinzufügen
        </button>
      </section>

      <!-- Zusätzliche Informationen -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-file-text-fill icons" aria-hidden="true"></i>Zusätzliche Informationen
        </div>

        <div class="form-group">
          <label for="zahlung-bedingungen" class="form-label">Zahlungsbedingungen</label>
          <textarea
            id="zahlung-bedingungen"
            v-model="offer.payment_terms"
            class="inputs"
            rows="2"
            placeholder="z. B. 14 Tage netto, 2 % Skonto bei Zahlung innerhalb 8 Tagen"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="liefer-bedingungen" class="form-label">Lieferbedingungen</label>
          <textarea
            id="liefer-bedingungen"
            v-model="offer.delivery_terms"
            class="inputs"
            rows="2"
            placeholder="z. B. frei Haus, ab Werk, DAP, EXW unserer Niederlassung in Berlin"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="lieferzeit" class="form-label">Lieferzeit</label>
          <div class="date-wrapper">
            <input id="lieferzeit" v-model="offer.delivery_time" type="date" class="inputs date" />
          </div>
        </div>

        <div class="form-group">
          <label for="einleitung-text" class="form-label">Einleitungstext</label>
          <textarea
            id="einleitung-text"
            v-model="offer.introduction_text"
            class="inputs"
            rows="3"
            placeholder="Vielen Dank für Ihre Anfrage vom XX.XX.XXXX. Gerne unterbreiten wir Ihnen nachfolgend unser Angebot…"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="abschluss-text" class="form-label">Abschlusstext</label>
          <textarea
            id="abschluss-text"
            v-model="offer.closing_text"
            class="inputs"
            rows="3"
            placeholder="Wir freuen uns auf Ihre Rückmeldung und stehen bei Rückfragen jederzeit gerne zur Verfügung. Mit freundlichen Grüßen"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="kunden-notizen" class="form-label">Notizen (für Kunden sichtbar)</label>
          <textarea
            id="kunden-notizen"
            v-model="offer.notes"
            class="inputs"
            rows="3"
            placeholder="z. B. Preise verstehen sich zzgl. gesetzlicher MwSt. • Gültigkeit des Angebots: 30 Tage"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="interne-notizen" class="form-label">Interne Notizen</label>
          <textarea
            id="interne-notizen"
            v-model="offer.internal_notes"
            class="inputs"
            rows="3"
            placeholder="z. B. Kunde wünscht Expressversand • Rabatt nur bei Vorkasse • Material aktuell knapp"
          ></textarea>
        </div>
      </section>

      <section class="switch-container" aria-label="Legally binding signature">
        <label for="is_legal" class="switch">
          <input id="is_legal" v-model="offer.is_legal" type="checkbox" />
          <span class="slider round"></span>
        </label>
        <div class="switch-text">
          <i class="bi bi-pencil-square icons"></i><strong>Legally binding signature</strong>
        </div>
      </section>

      <div class="sections btn-container">
        <button type="submit" class="btn btn-preview" @click="submitPreview">
          <i class="bi bi-eye btn-icons" aria-hidden="true"></i>Vorschau anzeigen
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import store from '../../store/index.js'
export default {
  name: 'CreateOffer',
  inject: ['formatCurrency', 'checkServiceDates'],
  data() {
    return {
      title: 'Angebot erstellen',
      error: {},
      offer: {
        id: 0,
        customer_id: 0, //for foreing key

        date: '',
        valid_until: '',

        customer: null,

        subject: '',
        currency: 'EUR.de-DE',
        payment_terms: '',
        delivery_terms: '',
        delivery_time: '',

        introduction_text: '',
        closing_text: '',
        notes: '',
        internal_notes: '',

        status: 'draft',
        status_by: '',
        status_comments: '',

        is_active: 1,
        is_legal: 0,

        positions: [],
        net_total: 0,
        vat_total: 0,
        gross_total: 0
      }
    }
  },
  mounted() {
    this.getCustomer()
    this.getStore()
  },
  methods: {
    async getCustomer() {
      if (!this.$route.query.id) return
      try {
        const data = {
          id: this.$route.query.id,
          table_name: 'offers'
        }
        const result = await window.api.getCustomerById(data)
        if (!result.success) return
        this.offer.id = result.last_id == 0 ? 1 : result.last_id
        this.offer.customer = result.rows
        this.offer.customer_id = result.rows.id
      } catch (error) {
        console.error(error)
      }
    },
    getStore() {
      if (!store.state.offer) return
      this.offer = JSON.parse(JSON.stringify(store.state.offer))
    },
    addPosition() {
      if (!this.offer.positions) return
      this.offer.positions.push({
        title: 'Neue Position',
        description: 'Beschreibung',
        service_period_start: '',
        service_period_end: '',
        quantity: 1,
        unit: 'Stk',
        price: 0,
        vat: 19,
        unit_total: 0
      })
      this.error.positions = ''
    },
    deletePosition(index) {
      if (!this.offer.positions) return
      if (this.offer.positions.length > 0) {
        this.offer.positions.splice(index, 1)
      } else {
        alert('Keine Positionen vorhanden!')
      }
    },
    validateDates() {
      let isValid = true

      // Check (offer date)
      if (!this.offer.date) {
        this.error.date = 'Rechnungsdatum ist erforderlich'
        this.$refs.date.focus()
        isValid = false
        return isValid
      }

      // Check (service date)
      if (!this.offer.valid_until) {
        this.error.valid_until = 'Leistungsdatum ist erforderlich'
        this.$refs.valid_until.focus()
        isValid = false
        return isValid
      }

      // NEW: offer date cannot be before service date
      if (new Date(this.offer.date) < new Date(this.offer.valid_until)) {
        this.error.date = 'Rechnungsdatum kann nicht vor dem Leistungsdatum liegen'
        this.$refs.date.focus()
        isValid = false
        return isValid
      }

      // Check dates in positions
      for (let i = 0; i < this.offer.positions.length; i++) {
        const position = this.offer.positions[i]

        // Check service period start date
        if (!position.service_period_start) {
          this.error.service_period_start = 'Leistungsdatum Von ist erforderlich'
          if (this.$refs[`service_period_start_${i}`]) {
            this.$refs[`service_period_start_${i}`][0].focus()
          }
          isValid = false
          return isValid
        }

        // Check service period end date
        if (!position.service_period_end) {
          this.error.service_period_end = 'Leistungsdatum Bis ist erforderlich'
          if (this.$refs[`service_period_end_${i}`]) {
            this.$refs[`service_period_end_${i}`][0].focus()
          }
          isValid = false
          return isValid
        }

        // NEW: End date cannot be before start date
        if (new Date(position.service_period_end) < new Date(position.service_period_start)) {
          this.error.service_period_end = 'Enddatum kann nicht vor dem Startdatum liegen'
          if (this.$refs[`service_period_end_${i}`]) {
            this.$refs[`service_period_end_${i}`][0].focus()
          }
          isValid = false
          return isValid
        }
      }

      return isValid
    },
    positionTotal(item) {
      const net = item.quantity * item.price
      return (net * (1 + item.vat / 100)).toFixed(2)
    },
    getUnitTotal(quantity, price, index) {
      const vat = this.offer.positions[index].vat || 0
      const base = quantity * price
      this.offer.positions[index].unit_total = base.toFixed(2)
      this.offer.positions[index].vat_unit = (base * (vat / 100)).toFixed(2)
    },
    summary() {
      let netTotal = 0
      let vatTotal = 0

      this.offer.positions.forEach((pos) => {
        const unitTotal = parseFloat(pos.unit_total || 0)
        const vatUnit = parseFloat(pos.vat_unit || 0)
        netTotal += unitTotal
        vatTotal += vatUnit
      })

      this.offer.net_total = netTotal.toFixed(2)
      this.offer.vat_total = vatTotal.toFixed(2)
      this.offer.gross_total = (netTotal + vatTotal).toFixed(2)
    },
    async submitPreview() {
      if (!this.offer) return
      if (!this.validateDates()) {
        return
      }

      // Check positions exist
      if (!this.offer.positions || this.offer.positions.length === 0) {
        this.error.positions = 'Mindestens eine Position ist erforderlich'
        this.$nextTick(() => {
          const positionsError = document.querySelector('.positions-error')
          if (positionsError) {
            positionsError.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
        return false
      }

      this.summary()
      await store.setPreview('offer', JSON.parse(JSON.stringify(this.offer)))
      this.$router.push('/offers/preview')
    }
  }
}
</script>
