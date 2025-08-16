// IndexedDB 数据库服务
class DatabaseService {
  constructor() {
    this.dbName = 'GlestrexDB'
    this.version = 2  // 增加版本号以触发数据库升级
    this.db = null
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => {
        reject(new Error('数据库打开失败'))
      }
      
      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // 创建交易记录表
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', {
            keyPath: 'id',
            autoIncrement: true
          })
          
          // 创建索引
          transactionStore.createIndex('type', 'type', { unique: false })
          transactionStore.createIndex('category', 'category', { unique: false })
          transactionStore.createIndex('date', 'date', { unique: false })
        }
        
        // 创建账户表
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', {
            keyPath: 'id',
            autoIncrement: true
          })
          
          accountStore.createIndex('name', 'name', { unique: false })
          
          // 不添加默认账户，让用户自己创建
        }
        
        // 数据库升级：为现有账户添加balance字段
        if (event.oldVersion < 2) {
          const transaction = event.target.transaction
          if (db.objectStoreNames.contains('accounts')) {
            const accountStore = transaction.objectStore('accounts')
            const request = accountStore.getAll()
            
            request.onsuccess = async () => {
              const accounts = request.result
              for (const account of accounts) {
                if (account.balance === undefined) {
                  account.balance = 0  // 设置默认余额为0
                  accountStore.put(account)
                }
              }
            }
          }
        }
        
        // 创建分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true
          })
          
          categoryStore.createIndex('type', 'type', { unique: false })
          
          // 添加默认分类
          const defaultCategories = [
            // 收入分类
            { name: '工资', type: 'income', icon: '💰' },
            { name: '奖金', type: 'income', icon: '🎁' },
            { name: '投资收益', type: 'income', icon: '📈' },
            { name: '其他收入', type: 'income', icon: '💵' },
            
            // 支出分类
            { name: '餐饮', type: 'expense', icon: '🍽️' },
            { name: '交通', type: 'expense', icon: '🚗' },
            { name: '购物', type: 'expense', icon: '🛍️' },
            { name: '娱乐', type: 'expense', icon: '🎮' },
            { name: '医疗', type: 'expense', icon: '🏥' },
            { name: '教育', type: 'expense', icon: '📚' },
            { name: '住房', type: 'expense', icon: '🏠' },
            { name: '其他支出', type: 'expense', icon: '💸' }
          ]
          
          defaultCategories.forEach(category => {
            categoryStore.add(category)
          })
        }
      }
    })
  }

  // 获取对象存储
  getObjectStore(storeName, mode = 'readonly') {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    
    try {
      const transaction = this.db.transaction([storeName], mode)
      return transaction.objectStore(storeName)
    } catch (error) {
      console.error(`获取对象存储${storeName}失败:`, error)
      throw error
    }
  }

  // 添加记录
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite')
      const request = store.add(data)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有记录
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          resolve([])
          return
        }
        
        const store = this.getObjectStore(storeName)
        const request = store.getAll()
        
        request.onsuccess = () => {
          const result = request.result || []
          resolve(result)
        }
        request.onerror = () => reject(request.error)
      } catch (error) {
        console.error(`获取${storeName}数据失败:`, error)
        resolve([])
      }
    })
  }

  // 根据ID获取记录
  async getById(storeName, id) {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName)
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 更新记录
  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite')
      const request = store.put(data)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 删除记录
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(storeName, 'readwrite')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 清空所有数据
  async clearAllData() {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(['transactions', 'accounts', 'categories'], 'readwrite')
        
        // 清空所有表
        const transactionStore = transaction.objectStore('transactions')
        const accountStore = transaction.objectStore('accounts')
        const categoryStore = transaction.objectStore('categories')
        
        const clearTransactions = transactionStore.clear()
        const clearAccounts = accountStore.clear()
        const clearCategories = categoryStore.clear()
        
        transaction.oncomplete = () => {
          // 重新添加默认数据
          this.addDefaultData().then(() => {
            resolve()
          }).catch(reject)
        }
        
        transaction.onerror = () => reject(transaction.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  // 更新账户余额
  async updateAccountBalance(accountId, newBalance) {
    try {
      const account = await this.getById('accounts', accountId)
      if (account) {
        account.balance = newBalance
        await this.update('accounts', account)
      }
    } catch (error) {
      console.error('更新账户余额失败:', error)
      throw error
    }
  }

  // 根据日期范围查询交易记录（使用索引优化）
  async getTransactionsByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          resolve([])
          return
        }

        const transaction = this.db.transaction(['transactions'], 'readonly')
        const store = transaction.objectStore('transactions')
        const index = store.index('date')
        
        // 标准化日期为字符串格式（YYYY-MM-DD）
        const startDateStr = this.formatDateForIndex(startDate)
        const endDateStr = this.formatDateForIndex(endDate)
        
        if (!startDateStr || !endDateStr) {
          resolve([])
          return
        }
        
        // 使用索引进行范围查询
        const range = IDBKeyRange.bound(startDateStr, endDateStr, false, false)
        const request = index.getAll(range)
        
        request.onsuccess = () => {
          const result = request.result || []
          resolve(result)
        }
        
        request.onerror = () => {
          console.error('日期范围查询失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('日期范围查询异常:', error)
        resolve([])
      }
    })
  }

  // 根据具体日期查询交易记录
  async getTransactionsByDate(date) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          resolve([])
          return
        }

        const transaction = this.db.transaction(['transactions'], 'readonly')
        const store = transaction.objectStore('transactions')
        const index = store.index('date')
        
        const dateStr = this.formatDateForIndex(date)
        if (!dateStr) {
          resolve([])
          return
        }
        
        const request = index.getAll(dateStr)
        
        request.onsuccess = () => {
          const result = request.result || []
          resolve(result)
        }
        
        request.onerror = () => {
          console.error('单日查询失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('单日查询异常:', error)
        resolve([])
      }
    })
  }

  // 格式化日期为索引使用的字符串格式
  formatDateForIndex(date) {
    if (!date) return null
    
    let targetDate
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date // 已经是正确格式
      }
      targetDate = new Date(date)
    } else if (date instanceof Date) {
      targetDate = new Date(date)
    } else {
      return null
    }
    
    if (isNaN(targetDate.getTime())) {
      return null
    }
    
    // 返回YYYY-MM-DD格式
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // 添加默认数据
  async addDefaultData() {
    // 不添加默认账户，让用户自己创建
    
    // 添加默认分类
    const defaultCategories = [
      // 收入分类
      { name: '工资', type: 'income', icon: '💰' },
      { name: '奖金', type: 'income', icon: '🎁' },
      { name: '投资收益', type: 'income', icon: '📈' },
      { name: '其他收入', type: 'income', icon: '💵' },
      
      // 支出分类
      { name: '餐饮', type: 'expense', icon: '🍽️' },
      { name: '交通', type: 'expense', icon: '🚗' },
      { name: '购物', type: 'expense', icon: '🛍️' },
      { name: '娱乐', type: 'expense', icon: '🎮' },
      { name: '医疗', type: 'expense', icon: '🏥' },
      { name: '教育', type: 'expense', icon: '📚' },
      { name: '住房', type: 'expense', icon: '🏠' },
      { name: '其他支出', type: 'expense', icon: '💸' }
    ]
    
    // 添加默认分类
    for (const category of defaultCategories) {
      await this.add('categories', category)
    }
  }
}

// 创建单例实例
const databaseService = new DatabaseService()

export default databaseService