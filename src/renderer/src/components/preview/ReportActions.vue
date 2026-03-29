<template>
  <div v-if="period.start">
    <div class="sections btn-container" role="toolbar">
      <button class="btn btn-pdf" @click="savePdf()">
        <i class="bi bi-file-earmark-pdf btn-icons" aria-hidden="true"></i>
        PDF Exportieren
      </button>
      <button class="btn btn-print" @click="printDocument()">
        <i class="bi bi-printer btn-icons" aria-hidden="true"></i>
        Drucken
      </button>
    </div>
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js'
export default {
  inject: ['formatDate'],
  props: {
    fileName: {
      type: String,
      required: true
    },
    period: {
      type: Object,
      required: true
    }
  },
  methods: {
    async savePdf() {
      await this.$nextTick()
      const element = document.querySelector('.printable')
      if (!element) return

      const fileName = `${this.fileName}-${this.formatDate(this.period.start)} - ${this.formatDate(this.period.end)}`
      const options = {
        margin: 16,
        filename: fileName + '.jpeg',
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: { scale: 1, useCORS: true, logging: false, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      try {
        const pdf = await html2pdf().set(options).from(element).toPdf().output('blob')
        if (!pdf) return

        const url = URL.createObjectURL(pdf)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName + '.pdf'
        a.click()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('PDF save error:', err)
      }
    },
    printDocument() {
      window.print()
    }
  }
}
</script>
