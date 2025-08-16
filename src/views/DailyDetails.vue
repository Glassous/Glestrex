<template>
  <div class="daily-details-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">{{ formatDate(selectedDate.value) }}</h1>
    </div>

    <!-- 当日概览 -->
    <div class="daily-overview">
      <div class="overview-card income">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <div class="card-label">{{ $t('details.totalIncome') }}</div>
          <div class="card-value income-value">+{{ formatAmount(dailyStats.totalIncome) }}</div>
        </div>
      </div>
      
      <div class="overview-card expense">
        <div class="card-icon">📉</div>
        <div class="card-content">
          <div class="card-label">{{ $t('details.totalExpense') }}</div>
          <div class="card-value expense-value">-{{ formatAmount(dailyStats.totalExpense) }}</div>
        </div>
      </div>
      
      <div class="overview-card net">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-label">{{ $t('details.netAmount') }}</div>
          <div class="card-value" :class="{ 'income-value': dailyStats.netAmount >= 0, 'expense-value': dailyStats.netAmount < 0 }">
            {{ dailyStats.netAmount >= 0 ? '+' : '' }}{{ formatAmount(dailyStats.netAmount) }}
          </div>
        </div>
      </div>
      
      <div class="overview-card count">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <div class="card-label">{{ $t('details.transactionCount') }}</div>
          <div class="card-value">{{ dailyTransactions.length }}</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <div class="date-display">
        <h2>{{ formatDate(selectedDate) }}</h2>
      </div>
      <div class="button-group">
        <button class="export-btn" @click="exportData">
          {{ $t('details.exportToTxt') }}
        </button>
        <button class="copy-btn" @click="copyToClipboard">
          {{ $t('details.copyToClipboard') }}
        </button>
      </div>
    </div>

    <!-- 交易明细 -->
    <div class="section">
      <h2 class="section-title">{{ $t('details.dailyTransactions') }}</h2>
      <div v-if="dailyTransactions.length === 0" class="no-data">
        {{ $t('details.noTransactionsForDate') }}
      </div>
      <div v-else class="transaction-list">
        <div v-for="transaction in dailyTransactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-icon" :class="transaction.type">
            {{ getTransactionIcon(transaction.type) }}
          </div>
          <div class="transaction-content">
            <div class="transaction-description">{{ transaction.description || $t('common.noDescription') }}</div>
            <div class="transaction-meta">
              <span class="transaction-category">{{ transaction.category }}</span>
              <span class="transaction-account">{{ transaction.account }}</span>
            </div>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatAmount(Math.abs(transaction.amount)) }}
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import transactionService from '../services/transactionService'
import databaseService from '../services/database'

export default {
  name: 'DailyDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    
    const selectedDate = ref(route.query.date || new Date().toISOString().split('T')[0])
    const dailyTransactions = ref([])
    const accountBalances = ref([])
    const categories = ref([])
    const accounts = ref([])
    
    const dailyStats = computed(() => {
      const income = dailyTransactions.value
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expense = dailyTransactions.value
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        totalIncome: income,
        totalExpense: expense,
        netAmount: income - expense
      }
    })
    
    const loadDailyData = async () => {
      try {
        // 加载基础数据
        const [transactionsData, accountsData, categoriesData] = await Promise.all([
          transactionService.getTransactionsByDate(selectedDate.value),
          databaseService.getAll('accounts'),
          databaseService.getAll('categories')
        ])
        
        accounts.value = accountsData || []
        categories.value = categoriesData || []
        accountBalances.value = accountsData || []
        
        // 处理交易数据，添加分类和账户名称
        const processedTransactions = (transactionsData || []).map(transaction => {
          const account = accounts.value.find(acc => acc.id == transaction.accountId)
          const category = categories.value.find(cat => cat.id == transaction.categoryId)
          
          return {
            ...transaction,
            account: account ? account.name : t('common.unknown'),
            category: category ? category.name : t('common.unknown')
          }
        })
        
        dailyTransactions.value = processedTransactions
      } catch (error) {
        console.error('Failed to load daily data:', error)
        dailyTransactions.value = []
        accountBalances.value = []
        accounts.value = []
        categories.value = []
      }
    }
    
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      
      let date
      if (typeof dateStr === 'string') {
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // YYYY-MM-DD格式，创建本地时区日期
          const [year, month, day] = dateStr.split('-').map(Number)
          date = new Date(year, month - 1, day)
        } else {
          date = new Date(dateStr)
        }
      } else if (dateStr instanceof Date) {
        date = new Date(dateStr)
      } else {
        return ''
      }
      
      if (isNaN(date.getTime())) {
        return ''
      }
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
    
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
    
    const getTransactionIcon = (type) => {
      const icons = {
        income: '💰',
        expense: '💸',
        transfer: '🔄'
      }
      return icons[type] || '📝'
    }
    
    const getAccountIcon = (type) => {
      const icons = {
        cash: '💳',
        loan: '🏦',
        virtual: '🎮'
      }
      return icons[type] || '💼'
    }
    
    const goBack = () => {
      router.back()
    }
    
    const exportData = () => {
      const data = generateExportData()
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${t('details.export.filename', { date: selectedDate.value })}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    
    const copyToClipboard = async () => {
      try {
        const data = generateExportData()
        await navigator.clipboard.writeText(data)
        alert(t('details.export.copySuccess'))
      } catch (error) {
        console.error('Copy failed:', error)
        alert(t('details.export.copyFailed'))
      }
    }
    
    const generateExportData = () => {
      let data = `${formatDate(selectedDate.value)}\n`
      data += `${'='.repeat(50)}\n\n`
      
      // 概览数据
      data += `${t('details.dailyOverview')}:\n`
      data += `${t('details.totalIncome')}: +${formatAmount(dailyStats.value.totalIncome)}\n`
      data += `${t('details.totalExpense')}: -${formatAmount(dailyStats.value.totalExpense)}\n`
      data += `${t('details.netAmount')}: ${dailyStats.value.netAmount >= 0 ? '+' : ''}${formatAmount(dailyStats.value.netAmount)}\n`
      data += `${t('details.transactionCount')}: ${dailyTransactions.value.length}\n\n`
      
      // 交易明细
      data += `${t('details.dailyTransactions')}:\n`
      if (dailyTransactions.value.length === 0) {
        data += `${t('details.noTransactionsForDate')}\n`
      } else {
        dailyTransactions.value.forEach((transaction, index) => {
          data += `${index + 1}. ${transaction.description || t('common.noDescription')}\n`
          data += `   ${t('transactions.amount')}: ${transaction.type === 'income' ? '+' : '-'}${formatAmount(Math.abs(transaction.amount))}\n`
          data += `   ${t('transactions.category')}: ${transaction.category}\n`
          data += `   ${t('transactions.account')}: ${transaction.account}\n\n`
        })
      }
      
      // 账户余额
      data += `${t('details.accountBalances')}:\n`
      if (accountBalances.value.length === 0) {
        data += `${t('details.noAccountData')}\n`
      } else {
        accountBalances.value.forEach((account, index) => {
          data += `${index + 1}. ${account.name}\n`
          data += `   ${t('accountManagement.balance')}: ${formatAmount(account.balance)} ${account.unit}\n`
          data += `   ${t('accountManagement.accountType')}: ${t(`accountManagement.type.${account.type}`)}\n\n`
        })
      }
      
      return data
    }
    
    onMounted(async () => {
      try {
        await databaseService.init()
        await loadDailyData()
      } catch (error) {
        console.error('Failed to initialize:', error)
      }
    })
    
    return {
      selectedDate,
      dailyTransactions,
      accountBalances,
      categories,
      accounts,
      dailyStats,
      formatDate,
      formatAmount,
      getTransactionIcon,
      getAccountIcon,
      goBack,
      exportData,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
.daily-details-page {
  min-height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
  padding-top: 80px;
  padding-bottom: 20px;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--top-bar-background);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: var(--hover-color);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.export-btn,
.copy-btn {
  background: #007bff !important;
  color: white !important;
  border: 2px solid #007bff !important;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.export-btn:hover,
.copy-btn:hover {
  background: #0056b3 !important;
  border-color: #0056b3 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.date-display {
  text-align: center;
}

.date-display h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.daily-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.overview-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--background-secondary);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.income-value {
  color: var(--success-color);
}

.expense-value {
  color: var(--error-color);
}

.section {
  margin: 20px;
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-color);
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  font-size: 14px;
}

.transaction-list,
.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item,
.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--background-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.transaction-icon,
.account-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
  background: var(--background-color);
}

.transaction-content,
.account-content {
  flex: 1;
}

.transaction-description,
.account-name {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.transaction-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.account-type {
  font-size: 12px;
  color: var(--text-secondary);
}

.transaction-amount {
  font-weight: 600;
  font-size: 16px;
}

.transaction-amount.income {
  color: var(--success-color);
}

.transaction-amount.expense {
  color: var(--error-color);
}

.account-balance {
  font-weight: 600;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .daily-overview {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px;
  }
  
  .section {
    margin: 16px;
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .export-btn,
  .copy-btn {
    font-size: 10px;
    padding: 6px 8px;
  }
}
</style>