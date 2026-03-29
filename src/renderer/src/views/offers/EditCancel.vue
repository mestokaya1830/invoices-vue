<template>
  <div v-if="$route.params.id">
    <header class="page-header">
      <h1>{{ title }}</h1>
      <router-link :to="`/offers/details/${$route.params.id}`" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>
    <form @submit.prevent="updateOffer">
      <div class="printable">
        <!-- Header -->
        <h2>{{ title }}</h2>

        <section class="sections">
          <div class="custom-row">
            <dl class="form-group">
              <dt>Rechnung-Nr.:</dt>
              <dd class="inputs">{{ formatOfferId($route.params.id) }}</dd>
            </dl>

            <div class="form-group">
              <label for="">Storniert am</label>
              <div class="date-wrapper">
                <i class="bi bi-calendar calendar-icon" aria-hidden="true"></i>
                <input
                  v-model="cancelled_at"
                  type="date"
                  class="inputs date"
                  placeholder="Datum der Stornierung auswählen"
                />
              </div>
              <div v-if="error.cancelled_at" class="error" role="alert">
                {{ error.cancelled_at }}
              </div>
            </div>

            <div class="form-group">
              <label for="">Storniert von</label>
              <input
                v-model="cancelled_by"
                type="text"
                class="inputs"
                placeholder="Name der Person, die storniert"
              />
              <div v-if="error.cancelled_by" class="error" role="alert">
                {{ error.cancelled_by }}
              </div>
            </div>

            <div class="form-group">
              <label for="">Stornierungsgrund</label>
              <textarea
                v-model="cancellation_reason"
                class="inputs"
                placeholder="Grund der Stornierung hier eingeben"
              ></textarea>
              <div v-if="error.cancellation_reason" class="error" role="alert">
                {{ error.cancellation_reason }}
              </div>
            </div>
          </div>
        </section>
      </div>
      <section class="sections btn-container">
        <button type="submit" class="btn btn-update" @click="updateOffer">
          <i class="bi bi-save btn-icons" aria-hidden="true"></i>
          Aktualisieren
        </button>
      </section>
    </form>
    <router-link :to="`/offers/details/${$route.params.id}`" class="back-link">
      ← Zurück zur Angebotsdetails
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'OfferEdit',
  inject: ['formatOfferId'],
  data() {
    return {
      title: 'Angebot stornieren',
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
    async updateOffer() {
      const id = this.$route.params.id
      const data = {
        id: id,
        is_active: 0,
        cancellation_reason: this.cancellation_reason,
        cancelled_by: this.cancled_by,
        cancelled_at: this.cancelled_at
      }
      if (!this.checkInputs()) return
      const result = await window.api.cancelOffer(data)
      if (result.success) {
        this.$router.push('/offers')
      }
    }
  }
}
</script>
