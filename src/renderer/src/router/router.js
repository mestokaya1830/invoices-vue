import { createWebHistory, createRouter } from 'vue-router'

import Home from '../views/Index.vue'
import Login from '../views/auth/Login.vue'
import store from '../store/index.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Startseite', auth: true }
  },

  //user
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { title: 'Registrieren' }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/auth/Reset-Password.vue'),
    meta: { title: 'Passwort zurücksetzen' }
  },
  {
    path: '/email-verfication',
    name: 'email-verfication',
    component: () => import('../views/auth/Email-Verfication.vue'),
    meta: { title: 'E-Mail-Verifizierung' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/settings/Profile.vue'),
    meta: { title: 'Profil', auth: true }
  },
  {
    path: '/edit-user',
    name: 'edit-user',
    component: () => import('../views/settings/EditUser.vue'),
    meta: { title: 'Benutzer bearbeiten', auth: true }
  },

  //customers
  {
    path: '/customers',
    name: 'customers',
    component: () => import('../views/customers/Index.vue'),
    meta: { title: 'Kunden', auth: true }
  },
  {
    path: '/customers/create',
    name: 'customers-create',
    component: () => import('../views/customers/Create.vue'),
    meta: { title: 'Neuer Kunde', auth: true }
  },
  {
    path: '/customers/details/:id',
    name: 'customers-details',
    component: () => import('../views/customers/Details.vue'),
    meta: { title: 'Kundendetails', auth: true }
  },
  {
    path: '/customers/edit/:id',
    name: 'customers-edit',
    component: () => import('../views/customers/Edit.vue'),
    meta: { title: 'Kunde bearbeiten', auth: true }
  },

  //invoices
  {
    path: '/invoices',
    name: 'invoices',
    component: () => import('../views/invoices/Index.vue'),
    meta: { title: 'Rechnungen', auth: true }
  },
  {
    path: '/invoices/create',
    name: 'invoices-create',
    component: () => import('../views/invoices/Create.vue'),
    meta: { title: 'Neue Rechnung', auth: true }
  },
  {
    path: '/invoices/details/:id',
    name: 'invoices-details',
    component: () => import('../views/invoices/Details.vue'),
    meta: { title: 'Rechnungsdetails', auth: true }
  },
  {
    path: '/invoices/edit/:id',
    name: 'invoices-edit',
    component: () => import('../views/invoices/Edit.vue'),
    meta: { title: 'Rechnung stornieren', auth: true }
  },
  {
    path: '/invoices/preview',
    name: 'invoices-preview',
    component: () => import('../views/invoices/Preview.vue'),
    meta: { title: 'Rechnungsvorschau', auth: true }
  },

  //offers
  {
    path: '/offers',
    name: 'offers',
    component: () => import('../views/offers/Index.vue'),
    meta: { title: 'Angebote', auth: true }
  },
  {
    path: '/offers/create',
    name: 'offers-create',
    component: () => import('../views/offers/Create.vue'),
    meta: { title: 'Neues Angebot', auth: true }
  },
  {
    path: '/offers/details/:id',
    name: 'offers-details',
    component: () => import('../views/offers/Details.vue'),
    meta: { title: 'Angebotsdetails', auth: true }
  },
  {
    path: '/offers/edit/:id',
    name: 'offers-edit',
    component: () => import('../views/offers/Edit.vue'),
    meta: { title: 'Angebot bearbeiten', auth: true }
  },
  {
    path: '/offers/edit-cancel/:id',
    name: 'offers-edit-cancel',
    component: () => import('../views/offers/EditCancel.vue'),
    meta: { title: 'Angebot stornieren', auth: true }
  },
  {
    path: '/offers/preview',
    name: 'offers-preview',
    component: () => import('../views/offers/Preview.vue'),
    meta: { title: 'Angebotsvorschau', auth: true }
  },

  //orders
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/orders/Index.vue'),
    meta: { title: 'Aufträge', auth: true }
  },
  {
    path: '/orders/create',
    name: 'orders-create',
    component: () => import('../views/orders/Create.vue'),
    meta: { title: 'Neuer Auftrag', auth: true }
  },
  {
    path: '/orders/details/:id',
    name: 'orders-details',
    component: () => import('../views/orders/Details.vue'),
    meta: { title: 'Auftragsdetails', auth: true }
  },
  {
    path: '/orders/edit/:id',
    name: 'orders-edit',
    component: () => import('../views/orders/Edit.vue'),
    meta: { title: 'Auftrag bearbeiten', auth: true }
  },
  {
    path: '/orders/edit-cancel/:id',
    name: 'orders-edit-cancel',
    component: () => import('../views/orders/EditCancel.vue'),
    meta: { title: 'Auftrag stornieren', auth: true }
  },
  {
    path: '/orders/preview',
    name: 'orders-preview',
    component: () => import('../views/orders/Preview.vue'),
    meta: { title: 'Auftragsvorschau', auth: true }
  },

  //payments
  {
    path: '/payments',
    name: 'payments',
    component: () => import('../views/payments/Index.vue'),
    meta: { title: 'Zahlungen', auth: true }
  },
  {
    path: '/payments/create/:id',
    name: 'payments-create',
    component: () => import('../views/payments/Create.vue'),
    meta: { title: 'Neue Zahlung', auth: true }
  },
  {
    path: '/payments/details/:id',
    name: 'payments-details',
    component: () => import('../views/payments/Details.vue'),
    meta: { title: 'Erinnerungsdetails', auth: true }
  },
  {
    path: '/payments/edit/:id',
    name: 'payments-edit',
    component: () => import('../views/payments/Edit.vue'),
    meta: { title: 'Zahlung stornieren', auth: true }
  },
  {
    path: '/payments/preview',
    name: 'payments-preview',
    component: () => import('../views/payments/Preview.vue'),
    meta: { title: 'Zahlungsvorschau', auth: true }
  },

  //reminders
  {
    path: '/reminders',
    name: 'reminders',
    component: () => import('../views/reminders/Index.vue'),
    meta: { title: 'Mahnungen', auth: true }
  },
  {
    path: '/reminders/create/:id',
    name: 'reminders-create',
    component: () => import('../views/reminders/Create.vue'),
    meta: { title: 'Neue Erinnerung', auth: true }
  },
  {
    path: '/reminders/details/:id',
    name: 'reminders-details',
    component: () => import('../views/reminders/Details.vue'),
    meta: { title: 'Erinnerungsdetails', auth: true }
  },
  {
    path: '/reminders/edit/:id',
    name: 'reminders-edit',
    component: () => import('../views/reminders/Edit.vue'),
    meta: { title: 'Mahnung stornieren', auth: true }
  },
  {
    path: '/reminders/preview',
    name: 'reminders-preview',
    component: () => import('../views/reminders/Preview.vue'),
    meta: { title: 'Erinnerungsvorschau', auth: true }
  },

  //about
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: 'Über' }
  },

  //reports
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/reports/Index.vue'),
    meta: { title: 'Berichte', auth: true }
  },
  //not found
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Nicht gefunden' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
  if (to.meta.auth && !store.state.auth) {
    next('/login')
  } else {
    next()
  }
})
export default router
