<template>
  <div class="vat-chart-wrapper">
    <h3 class="chart-title">Umsatzsteuer nach Steuersätzen</h3>
    <section class="charts-grid">
      <!-- Bar Chart -->
      <div class="chart-card chart-main">
        <canvas
          ref="barChart"
          role="img"
          aria-label="Balkendiagramm Umsatzsteuer nach Steuersätzen"
        ></canvas>
      </div>

      <!-- Donut Chart -->
      <div class="chart-card chart-side">
        <canvas
          ref="donutChart"
          aria-label="Balkendiagramm Umsatzsteuer nach Steuersätzen"
        ></canvas>
      </div>
    </section>

    <!-- KPI Strip -->
    <section class="kpi-strip">
      <div class="kpi-item kpi-total" role="listitem">
        <span class="kpi-dot" :style="`background:#0d8a6b`"></span>
        <span class="kpi-label">Gesamt MwSt.</span>
        <span class="kpi-value">{{ formatEur(totalVat.gross) }}</span>
        <span class="kpi-count">{{ totalVat.count }} Positionen</span>
      </div>
      <div
        v-for="(vatData, vatRate) in vatRatesData"
        :key="vatRate"
        class="kpi-item"
        role="listitem"
      >
        <span class="kpi-dot" :style="`background:${getVatColor(vatRate)}`"></span>
        <span class="kpi-label">{{ vatRate }}% MwSt.</span>
        <span class="kpi-value">{{ formatEur(vatData.gross) }}</span>
        <span class="kpi-count">{{ vatData.count }} Positionen</span>
      </div>
    </section>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'VatChart',
  props: {
    chartData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      barChartInstance: null,
      donutChartInstance: null
    }
  },

  computed: {
    vatRatesData() {
      const vatMap = {}
      this.chartData.forEach((invoice) => {
        let positions = []
        try {
          positions = JSON.parse(invoice.positions)
        } catch {
          positions = []
        }

        positions.forEach((pos) => {
          const vatRate = Number(pos.vat || 0)
          const quantity = Number(pos.quantity || 1)
          const price = Number(pos.price || 0)
          const discount = Number(pos.discount || 0)

          const net = price * quantity - discount
          const vat = (net * vatRate) / 100
          const gross = net + vat

          if (!vatMap[vatRate]) vatMap[vatRate] = { count: 0, net: 0, vat: 0, gross: 0 }

          vatMap[vatRate].count++
          vatMap[vatRate].net += net
          vatMap[vatRate].vat += vat
          vatMap[vatRate].gross += gross
        })
      })

      return Object.keys(vatMap)
        .sort((a, b) => b - a)
        .reduce((acc, key) => {
          acc[key] = vatMap[key]
          return acc
        }, {})
    },

    totalVat() {
      return Object.values(this.vatRatesData).reduce(
        (tot, v) => {
          tot.count += v.count
          tot.net += v.net
          tot.vat += v.vat
          tot.gross += v.gross
          return tot
        },
        { count: 0, net: 0, vat: 0, gross: 0 }
      )
    }
  },
  watch: {
    chartData() {
      this.$nextTick(() => this.renderCharts())
    }
  },
  mounted() {
    this.$nextTick(() => this.renderCharts())
  },

  beforeUnmount() {
    this.destroyCharts()
  },
  methods: {
    destroyCharts() {
      this.barChartInstance?.destroy()
      this.donutChartInstance?.destroy()
      this.barChartInstance = null
      this.donutChartInstance = null
    },

    renderCharts() {
      this.destroyCharts()
      this.renderBarChart()
      this.renderDonutChart()
    },

    renderBarChart() {
      const ctx = this.$refs.barChart?.getContext('2d')
      if (!ctx) return
      const rates = Object.keys(this.vatRatesData)
      const labels = rates.map((r) => `${r}%`)
      const netData = rates.map((r) => this.vatRatesData[r].net)
      const vatData = rates.map((r) => this.vatRatesData[r].vat)
      const colors = rates.map((r) => this.getVatColor(r))

      this.barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Netto',
              data: netData,
              backgroundColor: colors.map((c) => c + '99'),
              borderRadius: 5
            },
            { label: 'MwSt.', data: vatData, backgroundColor: colors, borderRadius: 5 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Netto- und MwSt.-Beträge nach Steuersatz',
              font: { size: 14, weight: '600' },
              padding: { bottom: 16 }
            },
            legend: {
              position: 'top',
              labels: { font: { size: 11 }, usePointStyle: true, padding: 12 }
            },
            tooltip: {
              callbacks: { label: (ctx) => `${ctx.dataset.label}: ${this.formatEur(ctx.raw)}` }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 12 } } },
            y: {
              grid: { color: '#f0f0f0' },
              ticks: { font: { size: 11 }, callback: (v) => this.formatEurShort(v) }
            }
          }
        }
      })
    },

    renderDonutChart() {
      const ctx = this.$refs.donutChart?.getContext('2d')
      if (!ctx) return
      const rates = Object.keys(this.vatRatesData)
      const labels = rates.map((r) => `${r}% MwSt.`)
      const data = rates.map((r) => this.vatRatesData[r].gross)
      const colors = rates.map((r) => this.getVatColor(r))

      this.donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            { data, backgroundColor: colors, borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 11 }, padding: 15, usePointStyle: true }
            },
            title: {
              display: true,
              text: 'Anteil nach Steuersatz',
              font: { size: 13, weight: '600' },
              padding: { bottom: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const perc = ((ctx.raw / this.totalVat.gross) * 100).toFixed(1)
                  return `${ctx.label}: ${this.formatEur(ctx.raw)} (${perc}%)`
                }
              }
            }
          }
        }
      })
    },

    getVatColor(rate) {
      rate = Number(rate)
      if (rate === 19) return '#0d8a6b'
      if (rate === 7) return '#9f3dea'
      if (rate === 0) return '#f59e0b'
      const colors = ['#6366f1', '#6366f1', '#9f3dea', '#ef4444', '#06b6d4']
      return colors[Math.floor(rate / 5) % colors.length]
    },

    formatEur(v) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v || 0)
    },
    formatEurShort(v) {
      if (v >= 1e6) return (v / 1e6).toFixed(1) + ' Mio€'
      if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k€'
      return v.toFixed(0) + '€'
    }
  }
}
</script>
