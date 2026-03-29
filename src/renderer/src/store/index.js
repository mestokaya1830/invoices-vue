// src/stores/useStore.js
import { reactive, readonly } from 'vue'
import localforage from 'localforage'

localforage.config({
  name: 'myApp',
  storeName: 'appData'
})

const state = reactive({
  auth: null,
  invoice: null,
  offer: null,
  order: null,
  payment: null,
  deliverie: null,
  reminder: null,
  category_filter: '',
  date_filter: '',
  search_filter: '',
  _isClearing: false // IndexedDB temizleme işlemi için flag
})

// init: IndexedDB’den önceki verileri yükle
async function init() {
  try {
    const authStored = await localforage.getItem('auth')
    if (authStored) state.auth = authStored

    const invoice = await localforage.getItem('invoice')
    if (invoice) state.invoice = invoice

    const offer = await localforage.getItem('offer')
    if (offer) state.offer = offer

    const order = await localforage.getItem('order')
    if (order) state.order = order

    const payment = await localforage.getItem('payment')
    if (payment) state.payment = payment

    const deliverie = await localforage.getItem('deliverie')
    if (deliverie) state.deliverie = deliverie

    const reminder = await localforage.getItem('reminder')
    if (reminder) state.reminder = reminder
  } catch (err) {
    console.error('Failed to load stored data:', err)
  }
}

//auth
async function setAuth(payload) {
  state.auth = payload
  try {
    await localforage.setItem('auth', payload)
  } catch (err) {
    console.error('Failed to save ', err)
  }
}

async function clearAuth() {
  try {
    state.auth = null
    await localforage.removeItem('auth')
  } catch (err) {
    console.error('Failed to save ', err)
  }
}

//filters
async function setFilters(store, payload) {
  this.clearFilters()
  state[store] = payload
  try {
    await localforage.setItem(store, payload)
  } catch (err) {
    console.error('Failed to save ' + store + ':', err)
  }
}

async function clearFilters() {
  state.category_filter = ''
  state.date_filter = ''
  state.search_filter = ''
}

//preview
async function setPreview(store, payload) {
  state[store] = payload
  try {
    await localforage.setItem(store, payload)
  } catch (err) {
    console.error('Failed to save ', err)
  }
}

async function clearPreview(store) {
  try {
    state[store] = null
    await localforage.removeItem(store)
  } catch (err) {
    console.error('Failed to save ', err)
  }
}

export default {
  state: readonly(state),
  init,
  setAuth,
  clearAuth,
  setFilters,
  clearFilters,
  setPreview,
  clearPreview
}
