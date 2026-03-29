<template>
  <div class="auth-container">
    <div class="auth-logo-header">
      <img src="/app_logo.png" class="app-logo" alt="Mes App Logo" aria-hidden="true" />
    </div>

    <h1 class="auth-title">Willkommen beim auth von Mes App</h1>
    <p class="auth-description">
      Erstellen Sie in wenigen Schritten Ihr professionelles Rechnungskonto
    </p>

    <!-- Features Grid -->
    <section class="auth-features-grid">
      <article class="auth-feature-card">
        <div class="auth-feature-icon">
          <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>
        </div>
        <div>Schnell & Einfach</div>
        <p>Erstellen in 2 Minuten</p>
      </article>

      <article class="auth-feature-card">
        <div class="auth-feature-icon">
          <i class="bi bi-shield-check" aria-hidden="true"></i>
        </div>
        <div>DSGVO-konform</div>
        <p>Ihre Daten sind sicher</p>
      </article>

      <article class="auth-feature-card">
        <div class="auth-feature-icon">
          <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
        </div>
        <div>Professionell</div>
        <p>Rechtskonforme Rechnungen</p>
      </article>
    </section>

    <!-- Action Button -->
    <router-link to="/register" class="btn btn-auth">
      Weiter
      <i class="bi bi-arrow-right" aria-hidden="true"></i>
    </router-link>
  </div>
</template>
