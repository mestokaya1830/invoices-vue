<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link to="/" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <form v-if="user" @submit.prevent="updateUser">
      <!-- Personal Information -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-person icons" aria-hidden="true"></i>Persönlichedaten
        </div>
        <div class="form-row">
          <dl class="form-group">
            <dt class="form-label">Anrede</dt>
            <dd for="" class="inputs">{{ user.gender }}</dd>
          </dl>
          <dl class="form-group">
            <dt class="form-label">Vorname</dt>
            <dd for="" class="inputs">{{ user.first_name }}</dd>
          </dl>
        </div>
        <div class="form-row">
          <dl class="form-group">
            <dt class="form-field">Nachname</dt>
            <dd for="" class="inputs">{{ user.last_name }}</dd>
          </dl>
          <dl class="form-group">
            <dt class="form-field">E-Mail</dt>
            <dd for="" class="inputs">{{ user.email }}</dd>
          </dl>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Kenntwort" class="form-field"
              >Passwort <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Kenntwort"
              v-model="user.password"
              ref="password"
              type="password"
              class="inputs"
              placeholder="Neues Passwort eingeben"
            />
            <div v-if="error.password" class="error" role="alert">{{ error.password }}</div>
          </div>
          <div class="form-group">
            <label for="Telefon" class="form-field"
              >Telefon <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Telefon"
              v-model="user.phone"
              ref="phone"
              type="tel"
              class="inputs"
              placeholder="+49 30 12345678"
            />
            <div v-if="error.phone" class="error" role="alert">{{ error.phone }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="Webseite" class="form-field"
            >Webseite <i class="bi bi-pencil icons" aria-hidden="true"></i
          ></label>
          <input
            id="Webseite"
            v-model="user.website"
            ref="website"
            type="url"
            class="inputs"
            placeholder="www.example.com"
          />
          <div v-if="error.website" class="error" role="alert">{{ error.website }}</div>
        </div>
      </section>

      <!-- Address Information -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-geo-alt" aria-hidden="true"></i>Adressdaten
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Adresse" class="form-label"
              >Adresse <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Adresse"
              v-model="user.address"
              ref="address"
              type="text"
              class="inputs"
              placeholder="Hauptstraße 123"
            />
            <div v-if="error.address" class="error" role="alert">{{ error.address }}</div>
          </div>

          <div class="form-group">
            <label for="Postleitzahl" class="form-label"
              >Postleitzahl <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Postleitzahl"
              ref="postal_code"
              v-model="user.postal_code"
              type="text"
              class="inputs"
              placeholder="10115"
            />
            <div v-if="error.postal_code" class="error" role="alert">{{ error.postal_code }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Stadt" class="form-label"
              >Stadt <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Stadt"
              ref="city"
              v-model="user.city"
              type="text"
              class="inputs"
              placeholder="Berlin"
            />
            <div v-if="error.city" class="error" role="alert">{{ error.city }}</div>
          </div>
          <div class="form-group">
            <label for="state" class="form-label"
              >Bundesland (Deutschland) <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <select id="state" ref="state" v-model="user.state" class="inputs">
              <option disabled value="">Bitte wählen</option>
              <option v-for="item in german_states" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <div v-if="error.state" class="error" role="alert">{{ error.state }}</div>
          </div>
        </div>
      </section>

      <!-- Company Information -->
      <section v-if="user.company_details" class="sections">
        <div class="sections-title">
          <i class="bi bi-building icons" aria-hidden="true"></i>Unternehmensdaten
        </div>
        <div class="form-row">
          <dl class="form-group">
            <dt class="form-field">Firmenname</dt>
            <dd class="inputs">{{ user.company_name }}</dd>
          </dl>
          <div class="form-group">
            <label for="Unternehmensform" class="form-field"
              >Unternehmensform (Deutschland)
              <i class="bi bi-pencil icons" aria-hidden="true"></i>
            </label>
            <select
              id="Unternehmensform"
              ref="company_details"
              v-model="user.company_details"
              class="inputs"
            >
              <option disabled value="">-- Bitte wählen --</option>
              <option v-for="item in companies" :key="item.value" :value="item">
                {{ item.label }}
              </option>
            </select>
            <div v-if="error.company_details" class="error" role="alert">
              {{ error.company_details }}
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="file" class="form-field"
              >Firmenlogo (Neues Logo hochladen)
              <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input id="file" ref="file" type="file" @change="setLogo($event)" />
          </div>
          <div class="form-group">
            <label class="form-field"
              >Logo-Vorschau <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <img
              v-if="!selectedImage"
              :src="`uploads/user/${user.logo}`"
              class="user-logo"
              alt="Company Logo"
            />
            <img
              v-else
              :src="`${selectedImage}`"
              class="user-logo"
              alt="Company Logo"
              role="image"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <!-- Contact Person -->
      <section v-if="user.contact_person" class="sections">
        <div class="sections-title">
          <i class="bi bi-telephone icons" aria-hidden="true"></i>Kontaktdaten
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Anrede" class="form-label"
              >Anrede <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <select
              id="Anrede"
              ref="contact_person_gender"
              v-model="user.contact_person.gender"
              class="inputs"
            >
              <option value="" disabled>Bitte wählen</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
              <option value="Divers">Divers</option>
            </select>
            <div v-if="error.contact_person_gender" class="error" role="alert">
              {{ error.contact_person_gender }}
            </div>
          </div>
          <div class="form-group">
            <label for="Vorname" class="form-label"
              >Vorname <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Vorname"
              ref="contact_person_first_name"
              v-model="user.contact_person.first_name"
              type="text"
              class="inputs"
              placeholder="Hans Mueller"
            />
            <div v-if="error.contact_person_first_name" class="error" role="alert">
              {{ error.contact_person_first_name }}
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Nachname" class="form-label">Nachname <i class="bi bi-pencil"></i></label>
            <input
              id="Nachname"
              v-model="user.contact_person.last_name"
              red="contact_person_last_name"
              type="text"
              class="inputs"
              placeholder="Hans Mueller"
            />
            <div v-if="error.contact_person_last_name" class="error" role="alert">
              {{ error.contact_person_last_name }}
            </div>
          </div>
          <div class="form-group">
            <label for="Telefon" class="form-label"
              >Telefon <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Telefon"
              ref="contact_person_phone"
              v-model="user.contact_person.phone"
              type="tel"
              class="inputs"
              placeholder="+49 30 12345678"
            />
            <div v-if="error.contact_person_phone" class="error" role="alert">
              {{ error.contact_person_phone }}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="email" class="form-label"
            >E-Mail <i class="bi bi-pencil icons" aria-hidden="true"></i
          ></label>
          <input
            id="email"
            ref="contact_person_email"
            v-model="user.contact_person.email"
            type="email"
            class="inputs"
            placeholder="example@email.com"
          />
          <div v-if="error.contact_person_email" class="error" role="alert">
            {{ error.contact_person_email }}
          </div>
        </div>
      </section>

      <!-- Tax Information -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-briefcase icons" aria-hidden="true"></i>Steuerinformationen
        </div>
        <div class="form-row">
          <dl class="form-group">
            <dt class="form-label">Steuernummer</dt>
            <dd class="inputs">{{ user.tax_number }}</dd>
          </dl>
          <div class="form-group">
            <label for="Finanzamt" class="form-label"
              >Finanzamt <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Finanzamt"
              ref="tax_office"
              v-model="user.tax_office"
              type="text"
              class="inputs"
              placeholder="Finanzamt Berlin Mitte/Tiergarten"
            />
            <div v-if="error.tax_office" class="error" role="alert">{{ error.tax_office }}</div>
          </div>
        </div>
        <div class="form-row">
          <dl class="form-group">
            <dt class="form-label">USt-IdNr.</dt>
            <dd class="inputs">{{ user.vat_id }}</dd>
          </dl>
          <dl class="form-group">
            <dt class="form-label">Handelsregistereintrag</dt>
            <dd class="inputs">{{ user.court_registration }}</dd>
          </dl>
        </div>
        <dl class="form-group">
          <dt class="form-label">Gerichtsstand</dt>
          <dd class="inputs">{{ user.court_location }}</dd>
        </dl>
      </section>

      <!-- Bank Information -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-credit-card icons"></i>Zahlungsinformationen
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="Bankname" class="form-field"
              >Bankname <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Bankname"
              ref="bank_name"
              v-model="user.bank_name"
              type="text"
              class="inputs"
              placeholder="Deutsche Bank AG"
            />
            <div v-if="error.bank_name" class="error" role="alert">{{ error.bank_name }}</div>
          </div>
          <div class="form-group">
            <label for="BIC" class="form-field"
              >BIC <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="BIC"
              ref="bic"
              v-model="user.bic"
              type="text"
              class="inputs"
              placeholder="DEUTDEBBXXX"
            />
            <div v-if="error.bic" class="error" role="alert">{{ error.bic }}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="IBAN" class="form-field"
              >IBAN <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="IBAN"
              ref="iban"
              v-model="user.iban"
              type="text"
              class="inputs"
              placeholder="DE89370400440532013000"
            />
            <div v-if="error.iban" class="error" role="alert">{{ error.iban }}</div>
          </div>
          <div class="form-group">
            <label for="Kontoinhaber" class="form-field"
              >Kontoinhaber <i class="bi bi-pencil icons" aria-hidden="true"></i
            ></label>
            <input
              id="Kontoinhaber"
              ref="bank_account_holder"
              v-model="user.bank_account_holder"
              type="text"
              class="inputs"
              placeholder="TechSolutions GmbH"
            />
            <div v-if="error.bank_account_holder" class="error" role="alert">
              {{ error.bank_account_holder }}
            </div>
          </div>
        </div>
      </section>

      <!-- Company Signature -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-pen icons" aria-hidden="true"></i>
          Unternehmenssignatur
        </div>

        <label for="Signaturtext" class="form-field">
          Signaturtext <i class="bi bi-pencil icons" aria-hidden="true"></i>
        </label>
        <textarea
          id="Signaturtext"
          ref="company_signature"
          v-model="user.company_signature"
          rows="4"
          placeholder="Mit freundlichen Grüßen&#10;TechSolutions GmbH&#10;Hans Mueller&#10;Geschäftsführer"
        ></textarea>
        <div v-if="error.company_signature" class="error" role="alert">
          {{ error.company_signature }}
        </div>
      </section>

      <!-- DATEV Export Section -->
      <section class="sections">
        <div class="sections-title">
          <i class="bi bi-file-earmark-spreadsheet icons" aria-hidden="true"></i>
          DATEV Export Einstellungen
        </div>

        <!-- Beraternummer -->
        <div class="form-group">
          <label for="datev_beraternummer" class="form-field">
            Beraternummer
            <i class="bi bi-pencil icons" aria-hidden="true"></i>
          </label>
          <input
            id="datev_beraternummer"
            ref="datev_beraternummer"
            v-model="user.datev_beraternummer"
            type="text"
            class="inputs"
            placeholder="z.B. 12345"
          />
          <div v-if="error.datev_beraternummer" class="error" role="alert">
            {{ error.datev_beraternummer }}
          </div>
        </div>

        <!-- Mandantennummer -->
        <div class="form-group">
          <label for="datev_mandantennummer" class="form-field">
            Mandantennummer
            <i class="bi bi-pencil icons" aria-hidden="true"></i>
          </label>
          <input
            id="datev_mandantennummer"
            ref="datev_mandantennummer"
            v-model="user.datev_mandantennummer"
            type="text"
            class="inputs"
            placeholder="1"
          />
          <div v-if="error.datev_mandantennummer" class="error" role="alert">
            {{ error.datev_mandantennummer }}
          </div>
        </div>

        <!-- Kontenrahmen (SKR) -->
        <div class="form-group">
          <label for="datev_skr" class="form-field">
            Kontenrahmen (SKR)
            <i class="bi bi-pencil icons" aria-hidden="true"></i>
          </label>
          <select id="datev_skr" ref="datev_skr" v-model="user.datev_skr" class="inputs">
            <option value="" disabled>Wählen Sie einen Kontenrahmen</option>
            <option value="04">SKR04 - Abschlussgliederungsprinzip (Standard)</option>
            <option value="03">SKR03 - Prozessgliederungsprinzip</option>
            <option value="14">SKR14 - Land- und Forstwirtschaft</option>
          </select>
          <div v-if="error.datev_skr" class="error" role="alert">
            {{ error.datev_skr }}
          </div>
        </div>
      </section>

      <!-- Submit Button -->
      <div class="form-section btn-container">
        <button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">Wird gespeichert...</span>
          <span v-else class="btn btn-update">
            <i class="bi bi-save btn-icons" aria-hidden="true"></i>
            Aktualisieren
          </span>
        </button>
      </div>
    </form>
    <!-- Messages -->
    <p v-if="isLoading" class="status-message loading">Profil wird geladen...</p>
    <p v-if="showSuccess" class="status-message success" role="status">
      <i class="bi bi-check-circle-fill text-success icons" aria-hidden="true"></i> Profil wurde
      erfolgreich aktualisiert!
    </p>
    <p v-if="errorMessage" class="status-message error" role="alert">
      <i class="bi bi-x-circle-fill text-danger icons" aria-hidden="true"></i> Fehler:
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'EditProfileForm',
  data() {
    return {
      title: 'Profil',
      user: null,
      isLoading: true,
      isSubmitting: false,
      showSuccess: false,
      errorMessage: '',
      error: {},
      selectedImage: null,
      blobImage: null,
      german_states: [
        { label: 'Baden-Württemberg', value: 'Baden-Württemberg' },
        { label: 'Bayern', value: 'Bayern' },
        { label: 'Berlin', value: 'Berlin' },
        { label: 'Brandenburg', value: 'Brandenburg' },
        { label: 'Bremen', value: 'Bremen' },
        { label: 'Hamburg', value: 'Hamburg' },
        { label: 'Hessen', value: 'Hessen' },
        { label: 'Mecklenburg-Vorpommern', value: 'Mecklenburg-Vorpommern' },
        { label: 'Niedersachsen', value: 'Niedersachsen' },
        { label: 'Nordrhein-Westfalen', value: 'Nordrhein-Westfalen' },
        { label: 'Rheinland-Pfalz', value: 'Rheinland-Pfalz' },
        { label: 'Saarland', value: 'Saarland' },
        { label: 'Sachsen', value: 'Sachsen' },
        { label: 'Sachsen-Anhalt', value: 'Sachsen-Anhalt' },
        { label: 'Schleswig-Holstein', value: 'Schleswig-Holstein' },
        { label: 'Thüringen', value: 'Thüringen' }
      ],
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
    this.getUser()
  },
  methods: {
    async getUser() {
      this.isLoading = true
      try {
        const result = await window.api.getUser()
        if (!result) return
        this.user = {
          ...result.rows,
          contact_person: JSON.parse(result.rows.contact_person),
          company_details: JSON.parse(result.rows.company_details)
        }
        this.isLoading = false
      } catch (error) {
        console.error(error)
      }
    },
    async setLogo(event) {
      const file = event.target.files[0]
      if (!file) return
      this.blobImage = await file.arrayBuffer()
      this.selectedImage = URL.createObjectURL(file)
      this.user.logo = 'user.png'
    },
    validateForm() {
      let valid = true
      this.error = {}
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

      // Password
      if (!this.user.password || this.user.password.length < 6) {
        this.error.password = 'Passwort muss mindestens 6 Zeichen enthalten.'
        valid = false
      }

      // Phone (optional)
      if (this.user.phone && !/^\+?49\d{5,14}$/.test(this.user.phone)) {
        this.error.phone = 'Bitte geben Sie eine gültige deutsche Telefonnummer ein.'
        valid = false
      }

      // Website (optional)
      if (this.user.website) {
        const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}([/\w\-.?&=]*)*$/
        if (!urlPattern.test(this.user.website)) {
          this.error.website = 'Bitte geben Sie eine gültige Website-Adresse ein.'
          valid = false
        }
      }

      // Address
      if (!this.user.address || this.user.address.trim().length < 3) {
        this.error.address = 'Adresse muss mindestens 3 Zeichen enthalten.'
        valid = false
      } else if (!/^[A-Za-zÄÖÜäöüß\s\-.]+\s+\d+[A-Za-z]?$/.test(this.user.address)) {
        this.error.address = 'Adresse muss Straße und Hausnummer enthalten (z.B. Musterstraße 12).'
        valid = false
      }

      // Postal code
      if (this.user.postal_code && !/^\d{5}$/.test(this.user.postal_code)) {
        this.error.postal_code = 'Postleitzahl muss 5 Ziffern enthalten.'
        valid = false
      }

      // City
      if (this.user.city && this.user.city.length < 2) {
        this.error.city = 'Stadt muss mindestens 2 Zeichen enthalten.'
        valid = false
      }

      // State
      if (!this.user.state) {
        this.error.state = 'Bitte Bundesland auswählen.'
        valid = false
      }

      // Company
      if (!this.user.company_details || !this.user.company_details.value) {
        this.error.company_details = 'Bitte Unternehmensform auswählen.'
        valid = false
      }

      // Contact person
      const cp = this.user.contact_person
      if (!cp.gender) {
        this.error.contact_person_gender = 'Bitte Anrede auswählen.'
        valid = false
      }
      if (!cp.first_name && cp.first_name.length < 2) {
        this.error.contact_person_first_name = 'Vorname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }
      if (!cp.last_name && cp.last_name.length < 2) {
        this.error.contact_person_last_name = 'Nachname muss mindestens 2 Zeichen enthalten.'
        valid = false
      }
      if (!cp.email && !emailRegex.test(cp.email)) {
        this.error.contact_person_email = 'Ungültige E-Mail-Adresse.'
        valid = false
      }
      if (!cp.phone && !/^\+?49\d{5,14}$/.test(cp.phone)) {
        this.error.contact_person_phone = 'Bitte geben Sie eine gültige deutsche Telefonnummer ein.'
        valid = false
      }

      // Tax info
      if (this.user.tax_number && this.user.tax_number.trim() !== '') {
        const cleanTaxNumber = this.user.tax_number.replace(/[\s/-]/g, '')
        if (!/^\d+$/.test(cleanTaxNumber)) {
          this.error.tax_number = 'Steuernummer darf nur Zahlen enthalten.'
          valid = false
        } else if (cleanTaxNumber.length < 10 || cleanTaxNumber.length > 13) {
          this.error.tax_number = 'Steuernummer muss 10-13 Ziffern enthalten.'
          valid = false
        }
      }
      if (!this.user.tax_office) {
        this.error.tax_office = 'Bitte geben Sie eine gültige Finanzamt ein.'
        valid = false
      }
      if (this.user.vat_id && this.user.vat_id.trim() !== '') {
        const cleanVatId = this.user.vat_id.replace(/\s/g, '').toUpperCase()
        if (!/^DE\d{9}$/.test(cleanVatId)) {
          this.error.vat_id = 'USt-IdNr. muss mit "DE" beginnen und 9 Ziffern enthalten.'
          valid = false
        }
      }

      // Bank info
      if (this.user.iban && this.user.iban.trim() !== '') {
        const cleanIban = this.user.iban.replace(/\s/g, '')
        if (!/^DE\d{20}$/.test(cleanIban)) {
          this.error.iban = 'Ungültige deutsche IBAN (Format: DE + 20 Ziffern).'
          valid = false
        }
      }
      // DATEV Beraternummer
      if (!this.user.datev_beraternummer) {
        this.error.datev_beraternummer = 'Bitte Beraternummer eingeben.'
        valid = false
      } else if (!/^\d+$/.test(this.user.datev_beraternummer)) {
        this.error.datev_beraternummer = 'Beraternummer darf nur Zahlen enthalten.'
        valid = false
      }

      // DATEV Mandantennummer
      if (!this.user.datev_mandantennummer) {
        this.error.datev_mandantennummer = 'Bitte Mandantennummer eingeben.'
        valid = false
      } else if (!/^\d+$/.test(this.user.datev_mandantennummer)) {
        this.error.datev_mandantennummer = 'Mandantennummer darf nur Zahlen enthalten.'
        valid = false
      }

      // DATEV SKR
      if (!this.user.datev_skr) {
        this.error.datev_skr = 'Bitte Kontenrahmen auswählen.'
        valid = false
      }
      // Focus
      if (!valid) {
        this.$nextTick(() => {
          const firstErrorField = Object.keys(this.error)[0]
          if (firstErrorField) {
            const inputElement = this.$refs[firstErrorField]
            if (inputElement) inputElement.focus()
          }
        })
      }

      return valid
    },
    formatIban() {
      let val = this.user.iban.toUpperCase().replace(/[^A-Z0-9]/g, '')
      val = val.match(/.{1,4}/g)?.join(' ') || val
      this.user.iban = val.substring(0, 27)
    },
    async updateUser() {
      if (!this.validateForm()) {
        this.showError = true
        this.errorMessage = 'Bitte alle Pflichtfelder korrekt ausfüllen.'
        console.log(this.error)
        return
      }
      if (this.user) {
        const data = {
          image_file: this.blobImage,
          user: JSON.parse(JSON.stringify(this.user))
        }
        const result = await window.api.updateUser(data)
        if (result.success) {
          this.errorMessage = ''
          this.$router.push('/login')
        }
      }
    }
  }
}
</script>
