<template>
  <div v-if="order">
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/customers" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>

    <form @sunmit.prevent="submitPreview">
      <!-- Grunddaten -->
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-pin-angle-fill icons" aria-hidden="true"></i>Grunddaten
        </h2>
        <div class="form-row">
          <div class="form-group">
            <label for="Auftragsnummer" class="form-label"
              >Auftragsnummer <span class="stars">*</span></label
            >
            <input
              id="Auftragsnummer"
              v-model="order.id"
              type="text"
              class="inputs"
              readonly
              placeholder="AU-20251205-001"
            />
          </div>
          <div class="form-group">
            <label for="Auftragsdatum" class="form-label"
              >Auftragsdatum <span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="Auftragsdatum"
                v-model="order.date"
                type="date"
                class="inputs date"
                ref="date"
                @input="error.date = ''"
              />
            </div>
            <div v-if="error.date" class="error">
              {{ error.date }}
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Leistungszeitraum Von" class="form-label"
              >Leistungszeitraum Von <span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon"></i>
              <input
                id="Leistungszeitraum Von"
                v-model="order.service_period_start"
                ref="service_period_start"
                type="date"
                class="inputs date"
                @input="error.service_period_start = ''"
              />
            </div>
            <div v-if="error.service_period_start" class="error">
              {{ error.service_period_start }}
            </div>
          </div>
          <div class="form-group">
            <label for="Leistungszeitraum Bis" class="form-label"
              >Leistungszeitraum Bis <span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon"></i>
              <input
                id="Leistungszeitraum Bis"
                v-model="order.service_period_end"
                type="date"
                ref="service_period_end"
                class="inputs date"
                @input="error.service_period_end = ''"
              />
            </div>
            <div v-if="error.service_period_end" class="error">
              {{ error.service_period_end }}
            </div>
          </div>
        </div>
      </section>

      <!-- Kundendaten -->
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-person-fil form-icons" aria-hidden="true"></i>Kundendaten
        </h2>
        <div v-if="order.customer?.id" class="customer-details">
          <div class="form-group">
            <label for="Kunden-Nr" class="form-label"
              >Kunden-Nr. <span class="stars">*</span></label
            >
            <input id="Kunden-Nr" v-model="order.customer.id" type="text" class="inputs" readonly />
          </div>
          <div class="form-group">
            <label for="Firmenname" class="form-label"
              >Firmenname <span class="stars">*</span></label
            >
            <input
              id="Firmenname"
              v-model="order.customer.company_name"
              type="text"
              class="inputs"
              readonly
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="Vorname" class="form-label">Vorname <span class="stars">*</span></label>
              <input
                id="Vorname"
                v-model="order.customer.first_name"
                type="text"
                class="inputs"
                readonly
              />
            </div>
            <div class="form-group">
              <label for="Nachname" class="form-label">Nachname <span class="stars">*</span></label>
              <input
                id="Nachname"
                v-model="order.customer.last_name"
                type="text"
                class="inputs"
                readonly
              />
            </div>
          </div>
          <div class="form-group">
            <label for="Adresse" class="form-label">Adresse <span class="stars">*</span></label>
            <input
              id="Adresse"
              v-model="order.customer.address"
              type="text"
              class="inputs"
              readonly
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="PLZ" class="form-label">PLZ <span class="stars">*</span></label>
              <input
                id="PLZ"
                v-model="order.customer.postal_code"
                type="text"
                class="inputs"
                readonly
              />
            </div>
            <div class="form-group">
              <label for="Stadt" class="form-label">Stadt <span class="stars">*</span></label>
              <input id="Stadt" v-model="order.customer.city" type="text" class="inputs" readonly />
            </div>
          </div>
        </div>
      </section>

      <!-- Subject -->
      <div class="form-group">
        <label for="Betreff" class="form-label">Betreff <span class="stars">*</span></label>
        <input id="Betreff" v-model="order.subject" type="text" class="inputs" />
      </div>

      <!-- Lieferdaten + Versand -->
      <section class="sections" aria-label="Lieferung & Versand">
        <h2 class="sections-title">
          <i class="bi bi-box-seam icons" aria-hidden="true"></i>Lieferung & Versand
        </h2>
        <div class="form-group">
          <label for="Lieferbedingungen" class="form-label">Lieferbedingungen</label>
          <input
            id="Lieferbedingungen"
            v-model="order.delivery_terms"
            type="text"
            class="inputs"
            placeholder="Lieferbedingungen eingeben"
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Versandart" class="form-label">Versandart</label>
            <select id="Versandart" v-model="order.shipping_method" class="inputs">
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
          <div class="form-group">
            <label for="Liefertermin" class="form-label">Liefertermin</label>
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon"></i>
              <input
                id="Liefertermin"
                v-model="order.delivery_date"
                type="date"
                class="inputs date"
              />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="Lieferadresse" class="form-label">Lieferadresse</label>
          <textarea
            id="Lieferadresse"
            v-model="order.delivery_address"
            rows="2"
            class="inputs"
          ></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="PLZ" class="form-label">PLZ</label>
            <input id="PLZ" v-model="order.delivery_postal_code" type="text" class="inputs" />
          </div>
          <div class="form-group">
            <label for="Stadt" class="form-label">Stadt</label>
            <input id="Stadt" v-model="order.delivery_city" type="text" class="inputs" />
          </div>
          <div class="form-group">
            <label for="Land" class="form-label">Land</label>
            <input id="Land" v-model="order.delivery_country" type="text" class="inputs" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Sendemethode" class="form-label">Sendemethode</label>
            <input id="Sendemethode" v-model="order.sent_method" type="text" class="inputs" />
          </div>
          <div class="form-group">
            <label for="Gesendet am" class="form-label">Gesendet am</label>
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input id="Gesendet am" v-model="order.sent_at" type="date" class="inputs date" />
            </div>
          </div>
        </div>
      </section>

      <!-- Zahlung & Währung -->
      <section class="sections" aria-label="Zahlung & Währung">
        <h2 class="sections-title">
          <i class="bi bi-credit-card-2-front-fill icons" aria-hidden="true"></i>Zahlung & Währung
        </h2>
        <div class="form-row">
          <div class="form-group">
            <label for="Zahlungsbedingungen" class="form-label">Zahlungsbedingungen</label>
            <input
              id="Zahlungsbedingungen"
              v-model="order.payment_terms"
              type="text"
              class="inputs"
            />
          </div>
          <div class="form-group">
            <label for="Zahlungsart" class="form-label">Zahlungsart</label>
            <select id="Zahlungsart" v-model="order.payment_method" class="inputs">
              <option value="" disabled>Bitte auswählen</option>
              <option>Überweisung</option>
              <option>Bar</option>
              <option>PayPal</option>
              <option>Kreditkarte</option>
              <option>Lastschrift</option>
              <option>Scheck</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="Zahlungshinweise" class="form-label">Zahlungshinweise</label>
          <textarea
            id="Zahlungshinweise"
            v-model="order.payment_conditions"
            class="inputs"
          ></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Zahlungsreferenz" class="form-label">Zahlungsreferenz</label>
            <input
              id="Zahlungsreferenz"
              v-model="order.payment_reference"
              type="text"
              class="inputs"
            />
          </div>
          <div class="form-group">
            <label for="Währung" class="form-label">Währung <span class="stars">*</span></label>
            <select id="Währung" v-model="order.currency" class="inputs">
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
        </div>
      </section>

      <!-- Positions -->
      <section class="sections positions-error" aria-label="Positionen">
        <h2 class="sections-title">
          <i class="bi bi-box-seam icons"></i>
          Positionen <span class="stars">*</span>
        </h2>

        <div v-if="order.positions && order.positions.length === 0">Keine Positionen vorhanden</div>
        <div v-if="error.positions" class="error" role="alert">
          {{ error.positions }}
        </div>
        <div v-else class="positions-editor">
          <div v-for="(item, index) in order.positions" :key="index" class="position-item">
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
                  <label for="Leistungsdatum Von" class="form-label"
                    >Leistungsdatum Von <span class="stars">*</span></label
                  >
                  <div class="date-wrapper">
                    <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
                    <input
                      id="Leistungsdatum Von"
                      :ref="`service_period_start_${index}`"
                      v-model="item.service_period_start"
                      type="date"
                      class="inputs date"
                      required
                      @input="delete error[`service_period_start_${index}`]"
                    />
                  </div>
                  <div v-if="error[`service_period_start_${index}`]" class="error" role="alert">
                    {{ error[`service_period_start_${index}`] }}
                  </div>
                </div>
                <div class="form-group">
                  <label for="Leistungsdatum Bis" class="form-label"
                    >Leistungsdatum Bis <span class="stars">*</span></label
                  >
                  <div class="date-wrapper">
                    <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
                    <input
                      id="Leistungsdatum Bis"
                      :ref="`service_period_end_${index}`"
                      v-model="item.service_period_end"
                      type="date"
                      class="inputs date"
                      required
                      @input="delete error[`service_period_end_${index}`]"
                    />
                  </div>
                  <div v-if="error[`service_period_end_${index}`]" class="error" role="alert">
                    {{ error[`service_period_end_${index}`] }}
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="Bezeichnung" class="form-label">Bezeichnung</label>
                  <input
                    id="Bezeichnung"
                    v-model="item.title"
                    type="text"
                    class="inputs"
                    placeholder="Produkt / Leistung"
                  />
                </div>
                <div class="form-group">
                  <label for="Beschreibung" class="form-label">Beschreibung</label>
                  <input
                    id="Beschreibung"
                    v-model="item.description"
                    type="text"
                    class="inputs"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="Menge" class="form-label">Menge</label>
                  <input
                    id="Menge"
                    v-model.number="item.quantity"
                    type="number"
                    class="inputs"
                    min="1"
                  />
                </div>

                <div class="form-group">
                  <label for="Einzelpreis" class="form-label">Einzelpreis</label>
                  <input
                    id="Einzelpreis"
                    v-model.number="item.price"
                    type="number"
                    class="inputs"
                    step="0.01"
                  />
                </div>

                <div class="form-group">
                  <label for="MwSt" class="form-label">MwSt %</label>
                  <select id="MwSt" v-model.number="item.vat" class="inputs">
                    <option :value="0">0 %</option>
                    <option :value="7">7 %</option>
                    <option :value="19">19 %</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="Gesamt" class="form-label">Gesamt</label>
                  <input
                    id="Gesamt"
                    type="text"
                    class="inputs"
                    :value="positionTotal(item)"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-if="order.positions.length > 0" class="sections">
            <div class="btn-container">
              <div class="summary-item">
                <label class="form-label">Nettobetrag</label>
                <div class="form-result-item">
                  {{ formatCurrency(summary.net_total, order.currency) }}
                </div>
              </div>
              <div class="summary-item">
                <label class="form-label">MwSt Gesamt</label>
                <div class="form-result-item">
                  {{ formatCurrency(summary.vat_total, order.currency) }}
                </div>
              </div>
              <div class="summary-item">
                <label class="form-label">Bruttobetrag</label>
                <div class="form-result-item">
                  {{ formatCurrency(summary.gross_total, order.currency) }}
                </div>
              </div>
              <div class="summary-item">
                <label class="form-label">Rabatt</label>
                <div class="form-result-item">
                  {{ formatCurrency(summary.early_payment_discount, order.currency) }}
                </div>
              </div>
              <div class="summary-item">
                <label class="form-label">Endbetrag</label>
                <div class="form-result-item">
                  {{ formatCurrency(summary.gross_total_after_discount, order.currency) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-add-position" @click="addPosition">
          <i class="bi bi-plus-circle btn-icons" aria-hidden="true"></i>
          Position hinzufügen
        </button>
      </section>

      <!-- Notizen & Texte -->
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-pencil-square icons" aria-hidden="true"></i>Notizen & Texte
        </h2>
        <div class="form-group">
          <label for="Einleitungstext" class="form-label">Einleitungstext</label>
          <textarea
            id="Einleitungstext"
            v-model="order.intro_text"
            rows="2"
            class="inputs"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="Kundennotiz" class="form-label">Kundennotiz</label>
          <textarea
            id="Einleitungstext"
            v-model="order.customer_notes"
            rows="3"
            class="inputs"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="Interne Notiz" class="form-label">Interne Notiz</label>
          <textarea
            id="Interne Notiz"
            v-model="order.internal_notes"
            rows="2"
            class="inputs"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="Schlusstext" class="form-label">Schlusstext</label>
          <textarea
            id="Schlusstext"
            v-model="order.closing_text"
            rows="3"
            class="inputs"
          ></textarea>
        </div>
      </section>

      <!-- Vorschau Button -->
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
  name: 'CreateOrder',
  inject: ['formatCurrency'],
  data() {
    return {
      title: 'Auftrag erstellen',
      error: {},
      order: {
        id: '',
        customer_id: 0,
        customer: {},
        subject: '',
        date: '',
        validity_date: '',
        service_period_start: '',
        service_period_end: '',
        status: 'pending',
        status_by: '',
        status_date: '',
        status_comments: '',
        is_active: 1,
        delivery_terms: '',
        shipping_method: '',
        delivery_address: '',
        delivery_postal_code: '',
        delivery_city: '',
        delivery_country: 'Deutschland',
        delivery_date: '',
        payment_terms: 14,
        payment_method: '',
        payment_conditions: '',
        payment_reference: '',
        currency: 'EUR.de-DE',
        net_total: 0,
        vat_total: 0,
        gross_total: 0,
        positions: [],
        attachments: [],
        priority: '',
        internal_status_notes: '',
        intro_text: '',
        customer_notes: '',
        internal_notes: '',
        closing_text: '',
        sent_at: '',
        sent_method: '',
        created_at: '',
        updated_at: ''
      }
    }
  },
  mounted() {
    this.getStore()
    this.getCustomer()
  },
  methods: {
    async getCustomer() {
      if (!this.$route.query.id) return
      try {
        const data = { id: this.$route.query.id, table_name: 'orders' }
        const result = await window.api.getCustomerById(data)
        if (!result.success) return
        this.order.id = result.last_id == 0 ? 1 : result.last_id
        this.order.customer = result.rows
        this.order.customer_id = result.rows.id
      } catch (error) {
        console.error(error)
      }
    },
    getStore() {
      if (!store.state.order) return
      this.order = JSON.parse(JSON.stringify(store.state.order))
    },
    addPosition() {
      this.order.positions.push({
        title: 'Neue Position',
        description: '',
        service_period_start: '',
        service_period_end: '',
        quantity: 1,
        unit: 'Stk',
        price: 0,
        vat: 19,
        vat_unit: 0,
        unit_total: 0
      })
      this.error.positions = ''
    },
    deletePosition(index) {
      if (this.order.positions.length > 0) this.order.positions.splice(index, 1)
    },
    validateDates() {
      // Clear all errors first
      this.error = {}

      // 1. Check Auftragsdatum (order date) - EN ÖNCELİKLİ
      if (!this.order.date) {
        this.error.date = 'Auftragsdatum ist erforderlich'
        this.$nextTick(() => {
          const dateInput = this.$refs.date
          if (dateInput) {
            dateInput.focus()
          }
        })
        return false
      }

      // 2. Check service_period_start (Leistungszeitraum Von)
      if (!this.order.service_period_start) {
        this.error.service_period_start = 'Leistungszeitraum Von ist erforderlich'
        this.$nextTick(() => {
          const startInput = this.$refs.service_period_start
          if (startInput) {
            startInput.focus()
          }
        })
        return false
      }

      // 3. Check service_period_end (Leistungszeitraum Bis)
      if (!this.order.service_period_end) {
        this.error.service_period_end = 'Leistungszeitraum Bis ist erforderlich'
        this.$nextTick(() => {
          const endInput = this.$refs.service_period_end
          if (endInput) {
            endInput.focus()
          }
        })
        return false
      }

      // 4. Check: service_period_end cannot be before service_period_start
      if (new Date(this.order.service_period_end) < new Date(this.order.service_period_start)) {
        this.error.service_period_end =
          'Leistungszeitraum Bis kann nicht vor Leistungszeitraum Von liegen'
        this.$nextTick(() => {
          const endInput = this.$refs.service_period_end
          if (endInput) {
            endInput.focus()
          }
        })
        return false
      }

      // 5. Check positions exist
      if (!this.order.positions || this.order.positions.length === 0) {
        this.error.positions = 'Mindestens eine Position ist erforderlich'
        return false
      }

      // 6. Check dates in positions
      for (let i = 0; i < this.order.positions.length; i++) {
        const position = this.order.positions[i]

        // Check service period start date
        if (!position.service_period_start) {
          this.error[`service_period_start_${i}`] = 'Leistungsdatum Von ist erforderlich'
          this.$nextTick(() => {
            const refElement = this.$refs[`service_period_start_${i}`]
            if (refElement && refElement.length > 0) {
              refElement[0].focus()
            }
          })
          return false
        }

        // Check service period end date
        if (!position.service_period_end) {
          this.error[`service_period_end_${i}`] = 'Leistungsdatum Bis ist erforderlich'
          this.$nextTick(() => {
            const refElement = this.$refs[`service_period_end_${i}`]
            if (refElement && refElement.length > 0) {
              refElement[0].focus()
            }
          })
          return false
        }

        // Check: End date cannot be before start date
        if (new Date(position.service_period_end) < new Date(position.service_period_start)) {
          this.error[`service_period_end_${i}`] = 'Enddatum kann nicht vor dem Startdatum liegen'
          this.$nextTick(() => {
            const refElement = this.$refs[`service_period_end_${i}`]
            if (refElement && refElement.length > 0) {
              refElement[0].focus()
            }
          })
          return false
        }
      }

      return true
    },
    positionTotal(item) {
      const net = item.quantity * item.price
      return (net * (1 + item.vat / 100)).toFixed(2)
    },
    getUnitTotal(quantity, price, index) {
      const vat = this.order.positions[index].vat || 0
      const base = quantity * price
      this.order.positions[index].vat_unit = (base * (vat / 100)).toFixed(2)
      this.order.positions[index].unit_total = (base * (1 + vat / 100)).toFixed(2)
    },
    summary() {
      let netTotal = 0
      let vatTotal = 0

      this.order.positions.forEach((pos) => {
        const unitTotal = parseFloat(pos.unit_total || 0)
        const vatUnit = parseFloat(pos.vat_unit || 0)
        netTotal += unitTotal
        vatTotal += vatUnit
      })

      this.order.net_total = netTotal.toFixed(2)
      this.order.vat_total = vatTotal.toFixed(2)
      this.order.gross_total = (netTotal + vatTotal).toFixed(2)
    },
    async submitPreview() {
      if (!this.order) return
      if (!this.validateDates()) return
      // if (!this.checkPositionsDates(this.order.positions)) return

      // Check positions exist
      if (!this.order.positions || this.order.positions.length === 0) {
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
      await store.setPreview('order', JSON.parse(JSON.stringify(this.order)))
      this.$router.push('/orders/preview')
    }
  }
}
</script>
