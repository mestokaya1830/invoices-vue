<template>
  <div v-if="customer">
    <!-- Header -->
    <header class="page-header">
      <h1 for="">{{ title }}</h1>
      <router-link to="/customers" class="btn btn-secondary">
        <i class="bi bi-arrow-left-circle btn-icons" aria-hidden="true"></i>Zurück
      </router-link>
    </header>

    <!-- Customer Info Card -->
    <section class="customer-details-container" aria-label="Kundendaten">
      <dl class="customer-details">
        <div class="customer-details-list">
          <dt>Kunden-Nr.:</dt>
          <dd>{{ formatCustomerId(customer.id) }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Datum:</dt>
          <dd>{{ formatDate(customer.date) }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Firma:</dt>
          <dd>{{ customer.company_name }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Firmentyp:</dt>
          <dd>{{ customer.company_type }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Vorname:</dt>
          <dd>{{ customer.first_name }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Nachname:</dt>
          <dd>{{ customer.last_name }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Email:</dt>
          <dd>{{ customer.email }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Adresse:</dt>
          <dd>{{ customer.address }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>PLZ:</dt>
          <dd>{{ customer.postal_code }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Stadt:</dt>
          <dd>{{ customer.city }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Telefon:</dt>
          <dd>{{ customer.phone }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Website:</dt>
          <dd>{{ customer.website }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>USt-IdNr.:</dt>
          <dd>{{ customer.vat_id }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Steuernummer:</dt>
          <dd>{{ customer.tax_number }}</dd>
        </div>
        <div class="customer-details-list">
          <dt>Aktiv:</dt>
          <dd>{{ customer.is_active ? 'Ja' : 'Nein' }}</dd>
        </div>
      </dl>
    </section>

    <!-- Actions -->
    <div class="sections btn-container">
      <select
        v-model="customer_status"
        class="inputs select-md"
        aria-label="Kundenstatus wählen"
        @change="cancelCustomer(customer.id)"
      >
        <option value="" disabled>Kundenstatus wählen</option>
        <option v-if="!customer.is_active" value="1">Aktiv</option>
        <option v-else value="0">Stornieren</option>
      </select>
      <router-link :to="`/customers/edit/${customer.id}`" class="btn btn-edit">
        <i class="bi bi-pencil-square btn-icons" aria-hidden="true"></i>
        Bearbeiten
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['formatCustomerId', 'formatDate'],
  data() {
    return {
      title: 'Kunden Details',
      customer: null,
      counts: null,
      customer_status: ''
    }
  },
  mounted() {
    this.getCustomer()
  },
  methods: {
    async getCustomer() {
      try {
        const result = await window.api.customerDetails(this.$route.params.id)
        if (!result.success) return
        this.customer = result.data.customer
        this.counts = result.data.counts
      } catch (error) {
        console.error(error)
      }
    },
    async cancelCustomer(id) {
      if (!id) return
      if (confirm('Sind Sie sicher, dass Sie den Kundenstatus ändern möchten? ✅')) {
        console.log(this.customer_status)
        try {
          const data = {
            id: id,
            status: Number(this.customer_status)
          }
          const result = await window.api.cancelCustomerById(data)
          if (!result.success) return
          this.$router.push({ name: 'customers' })
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
}
</script>
