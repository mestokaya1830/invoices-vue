<template>
  <div v-if="payments">
    <header class="page-header">
      <h1>{{ title }} {{ total_count }} / {{ current_count }}</h1>
    </header>

    <section class="main-filter">
      <select
        v-model="categories_filter"
        aria-label="Kategorien"
        class="inputs select"
        @change="filterCategories"
      >
        <option value="" disabled>Kategorien</option>
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

    <section class="list-grid printable">
      <div v-for="item in payments" :key="item.id" class="list-card">
        <div class="card-header">
          <div class="card-header-left">
            <div class="list-avatar">
              {{ avatarStyle(item.first_name, item.last_name) }}
            </div>
            <div class="list-info">
              <h2 class="list-id">{{ formatCustomerId(item.id) }}</h2>
              <span class="list-type-badge">{{ item.company_type || 'Standard' }}</span>
              <span class="list-name">{{ item.first_name }} {{ item.last_name }}</span>
            </div>
          </div>
          <div class="status-badge" :class="item.is_active ? 'active' : 'inactive'">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="card-actions">
          <router-link
            :to="`/payments/details/${item.id}`"
            class="btn btn-action btn-details"
            aria-label="Details anzeigen für {{ item.first_name }} {{ item.last_name }}"
          >
            <i class="bi bi-eye btn-icons" aria-hidden="true"></i>
            <span class="btn-actions-text">Details</span>
          </router-link>
        </div>
      </div>
    </section>

    <div v-if="payments.length === 0" class="empty-state">
      <i class="bi bi-people icons" aria-hidden="treu"></i>
      <h3>Keine Zahlungen</h3>
      <p>Fügen Sie Zahlung hinzu, um sie zu verwalten.</p>
    </div>
  </div>
</template>

<script>
import store from '../../store'
export default {
  name: 'Payments',
  inject: ['formatCustomerId'],
  data() {
    return {
      title: 'Zahlungen',
      payments: [],
      search_box: '',
      date_box_start: '',
      date_box_end: '',
      categories_filter: '',
      total_count: 0,
      current_count: 0,
      isSort: true,
      categories: [
        { key: 'all', label: 'Alle Zahlungen' },
        { key: 'received', label: 'Erhaltene Zahlungen' },
        { key: 'cancelled', label: 'Storniert' },
        { key: 'today', label: 'Heute' },
        { key: 'this_month', label: 'Dieser Monat' },
        { key: 'this_year', label: 'Dieses Jahr' },
        { key: 'bank_transfer', label: 'Überweisung' },
        { key: 'cash', label: 'Barzahlung' },
        { key: 'card', label: 'Kartenzahlung' }
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
    this.getPayments()
  },
  methods: {
    async getPayments() {
      try {
        const result = await window.api.getPayments()
        if (!result.success) return
        this.payments = result.rows.map((row) => ({
          ...row,
          customer: row.customer ? JSON.parse(row.customer) : null
        }))
        this.total_count = result.total_count
        this.current_count = result.rows.length
      } catch (error) {
        console.error(error)
      }
    },
    avatarStyle(firstName, lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : ''
      const last = lastName ? lastName.charAt(0).toUpperCase() : ''
      return first + last || '??'
    },
    async searchFilter() {
      const term = this.search_box?.trim()
      if (!term) {
        this.getPayments()
        return
      }
      if (isNaN(term) && term.length < 3) {
        return
      }
      const result = await window.api.searchPayments(term)
      if (!result.success) return
      this.payments = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))
       this.total_count = result.total_count
        this.current_count = result.rows.length
    },
    async filterCategories() {
      try {
        const result = await window.api.filterPaymentsCategories(this.categories_filter)
        if (!result.success) return
        this.payments = result.rows.map((row) => ({
          ...row,
          customer: row.customer ? JSON.parse(row.customer) : null
        }))
        this.total_count = result.total_count
        this.current_count = result.rows.length
        await store.setFilters(
          'category_filter',
          JSON.parse(JSON.stringify(this.categories_filter))
        )
      } catch (error) {
        console.error(error)
      }
    },
    async filterDate() {
      try {
        if (!this.date_box_start) return this.$refs.date_box_start.focus()
        if (!this.date_box_end) return this.$refs.date_box_end.focus()
        if (this.date_box_start > this.date_box_end) {
          this.date_box_end = ''
          return this.$refs.date_box_end.focus()
        }
        if (this.date_box_start && this.date_box_end) {
          const date = {
            start: this.date_box_start,
            end: this.date_box_end
          }
          const result = await window.api.filterPaymentsDate(date)
          if (!result.success) return
          this.payments = result.rows.map((row) => ({
            ...row,
            customer: row.customer ? JSON.parse(row.customer) : null
          }))
          this.total_count = result.total_count
          this.current_count = result.rows.length
          await store.setFilters('date_filter', JSON.parse(JSON.stringify(date)))
        }
      } catch (error) {
        console.error(error)
      }
    },
    sorting(key) {
      if (!key) return
      this.payments.sort((a, b) => {
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
