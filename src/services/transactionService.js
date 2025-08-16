import databaseService from './database.js'
import eventBus, { EVENTS } from '../utils/eventBus.js'

// 交易数据服务
class TransactionService {
  constructor() {
    this.storeName = 'transactions'
  }

  // 添加交易记录
  async addTransaction(transaction) {
    try {
      const now = new Date()
      const transactionData = {
        ...transaction,
        // 确保日期格式统一为YYYY-MM-DD
        date: this.formatDateForStorage(transaction.date || now),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
      
      const result = await databaseService.add(this.storeName, transactionData)
      
      // 同步更新账户余额
      await this.updateAccountBalances(transactionData)
      
      // 触发事件通知其他页面数据更新
      eventBus.emit(EVENTS.TRANSACTION_ADDED, { transaction: transactionData, id: result })
      
      return result
    } catch (error) {
      console.error('添加交易失败:', error)
      throw error
    }
  }

  // 更新账户余额
  async updateAccountBalances(transaction) {
    try {
      let { type, accountId, peerAccountId, toAccountId, amount } = transaction;

      // 确保ID是数字类型，因为它们可能从表单中以字符串形式传来
      const numAccountId = parseInt(accountId, 10);
      const numPeerAccountId = peerAccountId ? parseInt(peerAccountId, 10) : null;
      const numToAccountId = toAccountId ? parseInt(toAccountId, 10) : null;

      if (isNaN(numAccountId)) {
        console.error("无效的 accountId:", accountId);
        return;
      }
      
      const targetAccountId = numPeerAccountId || numToAccountId;

      if (type === 'income') {
        // 收入：增加账户余额
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
          eventBus.emit(EVENTS.DATA_REFRESHED);
        }
      } else if (type === 'expense') {
        // 支出：减少账户余额
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
          eventBus.emit(EVENTS.DATA_REFRESHED);
        }
      } else if (type === 'transfer') {
        if (targetAccountId === null || isNaN(targetAccountId)) {
          console.error("无效的目标账户ID:", peerAccountId, toAccountId);
          return;
        }
        // 转账：减少源账户余额，增加目标账户余额
        const fromAccount = await databaseService.getById('accounts', numAccountId);
        const toAccount = await databaseService.getById('accounts', targetAccountId);
        
        if (fromAccount) {
          const newFromBalance = (fromAccount.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newFromBalance);
        }
        
        if (toAccount) {
          const newToBalance = (toAccount.balance || 0) + amount;
          await databaseService.updateAccountBalance(targetAccountId, newToBalance);
        }
        eventBus.emit(EVENTS.DATA_REFRESHED);
      } else if (type === 'borrow') {
        // 借入：增加账户余额
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
          eventBus.emit(EVENTS.DATA_REFRESHED);
        }
      } else if (type === 'repay') {
        // 还款：减少账户余额
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
          eventBus.emit(EVENTS.DATA_REFRESHED);
        }
      } else if (type === 'adjust') {
        // 调整：直接设置余额变化
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
          eventBus.emit(EVENTS.DATA_REFRESHED);
        }
      }
    } catch (error) {
      console.error('更新账户余额失败:', error);
      throw error;
    }
  }

  // 还原账户余额
  async revertAccountBalances(transaction) {
    try {
      let { type, accountId, peerAccountId, toAccountId, amount } = transaction;
      const numAccountId = parseInt(accountId, 10);
      const numPeerAccountId = peerAccountId ? parseInt(peerAccountId, 10) : null;
      const numToAccountId = toAccountId ? parseInt(toAccountId, 10) : null;

      if (isNaN(numAccountId)) {
        console.error("无效的 accountId:", accountId);
        return;
      }

      const targetAccountId = numPeerAccountId || numToAccountId;

      if (type === 'income') {
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
        }
      } else if (type === 'expense') {
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
        }
      } else if (type === 'transfer') {
        if (targetAccountId === null || isNaN(targetAccountId)) {
          console.error("无效的目标账户ID:", peerAccountId, toAccountId);
          return;
        }
        const fromAccount = await databaseService.getById('accounts', numAccountId);
        const toAccount = await databaseService.getById('accounts', targetAccountId);
        if (fromAccount) {
          const newFromBalance = (fromAccount.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newFromBalance);
        }
        if (toAccount) {
          const newToBalance = (toAccount.balance || 0) - amount;
          await databaseService.updateAccountBalance(targetAccountId, newToBalance);
        }
      } else if (type === 'borrow') {
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
        }
      } else if (type === 'repay') {
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) + amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
        }
      } else if (type === 'adjust') {
        const account = await databaseService.getById('accounts', numAccountId);
        if (account) {
          const newBalance = (account.balance || 0) - amount;
          await databaseService.updateAccountBalance(numAccountId, newBalance);
        }
      }
      eventBus.emit(EVENTS.DATA_REFRESHED);
    } catch (error) {
      console.error('还原账户余额失败:', error);
      throw error;
    }
  }

  // 获取所有交易记录
  async getAllTransactions() {
    return await databaseService.getAll(this.storeName)
  }

  // 根据ID获取交易记录
  async getTransactionById(id) {
    return await databaseService.getById(this.storeName, id)
  }

  // 更新交易记录
  async updateTransaction(transaction) {
    const originalTransaction = await this.getTransactionById(transaction.id);
    if (!originalTransaction) {
      throw new Error("未找到要更新的交易");
    }

    await this.revertAccountBalances(originalTransaction);

    const updatedTransaction = {
      ...transaction,
      // 确保日期格式统一为YYYY-MM-DD
      date: this.formatDateForStorage(transaction.date),
      updatedAt: new Date().toISOString()
    };

    const result = await databaseService.update(this.storeName, updatedTransaction);

    await this.updateAccountBalances(updatedTransaction);
    
    eventBus.emit(EVENTS.TRANSACTION_UPDATED, { transaction: updatedTransaction });
    
    return result;
  }

  // 删除交易记录
  async deleteTransaction(id) {
    const transactionToDelete = await this.getTransactionById(id);
    if (!transactionToDelete) {
      throw new Error("未找到要删除的交易");
    }

    if (transactionToDelete.type === 'adjust') {
      throw new Error("期初余额不能删除");
    }

    await this.revertAccountBalances(transactionToDelete);
    
    const result = await databaseService.delete(this.storeName, id);
    
    eventBus.emit(EVENTS.TRANSACTION_DELETED, { id });
    
    return result;
  }

  // 根据类型获取交易记录
  async getTransactionsByType(type) {
    const allTransactions = await this.getAllTransactions()
    return allTransactions.filter(transaction => transaction.type === type)
  }

  // 根据日期范围获取交易记录
  async getTransactionsByDateRange(startDate, endDate) {
    try {
      // 优先使用数据库索引查询
      const indexedResults = await databaseService.getTransactionsByDateRange(startDate, endDate)
      if (indexedResults && indexedResults.length > 0) {
        return indexedResults
      }
      
      // 如果索引查询失败，回退到内存过滤
      const allTransactions = await this.getAllTransactions()
      
      // 标准化日期参数
      const normalizedStartDate = this.normalizeDate(startDate)
      const normalizedEndDate = this.normalizeDate(endDate)
      
      if (!normalizedStartDate || !normalizedEndDate) {
        return []
      }
      
      return allTransactions.filter(transaction => {
        if (!transaction.date) return false
        
        const transactionDate = this.normalizeDate(transaction.date)
        if (!transactionDate) return false
        
        return transactionDate >= normalizedStartDate && transactionDate <= normalizedEndDate
      })
    } catch (error) {
      console.error('日期范围查询失败:', error)
      return []
    }
  }

  // 标准化日期，统一处理时区问题
  normalizeDate(date) {
    if (!date) return null
    
    let normalizedDate
    if (typeof date === 'string') {
      // 如果是日期字符串（YYYY-MM-DD格式），创建本地时区的日期
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // 对于YYYY-MM-DD格式，创建本地时区的日期（避免UTC偏移问题）
        const [year, month, day] = date.split('-').map(Number)
        normalizedDate = new Date(year, month - 1, day)
      } else {
        // 其他格式的字符串
        normalizedDate = new Date(date)
      }
    } else if (date instanceof Date) {
      normalizedDate = new Date(date)
    } else {
      return null
    }
    
    // 确保日期有效
    if (isNaN(normalizedDate.getTime())) {
      return null
    }
    
    // 返回当天的开始时间（00:00:00）
    normalizedDate.setHours(0, 0, 0, 0)
    return normalizedDate
  }

  // 格式化日期为存储格式（YYYY-MM-DD）
  formatDateForStorage(date) {
    if (!date) return new Date().toISOString().split('T')[0]
    
    let targetDate
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date // 已经是正确格式
      }
      targetDate = new Date(date)
    } else if (date instanceof Date) {
      targetDate = new Date(date)
    } else {
      return new Date().toISOString().split('T')[0]
    }
    
    if (isNaN(targetDate.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    
    // 使用本地时区格式化日期，避免UTC偏移问题
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // 根据具体日期获取交易记录（单日查询）
  async getTransactionsByDate(date) {
    try {
      // 优先使用数据库索引查询
      const indexedResults = await databaseService.getTransactionsByDate(date)
      if (indexedResults && indexedResults.length >= 0) {
        return indexedResults
      }
      
      // 如果索引查询失败，回退到范围查询
      const targetDate = this.normalizeDate(date)
      if (!targetDate) return []
      
      // 创建当天的结束时间（23:59:59.999）
      const endDate = new Date(targetDate)
      endDate.setHours(23, 59, 59, 999)
      
      return this.getTransactionsByDateRange(targetDate, endDate)
    } catch (error) {
      console.error('单日查询失败:', error)
      return []
    }
  }

  // 根据分类获取交易记录
  async getTransactionsByCategory(category) {
    const allTransactions = await this.getAllTransactions()
    return allTransactions.filter(transaction => transaction.category === category)
  }

  // 计算总收入
  async getTotalIncome() {
    const incomeTransactions = await this.getTransactionsByType('income')
    return incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0)
  }

  // 计算总支出
  async getTotalExpense() {
    const expenseTransactions = await this.getTransactionsByType('expense')
    return expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0)
  }

  // 计算余额
  async getBalance() {
    const totalIncome = await this.getTotalIncome()
    const totalExpense = await this.getTotalExpense()
    return totalIncome - totalExpense
  }
}

// 创建单例实例
const transactionService = new TransactionService()

export default transactionService