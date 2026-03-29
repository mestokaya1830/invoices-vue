<template>
  <div>
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
        <section class="sections" aria-label="status">
          <div class="form-group">
            <div v-if="offer.status === 'accepted' || offer.status === 'rejected'">
              <h4>Status:</h4>
              <div class="inputs disabled">
                {{
                  offer.status === 'accepted'
                    ? 'Angenommen'
                    : offer.status === 'rejected'
                      ? 'Abgelehnt'
                      : offer.status
                }}

                <small class="text-muted d-block">Status kann nicht mehr geändert werden.</small>
              </div>
            </div>
            <div v-else class="form-row">
              <div class="form-group">
                <label for="status" class="form-label">Status<span class="stars">*</span></label>
                <select id="status" v-model="offer.status" class="inputs select" required>
                  <option value="" disabled>Status auswählen</option>
                  <option value="draft" :disabled="offer.status !== 'sent' ? true : true">
                    Entwurf
                  </option>
                  <option value="sent" :disabled="offer.status !== 'draft'">Gesendet</option>
                  <option value="accepted" :disabled="offer.status !== 'sent'">Angenommen</option>
                  <option value="rejected" :disabled="offer.status !== 'sent'">Abgelehnt</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="Bearbeitet von" class="form-label"
              >Bearbeitet von:<span class="stars">*</span></label
            >
            <input
              id="Bearbeitet von"
              v-model="offer.status_by"
              type="text"
              class="inputs"
              placeholder="Name der bearbeitenden Person eingeben"
              required
            />
          </div>

          <div class="form-group">
            <label for="Bearbeitet am" class="form-label"
              >Bearbeitet am:<span class="stars">*</span></label
            >
            <div class="date-wrapper">
              <i class="bi bi-calendar calendar-icon"></i>
              <input
                id="Bearbeitet am"
                v-model="offer.date"
                type="date"
                class="inputs date"
                required
              />
            </div>
            <div v-if="error.cancelled_at" class="error">{{ error.cancelled_at }}</div>
          </div>

          <div class="form-group">
            <label for="Kommentare" class="form-label">Kommentare:</label>
            <textarea
              id="Kommentare"
              v-model="offer.status_comments"
              class="inputs"
              placeholder="Kommentare oder Notizen hier eingeben"
            ></textarea>
          </div>
        </section>
      </div>
      <section class="sections btn-container">
        <button
          type="submit"
          :disabled="original_status == 'accepted' || original_status == 'rejected'"
          class="btn btn-update"
          @click="updateOffer"
        >
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
      title: 'Angebot-Bearbeiten',
      offer: {
        date: '',
        status: '',
        status_by: '',
        status_comments: ''
      },
      original_status: '',
      error: {}
    }
  },
  mounted() {
    this.getOfferStatus()
  },
  methods: {
    async getOfferStatus() {
      const result = await window.api.getOfferByStatus(this.$route.params.id)
      if (!result.success) return
      this.offer.status = result.rows.status
      this.offer.status_by = result.rows.status_by
      this.offer.date = result.rows.date
      this.offer.status_comments = result.rows.status_comments
      this.original_status = result.rows.status
    },
    async updateOffer() {
      const data = {
        id: this.$route.params.id,
        date: this.offer.date,
        status: this.offer.status,
        status_by: this.offer.status_by,
        status_comments: this.offer.status_comments
      }
      const result = await window.api.updateOfferById(data)
      if (result.success) {
        this.$router.push('/offers/details/' + this.$route.params.id)
      }
    }
  }
}
</script>
