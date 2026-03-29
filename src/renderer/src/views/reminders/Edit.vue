<template>
  <div v-if="$route.params.id">
    <header class="page-header">
      <h1 class="main-title">{{ title }}</h1>
      <router-link :to="`/reminders/details/${$route.params.id}`" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <form @submit.prevent="updateReminder">
      <div class="printable">
        <h2>{{ title }}</h2>
        <div class="sections">
          <div class="custom-row">
            <dl class="form-group">
              <dt for="">Rechnung-Nr.:</dt>
              <dd class="inputs">{{ formatReminderId($route.params.id) }}</dd>
            </dl>

            <div class="form-group">
              <label for="Storniert am">Storniert am<span class="stars">*</span></label>
              <div class="date-wrapper">
                <i class="bi bi-calendar calendar-icon" aria-hidden="true"></i>
                <input
                  id="Storniert am"
                  v-model="cancelled_at"
                  type="date"
                  class="inputs date"
                  placeholder="Datum der Stornierung auswählen"
                  required
                />
              </div>
              <div v-if="error.cancelled_at" class="error" role="alert">
                {{ error.cancelled_at }}
              </div>
            </div>

            <div class="form-group">
              <label for="Storniert von">Storniert von<span class="stars">*</span></label>
              <input
                id="Storniert von"
                v-model="cancelled_by"
                type="text"
                class="inputs"
                placeholder="Name der Person, die storniert"
                required
              />
              <div v-if="error.cancelled_by" class="error" role="alert">
                {{ error.cancelled_by }}
              </div>
            </div>

            <div class="form-group">
              <label for="Stornierungsgrund">Stornierungsgrund<span class="stars">*</span></label>
              <textarea
                id="Stornierungsgrund"
                v-model="cancellation_reason"
                class="inputs"
                placeholder="Grund der Stornierung hier eingeben"
                required
              ></textarea>
              <div v-if="error.cancellation_reason" class="error" role="alert">
                {{ error.cancellation_reason }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" @click="updateReminder" class="btn btn-update">
        <i class="bi bi-save btn-icons" aria-hidden="true"></i>
        Aktualisieren
      </button>
    </form>
    <router-link :to="`/invoices/details/${$route.params.id}`" class="btn back-btn">
      ← Zurück zur Rechnungsdetails
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ReminderEdit',
  inject: ['formatReminderId'],
  data() {
    return {
      title: 'Mahnung stornieren',
      cancelled_by: '',
      cancelled_at: '',
      cancellation_reason: '',
      error: {}
    }
  },
  methods: {
    checkInputs() {
      if (!this.cancelled_at.trim()) {
        this.error.cancelled_at = 'Bitte ein Datum auswählen'
        return false
      } else {
        this.error.cancelled_at = ''
      }

      // Name prüfen
      if (!this.cancelled_by.trim() || this.cancelled_by.length < 3) {
        this.error.cancelled_by = 'Bitte einen Namen mit mindestens 3 Zeichen eingeben'
        return false
      } else {
        this.error.cancelled_by = ''
      }

      // Grund prüfen
      if (!this.cancellation_reason.trim() || this.cancellation_reason.length < 5) {
        this.error.cancellation_reason = 'Bitte einen Grund mit mindestens 5 Zeichen eingeben'
        return false
      } else {
        this.error.cancellation_reason = ''
      }

      return true
    },
    async updateReminder() {
      const data = {
        id: this.$route.query.id,
        invoice_id: this.$route.query.invoice_id,
        cancelled_at: this.cancelled_at,
        cancelled_by: this.cancelled_by,
        cancellation_reason: this.cancellation_reason
      }
      if (!this.checkInputs()) return
      const result = await window.api.cancelReminderById(data)
      if (result.success) {
        this.$router.push('/invoices')
      }
    }
  }
}
</script>
