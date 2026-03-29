<template>
  <div>
    <canvas ref="dashboardDonatChart" role="img" aria-label="Startseite Chart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
  name: 'DonutChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      canvasId: 'donutChart_' + Math.random().toString(36).substr(2, 9),
      chartInstance: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.updateChart()
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.initChart())
  },
  beforeUnmount() {
    if (this.chartInstance) this.chartInstance.destroy()
  },
  methods: {
    initChart() {
      const ctx = this.$refs.dashboardDonatChart
      this.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              data: this.chartData.values,
              backgroundColor: ['#10b981', '#9f3dea', '#f59e0b', '#ef4444'],
              borderWidth: 2,
              borderColor: '#fff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.parsed.toLocaleString()}`
                }
              }
            }
          }
        }
      })
    },
    updateChart() {
      if (this.chartInstance) {
        this.chartInstance.data.labels = this.chartData.labels
        this.chartInstance.data.datasets[0].data = this.chartData.values
        this.chartInstance.update()
      }
    }
  }
}
</script>
