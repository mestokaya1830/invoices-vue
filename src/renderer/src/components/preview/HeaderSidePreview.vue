<template>
  <div>
    <h1 class="main-title">{{ title }}</h1>
    <section v-if="headerData" class="header-component" aria-label="Seitenkopf">
      <div aria-label="Firmeninformationen">
        <dl class="header-company-info">
          <dt>Firma:</dt>
          <dd>{{ headerData.company_name }}</dd>

          <dt>Adresse:</dt>
          <dd>{{ headerData.address }}</dd>

          <dt>PLZ-Ort:</dt>
          <dd>{{ headerData.postal_code }} {{ headerData.city }}</dd>

          <dt>Tel:</dt>
          <dd>{{ headerData.phone }}</dd>

          <dt>Email:</dt>
          <dd>{{ headerData.email }}</dd>

          <dt>Web:</dt>
          <dd>{{ headerData.website }}</dd>
        </dl>
      </div>

      <img
        :src="`/uploads/user/${auth.logo}`"
        :alt="`${headerData.company_name} Logo`"
        class="header-user-logo"
        aria-hidden="true"
      />
    </section>
  </div>
</template>

<script>
export default {
  name: 'HeaderSidePreview',
  props: {
    title: {
      type: String,
      required: true
    },
    auth: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      headerData: {},
      selected_image: ''
    }
  },
  mounted() {
    if (this.auth) {
      this.headerData = this.auth
    }
  }
}
</script>
