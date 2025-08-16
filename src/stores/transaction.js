import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTransactionStore = defineStore('transaction', () => {
  // 交易记录列表
  const transactions = ref([])
  
  // 添加交易记录
  const addTransaction = (transaction) => {
    transactions.value.push({
      id: Date.now(),
      ...transaction,
      createdAt: new Date()
    })
  }
  
  // 删除交易记录
  const removeTransaction = (id) => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index > -1) {
      transactions.value.splice(index, 1)
    }
  }
  
  // 更新交易记录
  const updateTransaction = (id, updates) => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index > -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
    }
  }
  
  // 计算总收入
  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  })
  
  // 计算总支出
  const totalExpense = computed(() => {
    return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  })
  
  // 计算余额
  const balance = computed(() => {
    return totalIncome.value - totalExpense.value
  })
  
  return {
    transactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    totalIncome,
    totalExpense,
    balance
  }
})