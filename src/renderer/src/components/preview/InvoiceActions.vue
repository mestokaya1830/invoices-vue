<template>
  <div>
    <div class="sections btn-container" role="toolbar" aria-label="Recnungaktionen">
      <router class="btn btn-email" @click="sendEmail">
        <i class="bi bi-envelope btn-icons" aria-hidden="true"></i>
        E-Mail
      </router>

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
        :to="`/invoices/edit/${tableData.id}`"
        class="btn btn-cancel"
      >
        <i class="bi bi-x-circle btn-icons" aria-hidden="true"></i>
        Stornieren
      </router-link>
    </div>
  </div>
</template>

<script>
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
    async getPdfBlob() {
      const result = await window.api.readInvoicePDF(this.fileName)
      if (!result.success) {
        console.error('PDF is not found:', result.message)
        return null
      }
      return new Blob([result.buffer], { type: 'application/pdf' })
    },

    async exportPDF() {
      const blob = await this.getPdfBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.fileName + '.pdf'
      a.click()
      URL.revokeObjectURL(url)
    },

    async printDocument() {
      const blob = await this.getPdfBlob()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)
      iframe.onload = () => {
        iframe.contentWindow.print()
        URL.revokeObjectURL(url)
      }
    },

    async sendEmail() {
      const blob = await this.getPdfBlob()
      if (!blob) return
      await window.api.sendEmail(blob, this.fileName)
    }
  }
}
</script>
