<template>
  <div class="settings-page">
    <!-- 固定顶部栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="$router.go(-1)">
        <span class="back-icon">←</span>
      </button>
      <h1 class="page-title">设置</h1>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <div class="settings-container">
        <div class="settings-section">
          <h2>{{ $t('settings.general') }}</h2>
          <div class="setting-item-static">
            <span>{{ $t('settings.theme') }}</span>
          </div>
          <!-- 三按钮主题切换器 -->
          <div class="theme-switcher">
            <button 
              v-for="option in themeOptions" 
              :key="option.value"
              class="theme-btn"
              :class="{ active: themeStore.themeMode === option.value }"
              @click="selectTheme(option.value)"
            >
              <IconComponent :name="option.icon" class="theme-icon" />
              <span class="theme-label">{{ option.label }}</span>
            </button>
          </div>
          <div class="setting-item" @click="toggleLanguageSelector">
            <span>{{ $t('settings.language') }}</span>
            <span>{{ getCurrentLanguageLabel() }} →</span>
          </div>
          
          <!-- 语言选择器 -->
          <div v-if="showLanguageSelector" class="language-selector">
            <button 
              v-for="lang in availableLanguages" 
              :key="lang.code"
              class="language-btn"
              :class="{ active: languageStore.currentLanguage === lang.code }"
              @click="selectLanguage(lang.code)"
            >
              <span class="language-flag">{{ lang.flag }}</span>
              <span class="language-label">{{ lang.label }}</span>
            </button>
          </div>
        </div>
        
        <div class="settings-section">
          <h2>{{ $t('settings.dataManagement') }}</h2>
          <div class="setting-item" @click="exportData">
            <span>{{ $t('settings.exportData') }}</span>
            <span>→</span>
          </div>
          <div class="setting-item" @click="importData">
            <span>{{ $t('settings.importData') }}</span>
            <span>→</span>
          </div>
          <div class="setting-item danger" @click="showClearDataDialog">
            <span>{{ $t('settings.clearAllData') }}</span>
            <span class="danger-text">⚠️</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 清空数据确认对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="hideDialog">
      <div class="dialog" @click.stop>
        <h3>{{ $t('settings.confirmClearData') }}</h3>
        <p>{{ $t('settings.clearDataWarning') }}</p>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="hideDialog">{{ $t('common.cancel') }}</button>
          <button class="btn-confirm" @click="clearAllData" :disabled="isClearing">{{ isClearing ? $t('settings.clearing') : $t('settings.confirmClear') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import databaseService from '../services/database.js'
import { useThemeStore } from '../stores/theme.js'
import { useLanguageStore } from '../stores/language.js'
import IconComponent from '../components/IconComponent.vue'

const router = useRouter()
const showDialog = ref(false)
const isClearing = ref(false)
const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const { t: $t } = useI18n()
const showThemeSelector = ref(false)
const showLanguageSelector = ref(false)

// 主题选项
const themeOptions = computed(() => [
  { value: 'system', label: $t('settings.themeSystem'), icon: 'refresh-cw' },
  { value: 'light', label: $t('settings.themeLight'), icon: 'sun' },
  { value: 'dark', label: $t('settings.themeDark'), icon: 'moon' }
])

// 返回上一页
const goBack = () => {
  router.back()
}

// 选择主题
const selectTheme = (theme) => {
  themeStore.setThemeMode(theme)
}

// 可用语言列表
const availableLanguages = computed(() => [
  { code: 'zh-CN', label: $t('settings.languageZhCN'), flag: '🇨🇳' },
  { code: 'en-US', label: $t('settings.languageEnUS'), flag: '🇺🇸' }
])

// 获取当前语言标签
const getCurrentLanguageLabel = () => {
  return languageStore.getCurrentLanguageLabel
}

// 切换语言选择器显示
const toggleLanguageSelector = () => {
  showLanguageSelector.value = !showLanguageSelector.value
}

// 选择语言
const selectLanguage = (languageCode) => {
  languageStore.setLanguage(languageCode)
  showLanguageSelector.value = false
}

// 显示清空数据对话框
const showClearDataDialog = () => {
  showDialog.value = true
}

// 隐藏对话框
const hideDialog = () => {
  showDialog.value = false
}

// 导出数据
const exportData = async () => {
  try {
    // 获取所有数据
    const accounts = await databaseService.getAll('accounts')
    const transactions = await databaseService.getAll('transactions')
    const categories = await databaseService.getAll('categories')
    
    // 获取当前语言
    const currentLanguage = languageStore.currentLanguage
    
    // 构建导出数据
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      language: currentLanguage,
      data: {
        accounts: accounts || [],
        transactions: transactions || [],
        categories: categories || []
      },
      metadata: {
        totalAccounts: (accounts || []).length,
        totalTransactions: (transactions || []).length,
        totalCategories: (categories || []).length
      }
    }
    
    // 创建下载链接
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    // 创建下载链接并触发下载
    const link = document.createElement('a')
    link.href = url
    link.download = `glestrex-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    alert($t('settings.messages.exportSuccess'))
  } catch (error) {
    console.error('导出数据失败:', error)
    alert($t('settings.messages.exportFailed'))
  }
}

// 导入数据
const importData = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      // 验证数据格式
      if (!importData.data || !importData.version) {
        throw new Error('Invalid data format')
      }
      
      // 确认导入
      const confirmed = confirm($t('settings.messages.confirmImport'))
      if (!confirmed) return
      
      // 清空现有数据
      await databaseService.clearAllData()
      
      // 导入新数据
      const { accounts, transactions, categories } = importData.data
      
      // 导入账户
      if (accounts && accounts.length > 0) {
        for (const account of accounts) {
          await databaseService.add('accounts', account)
        }
      }
      
      // 导入分类
      if (categories && categories.length > 0) {
        for (const category of categories) {
          await databaseService.add('categories', category)
        }
      }
      
      // 导入交易记录
      if (transactions && transactions.length > 0) {
        for (const transaction of transactions) {
          await databaseService.add('transactions', transaction)
        }
      }
      
      alert($t('settings.messages.importSuccess'))
      
      // 刷新页面以更新数据
      window.location.reload()
    } catch (error) {
      console.error('导入数据失败:', error)
      alert($t('settings.messages.importFailed'))
    }
  }
  
  // 触发文件选择
  input.click()
}

// 清空所有数据
const clearAllData = async () => {
  isClearing.value = true
  try {
    // 清空数据库中的所有数据
    await databaseService.clearAllData()
    
    // 清空localStorage中的所有数据
    localStorage.clear()
    
    // 延迟一下显示清空过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 清空完成后刷新页面
    window.location.reload()
  } catch (error) {
    console.error('清空数据失败:', error)
    alert($t('settings.messages.clearDataFailed'))
  } finally {
    isClearing.value = false
    hideDialog()
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* 固定顶部栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 20px;
  padding-top: 52px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 20px;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 20px;
  color: var(--text-primary);
  font-weight: bold;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

.app-logo {
  height: 40px;
  width: auto;
}

/* 页面内容 */
.page-content {
  padding-top: 140px;
  padding-bottom: 20px;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #f0f0f0;
  background: var(--bg-secondary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: var(--bg-secondary);
}

.setting-item.danger {
  color: var(--danger-color);
}

.setting-item.danger:hover {
  background-color: var(--danger-bg);
}

.danger-text {
  color: var(--danger-color);
}

.arrow {
  font-size: 12px;
  margin-left: 8px;
  transition: transform 0.2s;
}

/* 静态设置项样式 */
.setting-item-static {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 500;
  color: var(--text-primary);
}

/* 三按钮主题切换器样式 */
.theme-switcher {
  display: flex;
  padding: 20px;
  gap: 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid #f0f0f0;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.theme-btn.active {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-color: var(--primary-color);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.3);
}

.theme-btn.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.theme-icon {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.theme-btn:hover .theme-icon {
  transform: scale(1.1);
}

.theme-btn.active .theme-icon {
  transform: scale(1.15);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.theme-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  transition: color 0.3s ease;
}

.theme-btn.active .theme-label {
  color: #fff;
  font-weight: 600;
}

/* 语言选择器样式 */
.language-selector {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.language-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.language-btn:last-child {
  margin-bottom: 0;
}

.language-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.language-btn.active {
  background: var(--primary-color-light);
  border-color: var(--primary-color);
}

.language-flag {
  font-size: 18px;
  margin-right: 12px;
}

.language-label {
  color: var(--text-primary);
  font-weight: 500;
}

.language-btn.active .language-label {
  color: var(--primary-color);
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.dialog p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--border-color);
}

.btn-confirm {
  background: var(--danger-color);
  color: #fff;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--danger-hover);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fixed-header {
    padding: 12px 16px;
  }
  
  .fixed-header h1 {
    font-size: 20px;
  }
  
  .back-btn {
    left: 16px;
    padding: 6px;
  }
  
  .back-icon {
    font-size: 18px;
  }
  
  .settings-container {
    padding: 16px;
  }
  
  .empty-message {
    font-size: 14px;
    margin-top: 60px;
  }
}
</style>