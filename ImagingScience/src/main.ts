import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import Home from './Home.vue'

import { createMemoryHistory, createRouter } from 'vue-router'


const routes = [
  { path: '/', component: Home },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
