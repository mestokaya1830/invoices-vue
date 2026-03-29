import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  //window control
  controlWindow: (data) => ipcRenderer.invoke('control-window', data),

  //register
  checkRegister: async () => ipcRenderer.invoke('check-register'),
  register: async (data) => ipcRenderer.invoke('register', data),

  //login and user
  login: async (data) => ipcRenderer.invoke('login', data),
  resetPassword: async (data) => ipcRenderer.invoke('reset-password', data),
  emailVerfication: async (data) => ipcRenderer.invoke('email-verification', data),
  getUser: async (data) => ipcRenderer.invoke('get-user', data),
  updateUser: async (data) => ipcRenderer.invoke('update-user', data),

  //dashboard
  getDashboard: async (data) => ipcRenderer.invoke('get-dashboard', data),
  getDashboardChart: async (data) => ipcRenderer.invoke('get-dashboard-chart', data),
  getLatestActivities: async (data) => ipcRenderer.invoke('get-latest-activities', data),

  //customer
  addCustomer: async (data) => ipcRenderer.invoke('add-customer', data),
  getCustomers: async (data) => ipcRenderer.invoke('get-customers', data),
  customerDetails: async (id) => ipcRenderer.invoke('customer-details', id),
  getCustomerById: async (data) => ipcRenderer.invoke('get-customer-by-id', data), //get customer info und lastid for create invoice ,offer,order
  updateCustomerById: async (data) => ipcRenderer.invoke('update-customer-by-id', data),
  cancelCustomerById: async (data) => ipcRenderer.invoke('cancel-customer-by-id', data),
  filterCustomersCategories: async (data) => ipcRenderer.invoke('flter-customers-categories', data),
  searchCustomers: async (data) => ipcRenderer.invoke('search-customers', data),
  filterCustomerDate: async (date) => ipcRenderer.invoke('filter-customers-date', date),

  //invoice
  addInvoice: async (data) => ipcRenderer.invoke('add-invoice', data),
  getInvoices: async (data) => ipcRenderer.invoke('get-invoices', data),
  getInvoiceById: async (data) => ipcRenderer.invoke('get-invoice-by-id', data),
  cancelInvoice: async (data) => ipcRenderer.invoke('cancel-invoice', data),
  filterInvoicesCategories: async (data) => ipcRenderer.invoke('flter-invoices-categories', data),
  searchInvoices: async (term) => ipcRenderer.invoke('search-invoices', term),
  filterInvoicesDate: async (date) => ipcRenderer.invoke('filter-invoices-date', date),

  //offer
  addOffer: async (data) => ipcRenderer.invoke('add-offer', data),
  getOffers: async (data) => ipcRenderer.invoke('get-offers', data),
  getOfferById: async (id) => ipcRenderer.invoke('get-offer-by-id', id),
  getOfferByStatus: async (id) => ipcRenderer.invoke('get-offer-by-status', id),
  updateOfferById: async (data) => ipcRenderer.invoke('update-offer-by-id', data),
  cancelOffer: async (id) => ipcRenderer.invoke('cancel-offer', id),
  filterOffersCategories: async (data) => ipcRenderer.invoke('flter-offers-categories', data),
  searchOffers: async (term) => ipcRenderer.invoke('search-offers', term),
  filterOffersDate: async (date) => ipcRenderer.invoke('filter-offers-date', date),

  //order
  addOrder: async (data) => ipcRenderer.invoke('add-order', data),
  getOrders: async (data) => ipcRenderer.invoke('get-orders', data),
  getOrderById: async (id) => ipcRenderer.invoke('get-order-by-id', id),
  updateOrderById: async (data) => ipcRenderer.invoke('update-order-by-id', data),
  cancelOrder: async (data) => ipcRenderer.invoke('cancel-order', data),
  filterOrdersCategories: async (data) => ipcRenderer.invoke('flter-orders-categories', data),
  searchOrders: async (term) => ipcRenderer.invoke('search-orders', term),
  filterOrdersDate: async (date) => ipcRenderer.invoke('filter-orders-date', date),

  //payment
  addPayment: (data) => ipcRenderer.invoke('add-payment', data),
  getPayments: async (data) => ipcRenderer.invoke('get-payments', data),
  getPaymentById: (id) => ipcRenderer.invoke('get-payment-by-id', id),
  cancelPaymentById: (data) => ipcRenderer.invoke('cancel-payment-by-id', data),
  filterPaymentsCategories: async (data) => ipcRenderer.invoke('filter-payments-categories', data),
  searchPayments: async (term) => ipcRenderer.invoke('search-payments', term),
  filterPaymentsDate: async (date) => ipcRenderer.invoke('filter-payments-date', date),

  //reminder
  addReminder: (data) => ipcRenderer.invoke('add-reminder', data),
  getReminders: async (data) => ipcRenderer.invoke('get-reminders', data),
  getReminderById: (id) => ipcRenderer.invoke('get-reminder-by-id', id),
  cancelReminderById: (data) => ipcRenderer.invoke('cancel-reminder-by-id', data),
  filterRemindersCategories: async (data) =>
    ipcRenderer.invoke('filter-reminders-categories', data),
  searchReminders: async (term) => ipcRenderer.invoke('search-reminders', term),
  filterRemindersDate: async (date) => ipcRenderer.invoke('filter-reminders-date', date),

  //reports
  reportCustomers: async (data) => ipcRenderer.invoke('report-customers', data),
  reportInvoices: async (data) => ipcRenderer.invoke('report-invoices', data),
  reportTaxs: async (data) => ipcRenderer.invoke('report-taxs', data),
  reportSales: async (data) => ipcRenderer.invoke('report-sales', data),

  //save pdf
  saveInvoicePDF: (pdfBlob, fileName) => {
    return pdfBlob.arrayBuffer().then((buffer) => {
      const uint8Array = new Uint8Array(buffer)
      return ipcRenderer.invoke('save-invoice-pdf', {
        buffer: uint8Array,
        fileName
      })
    })
  },
  sendEmail: (pdfBlob, fileName) => {
    return pdfBlob.arrayBuffer().then((buffer) => {
      const uint8Array = new Uint8Array(buffer)
      return ipcRenderer.invoke('send-email', {
        buffer: uint8Array,
        fileName
      })
    })
  },
  // preload.js
  readInvoicePDF: (fileName) => {
    return ipcRenderer.invoke('read-invoice-pdf', { fileName })
  }
})
