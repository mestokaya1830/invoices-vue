<template>
  <div v-if="payment">
    <header class="main-header">
      <h1>{{ title }}</h1>
      <router-link to="/invoices" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>

    <form @submit.prevent="submitPreview">
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-file-text icons" aria-hidden="true"></i>Ausgewählte Rechnung
        </h2>
        <dl class="customer-details" style="margin-top: 16px">
          <div class="form-row">
            <div class="form-group">
              <dt class="form-label">Rechnung-Nr. <span class="star">*</span></dt>
              <dd class="inputs">{{ formatInvoiceId(payment.invoice.id) }}</dd>
            </div>
            <div class="form-group">
              <dt class="form-label">Kunden-Nr. <span class="star">*</span></dt>
              <dd class="inputs">{{ formatCustomerId(payment.invoice.customer_id) }}</dd>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <dt class="form-label">Rechnungsdatum <span class="star">*</span></dt>
              <dd class="inputs">{{ formatDate(payment.invoice.date) }}</dd>
            </div>
            <div class="form-group">
              <dt class="form-label">Fälligkeitsdatum <span class="star">*</span></dt>
              <dd class="inputs">{{ formatDate(payment.invoice.due_date) }}</dd>
            </div>
          </div>

          <dl class="form-group">
            <dt class="form-label">Gesamtsumme:</dt>
            <dd>
              {{ formatCurrency(payment.invoice.gross_total, payment.invoice.currency) }}
            </dd>
            <dt>Bereits gezahlt:</dt>
            <dd>{{ formatCurrency(payment.payment_total, payment.invoice.currency) }}</dd>
            <dt>Offener Betrag:</dt>
            <dd>{{ formatCurrency(outstanding, payment.invoice.currency) }}</dd>
          </dl>
        </dl>
      </section>

      <section class="sections iban-section">
        <h2 class="sections-title">
          <i class="bi bi-bank2 icons" aria-hidden="true"></i>Gegenpartei Informationen
        </h2>

        <IbanComponent
          ref="ibanSection"
          v-model:localNamePartner="payment.counterparty_name"
          v-model:iban="payment.counterparty_iban"
          v-model:bic="payment.counterparty_bic"
          @nameValid="nameValid = $event"
          @ibanValid="ibanValid = $event"
          @bicValid="bicValid = $event"
          @update:bank="setBank"
        />
      </section>

      <section class="sections">
        <h2 class="sections-title"><i class="bi bi-coin icons" aria-hidden="true"></i>Währung</h2>
        <div class="form-group">
          <label for="Währung" class="form-label">Währung <span class="star">*</span></label>
          <select v-model="payment.invoice.currency" class="inputs">
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

      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-cash-stack icons" aria-hidden="true"></i>Zahlungsdetails
        </h2>
        <div class="form-row">
          <div class="form-group">
            <label for="Zahlungsdatum" class="form-label"
              >Zahlungsdatum <span class="star">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="Zahlungsdatum"
                ref="date"
                v-model="payment.date"
                type="date"
                class="inputs date"
                @change="checkEarlyPayment"
              />
            </div>
            <small v-if="error.date" class="error" role="alert">{{ error.date }}</small>
          </div>

          <div class="form-group">
            <label for="Betrag" class="form-label">Betrag (€) <span class="star">*</span></label>
            <input
              id="Betrag"
              ref="payment_amount"
              v-model="payment.payment_amount"
              type="number"
              class="inputs"
              min="0"
              :disabled="isPaymentAmountDisabled"
              @input="onAmountInput"
            />
            <small v-if="error.payment_amount" class="error" role="alert">{{
              error.payment_amount
            }}</small>
            <small v-if="paymentAmountError" class="form-warning"
              >Der Zahlungsbetrag darf den Rechnungsbetrag nicht überschreiten.</small
            >
            <div class="payment-row">
              <div class="form-group">
                <label for="Rabatt" class="form-label">Rabatt</label>
                <small v-if="is_early_payment_selected">{{
                  payment.invoice.early_payment_discount
                }}</small>
                <small v-else>0</small>
              </div>
              <dl class="form-group">
                <dt for="Offener Betrag" class="form-label">Offener Betrag</dt>
                <dd>{{ formatCurrency(setOutstanding, payment.invoice.currency) }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="Zahlungsmethode" class="form-label"
              >Zahlungsmethode <span class="star">*</span></label
            >
            <select id="Zahlungsmethode" v-model="payment.payment_method" class="inputs">
              <option>Überweisung</option>
              <option>Bar</option>
              <option>PayPal</option>
              <option>Kreditkarte</option>
              <option>Lastschrift</option>
              <option>Scheck</option>
            </select>
          </div>

          <div class="form-group">
            <label for="Zahlungsreferenz" class="form-label">Zahlungsreferenz</label>
            <input
              id="Zahlungsreferenz"
              v-model="payment.payment_reference"
              type="text"
              class="inputs"
              placeholder="z.B. Bankreferenz, Transaktions-ID"
            />
            <small class="hint">Optional</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="Beleg / Zahlungsnachweis (optional)" class="form-label"
              >Beleg / Zahlungsnachweis (optional)</label
            >
            <input type="file" accept=".pdf,image/*" @change="setImage" />
          </div>

          <div class="form-group">
            <label for="Ausgewählte Datei" class="form-label">Ausgewählte Datei</label>
            <img
              v-if="selectedImage"
              :src="selectedImage"
              alt=""
              class="selected-image"
              aria-hidden="true"
            />
            <div v-else>{{ payment.file_name }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="Notizen (optional)" class="form-label">Notizen (optional)</label>
          <textarea id="Notizen" v-model="payment.notes" class="inputs" rows="3"></textarea>
        </div>
      </section>

      <!-- GoBD Compliance Hinweis -->
      <section class="sections">
        <div class="compliance-notice">
          <i class="bi bi-info-circle-fill icons" aria-hidden="true"></i>
          <strong>GoBD-Hinweis:</strong> Alle mit * markierten Felder sind für die ordnungsgemäße
          Buchführung nach deutschen Steuergesetzen erforderlich. Die Daten werden revisionssicher
          gespeichert.
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
import store from '../../store'
import IbanComponent from '../../components/IbanComponent.vue'

export default {
  components: {
    IbanComponent
  },
  inject: ['formatInvoiceId', 'formatCustomerId', 'formatDate', 'formatCurrency'],
  data() {
    return {
      title: 'Zahlung erfassen',
      payment: null,
      selectedImage: null,
      blobImage: null,
      ibanError: '',
      handleIban: false,
      ibanCountryFlag: '',
      bicError: '',
      paymentAmountError: false,
      isPaymentAmountDisabled: false,
      is_early_payment_selected: false,
      outstanding: 0,
      nameValid: false,
      ibanValid: false,
      bicValid: false,
      error: {}
    }
  },
  computed: {
    setOutstanding() {
      return this.outstanding - this.payment.payment_amount
    },
    formValid() {
      return this.nameValid && this.ibanValid && this.bicValid
    }
  },
  mounted() {
    this.getStore()
  },

  methods: {
    async getInvoice() {
      const id = this.$route.params.id
      if (!id) return
      try {
        const data = { id, table_name: 'payments' }
        const result = await window.api.getInvoiceById(data)
        if (!result.rows) return
        this.payment = {
          id: result.payment_id + 1,
          date: null,
          invoice_id: result.rows.id,
          customer_id: result.rows.customer_id,
          is_active: 1,
          payment_amount: '',
          payment_total: result.payment_total,
          payment_method: 'Überweisung',
          payment_reference: '',
          counterparty_name: '',
          counterparty_iban: '',
          counterparty_bic: '',
          counterparty_bank: '',
          notes: '',
          file_name: '',
          invoice: result.rows
        }
        this.outstanding = result.rows.gross_total - result.payment_total
      } catch (error) {
        console.error(error)
      }
    },

    async getStore() {
      // await store.clearFilters('payment')
      if (!store.state.payment) return await this.getInvoice()
      this.payment = JSON.parse(JSON.stringify(store.state.payment))
      this.outstanding = this.payment.invoice.gross_total - this.payment.payment_total
      this.selectedImage = this.payment.image_file
      this.checkEarlyPayment()
    },

    setImage(event) {
      const file = event.target.files[0]
      if (!file) return
      const arrayBuffer = file.arrayBuffer()
      this.blobImage = Array.from(new Uint8Array(arrayBuffer)) //to send to backend
      const timestamp = new Date().getTime()
      this.payment.file_name = `${this.payment.id}-${timestamp}.${file.name.split('.').pop()}`
      this.selectedImage = URL.createObjectURL(file)
    },

    onAmountInput() {
      if (!this.isCalculating) {
        this.calculateOutstanding()
      }
    },

    calculateOutstanding() {
      if (!this.payment) return 0
      let gross = this.payment.invoice.gross_total
      let paid = this.payment.payment_total
      let amount = Number(this.payment.payment_amount) || 0

      let outstanding
      if (this.is_early_payment_selected) {
        outstanding = 0
      } else {
        outstanding = gross - (paid + amount)
      }
      return Number(outstanding.toFixed(2))
    },

    checkEarlyPayment() {
      if (!this.payment.invoice.early_payment_offer) return
      this.isCalculating = true

      const {
        early_payment_days: earlyDays = 0,
        gross_total: grossTotal = 0,
        gross_total_after_discount: earlyTotal = 0,
        date: invoiceDateRaw
      } = this.payment.invoice

      const invoiceDate = invoiceDateRaw && new Date(invoiceDateRaw)
      const paymentDate = this.payment.date && new Date(this.payment.date)

      const earlyPaymentDate = invoiceDate && new Date(invoiceDate)
      earlyPaymentDate?.setDate(earlyPaymentDate.getDate() + earlyDays)

      this.is_early_payment_selected = paymentDate <= earlyPaymentDate

      this.payment.invoice.early_paid_discount_applied = this.is_early_payment_selected
      this.isPaymentAmountDisabled = this.is_early_payment_selected
      this.outstanding = this.is_early_payment_selected ? earlyTotal : grossTotal

      if (this.is_early_payment_selected) {
        this.payment.payment_amount = earlyTotal
        this.payment.invoice.paid_at = paymentDate
      }

      this.$nextTick(() => {
        this.isCalculating = false // Flag'i kapat
        this.calculateOutstanding()
      })
    },

    setBank(bankName) {
      this.payment.counterparty_bank = bankName
    },

    setPaymentStatus() {
      let result = this.calculateOutstanding()
      if (result === 0) {
        this.payment.invoice.payment_status = 'paid'
        return
      }
      this.payment.invoice.payment_status = 'partially_paid'
    },

    checkPaymentDate() {
      if (!this.payment.date) {
        this.$refs.date.focus()
        return
      }
      return true
    },

    validate() {
      let isValid = true
      if (!this.payment.date) {
        this.error.date = 'Datum ist erforderlich'
        this.$refs.date.focus()
        isValid = false
      } else {
        this.error.date = ''
      }

      if (!this.payment.payment_amount) {
        this.error.payment_amount = 'Zahlungsbetrag ist erforderlich'
        isValid = false
      } else if (this.payment.payment_amount <= 0) {
        this.error.payment_amount = 'Zahlungsbetrag muss größer als 0 sein'
        isValid = false
      } else if (this.payment.payment_amount > this.outstanding) {
        this.error.payment_amount = 'Zahlungsbetrag darf den offenen Betrag nicht überschreiten'
        isValid = false
      } else {
        this.error.payment_amount = ''
      }

      return isValid
    },

    scrollToIban() {
      this.$nextTick(() => {
        const el = document.querySelector('.iban-section')
        if (!el) return

        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      })
    },

    async submitPreview() {
      // if (!this.formValid) {
      //   this.scrollToIban()
      //   console.log('Form is invalid. Please correct the errors before submitting.')
      //   return
      // }
      if (!this.validate()) return
      if (this.setPaymentStatus()) return
      await store.setPreview('payment', JSON.parse(JSON.stringify(this.payment)))
      this.$router.push('/payments/preview')
    }
  }
}
</script>
