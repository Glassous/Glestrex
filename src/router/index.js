import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import Transactions from '../views/Transactions.vue'
import Details from '../views/Details.vue'
import DailyDetails from '../views/DailyDetails.vue'
import Profile from '../views/Profile.vue'
import AccountManagement from '../views/AccountManagement.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/details',
    name: 'Details',
    component: Details
  },
  {
    path: '/daily-details',
    name: 'DailyDetails',
    component: DailyDetails
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/account-management',
    name: 'AccountManagement',
    component: AccountManagement
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router