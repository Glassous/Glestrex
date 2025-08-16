<template>
  <div class="home-page">
    <!-- 固定顶部栏 -->
    <div class="top-bar">
      <img src="/src/images/glestrexlogo+glestrex.png" alt="Glestrex" class="app-logo" />
    </div>
    <!-- 财务概览卡片 -->
    <div class="overview-section section">
      <h2 class="section-title">{{ $t('home.totalBalance') }}</h2>
      <div class="overview-cards">
        <!-- 净资产总览 -->
        <div class="overview-card net-worth-card">
          <div class="card-header">
            <h3>{{ $t('home.totalBalance') }}</h3>
            <span class="card-icon">💰</span>
          </div>
          <div class="card-content">
            <div v-if="Object.keys(netWorth).length > 0" class="net-worth-list">
              <div v-for="(amount, unit) in netWorth" :key="unit" class="net-worth-item">
                <span class="amount">{{ formatAmount(amount, unit) }}</span>
                <span class="unit">{{ unit }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <span>{{ $t('common.noData') }}</span>
            </div>
          </div>
        </div>

        <!-- 今日收支 -->
        <div class="overview-card today-card">
          <div class="card-header">
            <h3>{{ $t('datetime.today') }}</h3>
            <span class="card-icon">📊</span>
          </div>
          <div class="card-content">
            <div class="income-expense">
              <div class="income-item">
                <span class="label">{{ $t('home.income') }}</span>
                <span class="amount income">+{{ formatAmount(todayIncome) }}</span>
              </div>
              <div class="expense-item">
                <span class="label">{{ $t('home.expense') }}</span>
                <span class="amount expense">-{{ formatAmount(todayExpense) }}</span>
              </div>
              <div class="balance-item">
                <span class="label">{{ $t('transactions.amount') }}</span>
                <span class="amount" :class="todayBalance >= 0 ? 'income' : 'expense'">
                  {{ todayBalance >= 0 ? '+' : '' }}{{ formatAmount(todayBalance) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 本月收支 -->
        <div class="overview-card month-card">
          <div class="card-header">
            <h3>{{ $t('datetime.thisMonth') }}</h3>
            <span class="card-icon">📈</span>
          </div>
          <div class="card-content">
            <div class="income-expense">
              <div class="income-item">
                <span class="label">收入</span>
                <span class="amount income">+{{ formatAmount(monthIncome) }}</span>
              </div>
              <div class="expense-item">
                <span class="label">支出</span>
                <span class="amount expense">-{{ formatAmount(monthExpense) }}</span>
              </div>
              <div class="balance-item">
                <span class="label">净收支</span>
                <span class="amount" :class="monthBalance >= 0 ? 'income' : 'expense'">
                  {{ monthBalance >= 0 ? '+' : '' }}{{ formatAmount(monthBalance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区 -->
    <div class="quick-actions-section section">
      <h2 class="section-title">{{ $t('home.quickActions') }}</h2>
      <div class="quick-actions-grid">
        <!-- 快速记账 -->
        <div class="quick-action-card" @click="openQuickForm('income')">
          <div class="action-icon income-icon">💰</div>
          <div class="action-label">{{ $t('home.income') }}</div>
        </div>
        
        <div class="quick-action-card" @click="openQuickForm('expense')">
          <div class="action-icon expense-icon">💸</div>
          <div class="action-label">{{ $t('home.expense') }}</div>
        </div>
        
        <div class="quick-action-card" @click="openQuickForm('transfer')">
          <div class="action-icon transfer-icon">🔄</div>
          <div class="action-label">{{ $t('home.transfer') }}</div>
        </div>
        
        <div class="quick-action-card" @click="openQuickForm('adjust')">
          <div class="action-icon adjust-icon">⚖️</div>
          <div class="action-label">{{ $t('transactions.type.adjust') }}</div>
        </div>
      </div>
    </div>

    <!-- 快速交易表单模态框 -->
    <div v-if="showQuickForm" class="quick-form-modal">
      <div class="modal-backdrop" @click="closeQuickForm"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ getFormTitle() }}</h2>
          <button class="close-btn" @click="closeQuickForm">{{ $t('common.close') }}</button>
        </div>
        
        <form @submit.prevent="submitQuickTransaction">
          <!-- 账户选择 -->
          <FormSelect
            v-model="quickForm.accountId"
            :label="quickForm.type === 'transfer' ? $t('transactions.account') : $t('transactions.account')"
            :placeholder="$t('transactions.form.selectAccount')"
            :options="accounts.map(account => ({
              value: account.id,
              label: `${account.name} (${account.unit})`
            }))"
            required
          />

          <!-- 转账目标账户 -->
          <FormSelect
            v-if="quickForm.type === 'transfer'"
            v-model="quickForm.peerAccountId"
            :label="$t('transactions.account')"
            :placeholder="$t('transactions.form.selectAccount')"
            :options="accounts.filter(account => account.id !== quickForm.accountId).map(account => ({
              value: account.id,
              label: `${account.name} (${account.unit})`
            }))"
            required
          />

          <!-- 金额输入 -->
          <FormInputWithCalculator
            v-model="quickForm.amount"
            :label="$t('transactions.amount')"
            type="number"
            :step="getQuickFormAmountStep()"
            :min="quickForm.type === 'adjust' ? undefined : '0'"
            :placeholder="$t('transactions.form.enterAmount')"
            :suffix="getQuickFormSelectedAccountUnit()"
            required
          />

          <!-- 分类选择 -->
          <FormSelect
            v-if="quickForm.type !== 'transfer' && quickForm.type !== 'adjust'"
            v-model="quickForm.categoryId"
            :label="$t('transactions.category')"
            :placeholder="$t('transactions.form.selectCategory')"
            :options="filteredQuickCategories.map(category => ({
              value: category.id,
              label: category.name
            }))"
          />

          <!-- 描述 -->
          <FormTextarea
            v-model="quickForm.description"
            :label="$t('transactions.description')"
            :placeholder="$t('transactions.form.enterDescription')"
            :rows="2"
          />

          <!-- 提交按钮 -->
          <div class="form-actions">
            <BaseButton type="button" variant="outline-secondary" @click="closeQuickForm">{{ $t('common.cancel') }}</BaseButton>
            <BaseButton type="submit" variant="primary" :disabled="!isQuickFormValid">{{ $t('common.save') }}</BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- 账户余额快览 -->
    <div class="accounts-section section">
      <div class="section-header">
        <h2 class="section-title">{{ $t('profile.currentBalance') }}</h2>
        <BaseButton @click="$router.push('/account-management')" variant="outline-primary" size="small">
          {{ $t('profile.accountManagement') }}
        </BaseButton>
      </div>
      <div class="accounts-grid">
        <div v-for="account in accounts" :key="account.id" class="account-card">
          <div class="account-header">
            <span class="account-name">{{ account.name }}</span>
            <span class="account-type">{{ getAccountTypeLabel(account.type) }}</span>
          </div>
          <div class="account-balance">
            <span class="balance-amount">{{ formatAmount(account.balance || 0, account.unit) }}</span>
            <span class="balance-unit">{{ account.unit }}</span>
          </div>
        </div>
        <div v-if="accounts.length === 0" class="empty-accounts">
          <span class="empty-text">{{ $t('common.noData') }}</span>
          <BaseButton @click="$router.push('/account-management')" variant="primary" size="small">
            {{ $t('accountManagement.addAccount') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 快捷导航 -->
    <div class="quick-nav-section section">
      <h2 class="section-title">{{ $t('home.quickActions') }}</h2>
      <div class="nav-grid">
        <div class="nav-item" @click="$router.push('/transactions')">
          <div class="nav-icon">📊</div>
          <div class="nav-label">{{ $t('nav.transactions') }}</div>
        </div>
        <div class="nav-item" @click="$router.push('/account-management')">
          <div class="nav-icon">🏦</div>
          <div class="nav-label">{{ $t('profile.accountManagement') }}</div>
        </div>
        <div class="nav-item" @click="$router.push('/details')">
          <div class="nav-icon">👤</div>
          <div class="nav-label">{{ $t('nav.profile') }}</div>
        </div>
        <div class="nav-item" @click="$router.push('/settings')">
          <div class="nav-icon">⚙️</div>
          <div class="nav-label">{{ $t('settings.title') }}</div>
        </div>
      </div>
    </div>

    <!-- 最近交易 -->
    <div class="recent-transactions-section section">
      <div class="section-header">
        <h2 class="section-title">{{ $t('home.recentTransactions') }}</h2>
        <BaseButton @click="$router.push('/transactions')" variant="outline-primary" size="small">
          {{ $t('common.viewAll') }}
        </BaseButton>
      </div>
      <div class="transactions-list">
        <div v-if="recentTransactions.length > 0" class="transaction-items">
          <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-main">
              <div class="transaction-info">
                <div class="transaction-type">
                  <span class="type-icon">{{ getTransactionTypeIcon(transaction.type) }}</span>
                  <span class="type-label">{{ getTransactionTypeLabel(transaction.type) }}</span>
                </div>
                <div class="transaction-details">
                  <div class="transaction-account">{{ getAccountName(transaction.accountId) }}</div>
                  <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
                </div>
              </div>
              <div class="transaction-amount">
                <span class="amount" :class="getAmountClass(transaction.type)">
                  {{ getAmountPrefix(transaction.type) }}{{ formatAmount(transaction.amount) }}
                </span>
              </div>
            </div>
            <div v-if="transaction.description" class="transaction-description">
              {{ transaction.description }}
            </div>
          </div>
        </div>
        <div v-else class="empty-transactions">
          <span class="empty-text">{{ $t('common.noData') }}</span>
          <BaseButton @click="$router.push('/transactions')" variant="primary" size="small">
            {{ $t('transactions.addTransaction') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import FormSelect from '../components/FormSelect.vue'
import FormInputWithCalculator from '../components/FormInputWithCalculator.vue'
import FormTextarea from '../components/FormTextarea.vue'
import databaseService from '../services/database.js'
import transactionService from '../services/transactionService.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'

const router = useRouter()

// 响应式数据
const accounts = ref([])
const transactions = ref([])
const categories = ref([])

// 快速表单相关
const showQuickForm = ref(false)
const quickForm = ref({
  type: 'expense',
  accountId: '',
  peerAccountId: '',
  categoryId: '',
  amount: '',
  description: ''
})

// 交易类型定义
const transactionTypes = [
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
  { value: 'transfer', label: '转账' },
  { value: 'adjust', label: '调整' }
]

// 最近交易（最多显示5条）
const recentTransactions = computed(() => {
  return transactions.value
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

// 获取账户数据
const loadAccounts = async () => {
  try {
    accounts.value = await databaseService.getAll('accounts')
  } catch (error) {
    console.error('加载账户失败:', error)
  }
}

// 获取分类数据
const loadCategories = async () => {
  try {
    categories.value = await databaseService.getAll('categories')
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 获取交易数据
const loadTransactions = async () => {
  try {
    transactions.value = await transactionService.getAllTransactions()
  } catch (error) {
    console.error('加载交易失败:', error)
  }
}

// 计算净资产
const netWorth = computed(() => {
  const netWorthByUnit = {}
  
  accounts.value.forEach(account => {
    if (account.includeInNetWorth !== false) {
      const unit = account.unit || 'CNY'
      const balance = account.balance || 0
      
      if (!netWorthByUnit[unit]) {
        netWorthByUnit[unit] = 0
      }
      netWorthByUnit[unit] += balance
    }
  })
  
  return netWorthByUnit
})

// 今日收支统计
const todayIncome = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return transactions.value
    .filter(t => t.date === today && t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const todayExpense = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return transactions.value
    .filter(t => t.date === today && t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const todayBalance = computed(() => todayIncome.value - todayExpense.value)

// 本月收支统计
const monthIncome = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  return transactions.value
    .filter(t => t.date >= monthStart && t.date <= monthEnd && t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const monthExpense = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  
  return transactions.value
    .filter(t => t.date >= monthStart && t.date <= monthEnd && t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
})

const monthBalance = computed(() => monthIncome.value - monthExpense.value)

// 格式化金额
const formatAmount = (amount, unit = 'CNY') => {
  if (typeof amount !== 'number') return '0.00'
  
  // 根据不同货币单位设置精度
  let precision = 2
  if (unit === 'JPY' || unit === 'POINTS' || unit === 'MILES') {
    precision = 0
  } else if (unit === 'BTC') {
    precision = 8
  } else if (unit === 'ETH') {
    precision = 6
  }
  
  return amount.toFixed(precision)
}

// 获取账户类型标签
const getAccountTypeLabel = (type) => {
  const typeLabels = {
    cash: '现金',
    loan: '贷款',
    virtual: '虚拟'
  }
  return typeLabels[type] || '未知'
}

// 快速表单相关计算属性
const filteredQuickCategories = computed(() => {
  if (quickForm.value.type === 'income') {
    return categories.value.filter(cat => cat.type === 'income')
  } else if (quickForm.value.type === 'expense') {
    return categories.value.filter(cat => cat.type === 'expense')
  }
  return []
})

const isQuickFormValid = computed(() => {
  const form = quickForm.value
  if (!form.accountId || !form.amount) return false
  if (form.type === 'transfer' && !form.peerAccountId) return false
  return true
})

// 快速表单方法
const openQuickForm = (type) => {
  quickForm.value.type = type
  quickForm.value.accountId = ''
  quickForm.value.peerAccountId = ''
  quickForm.value.categoryId = ''
  quickForm.value.amount = ''
  quickForm.value.description = ''
  showQuickForm.value = true
  eventBus.emit(EVENTS.FORM_SHOW)
}

const closeQuickForm = () => {
  showQuickForm.value = false
  eventBus.emit(EVENTS.FORM_HIDE)
}

const getFormTitle = () => {
  const typeObj = transactionTypes.find(t => t.value === quickForm.value.type)
  return typeObj ? typeObj.label : '交易'
}

const getQuickFormAmountStep = () => {
  const account = accounts.value.find(acc => acc.id == quickForm.value.accountId)
  if (!account) return '0.01'
  const precision = account.precision || 2
  return (1 / Math.pow(10, precision)).toString()
}

const getQuickFormSelectedAccountUnit = () => {
  const account = accounts.value.find(acc => acc.id == quickForm.value.accountId)
  return account ? account.unit : 'CNY'
}

const submitQuickTransaction = async () => {
  try {
    const transactionData = {
      ...quickForm.value,
      amount: parseFloat(quickForm.value.amount),
      date: new Date().toISOString().split('T')[0]
    }
    
    await transactionService.addTransaction(transactionData)
    alert(t('common.messages.transactionSaved'))
    closeQuickForm()
    loadTransactions()
    loadAccounts()
  } catch (error) {
    console.error('保存交易失败:', error)
    alert(t('common.messages.transactionSaveFailed'))
  }
}

// 获取交易类型图标
const getTransactionTypeIcon = (type) => {
  const icons = {
    income: '💰',
    expense: '💸',
    transfer: '🔄',
    borrow: '📈',
    repay: '📉',
    adjust: '⚖️'
  }
  return icons[type] || '❓'
}

// 获取交易类型标签
const getTransactionTypeLabel = (type) => {
  const labels = {
    income: '收入',
    expense: '支出',
    transfer: '转账',
    borrow: '借入',
    repay: '还款',
    adjust: '调整'
  }
  return labels[type] || '未知'
}

// 获取账户名称
const getAccountName = (accountId) => {
  const account = accounts.value.find(acc => acc.id === accountId)
  return account ? account.name : '未知账户'
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 获取金额样式类
const getAmountClass = (type) => {
  if (type === 'income' || type === 'borrow') {
    return 'income'
  } else if (type === 'expense' || type === 'repay') {
    return 'expense'
  }
  return 'neutral'
}

// 获取金额前缀
const getAmountPrefix = (type) => {
  if (type === 'income' || type === 'borrow') {
    return '+'
  } else if (type === 'expense' || type === 'repay') {
    return '-'
  }
  return ''
}



// 初始化数据
const initData = async () => {
  await databaseService.init()
  await loadAccounts()
  await loadCategories()
  await loadTransactions()
}

// 监听数据更新事件
const setupEventListeners = () => {
  eventBus.on(EVENTS.DATA_REFRESHED, () => {
    loadAccounts()
    loadTransactions()
  })
  
  eventBus.on(EVENTS.TRANSACTION_ADDED, () => {
    loadAccounts()
    loadTransactions()
  })
  
  eventBus.on(EVENTS.TRANSACTION_UPDATED, () => {
    loadAccounts()
    loadTransactions()
  })
  
  eventBus.on(EVENTS.TRANSACTION_DELETED, () => {
    loadAccounts()
    loadTransactions()
  })
}

onMounted(() => {
  initData()
  setupEventListeners()
})
</script>

<style scoped>
/* 固定顶部栏 */
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid #e8ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.app-logo {
  height: 40px;
  width: auto;
}

.home-page {
  padding: 24px;
  padding-top: 84px; /* 为固定顶部栏留出空间 */
  padding-bottom: 120px; /* 为底部导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 财务概览卡片 */

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.overview-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-icon {
  font-size: 24px;
}

.card-content {
  color: var(--text-secondary);
}

/* 净资产卡片 */
.net-worth-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.net-worth-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.net-worth-item:last-child {
  border-bottom: none;
}

.net-worth-item .amount {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.net-worth-item .unit {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 收支统计 */
.income-expense {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.income-item,
.expense-item,
.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 14px;
  color: var(--text-secondary);
}

.amount {
  font-size: 16px;
  font-weight: 600;
}

.amount.income {
  color: var(--success-color);
}

.amount.expense {
  color: var(--danger-color);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

/* 快速操作区 */

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.quick-action-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.quick-action-card:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.income-icon {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.expense-icon {
  background: linear-gradient(135deg, #dc3545, #fd7e14);
  color: white;
}

.transfer-icon {
  background: linear-gradient(135deg, #007bff, #6610f2);
  color: white;
}

.adjust-icon {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 账户余额快览 */

/* 快捷导航 */

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.nav-item {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: var(--bg-secondary);
}

.nav-item:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 快速表单模态框 */
.quick-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.quick-form-modal .modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.quick-form-modal .modal-content {
  position: relative;
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.quick-form-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.quick-form-modal .modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.quick-form-modal .close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.quick-form-modal .close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.quick-form-modal form {
  padding: 0 24px 24px;
}

.quick-form-modal .form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 最近交易 */

.transactions-list {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
}

.transaction-items {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:hover {
  background-color: var(--bg-secondary);
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 16px;
}

.type-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-account {
  font-size: 13px;
  color: var(--text-secondary);
}

.transaction-date {
  font-size: 12px;
  color: var(--text-muted);
}

.transaction-amount {
  display: flex;
  align-items: center;
}

.transaction-amount .amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount .amount.income {
  color: var(--success-color);
}

.transaction-amount .amount.expense {
  color: var(--danger-color);
}

.transaction-amount .amount.neutral {
  color: var(--text-primary);
}

.transaction-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  padding-left: 24px;
}



.empty-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
}

.empty-text {
  color: var(--text-muted);
  font-style: italic;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.account-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.account-name {
  font-weight: 600;
  color: var(--text-primary);
}

.account-type {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
}

.account-balance {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.balance-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.balance-unit {
  font-size: 12px;
  color: var(--text-secondary);
}

.empty-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  gap: 16px;
}

.empty-text {
  color: #999;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 20px;
    background: var(--bg-primary);
  }
  
  .section {
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 22px;
    margin-bottom: 16px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .overview-card {
    padding: 20px;
    border-radius: 12px;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .quick-action-card {
    padding: 20px;
    border-radius: 12px;
  }
  
  .nav-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .nav-grid {
    gap: 16px;
  }
  
  .nav-item {
    padding: 18px 12px;
    border-radius: 12px;
  }
  
  .nav-icon {
    font-size: 20px;
  }
  
  .nav-label {
    font-size: 12px;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .account-card {
    padding: 18px;
    border-radius: 10px;
  }
  
  .transactions-list {
    border-radius: 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .quick-action-card {
    padding: 16px;
  }
  
  .action-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .transaction-item {
    padding: 12px 16px;
  }
  
  .transaction-main {
    flex-direction: column;
    gap: 8px;
  }
  
  .transaction-amount {
    align-self: flex-end;
  }
}
</style>