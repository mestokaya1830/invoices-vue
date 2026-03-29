<template>
  <div>
    <AuthPage v-if="!register" />
    <div v-else class="auth-container">
      <div class="auth-logo-header">
        <img src="/app_logo.png" class="app-logo" alt="Mes App Logo" />
      </div>
      <form aria-label="Abmeldeformular" @submit.prevent="loginUser">
        <h1 class="auth-title">Willkommen bei Mes App</h1>

        <div class="form-row">
          <div class="form-group">
            <label for="email" class="form-label"
              >E-Mail-Adresse <span class="stars">*</span></label
            >
            <input
              id="email"
              v-model="user.email"
              type="email"
              :class="['inputs', { error: error.email }]"
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
            />
            <div v-if="error.email" class="error" role="alert">{{ error.email }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="kenntwort" class="form-label">Passwort <span class="stars">*</span></label>
            <input
              id="kenntwort"
              v-model="user.password"
              type="password"
              :class="['inputs', { error: error.password }]"
              placeholder="Geben Sie Ihr Passwort ein"
            />
            <div v-if="error.password" class="error" role="alert">{{ error.password }}</div>
          </div>
        </div>

        <div v-if="error.credential" class="text error-message" role="alert">
          {{ error.credential }}
        </div>
        <div class="btn-container">
          <router-link to="email-verfication" class="forgot-password">
            Kenntwort vergessen?
          </router-link>

          <button type="submit" class="btn btn-auth">
            <i class="bi bi-arrow-right ioncs" aria-hidden="true"></i>
            Anmelden
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import store from '../../store/index.js'
import AuthPage from '../../components/preview/AuthPage.vue'

export default {
  name: 'Login',
  components: { AuthPage },
  inject: ['trimFormFields'],
  data() {
    return {
      user: { email: '', password: '' },
      error: { email: '', password: '', credential: '' },
      register: false
    }
  },
  watch: {
    user: {
      handler(newVal) {
        for (const key in newVal) {
          if (typeof newVal[key] === 'string' && newVal[key] && this.error[key]) {
            this.error[key] = ''
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.checkRegister()
  },
  methods: {
    async checkRegister() {
      try {
        const res = await window.api.checkRegister()
        this.register = res.success
      } catch (err) {
        console.error(err)
      }
    },

    validateForm() {
      let valid = true
      this.error = { email: '', password: '', credential: '' }

      if (!this.user.email) {
        this.error.email = 'E-Mail darf nicht leer sein.'
        valid = false
      } else if (!this.user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        this.error.email = 'Ungültiges E-Mail-Format.'
        valid = false
      }

      if (!this.user.password) {
        this.error.password = 'Passwort darf nicht leer sein.'
        valid = false
      } else if (this.user.password.length < 6) {
        this.error.password = 'Das Passwort muss mindestens 6 Zeichen lang sein.'
        valid = false
      }

      return valid
    },

    async loginUser() {
      this.trimFormFields(this.user)
      if (!this.validateForm()) return

      try {
        const res = await window.api.login(JSON.parse(JSON.stringify(this.user)))
        if (!res.success) {
          this.error.credential = res.message || 'Ungültige Anmeldedaten.'
          return
        }
        await store.setAuth(res.user)
        this.$router.push('/')
      } catch (err) {
        this.error.credential = err.message || 'Serverfehler.'
      }
    }
  }
}
</script>
