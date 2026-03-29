<template>
  <div>
    <h3 class="chart-title">Zahlungsverlauf</h3>
    <div class="chart-card chart-main">
      <canvas ref="invoiceLineChart" role="img" aria-label="Rechnung Line Chart"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'BarChart',
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {}
  },
  mounted() {
    this.$nextTick(() => this.initChart())
  },
  methods: {
    initChart() {
      Chart.defaults.elements.bar.borderWidth = 2
      Chart.defaults.elements.bar.borderColor = '#444'

      const labels = ['Bezahlt', 'Teilweise bezahlt', 'Unbezahlt', 'Überfällig']
      const backgroundColor = ['#10b981', '#60a5fa', '#f59e0b', '#ef4444']
      const data = [
        this.chartData.paid_count,
        this.chartData.partially_paid_count,
        this.chartData.unpaid_count,
        this.chartData.overdue_count
      ]

      new Chart(this.$refs.invoiceLineChart, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: '',
              data: data,
              backgroundColor: backgroundColor,
              barPercentage: 0.5,
              categoryPercentage: 1,
              borderRadius: 5
            }
          ]
        },
        scales: {
          yAxis: {
            min: 0,
            stepSize: 0.1,
            color: '#000',
            font: { size: 12 }
          }
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Anzahl Rechnungen',
              font: { size: 18 },
              padding: {
                top: 20,
                bottom: 0
              }
            },
            // subtitle: {
            //   display: true,
            //   text: 'Subtitle'
            // },
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'blue',
                font: { size: 10 }
              }
            }
          }
        }
      })
    }
  }
}
</script>
