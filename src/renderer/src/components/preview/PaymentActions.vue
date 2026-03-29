<template>
  <div>
    <div class="sections btn-container" role="toolbar" aria-label="Zahlungaktionen">
      <button class="btn btn-email" @click="sendEmail">
        <i class="bi bi-envelope btn-icons" aria-hidden="true"></i>
        E-Mail
      </button>

      <button class="btn btn-pdf" @click="exportPDF">
        <i class="bi bi-file-earmark-pdf btn-icons" aria-hidden="true"></i>
        PDF
      </button>

      <button class="btn btn-print" @click="printDocument">
        <i class="bi bi-printer btn-icons" aria-hidden="true"></i>
        Drucken
      </button>

      <router-link
        v-if="tableData.id !== 'preview' && tableData.is_active"
        :to="`/payments/edit/${tableData.id}`"
        class="btn btn-cancel"
      >
        <i class="bi bi-x-circle btn-icons" aria-hidden="true"></i>
        Stornieren
      </router-link>
    </div>
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js'
import store from '../../store/index.js'
export default {
  name: 'ActionsButton',
  props: {
    tableData: {
      type: Object,
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  methods: {
    async exportPDF() {
      await this.$nextTick() // Vue render bitti mi bekle
      const element = document.querySelector('.printable')
      if (!element) return

      const options = {
        margin: 16,
        filename: this.fileName + '.pdf',
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          logging: false,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      html2pdf().set(options).from(element).save()
      this.clearFilters()
    },

    printDocument() {
      window.print()
    },
    sendEmail() {
      this.clearFilters()
    },
    async clearFilters() {
      try {
        await store.clearFilters('payment')
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
