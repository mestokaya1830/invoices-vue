<template>
  <div>
    <section aria-label="Datumsbereich auswählen">
      <select
        id="date-range"
        v-model="date_range"
        class="inputs"
        aria-label="Zeitraum auswählen"
        @change="rangeDateFilter"
      >
        <option value="" disabled>Zeitraum wählen</option>
        <option value="1">Diesen Monat</option>
        <option value="3">Letzte 3 Monate</option>
        <option value="6">Letzte 6 Monate</option>
        <option value="12">Letztes Jahr</option>
      </select>

      <div class="sections report-period">
        <div class="form-row">
          <div class="form-group">
            <label for="date-start">Von</label>
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="date-start"
                v-model="date_box_start"
                type="date"
                class="inputs date"
                aria-label="Startdatum"
                @change="flexDateFilter()"
              />
            </div>
          </div>
          <div class="form-group">
            <label for="date-end">Bis</label>
            <div class="date-wrapper">
              <i class="bi bi-calendar3 calendar-icon" aria-hidden="true"></i>
              <input
                id="date-end"
                v-model="date_box_end"
                type="date"
                class="inputs date"
                aria-label="Enddatum"
                @change="flexDateFilter()"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="reports" aria-label="Bericht Zusammenfassung">
      <div class="report-header">
        <h2>{{ title }}</h2>
        <p class="report-period">
          <i class="bi bi-clock-history icons-medium" aria-hidden="true"></i>Zeitraum:
          {{ selectedPeriod }}
        </p>
      </div>

      <div class="report-summary-cards">
        <article class="report-summary-card" aria-label="Aktive Kunden">
          <div class="report-card-icon-container">
            <i class="bi bi-people-fill report-card-icons" aria-hidden="true"></i>
            <p class="repor-card-label">Aktive Kunden</p>
          </div>
          <div class="card-content">
            <h3 class="card-value">Anzahl {{ reports.length }}</h3>
            <p class="card-detail">Im Zeitraum {{ selectedPeriod }}</p>
          </div>
        </article>

        <article class="report-summary-card" aria-label="Ø Gesamtumsatz">
          <div class="report-card-icon-container">
            <i class="bi bi-cash-stack report-card-icons" aria-hidden="true"></i>
            <p class="repor-card-label">Ø Gesamtumsatz</p>
          </div>
          <div class="card-content">
            <h3 class="card-value">{{ formatCurrency(summary.total_revenue) }}</h3>
            <p class="card-detail">Im Zeitraum</p>
          </div>
        </article>

        <article v-if="summary.top_customer" class="report-summary-card" aria-label="Top Kunde">
          <div class="report-card-icon-container">
            <i class="bi bi-trophy-fill text-warning report-card-icons" aria-hidden="true"></i>
            <p class="repor-card-label">Top Kunde</p>
          </div>
          <div class="card-content">
            <h3 class="card-value">{{ formatCurrency(summary.top_customer.invoice_total) }}</h3>
            <p class="card-detail">{{ summary.top_customer.company_name }}</p>
            <p class="card-detail">{{ summary.top_customer.full_name }}</p>
          </div>
        </article>

        <article class="report-summary-card" aria-label="Umsatz pro Kunde">
          <div class="report-card-icon-container">
            <i class="bi bi-graph-up-arrow report-card-icons" aria-hidden="true"></i>
            <p class="repor-card-label">Umsatz pro Kunde</p>
          </div>
          <div class="card-content">
            <h3 class="card-value">{{ formatCurrency(summary.total_avarage) }}</h3>
            <p class="card-detail">Durchschnitt</p>
          </div>
        </article>
      </div>
    </section>

    <section class="table-section" aria-label="Detaillierte Kundenübersicht">
      <h2>Detaillierte Kundenübersicht</h2>
      <table class="report-table">
        <caption>
          Kundenübersicht
        </caption>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Firma</th>
            <th>Name</th>
            <th>Stadt</th>
            <th>Rechnungen</th>
            <th>Gesamtumsatz</th>
            <th>Anteil %</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in reports" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.id }}</td>
            <td>{{ item.company_name || '-' }}</td>
            <td>{{ item.full_name || '-' }}</td>
            <td>{{ item.city || '-' }}</td>
            <td class="text-center">{{ item.invoice_count }}</td>
            <td class="text-right">{{ formatCurrency(item.invoice_total) }}</td>
            <td class="text-center">{{ item.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </section>

    <ReportActions fileName="Kundenberichte" :period="period" />
  </div>
</template>

<script>
import ReportActions from '../preview/ReportActions.vue'
export default {
  name: 'CustomersReport',
  components: {
    ReportActions
  },
  inject: ['formatCustomerId', 'formatDate', 'formatCurrency', 'formatPercentage'],
  data() {
    return {
      title: 'Kundenbezogener Bericht',
      reports: null,
      summary: null,
      date_range: '',
      date_box_start: '',
      date_box_end: '',
      period: { start: '', end: '' },
      is_ready: false,
      activeTab: 'all',
      is_sort: true
    }
  },
  computed: {
    selectedPeriod() {
      if (!this.period) return
      return this.formatDate(this.period.start) + ' - ' + this.formatDate(this.period.end)
    }
  },
  methods: {
    async rangeDateFilter() {
      if (!this.date_range) return
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth() - this.date_range, 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 0, 0)
      this.date_box_start = startDate.toISOString().slice(0, 10)
      this.date_box_end = endDate.toISOString().slice(0, 10)
      this.getReport()
    },
    flexDateFilter() {
      if (!this.date_box_start) return this.$refs.date_box_start.focus()
      if (!this.date_box_end) return this.$refs.date_box_end.focus()
      if (this.date_box_start > this.date_box_end) {
        this.date_box_end = ''
        return this.$refs.date_box_end.focus()
      }
      this.getReport()
    },
    async getReport() {
      if (!this.date_box_start || !this.date_box_end) return
      const data = {
        start: this.date_box_start,
        end: this.date_box_end,
        limit: 20
      }
      const result = await window.api.reportCustomers(data)
      if (!result.success) return
      this.reports = result.rows
      const totalRevenue = result.rows.reduce((sum, c) => sum + c.invoice_count, 0)

      result.rows.forEach((c) => {
        c.percentage = ((c.invoice_count / totalRevenue) * 100).toFixed(2) // örn: "50.00"
      })

      this.summary = {
        total_revenue: result.rows.reduce((sum, c) => sum + c.invoice_total, 0),
        total_avarage: result.rows.reduce(
          (sum, c) => sum + c.invoice_total / result.rows.length,
          0
        ),
        top_customer: result.rows.sort((a, b) => (a.invoice_total > b.invoice_total ? -1 : 1))[0]
      }
      this.period = {
        start: this.date_box_start,
        end: this.date_box_end
      }
      console.log('period', this.period)
      this.is_ready = true
    },
    sorting(key) {
      if (!key) return
      this.reports.sort((a, b) => {
        const res = a[key] > b[key] ? 1 : -1
        return this.isSort ? res : -res
      })
      this.isSort = !this.isSort
    }
  }
}
</script>
