import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.js'
import enUS from './en-US.js'

// 获取浏览器语言
function getBrowserLanguage() {
  const language = navigator.language || navigator.userLanguage
  if (language.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

// 从localStorage获取保存的语言设置，如果没有则使用浏览器语言
function getStoredLanguage() {
  const stored = localStorage.getItem('glestrex-language')
  return stored || getBrowserLanguage()
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getStoredLanguage(), // 设置默认语言
  fallbackLocale: 'zh-CN', // 设置备用语言
  messages,
  globalInjection: true // 全局注入 $t 函数
})

export default i18n

// 导出语言切换函数
export function setLanguage(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('glestrex-language', locale)
  document.documentElement.lang = locale
}

// 导出当前语言
export function getCurrentLanguage() {
  return i18n.global.locale.value
}

// 导出可用语言列表
export const availableLanguages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' }
]