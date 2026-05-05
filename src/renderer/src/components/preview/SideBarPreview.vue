<template>
  <div>
    <img src="/app_logo.png" alt="Firmen logo" class="sidebar-logo" />
    <nav aria-label="Hauptnavigation">
      <section>
        <ul class="nav-menu">
          <li class="nav-link">
            <router-link to="/" exact-active-class="active" class="nav-link">
              <i class="bi bi-house nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Startseite</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link
              to="/customers"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-people nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Kunden</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link
              to="/invoices"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-receipt nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Rechnungen</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link
              to="/offers"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-file-earmark-text nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Angebote</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link
              to="/orders"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-bag-check nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Aufträge</span>
            </router-link>
          </li>

          <!-- Payments -->
          <li class="nav-link">
            <router-link
              to="/payments"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-cash-stack nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Zahlungen</span>
            </router-link>
          </li>

          <!-- Reminders -->
          <li class="nav-link">
            <router-link
              to="/reminders"
              exact-active-class="active"
              class="nav-link"
              @click="clearFilters"
            >
              <i class="bi bi-exclamation-circle nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Mahnungen</span>
            </router-link>
          </li>
        </ul>
      </section>

      <section>
        <ul>
          <li class="nav-link">
            <router-link to="/reports" exact-active-class="active" class="nav-link">
              <i class="bi bi-bar-chart nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Berichte</span>
            </router-link>
          </li>

          <li class="nav-link">
            <router-link to="/profile" exact-active-class="active" class="nav-link">
              <i class="bi bi-gear nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Einstellungen</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/about" exact-active-class="active" class="nav-link">
              <i class="bi bi-info-circle nav-icon" aria-hidden="true"></i>
              <span class="nav-text">Über</span>
            </router-link>
          </li>
        </ul>
      </section>
    </nav>

    <footer v-if="checkLogout" class="sidebar-footer">
      <a href="#" class="logout-link" @click="logout()">
        <i class="bi bi-box-arrow-left logout-icon"></i>
        <span class="logout-text">Abmelden</span>
      </a>
    </footer>
  </div>
</template>

<script>
import store from '../../store/index.js'
export default {
  name: 'ModernSidebar',
  data() {
    return {
      auth: null
    }
  },
  computed: {
    checkLogout() {
      return store.state.auth
    }
  },
  mounted() {
    this.auth = store.state.auth
    this.clearFilters()
  },
  methods: {
    async logout() {
      try {
        await store.clearAuth()
        this.$router.push('/login')
      } catch (error) {
        console.error('Abmeldefehler:', error)
      }
    },
    async clearFilters() {
      try {
        await store.clearFilters()
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>


<style>
/* SIDEBAR */
.sidebar {
  display: grid;
  grid-template-columns: 20rem 1fr;
  grid-template-rows: calc(100vh - 60px);
  margin-top: 60px;
  background: linear-gradient(180deg, #1f2937 0%, #333 100%);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  overflow-x: auto;
}

.sidebar-header {
  padding: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo {
  width: 80%;
  padding: 2rem 1.5rem;
  margin: 20px;
  margin-left: 10%;
  font-size: 1.5rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.nav-menu {
  list-style: none;
  padding: 16px 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.95rem;
  position: relative;
}

.nav-link:hover,
.nav-link:focus {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  outline-offset: 1px;
  border-bottom: 1px solid green;
}

.nav-link.active {
  background: linear-gradient(90deg, rgba(59, 165, 92, 0.2) 0%, rgba(59, 165, 92, 0.05) 100%);
  color: white;
  font-weight: 600;
}
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #12b486;
}

.nav-icon {
  width: 36px;
  text-align: center;
  font-size: 24px;
  color: #12b486;
}
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  margin-top: auto;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ba55c 0%, #065f46 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.sidebar-footer h4 {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.sidebar-footer p {
  margin-top: auto;
  font-size: 0.8rem;
  color: #9ca3af;
}
.logout-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
}
.logout-icon {
  font-size: 30px;
  color: #e53e3e;
}
.logout-text {
  color: red;
  font-size: 18px;
}
</style>
