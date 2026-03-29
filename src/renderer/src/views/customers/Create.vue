<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/customers" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>
        Zurück
      </router-link>
    </header>

    <form @submit.prevent="saveCustomer">
      <!-- Kundeninformationen -->
      <section class="sections">
        <header class="sections-title">
          <i class="bi bi-person-badge icons" aria-hidden="true"></i>
          Kundeninformationen
        </header>

        <div class="form-row">
          <div class="form-group">
            <label for="company_type" class="form-label">
              Unternehmenstyp <span class="stars">*</span>
            </label>
            <select id="company_type" v-model="customer.company_type" class="inputs">
              <option disabled value="">Wähle Unternehmenstyp</option>
              <option v-for="item in companies" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <div v-if="error.company_type" class="error" role="alert">
              {{ error.company_type }}
            </div>
          </div>

          <div class="form-group">
            <label for="company_name" class="form-label">
              Firmenname <span class="stars">*</span>
            </label>
            <input id="company_name" v-model="customer.company_name" type="text" class="inputs" />
            <div v-if="error.company_name" class="error" role="alert">
              {{ error.company_name }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="first_name" class="form-label">
              Vorname <span class="stars">*</span>
            </label>
            <input id="first_name" v-model="customer.first_name" type="text" class="inputs" />
            <div v-if="error.first_name" class="error" role="alert">
              {{ error.first_name }}
            </div>
          </div>

          <div class="form-group">
            <label for="last_name" class="form-label">
              Nachname <span class="stars">*</span>
            </label>
            <input id="last_name" v-model="customer.last_name" type="text" class="inputs" />
            <div v-if="error.last_name" class="error" role="alert">
              {{ error.last_name }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email" class="form-label"> E-Mail <span class="stars">*</span> </label>
            <input id="email" v-model="customer.email" type="email" class="inputs" />
            <div v-if="error.email" class="error" role="alert">
              {{ error.email }}
            </div>
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">
              Telefonnummer <span class="stars">*</span>
            </label>
            <input id="phone" v-model="customer.phone" type="text" class="inputs" />
            <div v-if="error.phone" class="error" role="alert">
              {{ error.phone }}
            </div>
          </div>
        </div>
      </section>

      <!-- Adressdaten -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-geo-alt icons" aria-hidden="true"></i>
          Adressdaten
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="address" class="form-label"> Adresse <span class="stars">*</span> </label>
            <input id="address" v-model="customer.address" type="text" class="inputs" />
            <div v-if="error.address" class="error" role="alert">
              {{ error.address }}
            </div>
          </div>

          <div class="form-group">
            <label for="postal_code" class="form-label">
              Postleitzahl <span class="stars">*</span>
            </label>
            <input id="postal_code" v-model="customer.postal_code" type="text" class="inputs" />
            <div v-if="error.postal_code" class="error" role="alert">
              {{ error.postal_code }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="city" class="form-label"> Stadt <span class="stars">*</span> </label>
            <input id="city" v-model="customer.city" type="text" class="inputs" />
            <div v-if="error.city" class="error" role="alert">
              {{ error.city }}
            </div>
          </div>

          <div class="form-group">
            <label for="country" class="form-label"> Land <span class="stars">*</span> </label>
            <input id="country" v-model="customer.country" type="text" class="inputs" />
            <div v-if="error.country" class="error" role="alert">
              {{ error.country }}
            </div>
          </div>
        </div>
      </section>

      <!-- Steuerinformationen -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-briefcase icons" aria-hidden="true"></i>
          Steuerinformationen
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="tax_number" class="form-label">
              Steuernummer <span class="stars">*</span>
            </label>
            <input id="tax_number" v-model="customer.tax_number" type="text" class="inputs" />
            <div v-if="error.tax_number" class="error" role="alert">
              {{ error.tax_number }}
            </div>
          </div>

          <div class="form-group">
            <label for="vat_id" class="form-label"> USt-IdNr. <span class="stars">*</span> </label>
            <input id="vat_id" v-model="customer.vat_id" type="text" class="inputs" />
            <div v-if="error.vat_id" class="error" role="alert">
              {{ error.vat_id }}
            </div>
          </div>
        </div>
      </section>

      <!-- Submit -->
      <section class="sections btn-container">
        <div v-if="showSuccess">
          <p class="font-medium text-success" role="status">
            <i class="bi bi-check-circle icons" aria-hidden="true"></i>
            Kunde erfolgreich gespeichert!
          </p>
        </div>

        <button type="submit" class="btn btn-primary">
          <i class="bi bi-floppy-fill btn-icons" aria-hidden="true"></i>
          Speichern
        </button>
      </section>
    </form>

    <button @click="fillExampleData">Fill Example</button>
  </div>
</template>

<script>
export default {
  name: 'CustomerRegistrationForm',
  inject: ['trimFormFields'],
  data() {
    return {
      title: 'Kundenregistrierungsformular',
      isSubmitting: false,
      showSuccess: false,
      error: {},
      customer: {
        company_type: '',
        company_name: '',
        first_name: '',
        last_name: '',
        address: '',
        postal_code: '',
        city: '',
        country: '',
        email: '',
        phone: '+49',
        website: '',
        tax_number: '',
        vat_id: '',
        is_active: 1
      },
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
  watch: {
    customer: {
      handler(newVal) {
        for (const key in newVal) {
          if (typeof newVal[key] === 'string' && newVal[key] && this.error[key]) {
            this.error[key] = ''
          }
        }
      },
      deep: true
    }
  },
  methods: {
    validateForm() {
      const c = this.customer
      this.error = {}
      let valid = true

      if (!c.company_type) {
        this.error.company_type = 'Bitte Unternehmenstyp auswählen.'
        valid = false
      }
      if (!c.company_name) {
        this.error.company_name = 'Firmenname muss mindestens 2 Zeichen enthalten..'
        valid = false
      }

      if (!c.first_name || c.first_name.length < 2) {
        this.error.first_name = 'Vorname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!c.last_name || c.last_name.length < 2) {
        this.error.last_name = 'Nachname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(c.email)) {
        this.error.email = 'Ungültige E-Mail-Adresse.'
        valid = false
      }

      if (!/^\+?[0-9\s\-()]{7,15}$/.test(c.phone)) {
        this.error.phone = 'Telefonnummer muss zwischen 7 und 15 Ziffern enthalten.'
        valid = false
      }

      if (!c.address || c.address.trim().length < 3) {
        this.error.address = 'Adresse muss mindestens 3 Zeichen enthalten.'
        valid = false
      } else if (!/^[A-Za-zÄÖÜäöüß\s\-.]+\s+\d+[A-Za-z]?$/.test(c.address)) {
        this.error.address = 'Adresse muss Straße und Hausnummer enthalten (z. B. Musterstraße 12).'
        valid = false
      }

      if (!/^\d{5}$/.test(c.postal_code)) {
        this.error.postal_code = 'Postleitzahl muss aus 5 Zahlen bestehen.'
        valid = false
      }

      if (!c.city || c.city.length < 2) {
        this.error.city = 'Stadt muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!c.country || c.country.length < 2) {
        this.error.country = 'Land muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      if (!/^[0-9]{10,11}$/.test(c.tax_number)) {
        this.error.tax_number = 'Steuernummer muss 10–11 Ziffern enthalten.'
        valid = false
      }

      if (!/^DE[0-9]{9}$/.test(c.vat_id)) {
        this.error.vat_id = 'Die deutsche USt-ID muss mit "DE" beginnen und 9 Ziffern enthalten.'
        valid = false
      }

      return valid
    },
    async saveCustomer() {
      this.showSuccess = false
      this.trimFormFields(this.customer)
      if (!this.validateForm()) return

      try {
        this.isSubmitting = true
        const data = { customer: JSON.parse(JSON.stringify(this.customer)) }
        const result = await window.api.addCustomer(data)

        if (result.success) {
          this.showSuccess = true
          setTimeout(() => this.$router.push('/customers'), 1000)
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.isSubmitting = false
      }
    },
    fillExampleData() {
      this.customer = {
        is_active: 1,
        date: new Date().toISOString().split('T')[0],

        company_type: 'GmbH',
        company_name: 'Beispiel Consulting GmbH',

        first_name: 'Maximilian',
        last_name: 'Schmidt',

        email: 'admin@admin.de',
        phone: '+49 30 12345678',
        website: 'https://www.beispiel-gmbh.de',

        address: 'Friedrichstraße 123',
        postal_code: '10117',
        city: 'Berlin',
        country: 'Deutschland',

        tax_number: '12345678901',
        vat_id: 'DE123456789'
      }
    }
  }
}
</script>
