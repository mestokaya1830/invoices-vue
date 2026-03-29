<template>
  <div v-if="orders">
    <header class="page-header">
      <h1>{{ title }} {{ total_count }} / {{ current_count }}</h1>
      <router-link to="/customers" class="btn btn-primary">
        <i class="bi bi-plus-circle btn-icons" aria-hidden="true"></i>
        <span>Neuen Auftrag erstellen</span>
      </router-link>
    </header>

    <section class="main-filter">
      <select
        v-model="categories_filter"
        aria-label="Kategorie"
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

    <div v-if="search_box && search_box.length < 4" class="hint">Mindestens 2 Zeichen eingeben</div>

    <!-- Order card -->
    <section class="list-grid printable">
      <div v-for="item in orders" :key="item.id" class="list-card">
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-header-left">
            <div class="list-avatar">
              {{ avatarStyle(item.customer.first_name, item.customer.last_name) }}
            </div>
            <div class="list-info">
              <h2 class="list-id">{{ formatOrderId(item.id) }}</h2>
              <span class="list-type-badge">{{ item.customer.company_name }}</span> <br />
              <span class="list-name"
                >{{ item.customer.first_name }} {{ item.customer.last_name }}</span
              >
            </div>
          </div>
          <div class="status-badge-container">
            <div class="status-badge" :class="item.is_active ? 'active' : 'inactive'">
              {{ item.is_active ? 'Aktiv' : 'Storniert' }}
            </div>
            <div class="status-badge total">
              {{ formatCurrency(item.gross_total, item.currency) }}
            </div>

            <router-link
              v-if="item.payment_status !== 'paid' && item.is_active === 1"
              :to="`/payments/create/${item.id}`"
              class="status-badge payment"
              >Zahlung erfassen</router-link
            >

            <div
              v-if="item.payment_status === 'paid' && item.is_active === 1"
              class="status-badge paid"
            >
              <span v-if="item.paid_at && item.paid_at < item.due_date">
                <i class="bi bi-clock" aria-hidden="true"></i>
              </span>
              Bezahlt
              <span v-if="item.early_paid_discount_applied">
                <i class="bi bi-currency-euro" aria-hidden="true"></i>
              </span>
            </div>

            <div v-if="item.is_active === 0" class="status-badge canceled">
              <small>Storniert am: {{ formatDate(item.cancelled_at) }}</small>
            </div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="card-actions">
          <router-link
            :to="`/orders/details/${item.id}`"
            class="btn btn-action btn-details"
            aria-label="Details anzeigen für {{ item.first_name }} {{ item.last_name }}"
          >
            <i class="bi bi-eye btn-icons" aria-hidden="true"></i>
            <span class="btn-actions-text">Details</span>
          </router-link>
        </div>
      </div>
    </section>

    <section v-if="!orders || orders.length === 0" class="empty-state text-center py-5">
      <i
        class="bi bi-file-earmark-x text-muted icons"
        aria-hidden="true"
        style="font-size: 4rem"
      ></i>

      <h2 class="mt-3">Keine Aufträge</h2>
      <p class="text-secondary">Erstellen Sie neue Aufträge, um sie hier zu sehen.</p>
    </section>
  </div>
</template>

<script>
import store from '../../store'
export default {
  name: 'Orders',
  inject: ['formatOrderId', 'formatInvoiceId', 'formatCustomerId', 'formatDate', 'formatCurrency'],
  data() {
    return {
      title: 'Rechnungen',
      orders: [],
      search_box: '',
      date_box_start: '',
      date_box_end: '',
      categories_filter: '',
      total_count: 0,
      current_count: 0,
      isSort: true,
      categories: [
        { key: 'all', label: 'Alle Bestellungen' },

        { key: 'pending', label: 'Neu' },
        { key: 'confirmed', label: 'Bestätigt' },
        { key: 'in_progress', label: 'In Bearbeitung' },
        { key: 'completed', label: 'Abgeschlossen' },

        { key: 'delivery_pending', label: 'Versand offen' },
        { key: 'shipped', label: 'Versendet' },
        { key: 'delivered', label: 'Zugestellt' },

        { key: 'sent', label: 'Gesendet' },

        { key: 'cancelled', label: 'Storniert' }
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
    this.getOrders()
  },
  methods: {
    async getOrders() {
      try {
        const result = await window.api.getOrders()
        if (!result.success) return
        this.orders = result.rows.map((row) => ({
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
    async filterCategories() {
      try {
        const result = await window.api.filterOrdersCategories(this.categories_filter)
        if (!result.success) return
        this.orders = result.rows.map((row) => ({
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
        this.getOrders()
        return
      }
      if (isNaN(term) && term.length < 3) {
        return
      }

      const result = await window.api.searchOrders(term)
      if (!result.success) return
      this.orders = result.rows.map((row) => ({
        ...row,
        customer: row.customer ? JSON.parse(row.customer) : null
      }))
      this.total_count = result.total_count
      this.current_count = result.rows.length
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
          const result = await window.api.filterOrdersDate(date)
          if (!result.success) return
          this.orders = result.rows.map((row) => ({
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
      this.orders.sort((a, b) => {
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
