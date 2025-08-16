<template>
  <div class="account-management-page">
    <div class="top-bar">
      <button class="back-btn" @click="$router.go(-1)">
        <span class="back-icon">←</span>
      </button>
      <img src="/src/images/glestrexlogo+glestrex.png" alt="Glestrex" class="app-logo" />
      <BaseButton @click="showCreateForm = true" variant="primary" class="add-account-btn">
        <span class="icon">➕</span>
        {{ $t('accountManagement.createAccount') }}
      </BaseButton>
    </div>
    <div class="content-wrapper">

    <!-- 账户创建/编辑表单 -->
    <div v-if="showCreateForm || editingAccount" class="account-form-modal">
      <div class="modal-backdrop" @click="closeForm"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingAccount ? $t('accountManagement.editAccount') : $t('accountManagement.createAccount') }}</h2>
          <button class="close-btn" @click="closeForm">✕</button>
        </div>
        
        <form @submit.prevent="submitAccount">
          <!-- 账户名称 -->
          <FormInput
            v-model="accountForm.name"
            :label="$t('accountManagement.accountName')"
            :placeholder="$t('accountManagement.accountNamePlaceholder')"
            required
          />

          <!-- 账户类型 -->
          <div class="form-group">
            <label>{{ $t('accountManagement.accountType') }}</label>
            <div class="account-types">
              <button 
                type="button"
                v-for="type in accountTypes" 
                :key="type.value"
                :class="['type-btn', { active: accountForm.type === type.value }]"
                @click="selectAccountType(type.value)"
              >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-label">{{ type.label }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </button>
            </div>
          </div>

          <!-- 货币单位 -->
          <FormSelect
            v-model="accountForm.unit"
            :label="$t('accountManagement.currencyUnit')"
            :placeholder="$t('accountManagement.currencyUnitPlaceholder')"
            :options="currencyGroups"
            :grouped="true"
            required
          />
          
          <!-- 自定义货币单位 -->
          <div class="custom-currency-section">
            <div class="custom-currency-header">
              <span>{{ $t('accountManagement.customCurrency') }}</span>
              <BaseButton 
                type="button" 
                variant="outline-primary" 
                size="small" 
                @click="showCustomCurrencyForm = !showCustomCurrencyForm"
              >
                {{ showCustomCurrencyForm ? $t('accountManagement.cancel') : $t('accountManagement.addCustom') }}
              </BaseButton>
            </div>
            
            <div v-if="showCustomCurrencyForm" class="custom-currency-form">
              <div class="custom-currency-inputs">
                <FormInput
                  v-model="customCurrencyForm.code"
                  :label="$t('accountManagement.unitCode')"
                  :placeholder="$t('accountManagement.unitCodePlaceholder')"
                  :maxlength="10"
                  required
                />
                <FormInput
                  v-model="customCurrencyForm.name"
                  :label="$t('accountManagement.unitName')"
                  :placeholder="$t('accountManagement.unitNamePlaceholder')"
                  required
                />
              </div>
              <BaseButton 
                type="button" 
                variant="primary" 
                size="small" 
                @click="addCustomCurrency"
                :disabled="!customCurrencyForm.code || !customCurrencyForm.name"
              >
                {{ $t('accountManagement.addCustomUnit') }}
              </BaseButton>
            </div>
          </div>

          <!-- 精度设置 -->
          <FormSelect
            v-model="accountForm.precision"
            :label="$t('accountManagement.decimalPlaces')"
            :options="[
               { value: 0, label: $t('accountManagement.precisionOptions.zero') },
               { value: 2, label: $t('accountManagement.precisionOptions.two') },
               { value: 3, label: $t('accountManagement.precisionOptions.three') },
               { value: 6, label: $t('accountManagement.precisionOptions.six') },
               { value: 8, label: $t('accountManagement.precisionOptions.eight') }
             ]"
            value-key="value"
            label-key="label"
          />

          <!-- 期初余额 -->
          <div v-if="!editingAccount">
             <FormInput
               v-model="accountForm.initialBalance"
               :label="$t('accountManagement.initialBalance')"
               type="number"
               :step="getAmountStep()"
               :placeholder="$t('accountManagement.initialBalancePlaceholder')"
               :suffix="accountForm.unit || 'CNY'"
             />
             <small class="form-hint">
               {{ getBalanceHint() }}
             </small>
           </div>

          <!-- 是否纳入净资产 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="accountForm.includeInNetWorth"
              />
              <span class="checkmark"></span>
              {{ $t('accountManagement.includeInNetWorth') }}
            </label>
            <small class="form-hint">
              {{ $t('accountManagement.includeInNetWorthHint') }}
            </small>
          </div>

          <!-- 表单操作 -->
          <div class="form-actions">
            <BaseButton type="button" variant="outline-secondary" @click="closeForm">{{ $t('accountManagement.cancel') }}</BaseButton>
            <BaseButton type="submit" variant="primary" :disabled="!isFormValid">
              {{ editingAccount ? $t('accountManagement.saveChanges') : $t('accountManagement.createAccount') }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- 净资产汇总 -->
    <div class="accounts-summary">
      <div class="summary-card" v-for="(value, unit) in netWorthByUnit" :key="unit">
        <div class="summary-label">{{ $t('accountManagement.netWorth') }} ({{ unit }})</div>
        <div class="summary-value" :class="getNetWorthClass(value)">
          {{ formatAmount(value, unit) }}
        </div>
        <div class="summary-actions">
          <BaseButton 
            variant="primary" 
            size="small" 
            @click="downloadAccountBalances"
            class="action-btn download-btn"
            :title="$t('accountManagement.downloadBalances')"
          >
            📥 {{ $t('accountManagement.download') }}
          </BaseButton>
          <BaseButton 
            variant="outline-primary" 
            size="small" 
            @click="copyAccountBalances"
            class="action-btn copy-btn"
            :title="$t('accountManagement.copyBalances')"
          >
            📋 {{ $t('accountManagement.copy') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 账户列表 -->
    <div class="accounts-section">
      <div class="account-type-sections">
        <div v-for="typeGroup in groupedAccounts" :key="typeGroup.type" class="account-type-section">
          <h3 class="section-title">
            <span class="section-icon">{{ getTypeIcon(typeGroup.type) }}</span>
            {{ getTypeLabel(typeGroup.type) }}
            <span class="account-count">({{ typeGroup.accounts.length }})</span>
          </h3>
          
          <div class="account-grid">
            <div 
              v-for="account in typeGroup.accounts" 
              :key="account.id"
              class="account-card"
            >
              <div class="account-header">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-actions">
                  <BaseButton variant="outline-primary" size="small" @click="editAccount(account)" :title="$t('common.edit')">
                    ✏️
                  </BaseButton>
                  <BaseButton variant="outline-danger" size="small" @click="deleteAccount(account)" :title="$t('common.delete')">
                    🗑️
                  </BaseButton>
                </div>
              </div>
              
              <div class="account-balance">
                <div class="balance-amount" :class="getBalanceClass(account.balance)">
                  {{ formatAmount(account.balance || 0, account.unit) }}
                </div>
                <div class="balance-label">{{ $t('accountManagement.currentBalance') }}</div>
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
                  <span class="info-label">{{ $t('accountManagement.netWorth') }}:</span>
                  <span class="info-value">{{ account.includeInNetWorth ? $t('common.yes') : $t('common.no') }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">{{ $t('accountManagement.created') }}:</span>
                  <span class="info-value">{{ formatDate(account.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import databaseService from '../services/database.js'
import transactionService from '../services/transactionService.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'
import FormInput from '../components/FormInput.vue'
import FormSelect from '../components/FormSelect.vue'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const accounts = ref([])
const showCreateForm = ref(false)
const editingAccount = ref(null)
const showCustomCurrencyForm = ref(false)

// 表单数据
const accountForm = reactive({
  name: '',
  type: 'cash',
  unit: 'CNY',
  precision: 2,
  initialBalance: '',
  includeInNetWorth: true
})

// 自定义货币单位表单
const customCurrencyForm = reactive({
  code: '',
  name: ''
})

// 账户类型定义
const accountTypes = computed(() => [
  {
    value: 'cash',
    label: t('accountManagement.type.cash'),
    icon: '💰',
    description: t('accountManagement.typeDescriptions.cash')
  },
  {
    value: 'loan',
    label: t('accountManagement.type.loan'),
    icon: '🏦',
    description: t('accountManagement.typeDescriptions.loan')
  },
  {
    value: 'virtual',
    label: t('accountManagement.type.virtual'),
    icon: '🎮',
    description: t('accountManagement.typeDescriptions.virtual')
  }
])

// 自定义货币单位
const customCurrencies = ref([])

// 货币单位分组
const currencyGroups = computed(() => [
  {
    label: t('accountManagement.currencyGroups.fiat'),
    options: [
      { value: 'CNY', label: 'CNY - 人民币' },
      { value: 'USD', label: 'USD - 美元' },
      { value: 'EUR', label: 'EUR - 欧元' },
      { value: 'JPY', label: 'JPY - 日元' },
      { value: 'GBP', label: 'GBP - 英镑' },
      { value: 'HKD', label: 'HKD - 港币' }
    ]
  },
  {
    label: t('accountManagement.currencyGroups.crypto'),
    options: [
      { value: 'BTC', label: 'BTC - 比特币' },
      { value: 'ETH', label: 'ETH - 以太坊' },
      { value: 'USDT', label: 'USDT - 泰达币' }
    ]
  },
  {
    label: t('accountManagement.currencyGroups.precious'),
    options: [
      { value: 'GOLD', label: 'GOLD - 黄金(克)' },
      { value: 'SILVER', label: 'SILVER - 白银(克)' }
    ]
  },
  {
    label: t('accountManagement.currencyGroups.virtual'),
    options: [
      { value: 'POINTS', label: 'POINTS - 积分' },
      { value: 'MILES', label: 'MILES - 里程' },
      { value: 'GEMS', label: 'GEMS - 宝石' },
      { value: 'COINS', label: 'COINS - 游戏币' }
    ]
  },
  ...(customCurrencies.value.length > 0 ? [{
    label: t('accountManagement.currencyGroups.custom'),
    options: customCurrencies.value.map(currency => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`
    }))
  }] : [])
])

// 计算属性
const isFormValid = computed(() => {
  return accountForm.name.trim() && accountForm.type && accountForm.unit
})

const groupedAccounts = computed(() => {
  const groups = {}
  accounts.value.forEach(account => {
    if (!groups[account.type]) {
      groups[account.type] = []
    }
    groups[account.type].push(account)
  })
  
  return Object.keys(groups).map(type => ({
    type,
    accounts: groups[type].sort((a, b) => a.name.localeCompare(b.name))
  }))
})

const netWorthByUnit = computed(() => {
  const netWorth = {}
  accounts.value.forEach(account => {
    if (account.includeInNetWorth) {
      const unit = account.unit
      if (!netWorth[unit]) netWorth[unit] = 0
      netWorth[unit] += account.balance || 0
    }
  })
  return netWorth
})

// 方法
const goBack = () => {
  router.back()
}

const selectAccountType = (type) => {
  accountForm.type = type
  // 根据账户类型设置默认货币单位和净资产计算
  if (type === 'virtual') {
    accountForm.unit = 'POINTS'
    accountForm.precision = 0
    accountForm.includeInNetWorth = false // 虚拟资产默认不纳入净资产计算
  } else {
    accountForm.unit = 'CNY'
    accountForm.precision = 2
    accountForm.includeInNetWorth = true
  }
}

const getAmountStep = () => {
  const precision = accountForm.precision || 2
  return (1 / Math.pow(10, precision)).toString()
}

const getBalanceHint = () => {
  switch (accountForm.type) {
    case 'cash':
      return t('accountManagement.balanceHints.cash')
    case 'loan':
      return t('accountManagement.balanceHints.loan')
    case 'virtual':
      return t('accountManagement.balanceHints.virtual')
    default:
      return ''
  }
}

const submitAccount = async () => {
  try {
    const accountData = {
      ...accountForm,
      precision: parseInt(accountForm.precision),
      createdAt: editingAccount.value ? editingAccount.value.createdAt : new Date().toISOString()
    }
    
    if (editingAccount.value) {
      // 编辑现有账户
      accountData.id = editingAccount.value.id
      await databaseService.update('accounts', accountData)
      const index = accounts.value.findIndex(acc => acc.id === editingAccount.value.id)
      if (index !== -1) {
        accounts.value[index] = { ...accountData, balance: accounts.value[index].balance }
      }
    } else {
      // 创建新账户
      // 初始余额设为0，通过交易记录来设置期初余额
      accountData.balance = 0
      
      const accountId = await databaseService.add('accounts', accountData)
      const newAccount = { ...accountData, id: accountId }
      
      // 如果有期初余额，创建调整交易
      const initialBalance = accountForm.initialBalance ? parseFloat(accountForm.initialBalance) : 0
      if (initialBalance !== 0) {
        const initialTransaction = {
          date: new Date().toISOString().split('T')[0],
          type: 'adjust',
          accountId: accountId,
          amount: initialBalance,
          description: t('accountManagement.messages.initialBalanceNote'),
          createdAt: new Date().toISOString()
        }
        await transactionService.addTransaction(initialTransaction)
        // 更新本地账户余额显示
        newAccount.balance = initialBalance
      }
      
      accounts.value.push(newAccount)
    }
    
    alert(editingAccount.value ? t('accountManagement.messages.accountUpdated') : t('accountManagement.messages.accountCreated'))
    closeForm()
    await loadAccountBalances()
  } catch (error) {
    console.error('保存账户失败:', error)
    alert(t('accountManagement.messages.accountSaveFailed'))
  }
}

const editAccount = (account) => {
  editingAccount.value = account
  Object.assign(accountForm, {
    name: account.name,
    type: account.type,
    unit: account.unit,
    precision: account.precision,
    includeInNetWorth: account.includeInNetWorth,
    initialBalance: ''
  })
  showCreateForm.value = true
}



const deleteAccount = async (account) => {
  if (!confirm(t('accountManagement.messages.deleteConfirm', { name: account.name }))) {
    return
  }
  
  try {
    // 检查是否有相关交易记录
    const transactions = await transactionService.getAllTransactions()
    const hasTransactions = transactions.some(t => 
      t.accountId === account.id || t.peerAccountId === account.id
    )
    
    if (hasTransactions) {
      if (confirm(t('accountManagement.messages.deleteWithTransactions'))) {
        // 删除相关交易记录
        const relatedTransactions = transactions.filter(t => 
          t.accountId === account.id || t.peerAccountId === account.id
        )
        for (const transaction of relatedTransactions) {
          await databaseService.delete('transactions', transaction.id)
        }
      } else {
        return
      }
    }
    
    await databaseService.delete('accounts', account.id)
    accounts.value = accounts.value.filter(acc => acc.id !== account.id)
    alert(t('accountManagement.messages.accountDeleted'))
  } catch (error) {
    console.error('删除账户失败:', error)
    alert(t('accountManagement.messages.accountDeleteFailed'))
  }
}

const addCustomCurrency = () => {
  const code = customCurrencyForm.code.trim().toUpperCase()
  const name = customCurrencyForm.name.trim()
  
  if (!code || !name) {
    alert(t('accountManagement.messages.customUnitRequired'))
    return
  }
  
  // 检查是否已存在
  const existingCurrency = customCurrencies.value.find(c => c.code === code)
  if (existingCurrency) {
    alert(t('accountManagement.messages.customUnitExists'))
    return
  }
  
  // 添加自定义货币单位
  customCurrencies.value.push({ code, name })
  
  // 自动选择新添加的货币单位
  accountForm.unit = code
  
  // 重置表单并隐藏
  customCurrencyForm.code = ''
  customCurrencyForm.name = ''
  showCustomCurrencyForm.value = false
  
  // 保存到本地存储
  saveCustomCurrencies()
  
  alert(t('accountManagement.messages.customUnitAdded', { code, name }))
}

const saveCustomCurrencies = () => {
  try {
    localStorage.setItem('customCurrencies', JSON.stringify(customCurrencies.value))
  } catch (error) {
    console.error('保存自定义货币单位失败:', error)
  }
}

const loadCustomCurrencies = () => {
  try {
    const saved = localStorage.getItem('customCurrencies')
    if (saved) {
      customCurrencies.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载自定义货币单位失败:', error)
    customCurrencies.value = []
  }
}

const closeForm = () => {
  showCreateForm.value = false
  editingAccount.value = null
  showCustomCurrencyForm.value = false
  Object.assign(accountForm, {
    name: '',
    type: 'cash',
    unit: 'CNY',
    precision: 2,
    initialBalance: '',
    includeInNetWorth: true
  })
  Object.assign(customCurrencyForm, {
    code: '',
    name: ''
  })
}

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

const getNetWorthClass = (value) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'zero'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 下载所有账户余额情况（分类，TXT格式）
const downloadAccountBalances = () => {
  try {
    const content = generateAccountBalancesText()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `账户余额报告_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    alert(t('accountManagement.messages.downloadSuccess'))
  } catch (error) {
    console.error('下载账户余额失败:', error)
    alert(t('accountManagement.messages.downloadFailed'))
  }
}

// 复制所有账户余额情况到剪贴板
const copyAccountBalances = async () => {
  try {
    const content = generateAccountBalancesText()
    await navigator.clipboard.writeText(content)
    alert(t('accountManagement.messages.copySuccess'))
  } catch (error) {
    console.error('复制账户余额失败:', error)
    alert(t('accountManagement.messages.copyFailed'))
  }
}

// 生成账户余额报告文本
const generateAccountBalancesText = () => {
  const timestamp = new Date().toLocaleString('zh-CN')
  let content = `账户余额报告\n生成时间: ${timestamp}\n\n`
  
  // 净资产汇总
  content += '=== 净资产汇总 ===\n'
  Object.entries(netWorthByUnit.value).forEach(([unit, value]) => {
    content += `${unit}: ${formatAmount(value, unit)}\n`
  })
  content += '\n'
  
  // 按账户类型分类显示
  groupedAccounts.value.forEach(typeGroup => {
    content += `=== ${getTypeLabel(typeGroup.type)} (${typeGroup.accounts.length}个账户) ===\n`
    
    typeGroup.accounts.forEach(account => {
      const balanceStatus = account.balance > 0 ? '正' : account.balance < 0 ? '负' : '零'
      content += `${account.name}:\n`
      content += `  余额: ${formatAmount(account.balance || 0, account.unit)} (${balanceStatus})\n`
      content += `  货币单位: ${account.unit}\n`
      content += `  精度: ${account.precision}位小数\n`
      content += `  纳入净资产: ${account.includeInNetWorth ? '是' : '否'}\n`
      content += `  创建时间: ${formatDate(account.createdAt)}\n`
      content += '\n'
    })
    content += '\n'
  })
  
  // 统计信息
  content += '=== 统计信息 ===\n'
  content += `总账户数: ${accounts.value.length}\n`
  content += `现金账户: ${accounts.value.filter(a => a.type === 'cash').length}\n`
  content += `贷款账户: ${accounts.value.filter(a => a.type === 'loan').length}\n`
  content += `虚拟账户: ${accounts.value.filter(a => a.type === 'virtual').length}\n`
  content += `纳入净资产计算: ${accounts.value.filter(a => a.includeInNetWorth).length}\n`
  
  return content
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
    // 先加载自定义货币单位
    loadCustomCurrencies()
    
    // 初始化数据库
    await databaseService.init()
    
    // 等待一小段时间确保数据库完全初始化
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 然后加载数据
    await loadAccounts()
    
    console.log('账户管理页面数据初始化完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    // 即使初始化失败，也要确保数组被初始化为空数组
    accounts.value = []
  }
}

// 数据刷新处理函数
const handleDataRefresh = async () => {
  try {
    await loadAccounts()
    await loadAccountBalances()
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
.account-management-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  overflow-y: auto;
  position: relative;
}

.content-wrapper {
  padding: 20px;
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

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
  justify-content: space-between;
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
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 20px;
  color: var(--text-primary);
  font-weight: bold;
}

.app-logo {
  height: 40px;
  width: auto;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.add-account-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.icon {
  font-size: 18px;
}

/* 模态框样式 */
.account-form-modal {
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
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 自定义货币单位样式 */
.custom-currency-section {
  margin-top: 15px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.custom-currency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.custom-currency-header span {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.custom-currency-form {
  margin-top: 15px;
}

.custom-currency-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .custom-currency-inputs {
    grid-template-columns: 1fr;
  }
}

.account-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.type-btn:hover {
  border-color: #007bff;
  background: var(--bg-secondary);
}

.type-btn.active {
  border-color: #007bff;
  background: var(--primary-color);
  color: var(--text-light);
}

.type-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.type-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 12px;
  opacity: 0.8;
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
  padding-right: 80px;
}

.currency-unit {
  position: absolute;
  right: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  pointer-events: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.btn-secondary {
  padding: 12px 24px;
  background: var(--text-secondary);
  color: var(--text-light);
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: var(--text-tertiary);
}

.btn-primary:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

/* 账户列表样式 */
.accounts-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
}

.summary-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
}

.summary-value.positive {
  color: var(--success-color);
}

.summary-value.negative {
  color: var(--danger-color);
}

.summary-value.zero {
  color: var(--text-secondary);
}

.summary-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
}

.summary-actions .action-btn {
  flex: 1;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.download-btn {
  background: #007bff !important;
  color: white !important;
  border: 1px solid #007bff !important;
}

.download-btn:hover {
  background: #0056b3 !important;
  border-color: #0056b3 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.copy-btn {
  background: transparent !important;
  color: #007bff !important;
  border: 1px solid #007bff !important;
}

.copy-btn:hover {
  background: #007bff !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.account-type-section {
  width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.section-icon {
  font-size: 24px;
}

.account-count {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: normal;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.account-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.account-card.archived {
  opacity: 0.6;
  background: var(--bg-secondary);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.account-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
}

.account-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: var(--bg-secondary);
}

.action-btn.danger:hover {
  background: var(--danger-bg);
}

.account-balance {
  text-align: center;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.balance-amount {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.balance-amount.positive {
  color: var(--success-color);
}

.balance-amount.negative {
  color: var(--danger-color);
}

.balance-amount.zero {
  color: var(--text-secondary);
}

.balance-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.account-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .account-management-page {
    padding: 16px;
  }
  
  .fixed-header {
    padding: 12px 16px;
  }
  
  .page-header {
    flex-direction: row;
    gap: 12px;
    align-items: center;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .btn-primary {
    padding: 8px 12px;
    font-size: 14px;
    min-width: auto;
  }
  
  .btn-primary .icon {
    font-size: 16px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .account-types {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
  
  .accounts-summary {
    grid-template-columns: 1fr;
  }
  
  .account-grid {
    grid-template-columns: 1fr;
  }
  
  .account-info {
    grid-template-columns: 1fr;
  }
}
</style>