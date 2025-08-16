import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './styles/theme.css'
import App from './App.vue'
import router from './router/index.js'
import { useThemeStore } from './stores/theme.js'
import i18n from './locales/index.js'

// 创建应用
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
