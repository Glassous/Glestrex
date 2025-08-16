<template>
  <!-- 固定顶部栏 -->
  <div class="top-bar">
    <h1 class="page-title">{{ $t('nav.transactions') }}</h1>
    <div class="action-buttons">
      <BaseButton @click="downloadAllTransactions" variant="secondary" class="download-btn">{{ $t('transactions.download') }}</BaseButton>
      <BaseButton @click="copyAllTransactions" variant="secondary" class="copy-btn">{{ $t('transactions.copy') }}</BaseButton>
      <BaseButton @click="openForm" variant="primary" class="add-transaction-btn">{{ $t('transactions.addTransaction') }}</BaseButton>
    </div>
  </div>
  
  <div class="transactions-page">
    <div class="page-header">
      <h1>{{ $t('nav.transactions') }}</h1>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <div class="filter-group">
        <label>{{ $t('transactions.filters.dateRange') }}</label>
        <div class="date-range-inputs">
          <FormInput
            v-model="filters.startDate"
            type="date"
            :placeholder="$t('transactions.filters.startDate')"
          />
          <span class="date-separator">{{ $t('common.to') }}</span>
          <FormInput
            v-model="filters.endDate"
            type="date"
            :placeholder="$t('transactions.filters.endDate')"
          />
        </div>
      </div>
      
      <div class="filter-group">
        <ModalSelect
          v-model="filters.categoryId"
          :label="$t('transactions.filters.category')"
          :placeholder="$t('transactions.filters.allCategories')"
          :modal-title="$t('transactions.filters.category')"
          :options="[
            { value: '', label: $t('transactions.filters.allCategories'), icon: 'help-circle' },
            ...categories.map(category => ({
              value: category.id,
              label: category.name,
              icon: category.icon
            }))
          ]"
        />
      </div>
      
      <div class="filter-group">
        <ModalSelect
          v-model="filters.type"
          :label="$t('transactions.filters.type')"
          :placeholder="$t('transactions.filters.allTypes')"
          :modal-title="$t('transactions.filters.type')"
          :options="[
            { value: '', label: $t('transactions.filters.allTypes'), icon: 'help-circle' },
            ...transactionTypes.map(type => ({
              value: type.value,
              label: type.label,
              icon: type.icon
            }))
          ]"
        />
      </div>
      
      <div class="filter-actions">
        <BaseButton @click="clearFilters" variant="outline-secondary">{{ $t('common.clear') }}</BaseButton>
      </div>
    </div>
  
  <!-- 交易创建表单弹窗 -->
  <div v-if="showForm" class="transaction-form-modal">
      <div class="modal-backdrop" @click="cancelForm"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ formTitle }}</h2>
          <button class="close-btn" @click="cancelForm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitTransaction">
        <!-- 交易类型选择 -->
        <FormSelect
          v-model="form.type"
          :label="$t('transactions.type.title')"
          :placeholder="$t('transactions.form.selectType')"
          :options="transactionTypes.map(type => ({
            value: type.value,
            label: type.label
          }))"
          required
        />

        <!-- 账户选择 -->
        <FormSelect
          v-model="form.accountId"
          :label="$t('transactions.account')"
          :placeholder="$t('transactions.form.selectAccount')"
          :options="accounts.map(account => ({
            value: account.id,
            label: `${account.name} (${account.unit})`
          }))"
          required
        />

        <!-- 转账目标账户 -->
        <FormSelect
          v-if="form.type === 'transfer'"
          v-model="form.peerAccountId"
          :label="$t('transactions.account')"
          :placeholder="$t('transactions.form.selectAccount')"
          :options="accounts.filter(account => account.id !== form.accountId).map(account => ({
            value: account.id,
            label: `${account.name} (${account.unit})`
          }))"
          required
        />

        <!-- 金额输入 -->
         <FormInputWithCalculator
            v-model="form.amount"
            :label="$t('transactions.amount')"
            type="number"
            :step="getAmountStep()"
            :min="form.type === 'adjust' ? undefined : '0'"
            :placeholder="$t('transactions.form.enterAmount')"
            :suffix="getSelectedAccountUnit()"
            required
          />

        <!-- 分类选择 -->
        <FormSelect
          v-if="form.type !== 'transfer' && form.type !== 'adjust'"
          v-model="form.categoryId"
          :label="$t('transactions.category')"
          :placeholder="$t('transactions.form.selectCategory')"
          :options="filteredCategories.map(category => ({
            value: category.id,
            label: category.name
          }))"
        />

        <!-- 日期选择 -->
        <FormInput
          v-model="form.date"
          :label="$t('transactions.date')"
          type="date"
          required
        />

        <!-- 描述 -->
        <FormTextarea
          v-model="form.description"
          :label="$t('transactions.description')"
          :placeholder="$t('transactions.form.enterDescription')"
          :rows="3"
        />

          <!-- 提交按钮 -->
          <div class="form-actions">
            <BaseButton type="button" variant="outline-secondary" @click="cancelForm">{{ $t('common.cancel') }}</BaseButton>
            <BaseButton type="button" variant="outline-secondary" @click="resetForm">{{ $t('common.reset') }}</BaseButton>
            <BaseButton type="submit" variant="primary" :disabled="!isFormValid">{{ $t('common.save') }}</BaseButton>
          </div>
        </form>
      </div>
    </div>
  
  <!-- 交易记录 -->
  <div class="recent-transactions">
      <h2>{{ $t('transactions.allTransactions') }}</h2>
      
      <!-- 按日期分组的交易列表 -->
      <div v-if="groupedTransactions.length > 0" class="grouped-transactions">
        <div 
          v-for="group in groupedTransactions" 
          :key="group.date"
          class="date-group"
        >
          <div class="date-header">
            <h3>{{ formatGroupDate(group.date) }}</h3>
            <span class="transaction-count">{{ group.transactions.length }} {{ $t('transactions.records') }}</span>
          </div>
          
          <div class="transaction-list">
            <div 
              v-for="transaction in group.transactions" 
              :key="transaction.id"
              class="transaction-card"
              :class="`card-${transaction.type}`"
            >
              <div class="card-content">
                <div class="transaction-header">
                  <span class="transaction-type">{{ getTypeLabel(transaction.type) }}</span>
                  <div class="transaction-category" v-if="getCategoryName(transaction.categoryId)">
                    {{ getCategoryName(transaction.categoryId) }}
                  </div>
                </div>
                <div class="transaction-description">
                  {{ transaction.description || $t('common.noDescription') }}
                </div>
                <div class="transaction-footer">
                  <div class="transaction-amount" :class="getAmountClass(transaction.type)">
                    {{ formatAmount(transaction.amount, transaction.accountId) }}
                  </div>
                  <div class="transaction-actions">
                    <BaseButton @click="startEditTransaction(transaction)" variant="outline-secondary" size="sm">{{ $t('common.edit') }}</BaseButton>
                    <BaseButton @click="confirmDelete(transaction.id)" variant="outline-danger" size="sm">{{ $t('common.delete') }}</BaseButton>
                  </div>
                </div>
              </div>
              <div class="time-box">
                <span class="time">{{ formatTime(transaction.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无数据提示 -->
      <div v-else class="no-transactions">
        <p>{{ $t('transactions.noTransactions') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import transactionService from '../services/transactionService.js'
import databaseService from '../services/database.js'
import { useTransactionStore } from '../stores/transaction.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'
import FormInput from '../components/FormInput.vue'
import FormInputWithCalculator from '../components/FormInputWithCalculator.vue'
import FormSelect from '../components/FormSelect.vue'
import ModalSelect from '../components/ModalSelect.vue'
import FormTextarea from '../components/FormTextarea.vue'
import BaseButton from '../components/BaseButton.vue'
import IconComponent from '../components/IconComponent.vue'

const transactionStore = useTransactionStore()
const { t: $t } = useI18n()

// 响应式数据
const showForm = ref(false)
const accounts = ref([])
const categories = ref([])
const recentTransactions = ref([])
const editingTransaction = ref(null)

// 筛选器数据
const filters = reactive({
  startDate: '',
  endDate: '',
  categoryId: '',
  type: ''
})

// 表单数据
const form = reactive({
  type: 'expense',
  accountId: '',
  peerAccountId: '',
  categoryId: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
})

const formTitle = computed(() => editingTransaction.value ? $t('transactions.editTransaction') : $t('transactions.addTransaction'))

// 交易类型定义
const transactionTypes = computed(() => [
  { value: 'income', label: $t('transactions.type.income'), icon: 'dollar-sign' },
  { value: 'expense', label: $t('transactions.type.expense'), icon: 'trending-down' },
  { value: 'transfer', label: $t('transactions.type.transfer'), icon: 'refresh-cw' },
  { value: 'borrow', label: $t('transactions.type.borrow'), icon: 'trending-up' },
  { value: 'repay', label: $t('transactions.type.repay'), icon: 'trending-down' },
  { value: 'adjust', label: $t('transactions.type.adjust'), icon: 'scale' }
])

// 计算属性
const filteredCategories = computed(() => {
  return categories.value.filter(category => {
    if (form.type === 'income') return category.type === 'income'
    if (form.type === 'expense') return category.type === 'expense'
    return true
  })
})

const isFormValid = computed(() => {
  const basicValid = form.accountId && form.amount && form.date
  if (form.type === 'transfer') {
    return basicValid && form.peerAccountId && form.peerAccountId !== form.accountId
  }
  return basicValid
})

// 筛选后的交易
const filteredTransactions = computed(() => {
  let filtered = [...recentTransactions.value]
  
  // 日期筛选
  if (filters.startDate) {
    filtered = filtered.filter(t => t.date >= filters.startDate)
  }
  if (filters.endDate) {
    filtered = filtered.filter(t => t.date <= filters.endDate)
  }
  
  // 分类筛选
  if (filters.categoryId) {
    const categoryId = parseInt(filters.categoryId)
    filtered = filtered.filter(t => t.categoryId === categoryId)
  }
  
  // 类型筛选
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type)
  }
  
  return filtered
})

// 按日期分组的交易
const groupedTransactions = computed(() => {
  const groups = {}
  
  filteredTransactions.value.forEach(transaction => {
    const date = transaction.date || transaction.createdAt.split('T')[0]
    if (!groups[date]) {
      groups[date] = {
        date,
        transactions: []
      }
    }
    groups[date].transactions.push(transaction)
  })
  
  // 转换为数组并按日期排序（最新的在前）
  return Object.values(groups)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(group => ({
      ...group,
      transactions: group.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }))
})

// 方法
const selectType = (type) => {
  form.type = type
  form.categoryId = ''
  if (type !== 'transfer') {
    form.peerAccountId = ''
  }
}

const getAmountStep = () => {
  const account = accounts.value.find(acc => acc.id == form.accountId)
  if (!account) return '0.01'
  const precision = account.precision || 2
  return (1 / Math.pow(10, precision)).toString()
}

const getSelectedAccountUnit = () => {
  const account = accounts.value.find(acc => acc.id == form.accountId)
  return account ? account.unit : 'CNY'
}

const submitTransaction = async () => {
  try {
    if (editingTransaction.value) {
      // 更新现有交易
      const transactionData = {
        ...editingTransaction.value, // 保留原始数据，如 createdAt
        ...form, // 使用表单数据覆盖
        amount: parseFloat(form.amount),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      await transactionService.updateTransaction(transactionData);
      alert($t('common.messages.transactionUpdated'));
    } else {
      // 添加新交易
      const transactionData = {
        ...form,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      await transactionService.addTransaction(transactionData);
      alert($t('common.messages.transactionSaved'));
    }
    
    showForm.value = false;
    resetForm();
    loadRecentTransactions();
    eventBus.emit(EVENTS.FORM_HIDE);
  } catch (error) {
    console.error('保存交易失败:', error);
    alert($t('common.messages.transactionSaveFailed'));
  }
};

const resetForm = () => {
  Object.assign(form, {
    type: 'expense',
    accountId: '',
    peerAccountId: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  editingTransaction.value = null
}

const openForm = () => {
  showForm.value = true
  eventBus.emit(EVENTS.FORM_SHOW)
}

const cancelForm = () => {
  showForm.value = false
  resetForm()
  eventBus.emit(EVENTS.FORM_HIDE)
}

const startEditTransaction = (transaction) => {
  editingTransaction.value = transaction
  Object.assign(form, {
    type: transaction.type,
    accountId: transaction.accountId,
    peerAccountId: transaction.peerAccountId || '',
    categoryId: transaction.categoryId || '',
    amount: transaction.amount,
    date: transaction.date.split('T')[0],
    description: transaction.description || ''
  })
  showForm.value = true
  eventBus.emit(EVENTS.FORM_SHOW)
}

const confirmDelete = (id) => {
  if (window.confirm('您确定要删除这条交易记录吗？此操作不可撤销。')) {
    deleteTransaction(id)
  }
}

const deleteTransaction = async (id) => {
  try {
    await transactionService.deleteTransaction(id)
    alert($t('common.messages.transactionDeleted'))
    loadRecentTransactions()
  } catch (error) {
    console.error('删除交易失败:', error)
    alert($t('common.messages.transactionDeleteFailed'))
  }
}

const getTypeLabel = (type) => {
  const typeObj = transactionTypes.value.find(t => t.value === type)
  return typeObj ? typeObj.label : type
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return {
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}

const formatAmount = (amount, accountId) => {
  const account = accounts.value.find(acc => acc.id == accountId)
  const precision = account ? account.precision || 2 : 2
  const unit = account ? account.unit : 'CNY'
  return `${amount.toFixed(precision)} ${unit}`
}

const getAmountClass = (type) => {
  if (type === 'income' || type === 'borrow') return 'positive'
  if (type === 'expense' || type === 'repay') return 'negative'
  return 'neutral'
}

// 清除筛选器
const clearFilters = () => {
  Object.assign(filters, {
    startDate: '',
    endDate: '',
    categoryId: '',
    type: ''
  })
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return ''
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : ''
}

// 格式化分组日期
const formatGroupDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return $t('datetime.today')
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return $t('datetime.yesterday')
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }
}

// 格式化时间
const formatTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 下载所有交易记录
const downloadAllTransactions = async () => {
  try {
    const allTransactions = await transactionService.getAllTransactions()
    const text = generateTransactionsText(allTransactions)
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert($t('transactions.messages.downloadSuccess'))
  } catch (error) {
    console.error('下载交易记录失败:', error)
    alert($t('transactions.messages.downloadFailed'))
  }
}

// 复制所有交易记录到剪贴板
const copyAllTransactions = async () => {
  try {
    const allTransactions = await transactionService.getAllTransactions()
    const text = generateTransactionsText(allTransactions)
    
    await navigator.clipboard.writeText(text)
    alert($t('transactions.messages.copySuccess'))
  } catch (error) {
    console.error('复制交易记录失败:', error)
    alert($t('transactions.messages.copyFailed'))
  }
}

// 生成交易记录文本
const generateTransactionsText = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return $t('transactions.messages.noTransactions')
  }
  
  let text = `${$t('transactions.allTransactionsReport')}\n`
  text += `${$t('common.generatedAt')}: ${new Date().toLocaleString()}\n`
  text += `${$t('common.totalRecords')}: ${transactions.length}\n\n`
  
  // 按日期排序（最新的在前）
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  sortedTransactions.forEach((transaction, index) => {
    const account = accounts.value.find(acc => acc.id == transaction.accountId)
    const peerAccount = transaction.peerAccountId ? accounts.value.find(acc => acc.id == transaction.peerAccountId) : null
    const category = transaction.categoryId ? categories.value.find(cat => cat.id == transaction.categoryId) : null
    
    text += `${index + 1}. ${getTypeLabel(transaction.type)}\n`
    text += `   ${$t('transactions.date')}: ${new Date(transaction.createdAt).toLocaleString()}\n`
    text += `   ${$t('transactions.account')}: ${account ? account.name : 'Unknown'} (${account ? account.unit : 'Unknown'})\n`
    
    if (peerAccount) {
      text += `   ${$t('transactions.targetAccount')}: ${peerAccount.name} (${peerAccount.unit})\n`
    }
    
    if (category) {
      text += `   ${$t('transactions.category')}: ${category.name}\n`
    }
    
    text += `   ${$t('transactions.amount')}: ${formatAmount(transaction.amount, transaction.accountId)}\n`
    
    if (transaction.description) {
      text += `   ${$t('transactions.description')}: ${transaction.description}\n`
    }
    
    text += '\n'
  })
  
  return text
}

// 数据加载
const loadAccounts = async () => {
  try {
    const result = await databaseService.getAll('accounts')
    accounts.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('加载账户失败:', error)
    accounts.value = []
  }
}

const loadCategories = async () => {
  try {
    const result = await databaseService.getAll('categories')
    categories.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

const loadRecentTransactions = async () => {
  try {
    const allTransactions = await transactionService.getAllTransactions()
    // 确保数据存在且为数组
    if (Array.isArray(allTransactions)) {
      recentTransactions.value = allTransactions
        .filter(transaction => transaction && transaction.createdAt) // 过滤空值
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      recentTransactions.value = []
    }
  } catch (error) {
    console.error('加载最近交易失败:', error)
    recentTransactions.value = []
  }
}

// 初始化数据库并加载数据
const initializeData = async () => {
  try {
    // 先初始化数据库
    await databaseService.init()
    
    // 等待一小段时间确保数据库完全初始化
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 然后并行加载数据
    await Promise.all([
      loadAccounts(),
      loadCategories(),
      loadRecentTransactions()
    ])
    
    console.log('数据初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    // 即使初始化失败，也要确保数组被初始化为空数组
    accounts.value = []
    categories.value = []
    recentTransactions.value = []
  }
}

// 组件挂载时初始化
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
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
  border-bottom: 1px solid #e8ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  padding-top: 52px;
  z-index: 1000;
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.download-btn, .copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 20px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.download-btn:hover, .copy-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

.download-btn:active, .copy-btn:active {
  transform: translateY(0) scale(0.98) !important;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4) !important;
}

.add-transaction-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 14px 28px !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
}

.add-transaction-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #d63031 100%) !important;
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.6) !important;
  transform: translateY(-3px) scale(1.05) !important;
}

.add-transaction-btn:active {
  transform: translateY(-1px) scale(1.02) !important;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
}

@media (max-width: 768px) {
  .action-buttons {
    gap: 8px;
  }
  
  .download-btn, .copy-btn {
    padding: 8px 12px !important;
    font-size: 12px !important;
  }
  
  .add-transaction-btn {
    padding: 10px 16px !important;
    font-size: 14px !important;
  }
}

/* 页面容器 */
.transactions-page {
  padding: 24px;
  padding-top: 120px; /* 为固定顶部栏留出空间 */
  padding-bottom: 120px; /* 为底部导航栏留出空间 */
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-secondary);
  min-height: 100vh;
}

/* 筛选器样式 */
.filters-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-separator {
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 44px;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

@media (max-width: 768px) {
  .filters-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .date-range-inputs {
    flex-direction: column;
    gap: 8px;
  }
  
  .date-separator {
    display: none;
  }
}

.page-header {
  padding: 20px;
  margin-bottom: 0;
}

.page-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.transaction-form {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.transaction-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  max-width: 100%;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #007bff;
  background: var(--bg-secondary);
}

.type-btn.active {
  border-color: #007bff;
  background: var(--primary-color);
  color: #fff;
}

.type-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.type-label {
  font-size: 14px;
  font-weight: 500;
}

select, input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

select:focus, input:focus, textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.amount-input {
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input input {
  padding-right: 60px;
}

.currency-unit {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  pointer-events: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
}

/* 通用按钮样式增强 */
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border: 2px solid transparent;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #43a3f5 0%, #00d4e6 100%);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.btn-primary:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  color: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.recent-transactions {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  flex: 1;
}

.recent-transactions h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: var(--text-primary);
}

.transaction-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.transaction-card {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-secondary);
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.transaction-card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 日期分组样式 */
.grouped-transactions {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 2px solid var(--border-color);
}

.date-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.transaction-count {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 12px;
  border-radius: 12px;
}

.transaction-category {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 8px;
  margin-left: auto;
}

.time-box {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-box .time {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.no-transactions {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-transactions p {
  font-size: 16px;
  margin: 0;
}

/* Different transaction type colors */
.card-income {
  border-left: 5px solid var(--success-color);
}

.card-expense {
  border-left: 5px solid var(--danger-color);
}

.card-transfer {
  border-left: 5px solid var(--text-secondary);
}

.card-borrow {
  border-left: 5px solid #ffc107;
}

.card-repay {
  border-left: 5px solid #ff5722;
}

.card-adjust {
  border-left: 5px solid #9c27b0;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.transaction-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.transaction-type {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.transaction-amount {
  font-size: 18px;
  font-weight: 700;
}

.transaction-amount.positive {
  color: var(--success-color);
}

.transaction-amount.negative {
  color: var(--danger-color);
}

.transaction-amount.neutral {
  color: var(--text-secondary);
}

.transaction-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  flex-grow: 1;
}

.transaction-actions {
  display: flex;
  gap: 8px;
}

.date-box {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-box .month {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
}

.date-box .date {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 模态框样式 */
.transaction-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--text-primary);
}

/* 表单样式 */
form {
  padding: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

/* 计算器在窄屏时上浮样式 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
    padding-bottom: 100px; /* 为计算器留出空间 */
  }
  
  .transaction-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
  
  /* 计算器上浮样式 */
  .inline-calculator {
    position: fixed !important;
    bottom: 80px !important;
    left: 10px !important;
    right: 10px !important;
    z-index: 2000 !important;
    margin: 0 !important;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3) !important;
    border: 2px solid #007bff !important;
    background: white !important;
    border-radius: 12px !important;
    max-height: 60vh;
    overflow-y: auto;
  }
  
  /* 计算器按钮美化 */
  .calculator-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .calculator-btn:hover {
    background: linear-gradient(135deg, #43a3f5 0%, #00d4e6 100%) !important;
    box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4) !important;
    transform: translateY(-50%) scale(1.05) !important;
  }
}
</style>