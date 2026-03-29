<template>
  <div class="app-layout">
    <header>
      <div class="titlebar">
        <h1 class="titlebar-title">Meine App</h1>

        <div class="window-controls" role="toolbar" aria-label="Fenstersteuerung">
          <button type="button" aria-label="Minimieren" @click="minimize()">–</button>
          <button type="button" aria-label="Schließen" @click="close()">×</button>
        </div>
      </div>
    </header>

    <aside class="sidebar">
      <SideBar />
    </aside>

    <main ref="layouts" class="layouts">
      <router-view class="router" />
    </main>

    <footer>
      <button
        v-if="showGoTop"
        type="button"
        class="btn-go-top"
        aria-label="Nach oben scrollen"
        @click="scrollToTop"
      >
        <i class="bi bi-arrow-up go-top-icon" aria-hidden="true"></i>
      </button>
    </footer>

  </div>
</template>

<script>
import SideBar from './components/preview/SideBarPreview.vue'

export default {
  components: {
    SideBar
  },
  provide() {
    const year = new Date().getFullYear()
    return {
      formatCustomerId(value) {
        if (!value) return ''
        return `KU-${year}-${String(value).padStart(5, '0')}`
      },
      formatInvoiceId(value) {
        if (!value) return ''
        return `RE-${year}-${String(value).padStart(5, '0')}`
      },
      formatOfferId(value) {
        if (!value) return ''
        return `ANG-${year}-${String(value).padStart(5, '0')}`
      },
      formatOrderId(value) {
        if (!value) return ''
        return `AUF-${year}-${String(value).padStart(5, '0')}`
      },
      formatPaymentId(value) {
        if (!value) return ''
        return `ZA-${year}-${String(value).padStart(5, '0')}`
      },
      formatReminderId(value) {
        if (!value) return ''
        return `MA-${year}-${String(value).padStart(5, '0')}`
      },
      formatDeliveryId(value) {
        if (!value) return ''
        return `LI-${year}-${String(value).padStart(5, '0')}`
      },
      formatDate(value) {
        if (!value) return ''
        try {
          const d = new Date(value)
          if (isNaN(d)) return ''
          return d.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        } catch (error) {
          return error.message || ''
        }
      },
      formatValidDays(baseDate, validDays) {
        if (!baseDate || !validDays) return ''
        const d = new Date(baseDate)
        d.setDate(d.getDate() + Number(validDays))
        return d.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      },
      formatCurrency(value, currency) {
        if (currency == undefined) {
          currency = 'EUR.de-DE'
        }
        const num = parseFloat(value) || 0
        const [curr, locale] = currency.split('.')
        return new Intl.NumberFormat(locale, { style: 'currency', currency: curr }).format(num)
      },
      checkServiceDates(start, end, ref1, ref2) {
        if (!start) {
          this.$refs[ref1].focus?.()
          this.error[ref1] = 'Startdatum darf nicht leer sein.'
          return
        }

        if (!end) {
          this.$refs[ref2].focus?.()
          this.error[ref2] = 'Enddatum darf nicht leer sein.'
          return
        }

        if (start > end) {
          this.$refs[ref2].focus?.()
          this.error[ref2] = 'Startdatum darf nicht nach Enddatum liegen.'
          return
        }
        return true
      },
      checkPositionsDates(positions) {
        for (let i = 0; i < positions.length; i++) {
          if (!positions[i].service_period_start) {
            this.$refs.service_period_start[i].focus?.()
            this.error.service_period_start = 'Startdatum darf nicht leer sein.'
            return
          }

          if (!positions[i].service_period_end) {
            this.$refs.service_period_end[i].focus?.()
            this.error.service_period_end = 'Enddatum darf nicht leer sein.'
            return
          }

          if (positions[i].service_period_start > positions[i].service_period_end) {
            this.$refs.service_period_end[i].focus?.()
            this.error.service_period_end = 'Startdatum darf nicht nach Enddatum liegen.'
            return
          }
        }
        return true
      },
      trimFormFields(data) {
        for (const item in data) {
          if (typeof data[item] === 'string') {
            data[item] = data[item].trim()
          }
        }
      },
      checkDueDate(value) {
        if (!value) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const due_date = new Date(value)
        due_date.setHours(0, 0, 0, 0)

        return new Date(due_date) < today
      },
      formatPercentage(value, total) {
        if (!total || total === 0) return '0%'
        return ((value / total) * 100).toFixed(0) + '%'
      },
      validateIban(input) {
        const sepa_iban_lengths = {
          AT: 20,
          BE: 16,
          BG: 22,
          CH: 21,
          CY: 28,
          CZ: 24,
          DE: 22,
          DK: 18,
          EE: 20,
          ES: 24,
          FI: 18,
          FR: 27,
          GB: 22,
          GR: 27,
          HR: 21,
          HU: 28,
          IE: 22,
          IS: 26,
          IT: 27,
          LI: 21,
          LT: 20,
          LU: 20,
          LV: 21,
          MC: 27,
          MT: 31,
          NL: 18,
          NO: 15,
          PL: 28,
          PT: 25,
          RO: 24,
          SE: 24,
          SI: 19,
          SK: 24,
          SM: 27,
          VA: 22
        }

        const country_flags = {
          AT: '🇦🇹',
          BE: '🇧🇪',
          BG: '🇧🇬',
          CH: '🇨🇭',
          CY: '🇨🇾',
          CZ: '🇨🇿',
          DE: '🇩🇪',
          DK: '🇩🇰',
          EE: '🇪🇪',
          ES: '🇪🇸',
          FI: '🇫🇮',
          FR: '🇫🇷',
          GB: '🇬🇧',
          GR: '🇬🇷',
          HR: '🇭🇷',
          HU: '🇭🇺',
          IE: '🇮🇪',
          IS: '🇮🇸',
          IT: '🇮🇹',
          LI: '🇱🇮',
          LT: '🇱🇹',
          LU: '🇱🇺',
          LV: '🇱🇻',
          MC: '🇲🇨',
          MT: '🇲🇹',
          NL: '🇳🇱',
          NO: '🇳🇴',
          PL: '🇵🇱',
          PT: '🇵🇹',
          RO: '🇷🇴',
          SE: '🇸🇪',
          SI: '🇸🇮',
          SK: '🇸🇰',
          SM: '🇸🇲',
          VA: '🇻🇦'
        }

        const raw = (input || '')
          .toString()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')

        // Format: 4
        const formatted = raw.replace(/(.{4})/g, '$1 ').trim()

        if (!raw) {
          return { valid: false, formatted, flag: '', error: '' }
        }

        const country = raw.slice(0, 2)
        const flag = country_flags[country] || ''

        if (!sepa_iban_lengths[country]) {
          return { valid: false, formatted, error: `${country} ist kein SEPA-Land.` }
        }

        if (raw.length !== sepa_iban_lengths[country]) {
          return {
            valid: false,
            formatted,
            flag,
            error: `${country} IBAN muss ${sepa_iban_lengths[country]} Zeichen haben.`
          }
        }

        // MOD-97
        const rearranged = raw.slice(4) + raw.slice(0, 4)
        let numeric = ''
        for (const ch of rearranged) numeric += /[A-Z]/.test(ch) ? ch.charCodeAt(0) - 55 : ch

        let remainder = numeric
        while (remainder.length > 2) {
          const block = remainder.slice(0, 9)
          remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(block.length)
        }

        if (parseInt(remainder, 10) % 97 !== 1) {
          return { valid: false, formatted, flag, error: 'IBAN-Prüfsumme ist ungültig.' }
        }

        return { valid: true, formatted, flag, error: '' }
      }
    }
  },

  data() {
    return {
      showGoTop: false
    }
  },
  mounted() {
    const layouts = this.$refs.layouts
    if (layouts) {
      layouts.addEventListener('scroll', this.handleScroll)
    }
  },
  beforeUnmount() {
    const layouts = this.$refs.layouts
    if (layouts) layouts.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    async minimize() {
      await window.api.controlWindow('minimize')
    },
    // async maximize() {
    //   await window.api.controlWindow('maximize')
    // },
    async close() {
      await window.api.controlWindow('close')
    },
    handleScroll() {
      const layouts = this.$refs.layouts
      if (!layouts) return
      this.showGoTop = layouts.scrollTop > 300
    },
    scrollToTop() {
      const layouts = this.$refs.layouts
      if (layouts) {
        layouts.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }
}
</script>
