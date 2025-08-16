<template>
  <div class="profile-page">
    <!-- 固定顶部栏 -->
    <div class="top-bar">
      <img src="/src/images/glestrexlogo+glestrex.png" alt="Glestrex" class="app-logo" />
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 管理入口 -->
      <div class="management-section">
        <div class="section-card" @click="goToAccountManagement">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>{{ $t('profile.accountManagement') }}</h3>
            <p>{{ $t('profile.manageAccountInfo') }}</p>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </div>

      <!-- 账户总览 -->
      <div class="accounts-overview">
        <h2 class="section-title">{{ $t('profile.accountOverview') }}</h2>
        
        <div class="accounts-horizontal-scroll">
          <div class="accounts-row">
            <template v-for="typeGroup in groupedAccounts" :key="typeGroup.type">
              <div class="type-separator" v-if="typeGroup !== groupedAccounts[0]">
                <div class="separator-line"></div>
              </div>
              <div class="type-header-card">
                <div class="type-icon">{{ getTypeIcon(typeGroup.type) }}</div>
                <div class="type-info">
                  <div class="type-name">{{ getTypeLabel(typeGroup.type) }}</div>
                  <div class="type-count">{{ typeGroup.accounts.length }}{{ $t('profile.accountUnit') }}</div>
                </div>
              </div>
              <div v-for="account in typeGroup.accounts" :key="account.id" class="account-card" :class="{ archived: account.archived }">
                <div class="account-header">
                  <div class="account-name">{{ account.name }}</div>
                </div>
                
                <div class="account-balance">
                  <div class="balance-amount" :class="getBalanceClass(account.balance)">
                    {{ formatAmount(account.balance || 0, account.unit) }}
                  </div>
                  <div class="balance-label">{{ $t('profile.currentBalance') }}</div>
                </div>
                
                <div class="account-info">
                  <div class="info-item">
                    <span class="info-label">{{ $t('accountManagement.unit') }}:</span>
                    <span class="info-value">{{ account.unit }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('accountManagement.precision') }}:</span>
                    <span class="info-value">{{ account.precision }}{{ $t('accountManagement.decimalPlaces') }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('accountManagement.includeInNetWorth') }}:</span>
                    <span class="info-value">{{ account.includeInNetWorth ? $t('common.yes') : $t('common.no') }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ $t('common.created') }}:</span>
                    <span class="info-value">{{ formatDate(account.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 设置按钮 -->
      <div class="settings-section">
        <button class="settings-btn" @click="goToSettings">
          <span class="settings-icon">⚙️</span>
          <span class="settings-text">{{ $t('settings.title') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import databaseService from '../services/database.js'
import transactionService from '../services/transactionService.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'

// 路由
const router = useRouter()
const { t: $t } = useI18n()

// 响应式数据
const accounts = ref([])

// 账户类型定义
const accountTypes = computed(() => [
  {
    value: 'cash',
    label: $t('accountManagement.type.cash'),
    icon: '💰'
  },
  {
    value: 'loan',
    label: $t('accountManagement.type.loan'),
    icon: '🏦'
  },
  {
    value: 'virtual',
    label: $t('accountManagement.type.virtual'),
    icon: '🎮'
  }
])

// 计算属性
const groupedAccounts = computed(() => {
  const groups = {}
  accounts.value.forEach(account => {
    if (!groups[account.type]) {
      groups[account.type] = []
    }
    groups[account.type].push(account)
  })
  
  // 定义账户类型的显示顺序
  const typeOrder = ['cash', 'loan', 'virtual']
  
  return typeOrder
    .filter(type => groups[type]) // 只包含有账户的类型
    .map(type => ({
      type,
      accounts: groups[type].sort((a, b) => {
        if (a.archived !== b.archived) return a.archived ? 1 : -1
        return a.name.localeCompare(b.name)
      })
    }))
})

// 方法
const getTypeIcon = (type) => {
  const typeObj = accountTypes.value.find(t => t.value === type)
  return typeObj ? typeObj.icon : '💰'
}

const getTypeLabel = (type) => {
  const typeObj = accountTypes.value.find(t => t.value === type)
  return typeObj ? typeObj.label : type
}

const formatAmount = (amount, unit) => {
  const precision = getPrecisionByUnit(unit)
  return `${amount.toFixed(precision)} ${unit}`
}

const getPrecisionByUnit = (unit) => {
  const precisionMap = {
    'CNY': 2, 'USD': 2, 'EUR': 2, 'JPY': 0, 'GBP': 2, 'HKD': 2,
    'BTC': 8, 'ETH': 6, 'USDT': 2,
    'GOLD': 3, 'SILVER': 3,
    'POINTS': 0, 'MILES': 0, 'GEMS': 0, 'COINS': 0
  }
  return precisionMap[unit] || 2
}

const getBalanceClass = (balance) => {
  if (balance > 0) return 'positive'
  if (balance < 0) return 'negative'
  return 'zero'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 路由跳转方法
const goToAccountManagement = () => {
  router.push('/account-management')
}

const goToSettings = () => {
  router.push('/settings')
}

// 获取账户余额（直接从数据库读取balance字段）
const getAccountBalance = async (accountId) => {
  try {
    const account = await databaseService.getById('accounts', accountId)
    return account ? (account.balance || 0) : 0
  } catch (error) {
    console.error('获取账户余额失败:', error)
    return 0
  }
}

// 数据加载
const loadAccounts = async () => {
  try {
    const result = await databaseService.getAll('accounts')
    accounts.value = Array.isArray(result) ? result : []
    await loadAccountBalances()
  } catch (error) {
    console.error('加载账户失败:', error)
    accounts.value = []
  }
}

const loadAccountBalances = async () => {
  for (const account of accounts.value) {
    account.balance = await getAccountBalance(account.id)
  }
}

// 初始化数据库并加载数据
const initializeData = async () => {
  try {
    await databaseService.init()
    await new Promise(resolve => setTimeout(resolve, 100))
    await loadAccounts()
    console.log('Profile页面数据初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    accounts.value = []
  }
}

// 数据刷新处理函数
const handleDataRefresh = async () => {
  try {
    await loadAccounts()
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

// 组件挂载时初始化
onMounted(() => {
  initializeData()
  
  // 监听数据同步事件
  eventBus.on(EVENTS.TRANSACTION_ADDED, handleDataRefresh)
  eventBus.on(EVENTS.TRANSACTION_UPDATED, handleDataRefresh)
  eventBus.on(EVENTS.TRANSACTION_DELETED, handleDataRefresh)
  eventBus.on(EVENTS.DATA_REFRESHED, handleDataRefresh)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  eventBus.off(EVENTS.TRANSACTION_ADDED, handleDataRefresh)
  eventBus.off(EVENTS.TRANSACTION_UPDATED, handleDataRefresh)
  eventBus.off(EVENTS.TRANSACTION_DELETED, handleDataRefresh)
  eventBus.off(EVENTS.DATA_REFRESHED, handleDataRefresh)
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 固定顶部栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo {
  height: 40px;
  width: auto;
}

/* 设置区域 */
.settings-section {
  margin-top: 30px;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid #e1e5e9;
  padding: 12px 20px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.settings-btn:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.settings-icon {
  font-size: 18px;
}

.settings-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 页面内容 */
.page-content {
  padding: 80px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 管理入口卡片 */
.management-section {
  width: 100%;
}

.section-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
}

.card-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.card-arrow {
  font-size: 20px;
  color: var(--text-secondary);
}

/* 账户总览 */
.accounts-overview {
  width: 100%;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.type-separator {
  display: flex;
  align-items: center;
  margin: 0 15px;
}

.separator-line {
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, #e1e5e9, #c1c5c9, #e1e5e9);
  border-radius: 1px;
}

.type-header-card {
  background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 0 0 200px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px solid var(--border-color);
}

.type-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.type-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
}

.type-count {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: normal;
}

.accounts-horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.accounts-horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}

.accounts-horizontal-scroll::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 3px;
}

.accounts-horizontal-scroll::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

.accounts-horizontal-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

.accounts-row {
  display: flex;
  gap: 20px;
  min-width: min-content;
}

.account-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 0 0 300px;
  min-width: 300px;
}

.account-card.archived {
  opacity: 0.6;
  background: var(--bg-secondary);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.account-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
}

.account-balance {
  text-align: center;
  margin-bottom: 15px;
}

.balance-amount {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.balance-amount.positive {
  color: var(--success-color);
}

.balance-amount.negative {
  color: var(--danger-color);
}

.balance-amount.zero {
  color: var(--text-primary);
}

.balance-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 80px 15px 15px;
    gap: 20px;
  }
  
  .type-header-card {
    flex: 0 0 160px;
    min-width: 160px;
    padding: 15px;
  }
  
  .type-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .type-name {
    font-size: 14px;
  }
  
  .type-count {
    font-size: 11px;
  }
  
  .account-card {
    flex: 0 0 280px;
    min-width: 280px;
  }
  
  .account-info {
    grid-template-columns: 1fr;
  }
  
  .settings-section {
    margin-top: 20px;
  }
  
  .settings-btn {
    padding: 10px 16px;
  }
  
  .settings-text {
    font-size: 14px;
  }
  
  .settings-icon {
    font-size: 16px;
  }
}
</style>