<template>
  <div v-if="offers">
    <header class="page-header">
      <h1>{{ title }} {{ total_count }} / {{ current_count }}</h1>
      <router-link to="/customers" class="btn btn-primary">
        <i class="bi bi-plus-circle-fill btn-icons" aria-hidden="true"></i>
        <span>Neues Angebot erstellen</span>
      </router-link>
    </header>

    <!-- FILTER -->
    <section class="main-filter">
      <select
        v-model="categories_filter"
        aria-label="Kategorien"
        class="inputs select"
        @change="filterCategories"
      >
        <option value="" disabled="">Kategorien</option>
        <template v-for="item in categories" :key="item">
          <option :value="item.key">{{ item.label }}</option>
        </template>
      </select>

      <input
        v-model="search_box"
        class="inputs"
        aria-label="Suchen"
        placeholder="Kunde, Firma oder Rechnungs-ID suchen..."
        @input="searchFilter"
      />

      <div class="date-wrapper">
        <i class="bi bi-calendar calendar-icon"></i>
        <input
          ref="date_box_start"
          v-model="date_box_start"
          type="date"
          aria-label="Startdatum"
          class="inputs date"
          @input="filterDate()"
        />
      </div>

      <div class="date-wrapper">
        <i class="bi bi-calendar calendar-icon"></i>
        <input
          ref="date_box_end"
          v-model="date_box_end"
          type="date"
          aria-label="Enddatum"
          class="inputs date"
          @input="filterDate()"
        />
      </div>

      <button class="sort-btn" aria-label="Sortirien" @click="sorting('id')">&#8645;</button>
      <button class="list-print-icon" aria-label="Drucken">
        <i class="bi bi-printer btn-icons" aria-hidden="true" @click="printDocument"></i>
      </button>
    </section>

    <!-- LIST -->
    <section class="list-grid printable">
      <div v-for="item in offers" :key="item.id" class="list-card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="list-avatar">
              {{ avatarStyle(item.customer?.first_name, item.customer?.last_name) }}
            </div>
            <div class="list-info">
              <h2 class="list-id">{{ formatOfferId(item.id) }}</h2>

              <span class="list-type-badge">
                {{ item.customer?.company_name }}
              </span>
              <br />

              <span class="list-name">
                {{ item.customer?.first_name }} {{ item.customer?.last_name }}
              </span>
            </div>
          </div>

          <div class="status-badge-container">
            <div class="status-badge" :class="item.status">
              {{ statusLabel(item.status) }}
            </div>

            <div class="status-badge total">
              {{ formatCurrency(item.gross_total, item.currency) }}
            </div>

            <div class="offer-dates">
              <small>Gültig bis: {{ formatDate(item.valid_until) }}</small>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <router-link
            :to="`/offers/details/${item.id}`"
            class="btn btn-action btn-details"
            aria-label="Details anzeigen für {{ item.first_name }} {{ item.last_name }}"
          >
            <i class="bi bi-eye btn-icons" aria-hidden="true"></i>
            <span class="btn-actions-text">Details</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- EMPTY -->
    <section v-if="!offers || offers.length === 0" class="empty-state text-center py-5">
      <i
        class="bi bi-file-earmark-x text-muted icons"
        aria-hidden="true"
        style="font-size: 4rem"
      ></i>
      <h3 class="mt-3">Keine Angebote</h3>
      <p>Erstellen Sie neue Angebote, um sie hier zu sehen.</p>
    </section>
  </div>
</template>

<script>
import store from '../../store'
export default {
  name: 'Offers',
  inject: ['formatOfferId', 'formatDate', 'formatCurrency'],

  data() {
    return {
      title: 'Angebote',
      offers: [],
      search_box: '',
      date_box_start: '',
      date_box_end: '',
      categories_filter: '',
      total_count: 0,
      current_count: 0,
      isSort: true,
      categories: [
        { key: 'all', label: 'Alle Angebote' },
        { key: 'draft', label: 'Entwürfe' },
        { key: 'sent', label: 'Gesendet' },
        { key: 'accepted', label: 'Angenommen' },
        { key: 'rejected', label: 'Abgelehnt' },
        { key: 'expired', label: 'Abgelaufen' },
        { key: 'cancelled', label: 'Storniert' },
        { key: 'legal', label: 'Vertrag' }
      ]
    }
  },

  mounted() {
    if (store.state.date_filter) {
      this.date_box_start = store.state.date_filter.start
      this.date_box_end = store.state.date_filter.end
      this.filterDate()
      return
    }
    if (store.state.category_filter) {
      this.categories_filter = store.state.category_filter
      this.filterCategories()
      return
    }
    if (store.state.search_filter) {
      this.search_box = store.state.search_filter
      this.searchFilter()
      return
    }
    this.getOffers()
  },

  methods: {
    async getOffers() {
      const result = await window.api.getOffers()
      if (!result.success) return

      this.offers = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))

      this.total_count = result.rows.length
      this.current_count = result.rows.length
    },

    avatarStyle(firstName, lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : ''
      const last = lastName ? lastName.charAt(0).toUpperCase() : ''
      return first + last || '??'
    },

    statusLabel(status) {
      const labels = {
        draft: 'Entwurf',
        sent: 'Gesendet',
        accepted: 'Angenommen',
        rejected: 'Abgelehnt',
        expired: 'Abgelaufen',
        canceled: 'Storniert'
      }
      return labels[status] || status
    },

    async filterCategories() {
      const result = await window.api.filterOffersCategories(this.categories_filter)
      if (!result.success) return

      this.offers = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))

      this.total_count = result.total_count
      this.current_count = result.rows.length
    },

    async searchFilter() {
      const term = this.search_box?.trim()
      if (!term) return this.getOffers()
      if (isNaN(term) && term.length < 3) return

      const result = await window.api.searchOffers(term)
      if (!result.success) return

      this.offers = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))

      console.log(result)
      this.total_count = result.total_count
      this.current_count = result.rows.length
    },

    async filterDate() {
      if (!this.date_box_start || !this.date_box_end) return
      if (this.date_box_start > this.date_box_end) return

      const result = await window.api.filterOffersDate({
        start: this.date_box_start,
        end: this.date_box_end
      })

      if (!result.success) return

      this.offers = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))

      this.total_count = result.total_count
      this.current_count = result.rows.length
    },

    sorting(key) {
      if (!key) return

      this.offers.sort((a, b) => {
        const res = a[key] > b[key] ? 1 : -1
        return this.isSort ? res : -res
      })

      this.isSort = !this.isSort
    },
    printDocument() {
      window.print()
    }
  }
}
</script>
