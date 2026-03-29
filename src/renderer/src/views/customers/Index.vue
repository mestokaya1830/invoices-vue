<template>
  <div v-if="customers">
    <header class="page-header">
      <h1>{{ title }} {{ total_count }} / {{ current_count }}</h1>
      <router-link to="/customers/create" class="btn btn-primary">
        <i class="bi bi-plus-circle btn-icons" aria-hidden="true"></i>
        Neuen Kunden erstellen
      </router-link>
    </header>

    <section class="main-filter" aria-label="customer filter">
      <select
        v-model="categories_filter"
        class="inputs select"
        aria-label="Kategorien"
        @change="filterCategories"
      >
        <option value="" disabled>Kategorie</option>
        <template v-for="item in categories" :key="item">
          <option :value="item.key">{{ item.label }}</option>
        </template>
      </select>

      <input
        v-model="search_box"
        class="inputs"
        placeholder="Kunde, Firma oder Rechnungs-ID suchen..."
        aria-label="Kunden, Firma oder Rechnungs-ID suchen"
        @input="searchFilter"
      />

      <div class="date-wrapper">
        <i class="bi bi-calendar calendar-icon" aria-hidden="true"></i>
        <input
          ref="date_box_start"
          v-model="date_box_start"
          type="date"
          class="inputs date"
          aria-label="Startdatum"
          @input="filterDate()"
        />
      </div>

      <div class="date-wrapper">
        <i class="bi bi-calendar calendar-icon"></i>
        <input
          ref="date_box_end"
          v-model="date_box_end"
          type="date"
          class="inputs date"
          aria-label="Enddatum"
          @input="filterDate()"
        />
      </div>

      <button class="sort-btn" aria-label="Sortieren" @click="sorting('id')">&#8645;</button>
      <button type="button" class="sort-btn" @click="printDocument" aria-label="Drucken">
        <i class="bi bi-printer btn-icons" aria-hidden="true"></i>
      </button>
    </section>

    <section class="list-grid printable" aria-label="Kundenlist">
      <ul>
        <li v-for="item in customers" :key="item.id">
          <article class="list-card">
            <header class="card-header">
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
              <p class="status-badge" :class="item.is_active ? 'active' : 'inactive'">
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </p>
            </header>

            <nav class="card-actions" aria-label="Kundenaktionen">
              <router-link
                :to="{ path: '/invoices/create', query: { id: item.id } }"
                class="btn btn-action btn-rechnung"
                aria-label="Rechnung erstellen für {{ item.first_name }} {{ item.last_name }}"
              >
                <i class="bi bi-receipt btn-icons" aria-hidden="true"></i>
                <span class="btn-actions-text">Neue Rechnung erstellen</span>
              </router-link>

              <router-link
                :to="{ path: '/offers/create', query: { id: item.id } }"
                class="btn btn-action btn-angebot"
                aria-label="Neues Angebot erstellen für {{ item.first_name }} {{ item.last_name }}"
              >
                <i class="bi bi-file-earmark-text btn-icons" aria-hidden="true"></i>
                <span class="btn-actions-text"> Neues Angebot erstellen</span>
              </router-link>

              <router-link
                :to="{ path: '/orders/create', query: { id: item.id } }"
                class="btn btn-action btn-auftrag"
                aria-label="Neuen Auftrag erstellen für {{ item.first_name }} {{ item.last_name }}"
              >
                <i class="bi bi-box-seam btn-icons" aria-hidden="true"></i>
                <span class="btn-actions-text">Neuen Auftrag erstellen</span>
              </router-link>

              <router-link
                :to="`/customers/details/${item.id}`"
                class="btn btn-secondary btn-details"
                aria-label="Details anzeigen für {{ item.first_name }} {{ item.last_name }}"
              >
                <i class="bi bi-eye btn-icons" aria-hidden="true"></i>
                <span class="btn-actions-text">Details</span>
              </router-link>
            </nav>
          </article>
        </li>
      </ul>
    </section>

    <div v-if="customers.length === 0" class="empty-state">
      <i class="bi bi-people"></i>
      <h3>Keine Kunden</h3>
      <p>Fügen Sie Kunden hinzu, um sie zu verwalten.</p>
    </div>
  </div>
</template>

<script>
import store from '../../store'
export default {
  name: 'Customers',
  inject: ['formatCustomerId'],
  data() {
    return {
      title: 'Kunden',
      customers: [],
      search_box: '',
      isSort: true,
      date_box_start: '',
      date_box_end: '',
      categories_filter: '',
      total_count: 0,
      current_count: 0,
      categories: [
        { key: 'all', label: 'Alle' },
        { key: 'active', label: 'Aktiv' },
        { key: 'canceled', label: 'Storniert' },
        { key: 'first_10', label: 'Erste 10 Kunden' },
        { key: 'last_10', label: 'Letzte 10 Kunden' }
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
    this.getCustomers()
  },
  methods: {
    async getCustomers() {
      try {
        const result = await window.api.getCustomers()
        if (!result.success) return
        this.customers = result.rows
        this.total_count = result.total
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
    async filterCategories() {
      try {
        const result = await window.api.filterCustomersCategories(this.categories_filter)
        if (!result.success) return
        this.customers = result.rows.map((row) => ({
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
    async searchFilter() {
      const term = this.search_box?.trim()
      if (!term) {
        this.getCustomers()
        return
      }
      if (isNaN(term) && term.length < 3) {
        return
      }

      const result = await window.api.searchCustomers(term)
      if (!result.success) return
      this.customers = result.rows
      this.total_count = result.total_count
      this.current_count = result.rows.length
      await store.setFilters('search_filter', JSON.parse(JSON.stringify(this.search_box)))
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
          const result = await window.api.filterCustomerDate(date)
          if (!result.success) return
          this.customers = result.rows
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
      this.customers.sort((a, b) => {
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
