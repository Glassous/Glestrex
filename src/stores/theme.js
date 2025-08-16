import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // 主题模式：'system' | 'light' | 'dark'
  const themeMode = ref('system')
  
  // 系统主题检测
  const systemTheme = ref('light')
  
  // 当前实际应用的主题
  const currentTheme = computed(() => {
    if (themeMode.value === 'system') {
      return systemTheme.value
    }
    return themeMode.value
  })
  
  // 初始化主题
  const initTheme = () => {
    // 从本地存储读取用户设置
    const savedTheme = localStorage.getItem('glestrex-theme')
    if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
      themeMode.value = savedTheme
    }
    
    // 检测系统主题
    updateSystemTheme()
    
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateSystemTheme)
    }
    
    // 应用主题
    applyTheme()
  }
  
  // 更新系统主题
  const updateSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemTheme.value = 'dark'
    } else {
      systemTheme.value = 'light'
    }
  }
  
  // 设置主题模式
  const setThemeMode = (mode) => {
    themeMode.value = mode
    localStorage.setItem('glestrex-theme', mode)
    applyTheme()
  }
  
  // 应用主题到DOM
  const applyTheme = () => {
    const theme = currentTheme.value
    document.documentElement.setAttribute('data-theme', theme)
    
    // 更新meta标签的主题色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#303030' : '#ffffff')
    }
  }
  
  // 监听主题变化
  watch(currentTheme, () => {
    applyTheme()
  })
  
  // 获取主题显示名称
  const getThemeDisplayName = (mode) => {
    const names = {
      system: '跟随系统',
      light: '浅色',
      dark: '深色'
    }
    return names[mode] || mode
  }
  
  return {
    themeMode,
    systemTheme,
    currentTheme,
    initTheme,
    setThemeMode,
    getThemeDisplayName
  }
})