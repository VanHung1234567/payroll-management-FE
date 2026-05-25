import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/RouterConfig'
import './assets/styles/main.css'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
const queryClient = new QueryClient()

const app = createApp(App)

app.use(VueQueryPlugin, {
  queryClient,
})
app.use(createPinia())
app.use(router)

app.mount('#app')
