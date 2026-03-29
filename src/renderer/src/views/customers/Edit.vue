<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/customers" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <form v-if="customer" @submit.prevent="updateCustomer">
      <!-- Base -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-person-badge icons" aria-hidden="true"></i
          >Kundeninformationen
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="Wähle Unternehmenstyp" class="form-label"
              >Unternehmenstyp <span class="stars">*</span></label
            >
            <select v-model="customer.company_type" id="Wähle Unternehmenstyp" class="inputs">
              <option disabled value="">Wähle Unternehmenstyp</option>
              <option v-for="item in companies" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <div v-if="error.company_type" class="error" role="alert">{{ error.company_type }}</div>
          </div>

          <div class="form-group">
            <label for="Firmenname" class="form-label"
              >Firmenname <span class="stars">*</span></label
            >
            <input v-model="customer.company_name" type="text" id="Firmenname" class="inputs" />
            <div v-if="error.company_name" class="error" role="alert">{{ error.company_name }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Vorname" class="form-label">Vorname <span class="stars">*</span></label>
            <input v-model="customer.first_name" type="text" id="Vorname" class="inputs" />
            <div v-if="error.first_name" class="error" role="alert">{{ error.first_name }}</div>
          </div>

          <div class="form-group">
            <label for="Nachname" class="form-label">Nachname <span class="stars">*</span></label>
            <input id="Nachname" v-model="customer.last_name" type="text" class="inputs" />
            <div v-if="error.last_name" class="error" role="alert">{{ error.last_name }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-row">
            <div class="form-group">
              <label for="Email" class="form-label">E-Mail <span class="stars">*</span></label>
              <input id="Email" v-model="customer.email" type="email" class="inputs" />
              <div v-if="error.email" class="error" role="alert">{{ error.email }}</div>
            </div>

            <div class="form-group">
              <label for="Telefonnummer" class="form-label"
                >Telefonnummer <span class="stars">*</span></label
              >
              <input id="Telefonnummer" v-model="customer.phone" type="text" class="inputs" />
              <div v-if="error.phone" class="error" role="alert">{{ error.phone }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Adressdaten -->
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-geo-alt  icons" aria-hidden="true"></i>
          Adressdaten
        </h2>
        <div class="form-row">
          <div class="form-group">
            <label for="Adresse" class="form-label">Adresse <span class="stars">*</span></label>
            <input id="Adresse" v-model="customer.address" type="text" class="inputs" />
            <div v-if="error.address" class="error" role="alert">{{ error.address }}</div>
          </div>

          <div class="form-group">
            <label for="Postleitzahl" class="form-label"
              >Postleitzahl <span class="stars">*</span></label
            >
            <input id="Postleitzahl" v-model="customer.postal_code" type="text" class="inputs" />
            <div v-if="error.postal_code" class="error" role="alert">{{ error.postal_code }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Stadt" class="form-label">Stadt <span class="stars">*</span></label>
            <input id="Stadt" v-model="customer.city" type="text" class="inputs" />
            <div v-if="error.city" class="error" role="alert">{{ error.city }}</div>
          </div>

          <div class="form-group">
            <label for="Land" class="form-label">Land <span class="stars">*</span></label>
            <input id="Land" v-model="customer.country" type="text" class="inputs" />
            <div v-if="error.country" class="error" role="alert">{{ error.country }}</div>
          </div>
        </div>
      </section>

      <!-- Steuerinformationen -->
      <section class="sections">
        <h2 class="sections-title">
          <i class="bi bi-briefcase  icons" aria-hidden="true"></i>Steuerinformationen
        </h2>
        <div class="form-row">
          <div class="form-group">
            <label for="Steuernummer" class="form-label"
              >Steuernummer <span class="stars">*</span></label
            >
            <input id="Steuernummer" v-model="customer.tax_number" type="text" class="inputs" />
            <div v-if="error.tax_number" class="error" role="alert">{{ error.tax_number }}</div>
          </div>

          <div class="form-group">
            <label for="USt-IdNr" class="form-label">USt-IdNr. <span class="stars">*</span></label>
            <input id="USt-IdNr" v-model="customer.vat_id" type="text" class="inputs" />
            <div v-if="error.vat_id" class="error" role="alert">{{ error.vat_id }}</div>
          </div>
        </div>
      </section>

      <!-- Submit -->
      <section class="sections btn-container">
        <div v-if="showSuccess" class="">
          <p class="font-medium text-success">
            <i class="bi bi-check-circle icons" aria-hidden="true"></i>
            Kunde erfolgreich gespeichert!
          </p>
        </div>

        <button type="submit" class="btn btn-update">
          <i class="bi bi-save btn-icons" aria-hidden="true"></i>
          Aktualisierung
        </button>
      </section>
    </form>
  </div>
</template>

<script>
export default {
  inject: ['formatCustomerId', 'formatDate'],
  data() {
    return {
      title: 'Kunden bearbeiten',
      customer: null,
      errorMessage: '',
      error: {},
      showSuccess: false,
      companies: [
        { value: 'Einzelunternehmen', label: 'Einzelunternehmen', is_small_company: true },
        { value: 'Freiberufler', label: 'Freiberufler', is_small_company: true },
        { value: 'Gbr', label: 'GbR (Gesellschaft bürgerlichen Rechts)', is_small_company: true },
        { value: 'Ug', label: 'UG (haftungsbeschränkt)', is_small_company: true },
        {
          value: 'GmbH',
          label: 'GmbH (Gesellschaft mit beschränkter Haftung)',
          is_small_company: false
        },
        { value: 'Ohg', label: 'OHG (Offene Handelsgesellschaft)', is_small_company: false },
        { value: 'Kg', label: 'KG (Kommanditgesellschaft)', is_small_company: false },
        { value: 'GmbH_co_KG', label: 'GmbH & Co. KG', is_small_company: false },
        { value: 'Partg', label: 'PartG (Partnerschaftsgesellschaft)', is_small_company: false },
        {
          value: 'Partgmbb',
          label: 'PartGmbB (Partnerschaftsgesellschaft mit beschränkter Berufshaftung)',
          is_small_company: false
        },
        { value: 'Ek', label: 'e.K. (eingetragener Kaufmann)', is_small_company: true },
        { value: 'Ev', label: 'e.V. (eingetragener Verein)', is_small_company: false },
        { value: 'GgmbH', label: 'gGmbH (gemeinnützige GmbH)', is_small_company: false },
        { value: 'Stiftung', label: 'Stiftung', is_small_company: false },
        { value: 'Ag', label: 'AG (Aktiengesellschaft)', is_small_company: false },
        { value: 'Se', label: 'SE (Societas Europaea)', is_small_company: false }
      ]
    }
  },
  mounted() {
    this.getCustomer()
  },
  methods: {
    async getCustomer() {
      try {
        const data = {
          id: this.$route.params.id,
          table_name: 'customers'
        }
        const result = await window.api.getCustomerById(data)
        if (!result.success) return
        this.customer = result.rows
        console.log(this.customer)
      } catch (error) {
        console.error(error)
      }
    },

    validateForm() {
      const c = this.customer
      this.error = {}
      let valid = true

      // helper
      const trim = (v) => v?.toString().trim() || ''

      // normalize helpers
      const phoneDigits = trim(c.phone).replace(/\D/g, '')
      const taxDigits = trim(c.tax_number).replace(/\D/g, '')
      const vatUpper = trim(c.vat_id).toUpperCase()

      if (!c.company_type) {
        this.error.company_type = 'Bitte Unternehmenstyp auswählen.'
        valid = false
      }

      if (!trim(c.company_name) || trim(c.company_name).length < 2) {
        this.error.company_name = 'Firmenname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!trim(c.first_name) || trim(c.first_name).length < 2) {
        this.error.first_name = 'Vorname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!trim(c.last_name) || trim(c.last_name).length < 2) {
        this.error.last_name = 'Nachname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(trim(c.email))) {
        this.error.email = 'Ungültige E-Mail-Adresse.'
        valid = false
      }

      // ✅ Telefon (nur Ziffern zählen, DB format egal)
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        this.error.phone = 'Telefonnummer muss zwischen 7 und 15 Ziffern enthalten.'
        valid = false
      }

      // Adresse
      if (!trim(c.address) || trim(c.address).length < 3) {
        this.error.address = 'Adresse muss mindestens 3 Zeichen enthalten.'
        valid = false
      } else if (!/^[A-Za-zÄÖÜäöüß\s\-.]+\s+\d+[A-Za-z]?$/.test(trim(c.address))) {
        this.error.address = 'Adresse muss Straße und Hausnummer enthalten (z. B. Musterstraße 12).'
        valid = false
      }

      // PLZ
      if (!/^\d{5}$/.test(trim(c.postal_code))) {
        this.error.postal_code = 'Postleitzahl muss aus 5 Zahlen bestehen.'
        valid = false
      }

      if (!trim(c.city) || trim(c.city).length < 2) {
        this.error.city = 'Stadt muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!trim(c.country) || trim(c.country).length < 2) {
        this.error.country = 'Land muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      // ✅ Steuernummer (Slash olsa bile sorun yok)
      if (taxDigits.length < 10 || taxDigits.length > 11) {
        this.error.tax_number = 'Steuernummer muss 10–11 Ziffern enthalten.'
        valid = false
      }

      // ✅ USt-ID (küçük harf de kabul)
      if (!/^DE\d{9}$/.test(vatUpper)) {
        this.error.vat_id = 'Die deutsche USt-ID muss mit "DE" beginnen und 9 Ziffern enthalten.'
        valid = false
      }

      return valid
    },

    async updateCustomer() {
      this.errorMessage = ''
      if (!this.validateForm()) return
      try {
        const result = await window.api.updateCustomerById(
          JSON.parse(JSON.stringify(this.customer))
        )
        if (!result.success) return

        this.$router.push('/customers')
      } catch (error) {
        console.error(error)
        this.errorMessage = error.message
      }
    }
  }
}
</script>
