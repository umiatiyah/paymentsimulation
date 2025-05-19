import { createRouter, createWebHistory } from 'vue-router'
import CustomerPortal from '../views/CustomerPortal.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CustomerPortal },
    { path: '/admin', component: AdminDashboard }
  ]
})

export default router