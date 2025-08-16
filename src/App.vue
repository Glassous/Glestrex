<template>
  <div id="app">
    <router-view />
    <Tabbar 
      v-if="shouldShowTabbar"
      :current-page="currentPage" 
      @page-change="handlePageChange" 
    />
    <Calculator 
      :visible="calculatorVisible" 
      @close="closeCalculator" 
      @toggle="toggleCalculator" 
      :show-hint="showKeyboardHint"
    />
    <CalculatorToggle @toggle="toggleCalculator" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Tabbar from './components/Tabbar.vue'
import Calculator from './components/Calculator.vue'
import CalculatorToggle from './components/CalculatorToggle.vue'
import eventBus, { EVENTS } from './utils/eventBus.js'
import { useThemeStore } from './stores/theme.js'

const router = useRouter()
const route = useRoute()
const calculatorVisible = ref(false)
const showKeyboardHint = ref(false)
const formVisible = ref(false)
const themeStore = useThemeStore()

// 根据当前路由计算当前页面
const currentPage = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path === '/transactions') return 'transactions'
  if (path === '/details') return 'details'
  if (path === '/profile') return 'profile'
  if (path === '/account-management') return 'profile' // account-management页面对应profile标签
  return 'home'
})

// 控制Tabbar显示
const shouldShowTabbar = computed(() => {
  const path = route.path
  // account-management、settings和daily-details页面不显示Tabbar
  // 主页和transactions页面在表单显示时也不显示Tabbar
  if (path === '/account-management' || path === '/settings' || path === '/daily-details') {
    return false
  }
  if ((path === '/' || path === '/transactions') && formVisible.value) {
    return false
  }
  return true
})

const handlePageChange = (page) => {
  const routes = {
    home: '/',
    transactions: '/transactions',
    details: '/details',
    profile: '/profile'
  }
  router.push(routes[page] || '/')
}

const toggleCalculator = () => {
  calculatorVisible.value = !calculatorVisible.value
  showKeyboardHint.value = true
  setTimeout(() => {
    showKeyboardHint.value = false
  }, 2000)
}

const closeCalculator = () => {
  calculatorVisible.value = false
}

// 全局键盘快捷键监听
const handleGlobalKeydown = (e) => {
  if (e.altKey && e.key.toLowerCase() === 'c') {
    e.preventDefault()
    toggleCalculator()
  }
}

// 表单显示/隐藏事件处理
const handleFormShow = () => {
  formVisible.value = true
}

const handleFormHide = () => {
  formVisible.value = false
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  eventBus.on(EVENTS.FORM_SHOW, handleFormShow)
  eventBus.on(EVENTS.FORM_HIDE, handleFormHide)
  
  // 监听主题变化
  watch(() => themeStore.currentTheme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  eventBus.off(EVENTS.FORM_SHOW, handleFormShow)
  eventBus.off(EVENTS.FORM_HIDE, handleFormHide)
})
</script>

<style>
html, body, * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100%;
  width: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  overflow-x: hidden;
  overflow-y: auto;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100%;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}




</style>
