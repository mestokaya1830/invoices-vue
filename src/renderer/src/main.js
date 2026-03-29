import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import store from './store/index.js'
import 'material-icons/iconfont/material-icons.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

await store.init()
createApp(App).use(router).mount('#app')
