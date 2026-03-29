<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
      <button class="btn btn-export" aria-label="Daten exportieren">
        <i class="bi bi-download btn-icons" aria-hidden="true"></i>
        <span class="btn-action-text">Exportieren</span>
      </button>
    </header>

    <section class="dashboard-grid">
      <article
        class="dashboard-card customers"
        tabindex="0"
        aria-label="Kunden anzeigen"
        @click="goTo('customers')"
      >
        <div class="dashboard-card-header">
          <div class="dashboard-avatar">
            <i :class="`bi bi-people-fill icons`" aria-hidden="true"></i>
          </div>
          <div class="dashboard-badge" aria-label="Aktiv">Aktiv</div>
        </div>
        <div class="dashboard-title" aria-label="Kunden">Kunden</div>
        <span class="dashboard-value">{{ tablesCount ? tablesCount.customers : 0 }}</span>
      </article>

      <article
        class="dashboard-card invoices"
        tabindex="0"
        aria-label="Rechnungen anzeigen"
        @click="goTo('invoices')"
      >
        <div class="dashboard-card-header">
          <div class="dashboard-avatar">
            <i :class="`bi bi-file-earmark-text-fill icons`" aria-hidden="true"></i>
          </div>
          <div class="dashboard-badge" aria-label="Aktiv">Aktiv</div>
        </div>
        <div class="dashboard-title">Rechnungen</div>
        <span class="dashboard-value">{{ tablesCount ? tablesCount.invoices : 0 }}</span>
      </article>

      <article
        class="dashboard-card offers"
        aria-label="Angebote anzeigen"
        tabindex="0"
        @click="goTo('offers')"
      >
        <div class="dashboard-card-header">
          <div class="dashboard-avatar">
            <i :class="`bi bi-file-earmark-text-fill icons`" aria-hidden="true"></i>
          </div>
          <div class="dashboard-badge" aria-label="Aktiv">Aktiv</div>
        </div>
        <div class="dashboard-title">Angebote</div>
        <span class="dashboard-value">{{ tablesCount ? tablesCount.offers : 0 }}</span>
      </article>

      <article
        class="dashboard-card orders"
        tabindex="0"
        aria-label="Bestellungen anzeigen"
        @click="goTo('orders')"
      >
        <div class="dashboard-card-header">
          <div class="dashboard-avatar">
            <i :class="`bi bi-file-earmark-text-fill icons`" aria-hidden="true"></i>
          </div>
          <div class="dashboard-badge" aria-label="Aktiv">Aktiv</div>
        </div>
        <div class="dashboard-title">Bestellungen</div>
        <span class="dashboard-value">{{ tablesCount ? tablesCount.orders : 0 }}</span>
      </article>
    </section>

    <section class="charts-grid">
      <article class="chart-card chart-main">
        <header class="chart-header">
          <h2 class="chart-title">Umsatzentwicklung</h2>
          <div class="time-filter">
            <button
              :class="{ active: selectedPeriod === '1M' }"
              aria-label="1 Monat"
              @click="updateChartData('1M')"
            >
              1M
            </button>
            <button
              :class="{ active: selectedPeriod === '3M' }"
              aria-label="3 Monate"
              @click="updateChartData('3M')"
            >
              3M
            </button>
            <button
              :class="{ active: selectedPeriod === '6M' }"
              aria-label="6 Monate"
              @click="updateChartData('6M')"
            >
              6M
            </button>
            <button
              :class="{ active: selectedPeriod === '1J' }"
              aria-label="1 Jahr"
              @click="updateChartData('1J')"
            >
              1J
            </button>
          </div>
        </header>
        <DashboardChart v-if="chartData" :chartData="chartData" :key="chartKey" />
      </article>
      <article class="chart-card chart-side">
        <h2 class="chart-title">Verteilung</h2>
        <DashboardChartDonat v-if="chartDataDonat" :chartData="chartDataDonat" :key="chartKey" />
      </article>
    </section>

    <section class="info-grid">
      <article class="info-card">
        <header class="info-title">Stammdaten</header>
        <dl>
          <div class="data-row">
            <dt>Aktive Kunden</dt>
            <dd>{{ tablesCount ? tablesCount.customers : 0 }}</dd>
          </div>
          <div class="data-row">
            <dt>Bezahlte Rechnungen</dt>
            <dd>{{ tablesCount ? tablesCount.paid_count : 0 }}</dd>
          </div>
          <div class="data-row">
            <dt>Offene Angebote</dt>
            <dd>{{ tablesCount ? tablesCount.offers : 0 }}</dd>
          </div>
          <div class="data-row">
            <dt>Laufende Aufträge</dt>
            <dd>{{ tablesCount ? tablesCount.orders : 0 }}</dd>
          </div>
        </dl>

        <div style="margin-top: 1.5rem">
          <div class="progress-item">
            <dl class="progress-header">
              <dt>Zahlungspünktlichkeit</dt>
              <dd>{{ invoiceStats.paymentRate }}%</dd>
            </dl>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: invoiceStats.paymentRate + '%' }"></div>
            </div>
          </div>

          <div class="progress-item">
            <dl class="progress-header">
              <dt>Unbezahlt Quote</dt>
              <dd>{{ invoiceStats.unpaidRate }}%</dd>
            </dl>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: invoiceStats.unpaidRate + '%' }"></div>
            </div>
          </div>

          <div class="progress-item">
            <dl class="progress-header">
              <dt>Überfällig Quote</dt>
              <dd>{{ invoiceStats.overdueRate }}%</dd>
            </dl>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: invoiceStats.overdueRate + '%' }"></div>
            </div>
          </div>
        </div>
      </article>

      <article v-if="last_activities" class="info-card">
        <header class="info-title">
          <h2>
            <i class="bi bi-clock-history info-title-icon icons" aria-hidden="true"></i>
            Letzte Aktivitäten
          </h2>
        </header>
        <div class="activity-item">
          <i class="bi bi-person-plus-fill icons" aria-hidden="true"></i>
          <div class="activity-content">
            <div class="activity-title">Neuer Kunde registriert</div>
            <div class="activity-subtitle">Schmidt Solutions GmbH</div>
          </div>
          <div
            class="activity-time"
            aria-label="Vor {{ daysDiff(last_activities.lastCustomer?.created_at) }} Tagen"
          >
            Vor {{ daysDiff(last_activities.lastCustomer?.created_at) }} Tagen
          </div>
        </div>

        <div class="activity-item">
          <i class="bi bi-check-circle-fill icons" aria-hidden="true"></i>
          <div class="activity-content">
            <div class="activity-title">
              Rechnung {{ last_activities.lastPaidInvoice?.id }} bezahlt
            </div>
            <div class="activity-subtitle">
              Kunde-Nr: {{ last_activities.lastPaidInvoice?.customer_id }}
            </div>
          </div>
          <div
            class="activity-time"
            aria-label="Vor {{ daysDiff(last_activities.lastPaidInvoice?.created_at) }} Tagen"
          >
            Vor {{ daysDiff(last_activities.lastPaidInvoice?.created_at) }} Tagen
          </div>
        </div>

        <div class="activity-item">
          <i class="bi bi-exclamation-triangle-fill icons" aria-hidden="true"></i>
          <div class="activity-content">
            <div class="activity-title">Rechnung fällig</div>
            <div class="activity-subtitle">
              Rechnung-Nr: {{ last_activities.lastOverdueInvoice?.id }}
            </div>
          </div>
          <div
            class="activity-time"
            aria-label="Fällig in {{ daysDiff(last_activities.lastOverdueInvoice?.due_date) }} Tagen"
          >
            Fällig in {{ daysDiff(last_activities.lastOverdueInvoice?.due_date) }} Tagen
          </div>
        </div>

        <div class="activity-item">
          <i class="bi bi-file-earmark-text icons" aria-hidden="true"></i>
          <div class="activity-content">
            <div class="activity-title">Neues Angebot erstellt</div>
            <div class="activity-subtitle">
              Angebot-Nr: {{ last_activities.lastOffer?.id }} –
              {{ last_activities.lastOffer?.customer_name }}
            </div>
          </div>
          <div
            class="activity-time"
            aria-label="Vor {{ daysDiff(last_activities.lastOffer?.created_at) }} Tagen"
          >
            Vor {{ daysDiff(last_activities.lastOffer?.created_at) }} Tagen
          </div>
        </div>

        <div class="activity-item">
          <i class="bi bi-file-earmark-text icons" aria-hidden="true"></i>
          <div class="activity-content">
            <div class="activity-title">Neues Auftrag erstellt</div>
            <div class="activity-subtitle">
              Auftrag-Nr: {{ last_activities.lastOrder?.id }} –
              {{ last_activities.lastOrder?.customer_name }}
            </div>
          </div>
          <div
            class="activity-time"
            aria-label="Vor {{ daysDiff(last_activities.lastOrder?.created_at) }} Tagen"
          >
            Vor {{ daysDiff(last_activities.lastOrder?.created_at) }} Tagen
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import DashboardChart from '../components/chart/DashboardChart.vue'
import DashboardChartDonat from '../components/chart/DashBoardChartDonat.vue'
import store from '../store'

export default {
  components: { DashboardChart, DashboardChartDonat },
  data() {
    return {
      title: 'Übersicht',
      tablesCount: null,
      chartData: null,
      chartDataDonat: null,
      selectedPeriod: '1M',
      chartKey: 0,
      last_activities: null
    }
  },
  computed: {
    invoiceStats() {
      if (!this.tablesCount) {
        return {
          paymentRate: 0,
          unpaidRate: 0,
          overdueRate: 0
        }
      }

      const paid = this.tablesCount.paid_count || 0
      const partial = this.tablesCount.partially_paid_count || 0
      const unpaid = this.tablesCount.unpaid_count || 0
      const overdue = this.tablesCount.overdue_count || 0

      const total = paid + partial + unpaid + overdue

      if (total === 0) {
        return {
          paymentRate: 0,
          unpaidRate: 0,
          overdueRate: 0
        }
      }

      return {
        paymentRate: Math.round(((paid + partial) / total) * 100),
        unpaidRate: Math.round((unpaid / total) * 100),
        overdueRate: Math.round((overdue / total) * 100)
      }
    }
  },
  mounted() {
    this.getDashboard()
  },
  methods: {
    async getDashboard() {
      try {
        this.clearDate()
        const result = await window.api.getDashboard()
        if (!result.success) return
        this.tablesCount = {
          customers: result.rows.customers || 0,
          invoices: result.rows.invoices || 0,
          offers: result.rows.offers || 0,
          orders: result.rows.orders || 0,
          paid_count: result.rows.paid_count || 0,
          partially_paid_count: result.rows.partially_paid_count || 0,
          unpaid_count: result.rows.unpaid_count || 0,
          overdue_count: result.rows.overdue_count || 0
        }
        await this.updateChartData(this.selectedPeriod)
        await this.getLatestActivities()
      } catch (error) {
        console.error(error)
      }
    },

    async updateChartData(period) {
      try {
        this.selectedPeriod = period
        const result = await window.api.getDashboardChart(period)

        if (result.success) {
          this.chartData = {
            labels: result.rows.labels,
            values: result.rows.values
          }
          this.chartDataDonat = {
            labels: ['Bezahlt', 'Teilweise bezahlt', 'Unbezahlt', 'Überfällig'],
            values: [
              result.rows.paid_count,
              result.rows.partially_paid_count,
              result.rows.unpaid_count,
              result.rows.overdue_count
            ]
          }
          this.chartKey++
        }
      } catch (error) {
        console.error('Chart verisi alınamadı:', error)
      }
    },

    async getLatestActivities() {
      const result = await window.api.getLatestActivities()
      if (!result) return
      this.last_activities = result.rows || null
    },
    goTo(path) {
      this.$router.push(`/${path}`)
    },

    daysDiff(dateString) {
      if (!dateString) return '0'
      const target = new Date(dateString)
      if (isNaN(target.getTime())) return '-'
      target.setHours(0, 0, 0, 0)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const diffMs = target.getTime() - now.getTime()
      return Math.round(diffMs / (1000 * 60 * 60 * 24))
    },

    async clearDate() {
      try {
        await store.clearFilters('date_filter')
        await store.clearFilters('category_filter')
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
