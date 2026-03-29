<template>
  <div>
    <header class="page-header">
      <h1>{{ title }}</h1>
    </header>
    <div class="form-group">
      <select v-model="report_type" class="inputs" aria-label="Waehle Bericht">
        <option value="" disabled>Waehle Bericht</option>
        <option value="Kundenbezogener">Kundenbezogener Bericht</option>
        <option value="Rechnungsliste">Rechnungsliste</option>
        <option value="Mehrwertsteuer">Mehrwertsteuer (MwSt) Bericht</option>
      </select>
    </div>
    <CustomersReport v-if="report_type == 'Kundenbezogener'" />
    <InvoicesListReport v-if="report_type == 'Rechnungsliste'" />
    <TaxReport v-if="report_type == 'Mehrwertsteuer'" />
  </div>
</template>

<script>
import CustomersReport from '../../components/reports/CustomersReport.vue'
import InvoicesListReport from '../../components/reports/InvoicesListReport.vue'
import TaxReport from '../../components/reports/TaxReport.vue'

export default {
  name: 'InvoicesReport',
  components: {
    CustomersReport,
    InvoicesListReport,
    TaxReport
  },
  data() {
    return {
      title: 'Berichte',
      report_type: ''
    }
  },
  methods: {
    printDocument() {
      window.print()
    }
  }
}
</script>
