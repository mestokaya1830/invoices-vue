<template>
  <div>
    <h3 class="chart-title">Zahlungsübersicht</h3>
    <div class="chart-card chart-side">
      <canvas
        ref="invoicePieChart"
        class="canvas-pie-invoice"
        role="img"
        aria-label="Rechnung Pie Chart"
      ></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'PieChart',
  props: {
    percentData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pieChart: null
    }
  },
  watch: {
    percentData: {
      deep: true,
      handler() {
        this.destroyAndInit()
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.initPie())
  },
  beforeUnmount() {
    if (this.pieChart) {
      this.pieChart.destroy()
      this.pieChart = null
    }
  },
  methods: {
    destroyAndInit() {
      if (this.pieChart) {
        this.pieChart.destroy()
        this.pieChart = null
      }
      this.$nextTick(() => this.initPie())
    },
    initPie() {
      if (!this.$refs.invoicePieChart) return

      const labels = ['Bezahlt', 'Teilweise', 'Unbezahlt', 'Überfällig']
      const colors = ['#10b981', '#9f3dea', '#f59e0b', '#ef4444']

      this.pieChart = new Chart(this.$refs.invoicePieChart, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data: [
                parseFloat(this.percentData.paid_percentage),
                parseFloat(this.percentData.partially_paid_percentage),
                parseFloat(this.percentData.unpaid_percentage),
                parseFloat(this.percentData.overdue_percentage)
              ],
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: ${context.raw.toFixed(1)}%`
              }
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-side {
  height: 440px;
}
</style>
