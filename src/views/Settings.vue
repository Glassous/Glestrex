<template>
  <div class="settings-page">
    <!-- 固定顶部栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="$router.go(-1)">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
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
              :data-theme="option.value"
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
              <img :src="getFlagUrl(lang.flagCode)" class="language-flag" :alt="lang.label" />
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
  { code: 'zh-CN', label: $t('settings.languageZhCN'), flagCode: 'cn' },
  { code: 'en-US', label: $t('settings.languageEnUS'), flagCode: 'us' }
])

// 获取当前语言标签
const getCurrentLanguageLabel = () => {
  return languageStore.getCurrentLanguageLabel
}

// 切换语言选择器显示
const toggleLanguageSelector = () => {
  showLanguageSelector.value = !showLanguageSelector.value
}

// 获取国旗URL
const getFlagUrl = (flagCode) => {
  try {
    // 使用本地 src/images/w80 文件夹下的国旗PNG图片
    return new URL(`../images/w80/${flagCode.toLowerCase()}.png`, import.meta.url).href
  } catch (error) {
    console.warn(`Flag not found for ${flagCode}`)
    return ''
  }
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
  padding: 10px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: absolute;
  left: 20px;
  z-index: 10;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.back-btn:hover .back-icon {
  color: var(--primary-color);
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
  gap: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 0 0 12px 12px;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.theme-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.theme-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.theme-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.theme-btn:hover::after {
  width: 120px;
  height: 120px;
}

.theme-btn.active {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--primary-color);
  box-shadow: 0 12px 35px rgba(var(--primary-color), 0.4);
}

.theme-btn.active::before {
  opacity: 1;
}

.theme-btn.active::after {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
}

.theme-icon {
  font-size: 28px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  color: var(--text-primary);
}

.theme-btn:hover .theme-icon {
  transform: scale(1.15) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.theme-btn.active .theme-icon {
  transform: scale(1.2) rotate(10deg);
  color: #ffffff;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.theme-label {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.theme-btn:hover .theme-label {
  color: var(--text-primary);
  font-weight: 600;
  transform: translateY(-1px);
}

.theme-btn.active .theme-label {
  color: #ffffff;
  font-weight: 700;
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 特殊主题按钮样式 */
.theme-btn[data-theme="system"] {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.theme-btn[data-theme="system"] .theme-icon,
.theme-btn[data-theme="system"] .theme-label {
  color: #495057 !important;
}

.theme-btn[data-theme="system"]:hover .theme-icon,
.theme-btn[data-theme="system"]:hover .theme-label {
  color: #343a40 !important;
}

.theme-btn[data-theme="system"].active .theme-icon,
.theme-btn[data-theme="system"].active .theme-label {
  color: #ffffff !important;
}

.theme-btn[data-theme="light"] {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.theme-btn[data-theme="light"] .theme-icon,
.theme-btn[data-theme="light"] .theme-label {
  color: #856404 !important;
}

.theme-btn[data-theme="light"]:hover .theme-icon,
.theme-btn[data-theme="light"]:hover .theme-label {
  color: #533f03 !important;
}

.theme-btn[data-theme="light"].active .theme-icon,
.theme-btn[data-theme="light"].active .theme-label {
  color: #ffffff !important;
}

.theme-btn[data-theme="dark"] {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
}

.theme-btn[data-theme="dark"] .theme-icon,
.theme-btn[data-theme="dark"] .theme-label {
  color: #f8f9fa !important;
}

.theme-btn[data-theme="system"]:hover,
.theme-btn[data-theme="system"].active {
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
}

.theme-btn[data-theme="light"]:hover,
.theme-btn[data-theme="light"].active {
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
}

.theme-btn[data-theme="dark"]:hover,
.theme-btn[data-theme="dark"].active {
  box-shadow: 0 8px 25px rgba(52, 58, 64, 0.4);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .theme-switcher {
    gap: 12px;
    padding: 16px;
  }
  
  .theme-btn {
    padding: 16px 12px;
    gap: 8px;
  }
  
  .theme-icon {
    font-size: 24px;
  }
  
  .theme-label {
    font-size: 12px;
  }
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
  width: 20px;
  height: 15px;
  margin-right: 12px;
  border-radius: 2px;
  object-fit: cover;
  border: 1px solid #ddd;
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