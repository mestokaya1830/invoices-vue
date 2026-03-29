<template>
  <div>
    <canvas
      ref="dashboardChart"
      class="canvas-dashboard-line"
      role="img"
      aria-label="Startseite Chart"
    ></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'LineChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartInstance: null
    }
  },
  mounted() {
    this.$nextTick(() => this.initChart())
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }
  },
  methods: {
    initChart() {
      const ctx = this.$refs.dashboardChart
      if (!ctx) return

      if (this.chartInstance) {
        this.chartInstance.destroy()
        this.chartInstance = null
      }

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: 'Umsatz (€)',
              data: this.chartData.values,
              borderColor: '#3ba55c',
              backgroundColor: 'rgba(59,165,92,0.1)',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: '#3ba55c'
            }
          ]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
            x: {}
          }
        }
      })
    },

    updateChart() {
      if (!this.chartInstance?.canvas) return
      this.chartInstance.data.labels = this.chartData.labels
      this.chartInstance.data.datasets[0].data = this.chartData.values
      this.chartInstance.update()
    }
  }
}
</script>

<style scoped>
.canvas-dashboard-line {
  height: 300px;
}
</style>
