<template>
  <div id="app">
    <OnboardingGuide 
      v-if="showOnboarding" 
      @complete="onOnboardingComplete"
    />
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { App } from '@capacitor/app'
import Tabbar from './components/Tabbar.vue'
import Calculator from './components/Calculator.vue'
import CalculatorToggle from './components/CalculatorToggle.vue'
import OnboardingGuide from './components/OnboardingGuide.vue'
import eventBus, { EVENTS } from './utils/eventBus.js'
import { useThemeStore } from './stores/theme.js'
import databaseService from './services/database.js'

const router = useRouter()
const route = useRoute()
const calculatorVisible = ref(false)
const showKeyboardHint = ref(false)
const formVisible = ref(false)
const showOnboarding = ref(false)
const themeStore = useThemeStore()

// 检查数据库是否为空
const checkDatabaseEmpty = async () => {
  try {
    await databaseService.init()
    
    // 检查是否已完成引导
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    if (onboardingCompleted) {
      showOnboarding.value = false
      return
    }
    
    // 检查数据库是否为空（检查账户和交易记录）
    const [accounts, transactions] = await Promise.all([
      databaseService.getAll('accounts'),
      databaseService.getAll('transactions')
    ])
    
    // 如果没有账户或者没有交易记录，显示新手引导
    if (!accounts || accounts.length === 0) {
      showOnboarding.value = true
    } else {
      showOnboarding.value = false
    }
  } catch (error) {
    console.error('检查数据库状态失败:', error)
    // 出错时也显示引导，确保用户能正常使用
    showOnboarding.value = true
  }
}

// 完成引导回调
const onOnboardingComplete = () => {
  showOnboarding.value = false
}

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

// Android返回键处理
const handleBackButton = () => {
  // 如果计算器打开，先关闭计算器
  if (calculatorVisible.value) {
    calculatorVisible.value = false
    return
  }
  
  // 如果表单打开，先关闭表单
  if (formVisible.value) {
    eventBus.emit(EVENTS.FORM_HIDE)
    return
  }
  
  // 如果在引导页面，不允许返回
  if (showOnboarding.value) {
    return
  }
  
  // 根据当前路由处理返回逻辑
  const currentPath = route.path
  
  // 如果在子页面，返回到主页面
  if (currentPath === '/account-management' || currentPath === '/settings' || currentPath === '/daily-details') {
    router.push('/profile')
    return
  }
  
  // 如果在主要页面（非首页），返回首页
  if (currentPath !== '/') {
    router.push('/')
    return
  }
  
  // 如果在首页，退出应用
  App.exitApp()
}

onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  eventBus.on(EVENTS.FORM_SHOW, handleFormShow)
  eventBus.on(EVENTS.FORM_HIDE, handleFormHide)
  
  // 监听Android返回键
  App.addListener('backButton', handleBackButton)
  
  // 初始化主题
  themeStore.initTheme()
  
  // 语言已在 main.js 中初始化，这里不需要重复初始化
  
  // 监听主题变化
  watch(() => themeStore.currentTheme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })
  
  // 检查是否需要显示新手引导
  await checkDatabaseEmpty()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  eventBus.off(EVENTS.FORM_SHOW, handleFormShow)
  eventBus.off(EVENTS.FORM_HIDE, handleFormHide)
  
  // 移除Android返回键监听器
  App.removeAllListeners()
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
