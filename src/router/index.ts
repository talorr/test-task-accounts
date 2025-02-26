import { createRouter, createWebHistory } from 'vue-router'
import AccountView from '@/views/AccountView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AccountView,
    },
  ],
})

export default router
